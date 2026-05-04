import { PIPELINE_STAGE_HINTS, type PipelineStage } from '@/types/crm';

export type NextStepStatus = 'open' | 'due' | 'overdue' | 'done' | 'recommendation';

export interface NextStepInfo {
  /** Anzuzeigender Text (z. B. "Angebot finalisieren") */
  label: string;
  /** Fälligkeitsdatum, falls echte Aufgabe */
  dueAt: string | null;
  /** Verantwortlicher Anzeigename, fällt auf "Jan (Standard)" zurück */
  owner: string;
  /** Priorität (low/normal/high/urgent) — ableitbar aus Task oder Pipeline */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** Status-Bucket für Farb-Badge */
  status: NextStepStatus;
  /** Wenn `true`, ist es eine Pipeline-Empfehlung (kein echter Task) */
  isRecommendation: boolean;
}

interface ResolveInput {
  /** Echte CRM-Aufgaben (offen, sortiert nach due_at asc) */
  tasks?: Array<{
    title?: string | null;
    due_at?: string | null;
    status?: string | null;
    type?: string | null;
    assigned_user_name?: string | null;
  }>;
  /** Pipeline-Stage des Datensatzes — Fallback-Quelle für Empfehlung */
  stage?: PipelineStage | string | null;
  /** Verantwortlicher des Records (Lead-Owner / Customer-Owner) */
  ownerName?: string | null;
}

const STAGE_PRIORITY: Record<PipelineStage, NextStepInfo['priority']> = {
  new_lead: 'high',
  setter_call_scheduled: 'high',
  setter_call_done: 'normal',
  analysis_ready: 'high',
  offer_draft: 'high',
  offer_sent: 'normal',
  payment_unlocked: 'urgent',
  won: 'normal',
  lost: 'low',
};

const isPipelineStage = (s: unknown): s is PipelineStage =>
  typeof s === 'string' && s in PIPELINE_STAGE_HINTS;

/**
 * Resolves the "next step" for a lead/customer.
 * Echte Aufgaben werden bevorzugt — Pipeline-Empfehlung als sauberer Fallback.
 */
export function resolveNextStep({ tasks, stage, ownerName }: ResolveInput): NextStepInfo {
  const owner = ownerName?.trim() || 'Jan (Standard)';
  const now = Date.now();

  // 1) Echte offene Aufgabe bevorzugen
  const openTask = (tasks ?? []).find(
    (t) => t.status !== 'done' && t.status !== 'completed' && t.status !== 'cancelled',
  );

  if (openTask) {
    const due = openTask.due_at ? new Date(openTask.due_at).getTime() : null;
    let status: NextStepStatus = 'open';
    if (due !== null) {
      const diffH = (due - now) / 36e5;
      if (diffH < 0) status = 'overdue';
      else if (diffH < 24) status = 'due';
      else status = 'open';
    }
    // Priorität: Task-Typ > Pipeline-Stage
    const taskPriority: NextStepInfo['priority'] =
      openTask.type === 'intervention' ? 'urgent' :
      openTask.type === 'call' ? 'high' :
      isPipelineStage(stage) ? STAGE_PRIORITY[stage] : 'normal';

    return {
      label: openTask.title?.trim() || 'Offene Aufgabe',
      dueAt: openTask.due_at ?? null,
      owner: openTask.assigned_user_name?.trim() || owner,
      priority: taskPriority,
      status,
      isRecommendation: false,
    };
  }

  // 2) Pipeline-Empfehlung
  if (isPipelineStage(stage)) {
    return {
      label: PIPELINE_STAGE_HINTS[stage],
      dueAt: null,
      owner,
      priority: STAGE_PRIORITY[stage],
      status: 'recommendation',
      isRecommendation: true,
    };
  }

  // 3) Letzter Fallback — generisch
  return {
    label: 'Lead prüfen und nächsten Schritt festlegen',
    dueAt: null,
    owner,
    priority: 'normal',
    status: 'recommendation',
    isRecommendation: true,
  };
}

export const NEXT_STEP_STATUS_LABEL: Record<NextStepStatus, string> = {
  open: 'Offen',
  due: 'Fällig heute',
  overdue: 'Überfällig',
  done: 'Erledigt',
  recommendation: 'Empfehlung',
};

export const NEXT_STEP_STATUS_CLASSES: Record<NextStepStatus, string> = {
  open: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  due: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  overdue: 'bg-destructive/15 text-destructive border-destructive/30 animate-pulse',
  done: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  recommendation: 'bg-muted text-muted-foreground border-border',
};

export const NEXT_STEP_PRIORITY_CLASSES: Record<NextStepInfo['priority'], string> = {
  low: 'text-muted-foreground',
  normal: 'text-foreground',
  high: 'text-amber-600',
  urgent: 'text-destructive',
};
