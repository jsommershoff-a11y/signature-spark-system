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

// Kurze Aktions-Hinweise pro Pipeline-Phase ("Was ist hier als Nächstes zu tun?")
export const PIPELINE_STAGE_HINTS: Record<PipelineStage, string> = {
  new_lead: 'Lead sichten und qualifizieren: passt ICP? Dann Erstgespräch anbieten.',
  setter_call_scheduled: 'Termin bestätigen, Reminder senden, No-Show vermeiden.',
  setter_call_done: 'Bedarf dokumentieren und Analyse / Lösungsvorschlag vorbereiten.',
  analysis_ready: 'Angebot konfigurieren – Module, Preis und Laufzeit festlegen.',
  offer_draft: 'Angebot finalisieren und an den Lead versenden.',
  offer_sent: 'Aktiv nachfassen: offene Fragen klären, Entscheidung herbeiführen.',
  payment_unlocked: 'Closing absichern: Vertrag, Zahlung und Onboarding-Start abstimmen.',
  won: 'Onboarding starten und in Kundenbetreuung übergeben.',
  lost: 'Verlustgrund dokumentieren und ggf. in Nurture-Sequenz aufnehmen.',
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
