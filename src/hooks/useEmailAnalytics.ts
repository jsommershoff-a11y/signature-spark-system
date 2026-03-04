import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEmailAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['email-analytics'],
    queryFn: async () => {
      const [messagesRes, eventsRes] = await Promise.all([
        supabase.from('email_messages').select('id, status, message_type, created_at'),
        supabase.from('email_events').select('id, event_type, message_id, created_at'),
      ]);
      if (messagesRes.error) throw messagesRes.error;
      if (eventsRes.error) throw eventsRes.error;

      const messages = messagesRes.data || [];
      const events = eventsRes.data || [];

      const totalSent = messages.filter(m => m.status !== 'queued').length;
      const delivered = events.filter(e => e.event_type === 'delivered').length;
      const opened = new Set(events.filter(e => e.event_type === 'opened').map(e => e.message_id)).size;
      const clicked = new Set(events.filter(e => e.event_type === 'clicked').map(e => e.message_id)).size;
      const bounced = events.filter(e => e.event_type === 'bounced').length;
      const unsubscribed = events.filter(e => e.event_type === 'unsubscribed').length;

      return {
        totalSent,
        delivered,
        openRate: totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0,
        clickRate: totalSent > 0 ? Math.round((clicked / totalSent) * 100) : 0,
        bounceRate: totalSent > 0 ? Math.round((bounced / totalSent) * 100) : 0,
        unsubscribeRate: totalSent > 0 ? Math.round((unsubscribed / totalSent) * 100) : 0,
        opened,
        clicked,
        bounced,
        unsubscribed,
      };
    },
  });

  return { stats, isLoading };
}
