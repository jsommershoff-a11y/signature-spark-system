import { supabase } from '@/integrations/supabase/client';

// =============================================================
// Google Ads Lead-Conversion (Session-deduped)
// =============================================================

const GADS_CONVERSION_ID = "AW-18031969359/GVlGCK-N26McEM-IqJZD";
const GADS_STORAGE_KEY = "krs_gads_fired:GVlGCK-N26McEM-IqJZD";

type GtagFn = (command: string, eventName: string, params: Record<string, unknown>) => void;

interface TrackLeadConversionOptions {
  force?: boolean;
  transactionId?: string;
}

/**
 * Fires the Google Ads lead conversion event exactly once per session,
 * unless `force: true` is passed (e.g. for confirmed payments).
 * Returns `true` when an event was actually sent to gtag.
 */
export function trackLeadConversion(options: TrackLeadConversionOptions = {}): boolean {
  const { force = false, transactionId } = options;

  if (typeof window === "undefined") return false;
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag !== "function") return false;

  if (!force) {
    try {
      if (window.sessionStorage.getItem(GADS_STORAGE_KEY)) return false;
    } catch {
      // sessionStorage may be unavailable (private mode) — fall through and fire anyway
    }
  }

  const payload: Record<string, unknown> = { send_to: GADS_CONVERSION_ID };
  if (transactionId) payload.transaction_id = transactionId;

  gtag("event", "conversion", payload);

  try {
    window.sessionStorage.setItem(GADS_STORAGE_KEY, "1");
  } catch {
    // ignore storage errors
  }

  return true;
}

// =============================================================
// Generic in-app event tracking → public.analytics_events
// Fire-and-forget. Never throws.
// =============================================================

export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  // Mirror to gtag (GA4) for funnel reporting in Google Analytics, when available.
  try {
    if (typeof window !== 'undefined') {
      const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
      if (typeof gtag === 'function') {
        gtag('event', eventName, properties as Record<string, unknown>);
      }
    }
  } catch {
    /* never throw from analytics */
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const url =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : null;

    await supabase.from('analytics_events').insert({
      user_id: user?.id ?? null,
      event_name: eventName,
      properties: properties as never,
      url,
    });
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.debug('[analytics] trackEvent failed', eventName, err);
    }
  }
}
