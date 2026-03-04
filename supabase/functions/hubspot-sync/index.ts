import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HUBSPOT_API = "https://api.hubapi.com";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- Authentication & Authorization ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and extract user
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Require teamleiter+ role
    const { data: hasRole } = await supabase.rpc("has_min_role", {
      _user_id: userData.user.id,
      _min_role: "teamleiter",
    });
    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Business Logic ---
    const HUBSPOT_ACCESS_TOKEN = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
    if (!HUBSPOT_ACCESS_TOKEN) throw new Error("HUBSPOT_ACCESS_TOKEN not configured");

    const { action, data } = await req.json();

    const hubHeaders = {
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    let result: unknown;

    switch (action) {
      // ========================================
      // PUSH: CRM Lead → HubSpot Contact
      // ========================================
      case "push_lead": {
        const { lead_id } = data;
        const { data: lead, error } = await supabase
          .from("crm_leads")
          .select("*")
          .eq("id", lead_id)
          .single();
        if (error || !lead) throw new Error("Lead not found");

        // Check if contact already exists in HubSpot by email
        const searchRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/search`, {
          method: "POST",
          headers: hubHeaders,
          body: JSON.stringify({
            filterGroups: [{
              filters: [{ propertyName: "email", operator: "EQ", value: lead.email }]
            }]
          }),
        });
        const searchData = await searchRes.json();

        if (searchData.total > 0) {
          // Update existing contact
          const hubspotId = searchData.results[0].id;
          const updateRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/${hubspotId}`, {
            method: "PATCH",
            headers: hubHeaders,
            body: JSON.stringify({
              properties: {
                firstname: lead.first_name,
                lastname: lead.last_name || "",
                email: lead.email,
                phone: lead.phone || "",
                company: lead.company || "",
                website: lead.website_url || "",
                city: lead.location || "",
                industry: lead.industry || "",
              },
            }),
          });
          if (!updateRes.ok) {
            const err = await updateRes.json();
            throw new Error(`HubSpot update failed [${updateRes.status}]: ${JSON.stringify(err)}`);
          }
          result = { action: "updated", hubspot_id: hubspotId };
        } else {
          // Create new contact
          const createRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
            method: "POST",
            headers: hubHeaders,
            body: JSON.stringify({
              properties: {
                firstname: lead.first_name,
                lastname: lead.last_name || "",
                email: lead.email,
                phone: lead.phone || "",
                company: lead.company || "",
                website: lead.website_url || "",
                city: lead.location || "",
                industry: lead.industry || "",
              },
            }),
          });
          if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(`HubSpot create failed [${createRes.status}]: ${JSON.stringify(err)}`);
          }
          const created = await createRes.json();
          result = { action: "created", hubspot_id: created.id };
        }
        break;
      }

      // ========================================
      // PULL: HubSpot Contacts → CRM Leads
      // ========================================
      case "pull_contacts": {
        const limit = data?.limit || 50;
        const after = data?.after || undefined;
        const params = new URLSearchParams({
          limit: String(limit),
          properties: "firstname,lastname,email,phone,company,website,city,industry",
        });
        if (after) params.set("after", after);

        const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts?${params}`, {
          headers: hubHeaders,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(`HubSpot fetch failed [${res.status}]: ${JSON.stringify(err)}`);
        }
        const hubData = await res.json();

        let imported = 0;
        let skipped = 0;
        for (const contact of hubData.results || []) {
          const props = contact.properties;
          if (!props.email) { skipped++; continue; }

          // Upsert by email (dedupe_key)
          const { error: upsertErr } = await supabase
            .from("crm_leads")
            .upsert({
              email: props.email,
              first_name: props.firstname || "Unbekannt",
              last_name: props.lastname || null,
              phone: props.phone || null,
              company: props.company || null,
              website_url: props.website || null,
              location: props.city || null,
              industry: props.industry || null,
              source_type: "referral",
              source_detail: "HubSpot Import",
              dedupe_key: `hubspot_${contact.id}`,
            }, { onConflict: "dedupe_key" });

          if (upsertErr) {
            console.error("Upsert error:", upsertErr);
            skipped++;
          } else {
            imported++;
          }
        }

        result = {
          imported,
          skipped,
          total: hubData.results?.length || 0,
          paging: hubData.paging || null,
        };
        break;
      }

      // ========================================
      // PUSH: Offer → HubSpot Deal
      // ========================================
      case "push_deal": {
        const { offer_id } = data;
        const { data: offer, error } = await supabase
          .from("offers")
          .select("*, crm_leads!offers_lead_id_fkey(first_name, last_name, email, company)")
          .eq("id", offer_id)
          .single();
        if (error || !offer) throw new Error("Offer not found");

        const lead = (offer as any).crm_leads;
        const offerJson = offer.offer_json as any;
        const dealName = `${lead?.company || lead?.first_name || "Deal"} – Angebot ${offer.version}`;
        const amount = offerJson?.total_price_cents ? (offerJson.total_price_cents / 100) : 0;

        const stageMap: Record<string, string> = {
          draft: "qualifiedtobuy",
          sent: "presentationscheduled",
          viewed: "presentationscheduled",
          accepted: "closedwon",
          rejected: "closedlost",
          expired: "closedlost",
        };

        const createRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals`, {
          method: "POST",
          headers: hubHeaders,
          body: JSON.stringify({
            properties: {
              dealname: dealName,
              amount: String(amount),
              dealstage: stageMap[offer.status] || "qualifiedtobuy",
              pipeline: "default",
            },
          }),
        });
        if (!createRes.ok) {
          const err = await createRes.json();
          throw new Error(`HubSpot deal create failed [${createRes.status}]: ${JSON.stringify(err)}`);
        }
        const deal = await createRes.json();

        // Associate deal with contact by email
        if (lead?.email) {
          const searchRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/search`, {
            method: "POST",
            headers: hubHeaders,
            body: JSON.stringify({
              filterGroups: [{
                filters: [{ propertyName: "email", operator: "EQ", value: lead.email }]
              }]
            }),
          });
          const searchData = await searchRes.json();
          if (searchData.total > 0) {
            const contactId = searchData.results[0].id;
            await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/${deal.id}/associations/contacts/${contactId}/deal_to_contact`, {
              method: "PUT",
              headers: hubHeaders,
            });
          }
        }

        result = { action: "deal_created", hubspot_deal_id: deal.id };
        break;
      }

      // ========================================
      // PULL: HubSpot Deals → overview
      // ========================================
      case "pull_deals": {
        const limit = data?.limit || 50;
        const params = new URLSearchParams({
          limit: String(limit),
          properties: "dealname,amount,dealstage,closedate,pipeline",
        });

        const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals?${params}`, {
          headers: hubHeaders,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(`HubSpot deals fetch failed [${res.status}]: ${JSON.stringify(err)}`);
        }
        result = await res.json();
        break;
      }

      // ========================================
      // SYNC: Full bidirectional sync
      // ========================================
      case "full_sync": {
        // Pull contacts from HubSpot
        const pullRes = await fetch(req.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: req.headers.get("Authorization") || "" },
          body: JSON.stringify({ action: "pull_contacts", data: { limit: 100 } }),
        });
        const pullResult = await pullRes.json();

        // Push all CRM leads to HubSpot
        const { data: leads } = await supabase
          .from("crm_leads")
          .select("id")
          .is("dedupe_key", null)
          .limit(100);

        let pushed = 0;
        for (const lead of leads || []) {
          try {
            const pushRes = await fetch(req.url, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: req.headers.get("Authorization") || "" },
              body: JSON.stringify({ action: "push_lead", data: { lead_id: lead.id } }),
            });
            if (pushRes.ok) pushed++;
          } catch (e) {
            console.error("Push error for lead:", lead.id, e);
          }
        }

        result = { pulled: pullResult, pushed_leads: pushed };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}. Available: push_lead, pull_contacts, push_deal, pull_deals, full_sync`);
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("hubspot-sync error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
