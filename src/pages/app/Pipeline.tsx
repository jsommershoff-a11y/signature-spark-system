import { usePipeline, PipelineItemWithLead } from '@/hooks/usePipeline';
import { PipelineBoard } from '@/components/crm/PipelineBoard';
import { PipelineStage } from '@/types/crm';

export default function Pipeline() {
  const { 
    pipelineByStage, 
    loading,
    moveToStage,
  } = usePipeline();

  const handleItemClick = (item: PipelineItemWithLead) => {
    // TODO: Open lead detail modal
    console.log('Pipeline item clicked:', item);
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
    </div>
  );
}
