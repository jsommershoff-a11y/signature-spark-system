import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PipelineColumn } from './PipelineColumn';
import { PipelineData, PipelineItemWithLead } from '@/hooks/usePipeline';
import { PipelineStage } from '@/types/crm';

interface PipelineBoardProps {
  pipelineByStage: PipelineData;
  loading?: boolean;
  onItemClick?: (item: PipelineItemWithLead) => void;
  onStageChange?: (itemId: string, stage: PipelineStage) => void;
}

const STAGE_ORDER: PipelineStage[] = [
  'new_lead',
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
  'lost',
];

export function PipelineBoard({ 
  pipelineByStage, 
  loading,
  onItemClick,
  onStageChange,
}: PipelineBoardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 p-1 pb-4 h-[calc(100vh-220px)] min-h-[500px]">
        {STAGE_ORDER.map((stage) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            items={pipelineByStage[stage] || []}
            onItemClick={onItemClick}
            onDrop={onStageChange}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
