import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  createOpenAIChatCompletion,
  getOpenAIModel,
  OpenAIRequestError,
} from "../_shared/openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ChatRole = "system" | "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") return false;
      const candidate = message as Record<string, unknown>;
      return (
        (candidate.role === "user" || candidate.role === "assistant" || candidate.role === "system") &&
        typeof candidate.content === "string" &&
        candidate.content.trim().length > 0
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 8000),
    }))
    .slice(-16);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const messages = normalizeMessages(body.messages);
    if (!messages.some((message) => message.role === "user")) {
      return json({ error: "message required" }, 400);
    }

    const model = getOpenAIModel(typeof body.model === "string" ? body.model : undefined);
    const completion = await createOpenAIChatCompletion({
      model,
      messages: [
        {
          role: "system",
          content:
            "Du bist ChatGPT in der KI-Automationen-App. Antworte auf Deutsch, arbeite praxisnah und frage nur nach, wenn wichtige Informationen fehlen.",
        },
        ...messages,
      ],
      max_completion_tokens: 1800,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    return json({
      message: content,
      model: completion.model ?? model,
      usage: completion.usage ?? null,
    });
  } catch (error) {
    console.error("chatgpt error:", error);

    if (error instanceof OpenAIRequestError) {
      const status = error.status === 429 ? 429 : 502;
      return json({ error: "OpenAI request failed", status: error.status, details: error.details }, status);
    }

    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
