import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type PipelineStage } from '@/types/crm';
import { getStageLabel, getStageTooltipContent, getStageTooltip } from '@/lib/pipeline-stage';

/**
 * Einheitlicher Tooltip-Stil für alle Pipeline-Stage-Anzeigen.
 *
 * STIL-VERTRAG:
 *  - Breite:        max. 280px (mobil viewport-relativ)
 *  - Schrift:       text-xs / leading-relaxed
 *  - Layout:        Label fett, dann Status / Aufgabe / Ziel als Mini-Sektionen
 *  - Position:      bottom (Default), kollisionssicher
 *  - Delay:         150ms
 *
 * MUSS überall verwendet werden, wo eine Pipeline-Stage erklärt wird.
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
  const { status, task, goal } = getStageTooltipContent(stage);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>
          {asChild ? (
            (children as React.ReactElement)
          ) : (
            <span
              className={className}
              title={withNativeTitle ? getStageTooltip(stage) : undefined}
            >
              {children}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={6}
          align="center"
          avoidCollisions
          collisionPadding={8}
          className="max-w-[min(280px,calc(100vw-16px))] py-2.5 px-3 text-xs leading-relaxed break-words space-y-1.5"
        >
          <p className="font-semibold text-foreground">{label}</p>
          <div className="space-y-1.5 text-muted-foreground">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                Status
              </p>
              <p>{status}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                Aufgabe
              </p>
              <p>{task}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                Ziel
              </p>
              <p>{goal}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
