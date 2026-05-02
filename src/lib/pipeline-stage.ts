/**
 * Zentrale Helfer für Pipeline-Stage-Anzeige.
 *
 * SINGLE SOURCE OF TRUTH:
 * - Labels: PIPELINE_STAGE_LABELS aus '@/types/crm'
 * - Hinweise: PIPELINE_STAGE_HINTS aus '@/types/crm'
 *
 * Alle UI-Komponenten (PipelineColumn, PipelineHeatmap, PipelineStatsWidget)
 * MÜSSEN über diese Helper auf Labels und Tooltips zugreifen, damit Änderungen
 * an einem Ort überall durchschlagen.
 */
import {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_HINTS,
  PIPELINE_STAGE_TOOLTIPS,
  type PipelineStage,
  type PipelineStageTooltip,
} from '@/types/crm';

/** Aktionsorientiertes Stage-Label (z. B. „Eingang – noch nicht bewertet"). */
export function getStageLabel(stage: PipelineStage): string {
  return PIPELINE_STAGE_LABELS[stage];
}

/** Kurzer Hinweis: „Was ist in dieser Phase als Nächstes zu tun?". */
export function getStageHint(stage: PipelineStage): string {
  return PIPELINE_STAGE_HINTS[stage];
}

/** Strukturierter Tooltip-Inhalt: Status / Aufgabe / Ziel. */
export function getStageTooltipContent(stage: PipelineStage): PipelineStageTooltip {
  return PIPELINE_STAGE_TOOLTIPS[stage];
}

/** Kombinierter Plain-Text-Fallback für native `title`-Attribute. */
export function getStageTooltip(stage: PipelineStage): string {
  return `${PIPELINE_STAGE_LABELS[stage]} – ${PIPELINE_STAGE_HINTS[stage]}`;
}

/**
 * Tailwind-Klassen für robustes Label-Wrapping in allen Pipeline-Komponenten.
 * MUSS auf jedes Stage-Label-Element angewandt werden, damit lange Wörter
 * nie über Container-Grenzen hinauslaufen.
 */
export const STAGE_LABEL_WRAP_CLASS =
  'break-words hyphens-auto [overflow-wrap:anywhere] [word-break:break-word]';

