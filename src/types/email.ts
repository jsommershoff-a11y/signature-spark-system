export type EmailTemplateStatus = 'draft' | 'active';
export type SequenceStatus = 'draft' | 'active' | 'paused' | 'archived';
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'unsubscribed';
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent';
export type TriggerType = 'lead_registered' | 'offer_created' | 'offer_not_accepted' | 'product_purchased';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  variables: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType | null;
  trigger_config: Record<string, any>;
  status: SequenceStatus;
  is_preset: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_minutes: number;
  template_id: string | null;
  subject_override: string | null;
  conditions: Record<string, any> | null;
  created_at: string;
}

export interface LeadSequenceEnrollment {
  id: string;
  lead_id: string;
  sequence_id: string;
  status: EnrollmentStatus;
  current_step: number;
  enrolled_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  enrollment_id: string | null;
  template_id: string | null;
  lead_id: string;
  subject: string;
  body_html: string;
  status: MessageStatus;
  sent_at: string | null;
  message_type: 'sequence' | 'broadcast';
  broadcast_id: string | null;
  resend_message_id: string | null;
  created_at: string;
}

export interface EmailEvent {
  id: string;
  message_id: string;
  event_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface EmailBroadcast {
  id: string;
  name: string;
  template_id: string | null;
  subject: string;
  body_html: string | null;
  segment_filter: Record<string, any>;
  status: BroadcastStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  lead_registered: 'Lead Registrierung',
  offer_created: 'Angebot erstellt',
  offer_not_accepted: 'Angebot nicht angenommen',
  product_purchased: 'Produkt gekauft',
};

export const SEQUENCE_STATUS_LABELS: Record<SequenceStatus, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  paused: 'Pausiert',
  archived: 'Archiviert',
};

export const SEQUENCE_STATUS_COLORS: Record<SequenceStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
