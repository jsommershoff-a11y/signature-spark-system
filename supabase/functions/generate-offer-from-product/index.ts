import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createOpenAIChatCompletion, OpenAIRequestError } from "../_shared/openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  product_id: string;
  prompt_override?: string;
  lead_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // AuthN
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AuthZ: must be staff (gruppenbetreuer or higher)
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleCheck, error: roleErr } = await admin.rpc("has_min_role", {
      _user_id: userData.user.id,
      _min_role: "gruppenbetreuer",
    });
    if (roleErr || !roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden — staff only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Input
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.product_id || typeof body.product_id !== "string") {
      return new Response(JSON.stringify({ error: "product_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch product
    const { data: product, error: prodErr } = await admin
      .from("catalog_products")
      .select("id, code, name, subtitle, price_gross_cents, delivery_days, required_connectors, offer_prompt")
      .eq("id", body.product_id)
      .maybeSingle();
    if (prodErr || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional lead context
    let leadCtx: Record<string, string> = {
      lead_name: "(Test-Lead)",
      lead_company: "(Beispiel GmbH)",
      lead_industry: "(Allgemein)",
      lead_pain: "(noch nicht erfasst)",
    };
    if (body.lead_id) {
      const { data: lead } = await admin
        .from("crm_leads")
        .select("first_name, last_name, company, industry, message")
        .eq("id", body.lead_id)
        .maybeSingle();
      if (lead) {
        const leadWithIndustry = lead as { industry?: string | null };
        leadCtx = {
          lead_name: [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "(unbekannt)",
          lead_company: lead.company ?? "(keine Angabe)",
          lead_industry: leadWithIndustry.industry ?? "(keine Angabe)",
          lead_pain: lead.message ?? "(keine Angabe)",
        };
      }
    }

    const promptTemplate = body.prompt_override?.trim() || product.offer_prompt ||
      `Erstelle ein Angebot für {{product_name}} ({{product_code}}). Preis: {{product_price}}.`;

    const fmtEUR = (cents: number) =>
      new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

    const filled = promptTemplate
      .replaceAll("{{product_name}}", product.name)
      .replaceAll("{{product_code}}", product.code)
      .replaceAll("{{product_price}}", fmtEUR(product.price_gross_cents))
      .replaceAll("{{product_delivery_days}}", String(product.delivery_days))
      .replaceAll("{{required_connectors}}", (product.required_connectors ?? []).join(", ") || "—")
      .replaceAll("{{lead_name}}", leadCtx.lead_name)
      .replaceAll("{{lead_company}}", leadCtx.lead_company)
      .replaceAll("{{lead_industry}}", leadCtx.lead_industry)
      .replaceAll("{{lead_pain}}", leadCtx.lead_pain);

    const aiJson = await createOpenAIChatCompletion({
      messages: [
        { role: "system", content: "Du erstellst strukturierte Angebote als JSON. Antworte NUR mit gültigem JSON." },
        { role: "user", content: filled },
      ],
      response_format: { type: "json_object" },
    });

    const content = aiJson?.choices?.[0]?.message?.content ?? "";

    let parsed: unknown = content;
    try { parsed = JSON.parse(content); } catch { /* keep string */ }

    return new Response(JSON.stringify({ offer: parsed, prompt: filled }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-offer-from-product error", e);
    if (e instanceof OpenAIRequestError) {
      return new Response(JSON.stringify({ error: `OpenAI: ${e.status}`, details: e.details }), {
        status: e.status === 429 ? 429 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
