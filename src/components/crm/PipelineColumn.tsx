import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info } from 'lucide-react';
import { PipelineCard } from './PipelineCard';
import { StageTooltip } from './StageTooltip';
import { PipelineItemWithLead } from '@/hooks/usePipeline';
import { PipelineStage } from '@/types/crm';
import { getStageLabel, getStageHint } from '@/lib/pipeline-stage';
import { cn } from '@/lib/utils';

interface PipelineColumnProps {
  stage: PipelineStage;
  items: PipelineItemWithLead[];
  onItemClick?: (item: PipelineItemWithLead) => void;
  onDrop?: (itemId: string, stage: PipelineStage) => void;
  dimmed?: boolean;
}

function getStageColor(stage: PipelineStage) {
  switch (stage) {
    case 'new_lead': return 'bg-blue-500';
    case 'setter_call_scheduled': return 'bg-cyan-500';
    case 'setter_call_done': return 'bg-teal-500';
    case 'analysis_ready': return 'bg-amber-500';
    case 'offer_draft': return 'bg-orange-500';
    case 'offer_sent': return 'bg-purple-500';
    case 'payment_unlocked': return 'bg-pink-500';
    case 'won': return 'bg-green-500';
    case 'lost': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export function PipelineColumn({ stage, items, onItemClick, onDrop, dimmed = false }: PipelineColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-accent/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-accent/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-accent/50');
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId && onDrop) {
      onDrop(itemId, stage);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('itemId', itemId);
  };

  return (
    <Card
      className={cn(
        "flex flex-col h-full w-[240px] min-w-[240px] max-w-[240px] xs:w-[260px] xs:min-w-[260px] xs:max-w-[260px] sm:w-[300px] sm:min-w-[300px] sm:max-w-[300px] transition-all duration-200",
        dimmed && "opacity-40 grayscale-[0.4] hover:opacity-70"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3 flex-shrink-0 space-y-1.5 px-2.5 sm:px-6 pt-3 sm:pt-6">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 flex-1">
            <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 mt-1", getStageColor(stage))} />
            <StageTooltip stage={stage} className="flex-1 min-w-0">
              <CardTitle
                className="text-[13px] sm:text-sm font-medium leading-snug break-words hyphens-auto"
                style={{ overflowWrap: 'anywhere' }}
              >
                {getStageLabel(stage)}
              </CardTitle>
            </StageTooltip>
            <StageTooltip stage={stage} asChild>
              <button
                type="button"
                aria-label={`Hinweis: ${getStageLabel(stage)}`}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5 -mr-0.5"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </StageTooltip>
          </div>
          <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 flex-shrink-0 mt-0.5">
            {items.length}
          </Badge>
        </div>
        <p
          className="hidden sm:block text-[11px] leading-snug text-muted-foreground break-words"
          style={{ overflowWrap: 'anywhere' }}
        >
          {getStageHint(stage)}
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-2">
            {items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
              >
                <PipelineCard 
                  item={item}
                  onClick={() => onItemClick?.(item)}
                />
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Keine Leads
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
