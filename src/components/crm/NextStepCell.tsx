import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, AlertTriangle, Clock, Lightbulb, User } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  NEXT_STEP_PRIORITY_CLASSES,
  NEXT_STEP_STATUS_CLASSES,
  NEXT_STEP_STATUS_LABEL,
  type NextStepInfo,
} from '@/lib/next-step';

interface Props {
  info: NextStepInfo;
  /** "compact": eine Zeile, ideal für Tabellen. "detail": ausführlich für Detail-Seite. */
  variant?: 'compact' | 'detail';
  className?: string;
}

export function NextStepCell({ info, variant = 'compact', className = '' }: Props) {
  const Icon = info.status === 'overdue' ? AlertTriangle
    : info.isRecommendation ? Lightbulb
    : Clock;

  const dueLabel = info.dueAt
    ? format(new Date(info.dueAt), 'dd.MM.yy HH:mm', { locale: de })
    : null;

  if (variant === 'detail') {
    return (
      <div className={`rounded-lg border p-3 ${NEXT_STEP_STATUS_CLASSES[info.status]} ${className}`}>
        <div className="flex items-start gap-3">
          <Icon className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
              Nächster Schritt {info.isRecommendation && '· Empfehlung'}
            </div>
            <div className={`font-semibold text-sm ${NEXT_STEP_PRIORITY_CLASSES[info.priority]}`}>
              {info.label}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              <Badge variant="outline" className="text-[10px] py-0 h-4 bg-background/50">
                {NEXT_STEP_STATUS_LABEL[info.status]}
              </Badge>
              <span className="flex items-center gap-1 opacity-80">
                <User className="h-3 w-3" />{info.owner}
              </span>
              {dueLabel && (
                <span className="flex items-center gap-1 opacity-80">
                  <Clock className="h-3 w-3" />{dueLabel}
                </span>
              )}
              <span className="opacity-60">Priorität: {info.priority}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // compact
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1.5 min-w-0 ${className}`}>
            <Icon className={`h-3.5 w-3.5 shrink-0 ${
              info.status === 'overdue' ? 'text-destructive'
              : info.status === 'due' ? 'text-amber-600'
              : info.isRecommendation ? 'text-muted-foreground'
              : 'text-sky-600'
            }`} />
            <span className={`truncate text-xs ${
              info.status === 'overdue' ? 'font-semibold text-destructive'
              : info.isRecommendation ? 'text-muted-foreground italic'
              : 'text-foreground'
            }`}>
              {info.label}
            </span>
            {dueLabel && (
              <span className={`shrink-0 text-[10px] ${
                info.status === 'overdue' ? 'text-destructive font-medium' : 'text-muted-foreground'
              }`}>
                · {dueLabel}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <div className="font-semibold">{info.label}</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Status: {NEXT_STEP_STATUS_LABEL[info.status]}</span>
              <span>·</span>
              <span>Priorität: {info.priority}</span>
            </div>
            <div className="text-muted-foreground">Verantwortlich: {info.owner}</div>
            {info.isRecommendation && (
              <div className="text-muted-foreground italic">
                Empfehlung aus Pipeline-Status — keine Aufgabe hinterlegt.
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
