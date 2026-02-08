import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PipelineCard } from './PipelineCard';
import { PipelineItemWithLead } from '@/hooks/usePipeline';
import { PipelineStage, PIPELINE_STAGE_LABELS } from '@/types/crm';
import { cn } from '@/lib/utils';

interface PipelineColumnProps {
  stage: PipelineStage;
  items: PipelineItemWithLead[];
  onItemClick?: (item: PipelineItemWithLead) => void;
  onDrop?: (itemId: string, stage: PipelineStage) => void;
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

export function PipelineColumn({ stage, items, onItemClick, onDrop }: PipelineColumnProps) {
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
      className="flex flex-col h-full min-w-[280px] max-w-[280px] transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", getStageColor(stage))} />
            <CardTitle className="text-sm font-medium">
              {PIPELINE_STAGE_LABELS[stage]}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
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
