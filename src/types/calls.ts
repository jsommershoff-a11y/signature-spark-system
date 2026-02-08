// Call & Analysis Type Definitions

import type { CrmLead } from './crm';

// =============================================
// ENUMS
// =============================================

export type CallProvider = 'zoom' | 'twilio' | 'sipgate' | 'manual';
export type CallType = 'phone' | 'zoom' | 'teams' | 'other';
export type CallStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'recording_ready'
  | 'transcribed'
  | 'analyzed'
  | 'failed';

export type TranscriptStatus = 'pending' | 'processing' | 'done' | 'failed';
export type StructogramType = 'red' | 'green' | 'blue' | 'mixed' | 'unknown';

// =============================================
// INTERFACES
// =============================================

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
}

export interface Call {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  conducted_by?: string;
  provider: CallProvider;
  call_type: CallType;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  recording_url?: string;
  storage_path?: string;
  status: CallStatus;
  notes?: string;
  external_id?: string;
  meta?: Record<string, unknown>;
  // Joined data
  lead?: CrmLead;
  conductor?: Profile;
  transcript?: Transcript;
  analysis?: AiAnalysis;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface Transcript {
  id: string;
  created_at: string;
  updated_at: string;
  call_id: string;
  provider: string;
  language: string;
  text?: string;
  segments?: TranscriptSegment[];
  status: TranscriptStatus;
  error_message?: string;
  word_count?: number;
  confidence_score?: number;
}

// =============================================
// ANALYSIS RESULT STRUCTURE
// =============================================

export interface AnalysisResult {
  summary: {
    key_points: string[];
    call_quality: 'excellent' | 'good' | 'average' | 'poor';
    next_steps_recommended: string[];
  };
  
  problems: {
    identified: Array<{
      category: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      quote?: string;
    }>;
    pain_intensity: number;
  };
  
  objections: {
    raised: Array<{
      type: 'price' | 'timing' | 'trust' | 'need' | 'authority' | 'other';
      description: string;
      handled: boolean;
      response_quality?: 'excellent' | 'good' | 'average' | 'poor';
    }>;
    objection_handling_score: number;
  };
  
  buying_signals: {
    positive: string[];
    negative: string[];
    strength: number;
  };
  
  structogram: {
    primary_color: 'red' | 'green' | 'blue';
    secondary_color?: 'red' | 'green' | 'blue';
    confidence: number;
    indicators: {
      red_traits: string[];
      green_traits: string[];
      blue_traits: string[];
    };
    communication_tips: string[];
  };
  
  conversation_quality: {
    talk_ratio: {
      seller_percentage: number;
      buyer_percentage: number;
    };
    engagement_score: number;
    rapport_score: number;
  };
  
  recommendations: {
    immediate_actions: string[];
    follow_up_timing: string;
    offer_adjustments: string[];
  };
}

export interface AiAnalysis {
  id: string;
  created_at: string;
  updated_at: string;
  call_id: string;
  lead_id?: string;
  analysis_json: AnalysisResult;
  purchase_readiness?: number;
  success_probability?: number;
  primary_type: StructogramType;
  secondary_type?: StructogramType;
  model_version: string;
  status: string;
}

// =============================================
// FORM TYPES
// =============================================

export interface CreateCallInput {
  lead_id: string;
  conducted_by?: string;
  provider?: CallProvider;
  call_type?: CallType;
  scheduled_at?: string;
  notes?: string;
}

export interface UpdateCallInput {
  id: string;
  status?: CallStatus;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  recording_url?: string;
  storage_path?: string;
  notes?: string;
}

export interface CreateTranscriptInput {
  call_id: string;
  provider?: string;
  language?: string;
  text?: string;
  segments?: TranscriptSegment[];
}

// =============================================
// FILTER TYPES
// =============================================

export interface CallFilters {
  lead_id?: string;
  status?: CallStatus;
  conducted_by?: string;
  from_date?: string;
  to_date?: string;
}

// =============================================
// UI LABELS
// =============================================

export const CALL_PROVIDER_LABELS: Record<CallProvider, string> = {
  zoom: 'Zoom',
  twilio: 'Twilio',
  sipgate: 'Sipgate',
  manual: 'Manuell',
};

export const CALL_TYPE_LABELS: Record<CallType, string> = {
  phone: 'Telefon',
  zoom: 'Zoom Meeting',
  teams: 'Teams Meeting',
  other: 'Sonstiges',
};

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  scheduled: 'Geplant',
  in_progress: 'Läuft',
  completed: 'Beendet',
  recording_ready: 'Aufnahme bereit',
  transcribed: 'Transkribiert',
  analyzed: 'Analysiert',
  failed: 'Fehlgeschlagen',
};

export const CALL_STATUS_COLORS: Record<CallStatus, string> = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  recording_ready: 'bg-purple-500',
  transcribed: 'bg-indigo-500',
  analyzed: 'bg-emerald-500',
  failed: 'bg-red-500',
};

export const TRANSCRIPT_STATUS_LABELS: Record<TranscriptStatus, string> = {
  pending: 'Ausstehend',
  processing: 'Wird verarbeitet',
  done: 'Fertig',
  failed: 'Fehlgeschlagen',
};

export const STRUCTOGRAM_LABELS: Record<StructogramType, string> = {
  red: 'Rot (Dominant)',
  green: 'Grün (Beziehung)',
  blue: 'Blau (Analytisch)',
  mixed: 'Gemischt',
  unknown: 'Unbekannt',
};

export const STRUCTOGRAM_COLORS: Record<StructogramType, string> = {
  red: 'hsl(0, 84%, 60%)',
  green: 'hsl(142, 71%, 45%)',
  blue: 'hsl(217, 91%, 60%)',
  mixed: 'hsl(263, 70%, 50%)',
  unknown: 'hsl(220, 9%, 46%)',
};

export const STRUCTOGRAM_DESCRIPTIONS: Record<'red' | 'green' | 'blue', string> = {
  red: 'Dominant, handlungsorientiert, direkt, ergebnisorientiert',
  green: 'Beziehungsorientiert, teamfokussiert, harmoniesuchend',
  blue: 'Analytisch, detailorientiert, vorsichtig, strukturiert',
};

export const OBJECTION_TYPE_LABELS: Record<string, string> = {
  price: 'Preis',
  timing: 'Timing',
  trust: 'Vertrauen',
  need: 'Bedarf',
  authority: 'Entscheidungskompetenz',
  other: 'Sonstiges',
};

export const QUALITY_LABELS: Record<string, string> = {
  excellent: 'Exzellent',
  good: 'Gut',
  average: 'Durchschnittlich',
  poor: 'Schwach',
};
