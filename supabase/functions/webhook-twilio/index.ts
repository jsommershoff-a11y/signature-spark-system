import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Twilio sends form-encoded data
    const formData = await req.formData();
    
    const callSid = formData.get('CallSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingDuration = parseInt(formData.get('RecordingDuration') as string || '0');
    const recordingStatus = formData.get('RecordingStatus') as string;

    console.log('Twilio webhook received:', {
      callSid,
      recordingSid,
      recordingStatus,
      recordingDuration
    });

    if (!callSid || !recordingUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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
          call_sid: callSid,
          recording_url: recordingUrl
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

    // Optionally trigger transcription
    // await supabase.functions.invoke('transcribe-audio', {
    //   body: { call_id: existingCall.id }
    // });

    // Twilio expects empty 200 response
    return new Response('', { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
