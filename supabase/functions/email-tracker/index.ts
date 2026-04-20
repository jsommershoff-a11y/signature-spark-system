import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const messageId = url.searchParams.get("mid");
  const eventType = url.searchParams.get("event") || "opened";

  // Validate inputs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!messageId || !uuidRegex.test(messageId)) {
    return new Response("Missing or invalid mid", { status: 400 });
  }

  const allowedEvents = ["opened", "clicked"];
  if (!allowedEvents.includes(eventType)) {
    return new Response("Invalid event", { status: 400 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify message exists and is in 'sent' status
    const { data: msg } = await supabase
      .from("email_messages")
      .select("id")
      .eq("id", messageId)
      .eq("status", "sent")
      .maybeSingle();

    if (!msg) {
      // Silently return pixel/OK for invalid IDs (don't leak info)
      if (eventType === "opened") {
        const pixel = new Uint8Array([
          0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
          0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
          0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
          0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
          0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
          0x01, 0x00, 0x3b,
        ]);
        return new Response(pixel, {
          headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
        });
      }
      return new Response("OK", { status: 200 });
    }

    // Deduplicate: skip if same event was already recorded in last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("email_events")
      .select("id")
      .eq("message_id", messageId)
      .eq("event_type", eventType)
      .gte("created_at", fiveMinAgo)
      .limit(1);

    if (!recent || recent.length === 0) {
      await supabase.from("email_events").insert({
        message_id: messageId,
        event_type: eventType,
        metadata: {
          ip: req.headers.get("x-forwarded-for") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (eventType === "opened") {
      // Return 1x1 transparent pixel
      const pixel = new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
        0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
        0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
        0x01, 0x00, 0x3b,
      ]);
      return new Response(pixel, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // For click tracking, redirect or return OK — validate destination against allow-list
    const redirectUrl = url.searchParams.get("url");
    if (redirectUrl) {
      const ALLOWED_REDIRECT_PREFIXES = [
        "https://krsimmobilien.de",
        "https://www.krsimmobilien.de",
        "https://krs-signature.de",
        "https://www.krs-signature.de",
        "https://ki-automationen.io",
        "https://www.ki-automationen.io",
        "https://signature-spark-system.lovable.app",
      ];
      try {
        const parsed = new URL(redirectUrl);
        if (parsed.protocol !== "https:") {
          return new Response("Invalid redirect", { status: 400 });
        }
        const isAllowed = ALLOWED_REDIRECT_PREFIXES.some((prefix) =>
          redirectUrl.startsWith(prefix + "/") || redirectUrl === prefix
        );
        if (!isAllowed) {
          return new Response("Invalid redirect", { status: 400 });
        }
        return Response.redirect(redirectUrl, 302);
      } catch {
        return new Response("Invalid redirect", { status: 400 });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("email-tracker error:", e);
    return new Response("Error", { status: 500 });
  }
});
