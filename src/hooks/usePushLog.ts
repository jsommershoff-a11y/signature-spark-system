import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PushLogStatus = 'pending' | 'sent' | 'skipped' | 'failed' | 'partial';

export interface PushLogEntry {
  id: string;
  user_id: string | null;
  category: string;
  title: string;
  body: string | null;
  link: string | null;
  status: PushLogStatus;
  sent_count: number;
  total_tokens: number;
  invalid_removed: number;
  error: string | null;
  source: string | null;
  created_at: string;
  completed_at: string | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
}

export interface PushLogStats {
  total: number;
  sent: number;
  partial: number;
  failed: number;
  skipped: number;
  pending: number;
  by_category: Record<string, number>;
  by_day: Array<{ day: string; sent: number; failed: number; total: number }>;
}

export function usePushLog(days = 7) {
  return useQuery({
    queryKey: ['push-log', days],
    queryFn: async (): Promise<{ entries: PushLogEntry[]; stats: PushLogStats }> => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('push_log')
        .select('id, user_id, category, title, body, link, status, sent_count, total_tokens, invalid_removed, error, source, created_at, completed_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;

      const rows = (data ?? []) as PushLogEntry[];

      // Empfängernamen anreichern
      const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];
      let nameMap = new Map<string, { name: string | null; email: string | null }>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        nameMap = new Map(
          (profiles ?? []).map((p) => [p.user_id as string, { name: p.full_name, email: p.email }]),
        );
      }
      const entries = rows.map((r) => ({
        ...r,
        recipient_name: r.user_id ? nameMap.get(r.user_id)?.name ?? null : null,
        recipient_email: r.user_id ? nameMap.get(r.user_id)?.email ?? null : null,
      }));

      // Stats
      const stats: PushLogStats = {
        total: entries.length,
        sent: 0,
        partial: 0,
        failed: 0,
        skipped: 0,
        pending: 0,
        by_category: {},
        by_day: [],
      };
      const dayMap = new Map<string, { sent: number; failed: number; total: number }>();
      for (const e of entries) {
        stats[e.status] = (stats[e.status] ?? 0) + 1;
        stats.by_category[e.category] = (stats.by_category[e.category] ?? 0) + 1;
        const day = e.created_at.slice(0, 10);
        const d = dayMap.get(day) ?? { sent: 0, failed: 0, total: 0 };
        d.total++;
        if (e.status === 'sent' || e.status === 'partial') d.sent++;
        if (e.status === 'failed') d.failed++;
        dayMap.set(day, d);
      }
      stats.by_day = Array.from(dayMap.entries())
        .map(([day, v]) => ({ day, ...v }))
        .sort((a, b) => a.day.localeCompare(b.day));

      return { entries, stats };
    },
    staleTime: 30_000,
  });
}
