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
// Apollo.io Website Tracker bridge
// Tracker-Skript wird nur nach Marketing-Consent dynamisch geladen
// (siehe src/lib/apollo-loader.ts). `sendToApollo` no-op'd ohne Consent.
// =============================================================
import { hasMarketingConsent } from "@/lib/consent";

interface ApolloTrackingFunctions {
  onLoad?: (opts: { appId: string }) => void;
  trackEvent?: (eventName: string, properties?: Record<string, unknown>) => void;
  identify?: (traits: Record<string, unknown>) => void;
}

const APOLLO_APP_ID = "69eaf28dcab75b0011d9e969";

/** Fire-and-forget: Sendet Event an Apollo NUR wenn Consent + Tracker geladen. */
function sendToApollo(eventName: string, properties: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;
  try {
    const fns = (window as unknown as { trackingFunctions?: ApolloTrackingFunctions })
      .trackingFunctions;
    if (fns && typeof fns.trackEvent === "function") {
      fns.trackEvent(eventName, { app_id: APOLLO_APP_ID, ...properties });
    }
  } catch {
    /* never throw from analytics */
  }
}

/** Apollo-Identify (Form-Submits, Logins). Respektiert Consent. */
export function identifyApollo(
  traits: { email?: string; name?: string; phone?: string; [k: string]: unknown },
): void {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;
  try {
    const fns = (window as unknown as { trackingFunctions?: ApolloTrackingFunctions })
      .trackingFunctions;
    if (fns && typeof fns.identify === "function") {
      fns.identify({ app_id: APOLLO_APP_ID, ...traits });
    }
  } catch {
    /* never throw */
  }
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
  // Mirror to Apollo for B2B intent tracking on every tracked event.
  sendToApollo(eventName, properties);
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

// =============================================================
// Conversion Funnel: CTA-Klicks & Section-Views
// Standardisierte Funnel-Stages: hero → mid_page → final → sticky → floating
// =============================================================

export type FunnelStage =
  | 'hero'
  | 'mid_page'
  | 'final'
  | 'sticky_banner'
  | 'sticky_header'
  | 'floating'
  | 'mobile_sticky'
  | 'menu'
  | 'inline';

interface CtaClickProps {
  /** Stelle im Funnel, an der die CTA sitzt */
  stage: FunnelStage;
  /** Logischer Name der CTA, z. B. "qualifizierung", "eigener_bot", "bots_im_detail" */
  cta: string;
  /** Sichtbarer Button-Text (zur Diagnose) */
  label?: string;
  /** Ziel-URL/Anchor */
  destination?: string;
  /** Seiten-Slug oder Bundle-Slug, in dessen Kontext geklickt wurde */
  context?: string;
  /** Zusätzliche Properties */
  [key: string]: unknown;
}

/** Fire-and-forget CTA-Klick-Tracking → analytics_events + GA4. */
export function trackCtaClick(props: CtaClickProps): void {
  const path =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : undefined;
  void trackEvent('cta_click', {
    funnel_stage: props.stage,
    cta_name: props.cta,
    cta_label: props.label,
    destination: props.destination,
    context: props.context,
    page_path: path,
    ...props,
  });
}

/** Fire-and-forget Section-View (z. B. via IntersectionObserver). */
export function trackSectionView(stage: FunnelStage, context?: string): void {
  const path =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : undefined;
  void trackEvent('section_view', {
    funnel_stage: stage,
    context,
    page_path: path,
  });
}

