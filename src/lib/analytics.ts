import { supabase } from '@/integrations/supabase/client';

/**
 * Lightweight, fire-and-forget event tracking into public.analytics_events.
 * Never throws — analytics must never break the UI.
 */
export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const url = typeof window !== 'undefined' ? window.location.pathname + window.location.search : null;

    await supabase.from('analytics_events').insert({
      user_id: user?.id ?? null,
      event_name: eventName,
      properties: properties as never,
      url,
    });
  } catch (err) {
    // Silent fail — analytics must not impact UX
    if (typeof console !== 'undefined') {
      console.debug('[analytics] trackEvent failed', eventName, err);
    }
  }
}
