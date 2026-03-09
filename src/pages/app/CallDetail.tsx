import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CallDetailView } from '@/components/calls/CallDetailView';
import { useCallDetail, useCalls } from '@/hooks/useCalls';
import { useOffers } from '@/hooks/useOffers';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import type { DiscoveryData } from '@/types/offers';

export default function CallDetail() {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { call, transcript, analysis, loading, refetch } = useCallDetail(callId);
  const { startCall, endCall } = useCalls();
  const { createOffer } = useOffers();

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

  const handleCreateDeal = async (
    discoveryData: DiscoveryData | null,
    phaseNotes: Record<string, unknown>
  ) => {
    if (!call?.lead_id) {
      toast({
        title: 'Fehler',
        description: 'Kein Lead mit diesem Call verknüpft.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const offer = await createOffer({
        lead_id: call.lead_id,
        analysis_id: analysis?.id,
        offer_json: {
          title: `Angebot für ${call.lead?.first_name || ''} ${call.lead?.last_name || ''}`.trim(),
          valid_until: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          customer: {
            name: `${call.lead?.first_name || ''} ${call.lead?.last_name || ''}`.trim(),
            company: call.lead?.company || '',
            email: call.lead?.email || '',
          },
          discovery_data: discoveryData || undefined,
          offer_mode: discoveryData?.recommended_mode || 'performance',
          line_items: [],
          subtotal_cents: 0,
          tax_rate: 19,
          tax_cents: 0,
          total_cents: 0,
          payment_terms: { type: 'one_time' },
        },
        notes: `Erstellt aus Call ${callId}. Gesprächsnotizen vorhanden.`,
      });

      if (offer) {
        toast({
          title: 'Deal & Angebot erstellt',
          description: 'Das Angebot wurde als Entwurf gespeichert und die Pipeline aktualisiert.',
        });
        navigate(`/app/offers/${offer.id}`);
      }
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Angebot konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/app/calls')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück zur Übersicht
      </Button>

      <CallDetailView
        call={call}
        transcript={transcript}
        analysis={analysis}
        loading={loading}
        onStartCall={handleStartCall}
        onEndCall={handleEndCall}
        onRefresh={refetch}
        onCreateDeal={handleCreateDeal}
      />
    </div>
  );
}
