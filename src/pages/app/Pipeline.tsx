import { useState } from 'react';
import { usePipeline, PipelineItemWithLead } from '@/hooks/usePipeline';
import { useLeads } from '@/hooks/useLeads';
import { PipelineBoard } from '@/components/crm/PipelineBoard';
import { LeadDetailModal } from '@/components/crm/LeadDetailModal';
import { PipelineStage, CrmLead } from '@/types/crm';

export default function Pipeline() {
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { 
    pipelineByStage, 
    loading,
    moveToStage,
  } = usePipeline();

  const { updateLead, updatePipelineStage } = useLeads();

  const handleItemClick = (item: PipelineItemWithLead) => {
    if (item.lead) {
      // Transform the lead to include pipeline_item
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
        }
      };
      setSelectedLead(leadWithPipeline);
      setDetailModalOpen(true);
    }
  };

  const handleStageChange = async (itemId: string, stage: PipelineStage) => {
    await moveToStage(itemId, stage);
  };

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

      <LeadDetailModal
        lead={selectedLead}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSave={updateLead}
        onStageChange={updatePipelineStage}
      />
    </div>
  );
}
