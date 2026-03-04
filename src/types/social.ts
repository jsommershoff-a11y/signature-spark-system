export type SocialPlatform = 'instagram' | 'tiktok' | 'linkedin' | 'facebook';
export type SocialContentType = 'post' | 'reel' | 'story' | 'carousel';
export type SocialPostStatus = 'idee' | 'produktion' | 'geplant' | 'veroeffentlicht';
export type LibraryItemType = 'hook' | 'template' | 'hashtag' | 'story';

export interface SocialPost {
  id: string;
  title: string;
  platform: SocialPlatform;
  content_type: SocialContentType;
  scheduled_at: string | null;
  status: SocialPostStatus;
  hook: string | null;
  caption: string | null;
  assets: any[];
  notes: string | null;
  metrics: Record<string, number>;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLibraryItem {
  id: string;
  type: LibraryItemType;
  title: string;
  content: string | null;
  tags: string[];
  industry: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SocialStrategySettings {
  id: string;
  posting_frequency: Record<string, number>;
  content_pillars: string[];
  kpi_targets: Record<string, number>;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
};

export const PLATFORM_ICONS: Record<SocialPlatform, string> = {
  instagram: '📸',
  tiktok: '🎵',
  linkedin: '💼',
  facebook: '📘',
};

export const CONTENT_TYPE_LABELS: Record<SocialContentType, string> = {
  post: 'Post',
  reel: 'Reel',
  story: 'Story',
  carousel: 'Carousel',
};

export const STATUS_LABELS: Record<SocialPostStatus, string> = {
  idee: 'Idee',
  produktion: 'In Produktion',
  geplant: 'Geplant',
  veroeffentlicht: 'Veröffentlicht',
};

export const STATUS_COLORS: Record<SocialPostStatus, string> = {
  idee: 'bg-muted text-muted-foreground',
  produktion: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  geplant: 'bg-module-green-muted text-module-green-muted-foreground',
  veroeffentlicht: 'bg-module-green text-module-green-foreground',
};

export const STATUS_DOT_COLORS: Record<SocialPostStatus, string> = {
  idee: 'bg-muted-foreground',
  produktion: 'bg-amber-500',
  geplant: 'bg-module-green-light',
  veroeffentlicht: 'bg-module-green',
};
