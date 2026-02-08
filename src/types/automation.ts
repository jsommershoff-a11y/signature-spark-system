// Automation Types for n8n Integration

export type FollowupPlanStatus = 'pending' | 'approved' | 'rejected' | 'executed';
export type FollowupStepType = 'email' | 'whatsapp' | 'call' | 'task';
export type FollowupStepStatus = 'pending' | 'executed' | 'skipped' | 'failed';
export type CallQueueItemStatus = 'pending' | 'called' | 'skipped' | 'rescheduled';

export interface FollowupPlan {
  id: string;
  lead_id: string;
  triggered_by?: string;
  status: FollowupPlanStatus;
  approved_by?: string;
  approved_at?: string;
  plan_json: FollowupPlanContent;
  executed_at?: string;
  execution_result?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined
  lead?: {
    id: string;
    first_name: string;
    last_name?: string;
    company?: string;
    email: string;
  };
  approver?: {
    id: string;
    full_name?: string;
  };
  steps?: FollowupStep[];
}

export interface FollowupPlanContent {
  summary: string;
  reasoning: string;
  steps: FollowupStepContent[];
  expected_outcome?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface FollowupStepContent {
  type: FollowupStepType;
  delay_hours: number;
  subject?: string;
  content: string;
  channel?: string;
}

export interface FollowupStep {
  id: string;
  plan_id: string;
  step_order: number;
  step_type: FollowupStepType;
  scheduled_at?: string;
  content_json?: FollowupStepContent;
  status: FollowupStepStatus;
  executed_at?: string;
  result_json?: Record<string, unknown>;
  created_at: string;
}

export interface CallQueue {
  id: string;
  assigned_to: string;
  date: string;
  generated_by: string;
  priority_weight: number;
  created_at: string;
  // Joined
  assignee?: {
    id: string;
    full_name?: string;
  };
  items?: CallQueueItem[];
}

export interface CallQueueItem {
  id: string;
  queue_id: string;
  lead_id: string;
  priority_rank: number;
  reason?: string;
  context_json?: CallContext;
  status: CallQueueItemStatus;
  completed_at?: string;
  outcome?: string;
  created_at: string;
  // Joined
  lead?: {
    id: string;
    first_name: string;
    last_name?: string;
    company?: string;
    email: string;
    phone?: string;
  };
}

export interface CallContext {
  last_contact?: string;
  pipeline_stage?: string;
  purchase_readiness?: number;
  notes?: string;
  ai_suggestion?: string;
}

export interface ClosedCustomerSnapshot {
  id: string;
  order_id: string;
  lead_id: string;
  member_id?: string;
  snapshot_json: CustomerSnapshotData;
  created_at: string;
}

export interface CustomerSnapshotData {
  lead: Record<string, unknown>;
  order: Record<string, unknown>;
  analysis?: Record<string, unknown>;
  pipeline?: Record<string, unknown>;
  timestamp: string;
}

export interface CustomerAvatarModel {
  id: string;
  version: number;
  model_date: string;
  avatar_json: CustomerAvatar;
  sample_size?: number;
  confidence_score?: number;
  created_at: string;
}

export interface CustomerAvatar {
  summary: string;
  demographics: {
    typical_company_size?: string;
    industries?: string[];
    locations?: string[];
  };
  psychographics: {
    pain_points?: string[];
    goals?: string[];
    objections?: string[];
    decision_factors?: string[];
  };
  behavior: {
    typical_sales_cycle_days?: number;
    preferred_channels?: string[];
    peak_activity_times?: string[];
  };
  clusters?: CustomerCluster[];
}

export interface CustomerCluster {
  name: string;
  percentage: number;
  characteristics: string[];
  recommended_approach: string;
}

// UI Labels
export const FOLLOWUP_STATUS_LABELS: Record<FollowupPlanStatus, string> = {
  pending: 'Ausstehend',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt',
  executed: 'Ausgeführt',
};

export const FOLLOWUP_STATUS_COLORS: Record<FollowupPlanStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  executed: 'bg-blue-100 text-blue-800',
};

export const STEP_TYPE_LABELS: Record<FollowupStepType, string> = {
  email: 'E-Mail',
  whatsapp: 'WhatsApp',
  call: 'Anruf',
  task: 'Aufgabe',
};

export const QUEUE_ITEM_STATUS_LABELS: Record<CallQueueItemStatus, string> = {
  pending: 'Ausstehend',
  called: 'Angerufen',
  skipped: 'Übersprungen',
  rescheduled: 'Verschoben',
};
