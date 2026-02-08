import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Phone } from 'lucide-react';
import { PipelineItemWithLead } from '@/hooks/usePipeline';
import { cn } from '@/lib/utils';

interface PipelineCardProps {
  item: PipelineItemWithLead;
  onClick?: () => void;
  isDragging?: boolean;
}

function getPriorityColor(score?: number) {
  if (!score) return 'bg-gray-400';
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function PipelineCard({ item, onClick, isDragging }: PipelineCardProps) {
  const lead = item.lead;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isDragging && "opacity-50 rotate-2 shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {lead.first_name} {lead.last_name}
            </div>
            {lead.company && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{lead.company}</span>
              </div>
            )}
          </div>
          <div 
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold",
              getPriorityColor(item.pipeline_priority_score)
            )}
          >
            {item.pipeline_priority_score ?? '-'}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {lead.owner && (
            <Badge variant="secondary" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              {lead.owner.first_name || lead.owner.full_name}
            </Badge>
          )}
          {lead.phone && (
            <Badge variant="outline" className="text-xs">
              <Phone className="h-3 w-3 mr-1" />
              Telefon
            </Badge>
          )}
        </div>

        {lead.icp_fit_score && (
          <div className="mt-2 text-xs text-muted-foreground">
            ICP Score: {lead.icp_fit_score}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
