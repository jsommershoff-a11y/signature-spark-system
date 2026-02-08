import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CallDetailView } from '@/components/calls/CallDetailView';
import { useCallDetail, useCalls } from '@/hooks/useCalls';
import { ArrowLeft } from 'lucide-react';

export default function CallDetail() {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  
  const { call, transcript, analysis, loading, refetch } = useCallDetail(callId);
  const { startCall, endCall } = useCalls();

  const handleStartCall = async () => {
    if (callId) {
      await startCall(callId);
      refetch();
    }
  };

  const handleEndCall = async () => {
    if (callId) {
      await endCall(callId);
      refetch();
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('/app/calls')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück zur Übersicht
      </Button>

      {/* Call Detail View */}
      <CallDetailView
        call={call}
        transcript={transcript}
        analysis={analysis}
        loading={loading}
        onStartCall={handleStartCall}
        onEndCall={handleEndCall}
        onRefresh={refetch}
      />
    </div>
  );
}
