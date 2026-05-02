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
  type PipelineStage,
} from '@/types/crm';

/** Aktionsorientiertes Stage-Label inkl. Emoji (z. B. „👆 Lead prüfen"). */
export function getStageLabel(stage: PipelineStage): string {
  return PIPELINE_STAGE_LABELS[stage];
}

/** Kurzer Hinweis: „Was ist in dieser Phase als Nächstes zu tun?". */
export function getStageHint(stage: PipelineStage): string {
  return PIPELINE_STAGE_HINTS[stage];
}

/**
 * Vollständiger Tooltip-Text für eine Stage – Label + Hint kombiniert.
 * Wird in allen UI-Komponenten als `title=""` und/oder Tooltip-Inhalt genutzt.
 */
export function getStageTooltip(stage: PipelineStage): string {
  return `${PIPELINE_STAGE_LABELS[stage]} – ${PIPELINE_STAGE_HINTS[stage]}`;
}
