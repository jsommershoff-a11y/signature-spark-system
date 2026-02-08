import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-twilio-signature',
};

// Verify Twilio webhook signature
async function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null,
  authToken: string
): Promise<boolean> {
  if (!signature || !authToken) return false;
  
  try {
    // Sort params alphabetically and concatenate
    const sortedKeys = Object.keys(params).sort();
    let data = url;
    for (const key of sortedKeys) {
      data += key + params[key];
    }
    
    // Compute HMAC-SHA1
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(authToken),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    
    // Base64 encode
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sig)));
    
    return signature === expectedSig;
  } catch (error) {
    console.error('Twilio signature verification error:', error);
    return false;
  }
}

// Validate and sanitize string input
function sanitizeString(value: unknown, maxLength: number = 255): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, maxLength);
}

// Validate SID format (alphanumeric starting with specific prefix)
function isValidSid(value: string | null, prefix: string): boolean {
  if (!value) return false;
  const sidRegex = new RegExp(`^${prefix}[a-zA-Z0-9]{32}$`);
  return sidRegex.test(value);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Twilio sends form-encoded data
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        params[key] = value;
      }
    });

    // Verify Twilio signature if auth token is configured
    if (twilioAuthToken) {
      const twilioSignature = req.headers.get('x-twilio-signature');
      const requestUrl = req.url;
      
      const isValidSignature = await verifyTwilioSignature(
        requestUrl,
        params,
        twilioSignature,
        twilioAuthToken
      );
      
      if (!isValidSignature) {
        console.error('Invalid Twilio signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Twilio signature verified');
    }
    
    // Extract and validate fields
    const callSid = sanitizeString(params['CallSid'], 64);
    const recordingUrl = sanitizeString(params['RecordingUrl'], 500);
    const recordingSid = sanitizeString(params['RecordingSid'], 64);
    const recordingDurationRaw = params['RecordingDuration'];
    const recordingStatus = sanitizeString(params['RecordingStatus'], 50);

    // Validate CallSid format
    if (!callSid || !isValidSid(callSid, 'CA')) {
      console.error('Invalid or missing CallSid');
      return new Response(
        JSON.stringify({ error: 'Invalid CallSid format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate recording URL format
    if (!recordingUrl || !recordingUrl.startsWith('https://api.twilio.com/')) {
      console.error('Invalid or missing RecordingUrl');
      return new Response(
        JSON.stringify({ error: 'Invalid RecordingUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate duration
    let recordingDuration = 0;
    if (recordingDurationRaw) {
      const parsed = parseInt(recordingDurationRaw, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 86400) { // Max 24 hours
        recordingDuration = parsed;
      }
    }

    console.log('Twilio webhook received:', {
      callSid,
      recordingSid: recordingSid ? recordingSid.slice(0, 10) + '...' : null,
      recordingStatus,
      recordingDuration
    });

    // Find call by external_id (Twilio CallSid)
    const { data: existingCall, error: findError } = await supabase
      .from('calls')
      .select('id, lead_id, status')
      .eq('external_id', callSid)
      .single();

    if (findError || !existingCall) {
      console.log('No call found for CallSid:', callSid);
      
      // Store for later manual linking
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Recording received, no matching call found',
          call_sid: callSid
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update call with recording
    const { error: updateError } = await supabase
      .from('calls')
      .update({
        status: 'recording_ready',
        recording_url: recordingUrl + '.mp3', // Twilio provides .mp3 by default
        duration_seconds: recordingDuration,
        updated_at: new Date().toISOString(),
        meta: {
          twilio_recording_sid: recordingSid,
          twilio_call_sid: callSid
        }
      })
      .eq('id', existingCall.id);

    if (updateError) {
      console.error('Error updating call:', updateError);
      throw updateError;
    }

    console.log('Call updated successfully:', existingCall.id);

    // Twilio expects empty 200 response
    return new Response('', { 
      status: 200,
      headers: corsHeaders 
    });

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
