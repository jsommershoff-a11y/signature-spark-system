export type SocialPlatform = 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'youtube' | 'x';
export type SocialContentType = 'post' | 'reel' | 'story' | 'carousel' | 'video' | 'newsletter_teaser';
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
  youtube: 'YouTube',
  x: 'X',
};

export const CONTENT_TYPE_LABELS: Record<SocialContentType, string> = {
  post: 'Post',
  reel: 'Reel',
  story: 'Story',
  carousel: 'Carousel',
  video: 'Video',
  newsletter_teaser: 'Newsletter-Teaser',
};

export const STATUS_LABELS: Record<SocialPostStatus, string> = {
  idee: 'Idee',
  produktion: 'Produktion',
  geplant: 'Geplant',
  veroeffentlicht: 'Veröffentlicht',
};

export const STATUS_COLORS: Record<SocialPostStatus, string> = {
  idee: 'bg-muted text-muted-foreground',
  produktion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  geplant: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  veroeffentlicht: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};
