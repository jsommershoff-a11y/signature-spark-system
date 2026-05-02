import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type PipelineStage } from '@/types/crm';
import { getStageLabel, getStageHint } from '@/lib/pipeline-stage';

/**
 * Einheitlicher Tooltip-Stil für alle Pipeline-Stage-Anzeigen.
 *
 * STIL-VERTRAG (zentral, hier definiert):
 *  - Breite:        max. 260px
 *  - Schriftgröße:  text-xs
 *  - Zeilenhöhe:    leading-relaxed
 *  - Padding:       py-2 px-3 (vom shadcn-Default überschrieben)
 *  - Spacing:       Label fett, Hint darunter mit mt-1
 *  - Position:      side="bottom" (Default)
 *  - Delay:         150ms
 *
 * MUSS überall verwendet werden, wo eine Pipeline-Stage erklärt wird:
 * PipelineColumn, PipelineHeatmap, PipelineStatsWidget.
 */
interface StageTooltipProps {
  stage: PipelineStage;
  children: ReactNode;
  /** Tooltip-Position relativ zum Trigger. Default: 'bottom'. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Auch ein nativer HTML-`title`-Fallback (a11y für Touch + Tab-Nav). */
  withNativeTitle?: boolean;
  /** Wrapper-Klassen für den TooltipTrigger-Span (z. B. layout). */
  className?: string;
  /** Wenn true, wird der Trigger als `asChild` durchgereicht statt in <span> gewrappt. */
  asChild?: boolean;
}

export function StageTooltip({
  stage,
  children,
  side = 'bottom',
  withNativeTitle = false,
  className,
  asChild = false,
}: StageTooltipProps) {
  const label = getStageLabel(stage);
  const hint = getStageHint(stage);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>
          {asChild ? (
            (children as React.ReactElement)
          ) : (
            <span
              className={className}
              title={withNativeTitle ? `${label} – ${hint}` : undefined}
            >
              {children}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={6}
          className="max-w-[260px] py-2 px-3 text-xs leading-relaxed"
        >
          <p className="font-semibold">{label}</p>
          <p className="mt-1 text-muted-foreground">{hint}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
