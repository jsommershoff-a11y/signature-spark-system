import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  User,
  Phone,
  Mail,
  ArrowUpRight,
  Clock,
  Target,
} from 'lucide-react';
import { PipelineItemWithLead } from '@/hooks/usePipeline';
import { getStageLabel } from '@/lib/pipeline-stage';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { de } from 'date-fns/locale';

interface PipelineCardProps {
  item: PipelineItemWithLead;
  onClick?: () => void;
  isDragging?: boolean;
}

function getPriorityTone(score?: number) {
  if (score === undefined || score === null) {
    return 'bg-muted text-muted-foreground';
  }
  if (score >= 80) return 'bg-emerald-500 text-white';
  if (score >= 60) return 'bg-amber-500 text-white';
  if (score >= 40) return 'bg-orange-500 text-white';
  return 'bg-rose-500 text-white';
}

function getPriorityLabel(score?: number) {
  if (score === undefined || score === null) return 'Keine Priorität';
  if (score >= 80) return 'Hohe Priorität';
  if (score >= 60) return 'Mittlere Priorität';
  if (score >= 40) return 'Niedrige Priorität';
  return 'Sehr niedrig';
}

function getInitials(first?: string, last?: string) {
  const f = (first || '').trim()[0] || '';
  const l = (last || '').trim()[0] || '';
  return (f + l).toUpperCase() || '?';
}

function getRelativeTime(iso?: string) {
  if (!iso) return null;
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: de });
  } catch {
    return null;
  }
}

export function PipelineCard({ item, onClick, isDragging }: PipelineCardProps) {
  const lead = item.lead;
  const fullName = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() || lead.email;
  const stageLabel = getStageLabel(item.stage);
  const movedAgo = getRelativeTime(item.stage_updated_at);
  const priority = item.pipeline_priority_score;
  const icp = lead.icp_fit_score;

  // Mini-CTAs ohne Card-Click zu triggern
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:shadow-md hover:border-primary/40 border',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2.5">
        {/* Kopfzeile: Avatar + Name + Priority */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {getInitials(lead.first_name, lead.last_name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm leading-tight truncate" title={fullName}>
                {fullName}
              </div>
              {lead.company && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate" title={lead.company}>{lead.company}</span>
                </div>
              )}
            </div>
          </div>
          <div
            className={cn(
              'flex flex-col items-center justify-center min-w-8 h-8 px-1.5 rounded-md text-[11px] font-bold tabular-nums',
              getPriorityTone(priority),
            )}
            title={getPriorityLabel(priority)}
          >
            {priority ?? '–'}
          </div>
        </div>

        {/* Status-Zeile: aktuelle Phase + letzte Bewegung */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <Badge
            variant="outline"
            className="text-[10px] font-normal px-1.5 py-0 h-5 max-w-[60%] truncate border-border/70"
            title={stageLabel}
          >
            {stageLabel}
          </Badge>
          {movedAgo && (
            <span className="flex items-center gap-1 flex-shrink-0" title={`Phase aktualisiert ${movedAgo}`}>
              <Clock className="h-3 w-3" />
              {movedAgo}
            </span>
          )}
        </div>

        {/* Owner + ICP */}
        {(lead.owner || icp !== undefined) && (
          <div className="flex items-center gap-2 flex-wrap">
            {lead.owner && (
              <Badge variant="secondary" className="text-[10px] font-normal h-5 px-1.5">
                <User className="h-3 w-3 mr-1" />
                {lead.owner.first_name || lead.owner.full_name || 'Owner'}
              </Badge>
            )}
            {icp !== undefined && icp !== null && (
              <Badge
                variant="outline"
                className="text-[10px] font-normal h-5 px-1.5"
                title={`ICP-Fit: ${icp}%`}
              >
                <Target className="h-3 w-3 mr-1" />
                ICP {icp}%
              </Badge>
            )}
          </div>
        )}

        {/* Mini-CTA-Leiste – Mobile: immer sichtbar, Desktop: full row */}
        <div
          className="flex items-center gap-1 pt-1.5 border-t border-border/60 -mx-1"
          // Drag-Handle auf Card lassen, aber Buttons selbst nicht draggen
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={stop}
        >
          {lead.phone && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[11px] font-normal flex-1 min-w-0 touch-manipulation"
              onClick={stop}
              title={`Anrufen: ${lead.phone}`}
            >
              <a href={`tel:${lead.phone}`} aria-label={`Anrufen ${lead.phone}`}>
                <Phone className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">Anrufen</span>
              </a>
            </Button>
          )}
          {lead.email && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[11px] font-normal flex-1 min-w-0 touch-manipulation"
              onClick={stop}
              title={`E-Mail: ${lead.email}`}
            >
              <a href={`mailto:${lead.email}`} aria-label={`E-Mail an ${lead.email}`}>
                <Mail className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">E-Mail</span>
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[11px] font-normal text-primary flex-shrink-0 touch-manipulation md:opacity-70 md:group-hover:opacity-100 md:transition-opacity"
            onClick={(e) => {
              stop(e);
              onClick?.();
            }}
            title="Lead öffnen"
            aria-label="Lead öffnen"
          >
            <span className="hidden xs:inline">Öffnen</span>
            <ArrowUpRight className="h-3.5 w-3.5 xs:ml-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
