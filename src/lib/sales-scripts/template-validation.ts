/**
 * Validation for follow-up email templates.
 * Checks placeholder usage, unknown placeholders, and stage-specific requirements.
 */

import type { FollowUpVariant } from './follow-up';

/** All placeholders the renderer (`renderFollowUpTemplate`) supports. */
export const KNOWN_PLACEHOLDERS = [
  'greeting_name',
  'when',
  'company',
  'stage_label',
  'context_line',
] as const;

export type KnownPlaceholder = typeof KNOWN_PLACEHOLDERS[number];

/**
 * Placeholders that should appear in EVERY template body — they ensure
 * personal greeting and basic personalization.
 */
const REQUIRED_PLACEHOLDERS: KnownPlaceholder[] = ['greeting_name'];

/**
 * Stage-specific recommendations: if a template targets one of these stages,
 * the listed placeholders are strongly recommended.
 */
const STAGE_RECOMMENDED: Record<string, KnownPlaceholder[]> = {
  setter_call_scheduled: ['when'],
  setter_call_done: ['when'],
  analysis_ready: ['stage_label'],
  offer_sent: ['company'],
  offer_draft: ['company'],
};

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractPlaceholders(text: string): string[] {
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((m = PLACEHOLDER_RE.exec(text)) !== null) {
    found.add(m[1]);
  }
  return [...found];
}

export interface TemplateValidationIssue {
  level: 'error' | 'warning';
  code:
    | 'missing_required'
    | 'unknown_placeholder'
    | 'stage_recommended_missing'
    | 'variant_unknown_placeholder'
    | 'variant_missing_required';
  message: string;
  placeholder?: string;
  variantId?: string;
}

export interface TemplateValidationInput {
  subject: string;
  body: string;
  stages: string[];
  variants: FollowUpVariant[];
}

export interface TemplateValidationResult {
  errors: TemplateValidationIssue[];
  warnings: TemplateValidationIssue[];
  hasIssues: boolean;
}

export function validateFollowUpTemplate(
  input: TemplateValidationInput,
): TemplateValidationResult {
  const errors: TemplateValidationIssue[] = [];
  const warnings: TemplateValidationIssue[] = [];

  const combined = `${input.subject}\n${input.body}`;
  const used = new Set(extractPlaceholders(combined));

  // 1. Required placeholders missing → ERROR
  for (const req of REQUIRED_PLACEHOLDERS) {
    if (!used.has(req)) {
      errors.push({
        level: 'error',
        code: 'missing_required',
        placeholder: req,
        message: `Pflicht-Platzhalter {{${req}}} fehlt im Betreff oder Body.`,
      });
    }
  }

  // 2. Unknown placeholders → WARNING (likely typo)
  for (const ph of used) {
    if (!KNOWN_PLACEHOLDERS.includes(ph as KnownPlaceholder)) {
      warnings.push({
        level: 'warning',
        code: 'unknown_placeholder',
        placeholder: ph,
        message: `Unbekannter Platzhalter {{${ph}}} – Tippfehler? Erlaubt: ${KNOWN_PLACEHOLDERS.join(', ')}.`,
      });
    }
  }

  // 3. Stage-recommended placeholders → WARNING
  for (const stage of input.stages) {
    const recs = STAGE_RECOMMENDED[stage];
    if (!recs) continue;
    for (const rec of recs) {
      if (!used.has(rec)) {
        warnings.push({
          level: 'warning',
          code: 'stage_recommended_missing',
          placeholder: rec,
          message: `Phase „${stage}": {{${rec}}} wird empfohlen, fehlt aber.`,
        });
      }
    }
  }

  // 4. Variants
  for (const v of input.variants) {
    const vText = `${v.subject ?? ''}\n${(v.body ?? []).join('\n')}`;
    if (!vText.trim()) continue;
    const vUsed = new Set(extractPlaceholders(vText));

    // Required check for variant body if it overrides body
    if (v.body && v.body.length > 0) {
      for (const req of REQUIRED_PLACEHOLDERS) {
        // Variante darf Pflichtplatzhalter aus Standard-Body übernehmen,
        // aber wenn sie Body überschreibt, sollte Greeting drin sein.
        if (!vUsed.has(req) && !used.has(req)) {
          errors.push({
            level: 'error',
            code: 'variant_missing_required',
            placeholder: req,
            variantId: v.id,
            message: `Variante ${v.id}: Pflicht-Platzhalter {{${req}}} fehlt.`,
          });
        }
      }
    }

    for (const ph of vUsed) {
      if (!KNOWN_PLACEHOLDERS.includes(ph as KnownPlaceholder)) {
        warnings.push({
          level: 'warning',
          code: 'variant_unknown_placeholder',
          placeholder: ph,
          variantId: v.id,
          message: `Variante ${v.id}: Unbekannter Platzhalter {{${ph}}}.`,
        });
      }
    }
  }

  return {
    errors,
    warnings,
    hasIssues: errors.length > 0 || warnings.length > 0,
  };
}
