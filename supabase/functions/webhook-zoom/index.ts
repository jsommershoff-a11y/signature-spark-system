import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-zm-signature, x-zm-request-timestamp',
};

// Zoom event schema with validation
const recordingFileSchema = z.object({
  id: z.string().min(1),
  meeting_id: z.string().min(1),
  recording_start: z.string().optional(),
  recording_end: z.string().optional(),
  file_type: z.string(),
  file_size: z.number().nonnegative().optional(),
  play_url: z.string().url().optional(),
  download_url: z.string().url().optional(),
  status: z.string().optional(),
  recording_type: z.string().optional(),
});

const zoomEventSchema = z.object({
  event: z.string().min(1),
  payload: z.object({
    account_id: z.string().min(1),
    object: z.object({
      id: z.union([z.string(), z.number()]),
      uuid: z.string().optional(),
      host_id: z.string().optional(),
      topic: z.string().optional(),
      start_time: z.string().optional(),
      duration: z.number().nonnegative().optional(),
      recording_files: z.array(recordingFileSchema).optional(),
    }),
  }),
  event_ts: z.number().optional(),
});

// Verify Zoom webhook signature
async function verifyZoomSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !timestamp || !secret) return false;
  
  try {
    const encoder = new TextEncoder();
    const message = `v0:${timestamp}:${payload}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    const expectedSig = 'v0=' + Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedSig;
  } catch (error) {
    console.error('Zoom signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const zoomWebhookSecret = Deno.env.get('ZOOM_WEBHOOK_SECRET');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature verification
    const rawBody = await req.text();
    
    // Parse and validate JSON first
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      console.error('Invalid JSON payload');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle Zoom URL validation challenge
    if (typeof parsedBody === 'object' && parsedBody !== null && 
        'event' in parsedBody && (parsedBody as Record<string, unknown>).event === 'endpoint.url_validation') {
      const payload = parsedBody as { payload?: { plainToken?: string } };
      const plainToken = payload.payload?.plainToken;
      if (plainToken && zoomWebhookSecret) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(zoomWebhookSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(plainToken));
        const encryptedToken = Array.from(new Uint8Array(sig))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        return new Response(
          JSON.stringify({ plainToken, encryptedToken }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify Zoom signature if secret is configured
    if (zoomWebhookSecret) {
      const zoomSignature = req.headers.get('x-zm-signature');
      const zoomTimestamp = req.headers.get('x-zm-request-timestamp');
      
      const isValidSignature = await verifyZoomSignature(
        rawBody,
        zoomSignature,
        zoomTimestamp,
        zoomWebhookSecret
      );
      
      if (!isValidSignature) {
        console.error('Invalid Zoom signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Zoom signature verified');
    }

    // Validate payload schema
    const parseResult = zoomEventSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      console.error('Schema validation failed:', parseResult.error.message);
      return new Response(
        JSON.stringify({ error: 'Invalid payload structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = parseResult.data;
    console.log('Zoom webhook received:', event.event);

    // Validate event type
    if (event.event !== 'recording.completed') {
      console.log('Ignoring non-recording event:', event.event);
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { object } = event.payload;
    const meetingId = (object.uuid || String(object.id)).slice(0, 100);
    
    // Find audio/video file
    const recordingFiles = object.recording_files || [];
    const audioFile = recordingFiles.find(
      (f) => f.file_type === 'MP4' || f.file_type === 'M4A'
    );

    if (!audioFile) {
      console.log('No audio/video file found in recording');
      return new Response(
        JSON.stringify({ success: true, message: 'No audio file' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate recording URL
    const recordingUrl = audioFile.download_url || audioFile.play_url;
    if (!recordingUrl || !recordingUrl.startsWith('https://')) {
      console.error('Invalid recording URL');
      return new Response(
        JSON.stringify({ error: 'Invalid recording URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find existing call with this external_id or create mapping
    const { data: existingCall } = await supabase
      .from('calls')
      .select('id, lead_id')
      .eq('external_id', meetingId)
      .single();

    if (existingCall) {
      // Validate and sanitize duration
      const durationSeconds = object.duration 
        ? Math.min(Math.max(0, object.duration * 60), 86400) // Max 24 hours
        : null;

      // Update existing call
      const { error: updateError } = await supabase
        .from('calls')
        .update({
          status: 'recording_ready',
          recording_url: recordingUrl.slice(0, 500),
          started_at: object.start_time || null,
          ended_at: audioFile.recording_end || null,
          duration_seconds: durationSeconds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCall.id);

      if (updateError) {
        console.error('Error updating call:', updateError);
        throw updateError;
      }

      console.log('Call updated successfully:', existingCall.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          call_id: existingCall.id,
          message: 'Recording linked to existing call' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No existing call found - log for manual linking
    console.log('No call found for meeting:', meetingId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Recording received, no matching call found',
        meeting_id: meetingId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
