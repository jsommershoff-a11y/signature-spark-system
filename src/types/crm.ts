// CRM Type Definitions

export type LeadSourceType = 
  | 'inbound_paid'
  | 'inbound_organic'
  | 'referral'
  | 'outbound_ai'
  | 'outbound_manual'
  | 'partner';

export type LeadDiscoveredBy = 'daily_ai' | 'manual' | 'inbound';

export type LeadStatus = 'new' | 'qualified' | 'unqualified';

export type PipelineStage = 
  | 'new_lead'
  | 'setter_call_scheduled'
  | 'setter_call_done'
  | 'analysis_ready'
  | 'offer_draft'
  | 'offer_sent'
  | 'payment_unlocked'
  | 'won'
  | 'lost';

export type TaskType = 'call' | 'followup' | 'review_offer' | 'intervention';

export type TaskStatus = 'open' | 'done' | 'blocked';

export interface CrmLead {
  id: string;
  created_at: string;
  updated_at: string;
  source_type: LeadSourceType;
  source_detail?: string;
  source_confidence_score?: number;
  source_priority_weight: number;
  discovered_by: LeadDiscoveredBy;
  dedupe_key?: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  company?: string;
  website_url?: string;
  industry?: string;
  location?: string;
  icp_fit_score?: number;
  icp_fit_reason?: Record<string, unknown>;
  enrichment_json?: Record<string, unknown>;
  owner_user_id?: string;
  status: LeadStatus;
  notes?: string;
  // Joined data
  owner?: {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  pipeline_item?: PipelineItem;
}

export interface PipelineItem {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  stage: PipelineStage;
  stage_updated_at: string;
  pipeline_priority_score?: number;
  purchase_readiness?: number;
  urgency?: number;
  // Joined data
  lead?: CrmLead;
}

export interface CrmTask {
  id: string;
  created_at: string;
  updated_at: string;
  assigned_user_id: string;
  lead_id?: string;
  member_id?: string;
  type: TaskType;
  title: string;
  description?: string;
  due_at?: string;
  status: TaskStatus;
  meta?: Record<string, unknown>;
  // Joined data
  assigned_user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  lead?: CrmLead;
}

// Form types for creating/updating
export interface CreateLeadInput {
  source_type: LeadSourceType;
  source_detail?: string;
  source_confidence_score?: number;
  source_priority_weight?: number;
  discovered_by?: LeadDiscoveredBy;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  company?: string;
  website_url?: string;
  industry?: string;
  location?: string;
  icp_fit_score?: number;
  icp_fit_reason?: Record<string, unknown>;
  owner_user_id?: string;
  status?: LeadStatus;
  notes?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  id: string;
}

export interface CreateTaskInput {
  assigned_user_id: string;
  lead_id?: string;
  member_id?: string;
  type: TaskType;
  title: string;
  description?: string;
  due_at?: string;
  status?: TaskStatus;
  meta?: Record<string, unknown>;
}

export interface UpdateTaskInput extends Partial<Omit<CreateTaskInput, 'assigned_user_id'>> {
  id: string;
}

// Filter types
export interface LeadFilters {
  status?: LeadStatus;
  source_type?: LeadSourceType;
  owner_user_id?: string;
  stage?: PipelineStage;
  search?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  type?: TaskType;
  assigned_user_id?: string;
  due_today?: boolean;
  lead_id?: string;
}

// UI Labels
export const SOURCE_TYPE_LABELS: Record<LeadSourceType, string> = {
  inbound_paid: 'Bezahlte Werbung',
  inbound_organic: 'Organisch',
  referral: 'Empfehlung',
  outbound_ai: 'Outbound (AI)',
  outbound_manual: 'Outbound (Manuell)',
  partner: 'Partner',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Neu',
  qualified: 'Qualifiziert',
  unqualified: 'Unqualifiziert',
};

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  new_lead: 'Eingang – noch nicht bewertet',
  setter_call_scheduled: 'Erstgespräch terminiert',
  setter_call_done: 'Erstgespräch durchgeführt',
  analysis_ready: 'Analyse erstellt – bereit für Angebot',
  offer_draft: 'Angebot wird vorbereitet',
  offer_sent: 'Angebot versendet – Entscheidung offen',
  payment_unlocked: 'Follow-up & Abschlussphase',
  won: 'Kunde gewonnen',
  lost: 'Kein Abschluss',
};

// Strukturierte Tooltip-Inhalte pro Pipeline-Phase: Status / Aufgabe / Ziel.
// Zentrale Quelle für StageTooltip + alle abgeleiteten Hint-Texte.
export interface PipelineStageTooltip {
  status: string;
  task: string;
  goal: string;
}

export const PIPELINE_STAGE_TOOLTIPS: Record<PipelineStage, PipelineStageTooltip> = {
  new_lead: {
    status: 'Ein neuer Lead ist eingegangen und wurde noch nicht qualifiziert.',
    task: 'Lead prüfen, Quelle ansehen und entscheiden, ob ein Erstgespräch sinnvoll ist.',
    goal: 'Relevante Leads schnell erkennen und priorisieren.',
  },
  setter_call_scheduled: {
    status: 'Ein Erstgespräch wurde vereinbart.',
    task: 'Gespräch vorbereiten, Zielgruppe prüfen und relevante Fragen bereitlegen.',
    goal: 'Bedarf, Problem und wirtschaftliches Potenzial verstehen.',
  },
  setter_call_done: {
    status: 'Das Erstgespräch wurde geführt.',
    task: 'Gespräch zusammenfassen, Schmerzpunkte dokumentieren und Analyse starten.',
    goal: 'Eine belastbare Grundlage für Analyse und Angebot schaffen.',
  },
  analysis_ready: {
    status: 'Die Analyse ist abgeschlossen.',
    task: 'Lösungsvorschlag, Nutzenargumentation und Kosten-Nutzen-Rechnung vorbereiten.',
    goal: 'Aus dem Bedarf ein passendes Angebot ableiten.',
  },
  offer_draft: {
    status: 'Das Angebot befindet sich in Erstellung oder Prüfung.',
    task: 'Inhalte, Preise, Nutzenrechnung und nächste Schritte finalisieren.',
    goal: 'Ein klares, verkaufsstarkes und prüfbares Angebot erstellen.',
  },
  offer_sent: {
    status: 'Der Kunde hat das Angebot erhalten.',
    task: 'Reaktion prüfen, Follow-up planen und Zweitberatung sichern.',
    goal: 'Entscheidung vorbereiten und offene Fragen klären.',
  },
  payment_unlocked: {
    status: 'Das Angebot wird aktiv nachverfolgt.',
    task: 'Einwände klären, Entscheidung herbeiführen und Zahlung vorbereiten.',
    goal: 'Abschluss erzielen oder klare Absage dokumentieren.',
  },
  won: {
    status: 'Der Kunde hat bezahlt oder wurde durch Admin als gewonnen bestätigt.',
    task: 'Onboarding starten und nächste Schritte einleiten.',
    goal: 'Leistungserbringung sauber starten.',
  },
  lost: {
    status: 'Der Lead wurde verloren oder ist aktuell nicht passend.',
    task: 'Grund dokumentieren und Learnings für Vertrieb und Marketing ableiten.',
    goal: 'Systematisch aus verlorenen Chancen lernen.',
  },
};

// Kurzform der Hinweise (1-Zeilen-Aktion) – aus Tooltip-Tasks abgeleitet.
// Wird weiterhin von einigen Stellen als kompakter `title`-Text genutzt.
export const PIPELINE_STAGE_HINTS: Record<PipelineStage, string> = {
  new_lead: PIPELINE_STAGE_TOOLTIPS.new_lead.task,
  setter_call_scheduled: PIPELINE_STAGE_TOOLTIPS.setter_call_scheduled.task,
  setter_call_done: PIPELINE_STAGE_TOOLTIPS.setter_call_done.task,
  analysis_ready: PIPELINE_STAGE_TOOLTIPS.analysis_ready.task,
  offer_draft: PIPELINE_STAGE_TOOLTIPS.offer_draft.task,
  offer_sent: PIPELINE_STAGE_TOOLTIPS.offer_sent.task,
  payment_unlocked: PIPELINE_STAGE_TOOLTIPS.payment_unlocked.task,
  won: PIPELINE_STAGE_TOOLTIPS.won.task,
  lost: PIPELINE_STAGE_TOOLTIPS.lost.task,
};


// Pipeline-Filter-Gruppen (nach Team-Verantwortung)
export type PipelineGroup = 'all' | 'active' | 'setter' | 'closer' | 'archive';

export const PIPELINE_GROUP_LABELS: Record<PipelineGroup, string> = {
  all: 'Alle',
  active: 'Aktiv',
  setter: '📞 Setter',
  closer: '💼 Closer',
  archive: '📦 Archiv',
};

export const PIPELINE_GROUP_HINTS: Record<PipelineGroup, string> = {
  all: 'Alle Phasen anzeigen.',
  active: 'Alles, woran aktuell gearbeitet wird (ohne Gewonnen/Verloren).',
  setter: 'Lead prüfen, Termin vorbereiten, Gespräch auswerten.',
  closer: 'Angebot vorbereiten, finalisieren, nachfassen, Abschluss klären.',
  archive: 'Abgeschlossene Deals: Gewonnen oder Verloren.',
};

export const PIPELINE_GROUP_STAGES: Record<Exclude<PipelineGroup, 'all'>, PipelineStage[]> = {
  active: ['new_lead', 'setter_call_scheduled', 'setter_call_done', 'analysis_ready', 'offer_draft', 'offer_sent', 'payment_unlocked'],
  setter: ['new_lead', 'setter_call_scheduled', 'setter_call_done'],
  closer: ['analysis_ready', 'offer_draft', 'offer_sent', 'payment_unlocked'],
  archive: ['won', 'lost'],
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  call: 'Anruf',
  followup: 'Follow-up',
  review_offer: 'Angebot prüfen',
  intervention: 'Intervention',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Offen',
  done: 'Erledigt',
  blocked: 'Blockiert',
};

export const TASK_TYPE_ICONS: Record<TaskType, string> = {
  call: '📞',
  followup: '🔄',
  review_offer: '📝',
  intervention: '🚨',
};
