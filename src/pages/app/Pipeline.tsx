import { useState } from 'react';
import { usePipeline, PipelineItemWithLead } from '@/hooks/usePipeline';
import { useLeads } from '@/hooks/useLeads';
import { PipelineBoard } from '@/components/crm/PipelineBoard';
import { LeadDetailSidebar } from '@/components/crm/LeadDetailSidebar';
import { StageTransitionDialog } from '@/components/crm/StageTransitionDialog';
import { PipelineStage, CrmLead } from '@/types/crm';
import { isStageDialogSuppressed, isSkipDialogSuppressed } from '@/lib/crm/stage-dialog-prefs';
import { trackEvent } from '@/lib/analytics';
import { useMandatorySkipStages } from '@/hooks/useAppSettings';

export default function Pipeline() {
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<{
    itemId: string;
    fromStage: PipelineStage | null;
    toStage: PipelineStage;
  } | null>(null);

  const { pipelineByStage, loading, moveToStage } = usePipeline();
  const { updateLead } = useLeads();
  const { stages: mandatorySkipStages } = useMandatorySkipStages();

  const handleItemClick = (item: PipelineItemWithLead) => {
    if (item.lead) {
      const leadWithPipeline: CrmLead = {
        ...item.lead,
        pipeline_item: {
          id: item.id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          lead_id: item.lead_id,
          stage: item.stage,
          stage_updated_at: item.stage_updated_at,
          pipeline_priority_score: item.pipeline_priority_score,
          purchase_readiness: item.purchase_readiness,
          urgency: item.urgency,
        },
      };
      setSelectedLead(leadWithPipeline);
      setSidebarOpen(true);
    }
  };

  const handleStageChange = async (itemId: string, stage: PipelineStage) => {
    // Aktuellen Stage des Items aus pipelineByStage ermitteln
    let fromStage: PipelineStage | null = null;
    for (const s of Object.keys(pipelineByStage) as PipelineStage[]) {
      if ((pipelineByStage[s] || []).some((it) => it.id === itemId)) {
        fromStage = s;
        break;
      }
    }
    if (fromStage === stage) return; // kein Wechsel

    // Nutzer hat „Nicht erneut fragen" für Ziel-Stage gewählt → direkt verschieben.
    // Gates (Rückwärts, Skip, new_lead-Qualifizierung, lost) bleiben aktiv und werden
    // im Dialog selbst behandelt, daher nur Direct-Move bei Vorwärts-1-Schritt.
    const isOneStepForward = (() => {
      const order: PipelineStage[] = [
        'new_lead', 'setter_call_scheduled', 'setter_call_done',
        'analysis_ready', 'offer_draft', 'offer_sent', 'payment_unlocked', 'won',
      ];
      if (!fromStage) return false;
      const fi = order.indexOf(fromStage);
      const ti = order.indexOf(stage);
      return fi >= 0 && ti === fi + 1;
    })();
    if (isOneStepForward && fromStage !== 'new_lead' && isStageDialogSuppressed(stage)) {
      await moveToStage(itemId, stage);
      return;
    }

    // Skip-Dialog-Suppression: Vorwärts-Sprung über mind. 1 Stage hinweg, wenn
    // der Nutzer für diese Ziel-Stage „nicht erneut zeigen" gewählt hat.
    // Sicherheits-Gates (Rückwärts, new_lead-Qualifizierung, lost) bleiben aktiv.
    const order: PipelineStage[] = [
      'new_lead', 'setter_call_scheduled', 'setter_call_done',
      'analysis_ready', 'offer_draft', 'offer_sent', 'payment_unlocked', 'won',
    ];
    const fi = fromStage ? order.indexOf(fromStage) : -1;
    const ti = order.indexOf(stage);
    const isForwardSkip = fi >= 0 && ti > fi + 1;
    const isMandatory = mandatorySkipStages.includes(stage);
    if (
      isForwardSkip &&
      fromStage !== 'new_lead' &&
      stage !== 'lost' &&
      !isMandatory &&
      isSkipDialogSuppressed(stage)
    ) {
      void trackEvent('skip_dialog_bypassed', {
        to_stage: stage,
        from_stage: fromStage,
        skipped_count: ti - fi - 1,
      });
      await moveToStage(itemId, stage);
      return;
    }

    setPendingTransition({ itemId, fromStage, toStage: stage });
  };

  const confirmTransition = async () => {
    if (!pendingTransition) return;
    await moveToStage(pendingTransition.itemId, pendingTransition.toStage);
    setPendingTransition(null);
  };

  const cancelTransition = () => setPendingTransition(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">
          Verfolge den Fortschritt deiner Leads durch die Pipeline
        </p>
      </div>

      <PipelineBoard
        pipelineByStage={pipelineByStage}
        loading={loading}
        onItemClick={handleItemClick}
        onStageChange={handleStageChange}
      />

      <LeadDetailSidebar
        lead={selectedLead}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <StageTransitionDialog
        transition={pendingTransition}
        onConfirm={confirmTransition}
        onCancel={cancelTransition}
        onUpdateLeadNotes={async (leadId, notes) => {
          await updateLead({ id: leadId, notes });
        }}
        leadIdForItem={(itemId) => {
          for (const s of Object.keys(pipelineByStage) as PipelineStage[]) {
            const it = (pipelineByStage[s] || []).find((x) => x.id === itemId);
            if (it?.lead_id) return it.lead_id;
          }
          return null;
        }}
      />
    </div>
  );
}
