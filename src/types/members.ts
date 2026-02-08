// Member Types for LMS System

export type MemberStatus = 'active' | 'paused' | 'churned';
export type MembershipProduct = 'starter' | 'growth' | 'premium';
export type MembershipStatus = 'active' | 'inactive' | 'pending';
export type LessonType = 'video' | 'task' | 'worksheet' | 'quiz';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface Member {
  id: string;
  user_id: string;
  lead_id?: string;
  profile_id?: string;
  status: MemberStatus;
  onboarded_at?: string;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
  meta?: Record<string, unknown>;
  // Joined
  profile?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  memberships?: Membership[];
}

export interface Membership {
  id: string;
  member_id: string;
  order_id?: string;
  product: MembershipProduct;
  starts_at: string;
  ends_at?: string;
  status: MembershipStatus;
  is_trial: boolean;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  version: number;
  published: boolean;
  published_at?: string;
  required_product?: MembershipProduct;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  modules?: Module[];
  // Computed
  total_lessons?: number;
  completed_lessons?: number;
  progress_percent?: number;
}

export interface Module {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  // Joined
  lessons?: Lesson[];
  // Computed
  total_lessons?: number;
  completed_lessons?: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  name: string;
  description?: string;
  content_ref?: string;
  lesson_type: LessonType;
  duration_seconds?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  meta?: Record<string, unknown>;
  // Joined (for Member)
  progress?: LessonProgress;
}

export interface LessonProgress {
  id: string;
  member_id: string;
  lesson_id: string;
  status: ProgressStatus;
  progress_percent: number;
  started_at?: string;
  completed_at?: string;
  last_seen_at?: string;
  last_position_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface MemberKPI {
  id: string;
  member_id: string;
  week_start_date: string;
  tasks_completion_rate: number;
  lesson_completion_rate: number;
  revenue_value?: number;
  activity_score: number;
  risk_score: number;
  kpi_json: Record<string, unknown>;
  notes?: string;
  created_at: string;
}

// UI Labels
export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Aktiv',
  paused: 'Pausiert',
  churned: 'Gekündigt',
};

export const MEMBER_STATUS_COLORS: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  churned: 'bg-red-100 text-red-800',
};

export const PRODUCT_LABELS: Record<MembershipProduct, string> = {
  starter: 'Starter',
  growth: 'Growth',
  premium: 'Premium',
};

export const PRODUCT_COLORS: Record<MembershipProduct, string> = {
  starter: 'bg-blue-100 text-blue-800',
  growth: 'bg-purple-100 text-purple-800',
  premium: 'bg-amber-100 text-amber-800',
};

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: 'Video',
  task: 'Aufgabe',
  worksheet: 'Arbeitsblatt',
  quiz: 'Quiz',
};

export const LESSON_TYPE_ICONS: Record<LessonType, string> = {
  video: 'Play',
  task: 'CheckSquare',
  worksheet: 'FileText',
  quiz: 'HelpCircle',
};

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  not_started: 'Nicht gestartet',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
};
