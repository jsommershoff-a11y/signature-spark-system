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

/* ==========================================================================
 * Prioritäts-Tonalitäten (Single Source of Truth)
 *
 * Wird von PipelineCard, LeadTable, PipelineHeatmap und PipelineStatsWidget
 * verwendet, damit Score-Farben überall identisch sind. Skala (0–100):
 *   ≥ 80  → 'high'      (grün)   – Top-Priorität, sofort bearbeiten
 *   ≥ 60  → 'medium'    (amber)  – Wichtige Leads
 *   ≥ 40  → 'low'       (orange) – Im Auge behalten
 *   <  40 → 'very_low'  (rosé)   – Niedrige Priorität
 *   null  → 'none'      (muted)  – Kein Score
 * ========================================================================== */

export type PriorityTier = 'none' | 'very_low' | 'low' | 'medium' | 'high';

export const PRIORITY_THRESHOLDS = {
  high: 80,
  medium: 60,
  low: 40,
} as const;

export function getPriorityTier(score?: number | null): PriorityTier {
  if (score === undefined || score === null || Number.isNaN(score)) return 'none';
  if (score >= PRIORITY_THRESHOLDS.high) return 'high';
  if (score >= PRIORITY_THRESHOLDS.medium) return 'medium';
  if (score >= PRIORITY_THRESHOLDS.low) return 'low';
  return 'very_low';
}

/** Klartext-Label für Tooltips/Aria. */
export function getPriorityLabel(score?: number | null): string {
  switch (getPriorityTier(score)) {
    case 'high': return 'Hohe Priorität';
    case 'medium': return 'Mittlere Priorität';
    case 'low': return 'Niedrige Priorität';
    case 'very_low': return 'Sehr niedrige Priorität';
    default: return 'Keine Priorität';
  }
}

/** Solid-Badge (z. B. PipelineCard Score-Pill). */
export function getPriorityTone(score?: number | null): string {
  switch (getPriorityTier(score)) {
    case 'high': return 'bg-emerald-500 text-white';
    case 'medium': return 'bg-amber-500 text-white';
    case 'low': return 'bg-orange-500 text-white';
    case 'very_low': return 'bg-rose-500 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
}

/** Reine Text-Farbe (z. B. LeadTable-Zellen). */
export function getPriorityTextClass(score?: number | null): string {
  switch (getPriorityTier(score)) {
    case 'high': return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    case 'medium': return 'text-amber-600 dark:text-amber-400 font-medium';
    case 'low': return 'text-orange-600 dark:text-orange-400';
    case 'very_low': return 'text-rose-600 dark:text-rose-400';
    default: return 'text-muted-foreground';
  }
}

/** Hintergrund-Tint für Heatmap-Zellen / Stats-Bars. */
export function getPriorityBgClass(score?: number | null): string {
  switch (getPriorityTier(score)) {
    case 'high': return 'bg-emerald-500/15';
    case 'medium': return 'bg-amber-500/15';
    case 'low': return 'bg-orange-500/15';
    case 'very_low': return 'bg-rose-500/15';
    default: return 'bg-muted/40';
  }
}


