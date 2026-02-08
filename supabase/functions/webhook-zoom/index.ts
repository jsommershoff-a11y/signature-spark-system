import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ZoomRecordingEvent {
  event: string;
  payload: {
    account_id: string;
    object: {
      id: string;
      uuid: string;
      host_id: string;
      topic: string;
      start_time: string;
      duration: number;
      recording_files: Array<{
        id: string;
        meeting_id: string;
        recording_start: string;
        recording_end: string;
        file_type: string;
        file_size: number;
        play_url?: string;
        download_url?: string;
        status: string;
        recording_type: string;
      }>;
    };
  };
  event_ts: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event: ZoomRecordingEvent = await req.json();
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
    const meetingId = object.uuid || object.id.toString();
    const audioFile = object.recording_files.find(
      (f) => f.file_type === 'MP4' || f.file_type === 'M4A'
    );

    if (!audioFile) {
      console.log('No audio/video file found in recording');
      return new Response(
        JSON.stringify({ success: true, message: 'No audio file' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find existing call with this external_id or create mapping
    const { data: existingCall } = await supabase
      .from('calls')
      .select('id, lead_id')
      .eq('external_id', meetingId)
      .single();

    if (existingCall) {
      // Update existing call
      const { error: updateError } = await supabase
        .from('calls')
        .update({
          status: 'recording_ready',
          recording_url: audioFile.download_url || audioFile.play_url,
          started_at: object.start_time,
          ended_at: audioFile.recording_end,
          duration_seconds: object.duration * 60,
          updated_at: new Date().toISOString(),
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
    console.log('Recording URL:', audioFile.download_url || audioFile.play_url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Recording received, no matching call found',
        meeting_id: meetingId,
        recording_url: audioFile.download_url || audioFile.play_url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
