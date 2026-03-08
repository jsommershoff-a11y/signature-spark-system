// Learning Management System Types

export type PathLevel = 'starter' | 'fortgeschritten' | 'experte';

export interface LearningPath {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  courses?: LearningCourse[];
  // Computed
  total_courses?: number;
  completed_courses?: number;
  progress_percent?: number;
}

export interface LearningCourse {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  learning_path_id?: string;
  path_level?: PathLevel;
  sort_order: number;
  published: boolean;
  // Joined
  modules?: LearningModule[];
  // Computed
  total_lessons?: number;
  completed_lessons?: number;
  progress_percent?: number;
  is_locked?: boolean;
}

export interface LearningModule {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  sort_order: number;
  lessons?: LearningLesson[];
}

export interface LearningLesson {
  id: string;
  module_id: string;
  name: string;
  description?: string;
  content_ref?: string;
  lesson_type: 'video' | 'task' | 'worksheet' | 'quiz';
  duration_seconds?: number;
  sort_order: number;
  meta?: Record<string, unknown>;
  progress_status?: 'not_started' | 'in_progress' | 'completed';
  progress_percent?: number;
}

export const PATH_LEVEL_CONFIG: Record<PathLevel, {
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  order: number;
}> = {
  starter: {
    label: 'Starter',
    sublabel: 'Grundlagen',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: 'Sprout',
    order: 1,
  },
  fortgeschritten: {
    label: 'Fortgeschritten',
    sublabel: 'Praxis & Vertiefung',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: 'Rocket',
    order: 2,
  },
  experte: {
    label: 'Experte',
    sublabel: 'Meisterklasse',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: 'Crown',
    order: 3,
  },
};

export const TOPIC_ICONS: Record<string, string> = {
  prompting: 'MessageSquare',
  marketing: 'Megaphone',
  vertrieb: 'TrendingUp',
  automatisierung: 'Workflow',
};

export const TOPIC_COLORS: Record<string, string> = {
  orange: 'from-orange-500 to-amber-500',
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-emerald-500 to-teal-500',
  purple: 'from-purple-500 to-pink-500',
};
