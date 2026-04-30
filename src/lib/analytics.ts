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
import { z } from "zod";
import { hasMarketingConsent } from "@/lib/consent";

interface ApolloTrackingFunctions {
  onLoad?: (opts: { appId: string }) => void;
  trackEvent?: (eventName: string, properties?: Record<string, unknown>) => void;
  identify?: (traits: Record<string, unknown>) => void;
}

const APOLLO_APP_ID = "69eaf28dcab75b0011d9e969";

/** UTM/Referral-Whitelist — frei segmentierbar in Apollo. */
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
type UtmKey = typeof UTM_KEYS[number];
const UTM_STORAGE_KEY = "krs_utm_attribution";
const UTM_VALUE_RE = /^[A-Za-z0-9_.\-/+ ]{1,120}$/;

/** Liest UTM-Parameter aus der aktuellen URL und persistiert sie (first-touch) in sessionStorage. */
export function captureUtmParams(): Partial<Record<UtmKey, string>> {
  if (typeof window === "undefined") return {};
  const out: Partial<Record<UtmKey, string>> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_KEYS) {
      const raw = params.get(key);
      if (raw && UTM_VALUE_RE.test(raw)) out[key] = raw.trim().toLowerCase();
    }
    if (Object.keys(out).length > 0) {
      // First-touch: nicht überschreiben, wenn bereits gesetzt.
      if (!window.sessionStorage.getItem(UTM_STORAGE_KEY)) {
        window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(out));
      }
    }
  } catch {
    /* ignore */
  }
  return getStoredUtmParams();
}

export function getStoredUtmParams(): Partial<Record<UtmKey, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<UtmKey, string>>;
    const clean: Partial<Record<UtmKey, string>> = {};
    for (const key of UTM_KEYS) {
      const v = parsed[key];
      if (typeof v === "string" && UTM_VALUE_RE.test(v)) clean[key] = v;
    }
    return clean;
  } catch {
    return {};
  }
}

/** Zod-Schema für Identify-Traits — verhindert Garbage/PII-Leaks an externen Tracker. */
const apolloTraitsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  name: z.string().trim().min(1).max(120).optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9 ()/.\-]+$/, "invalid phone")
    .optional(),
  company: z.string().trim().max(150).optional(),
  // Traffic-Source-Felder zur Segmentierung in Apollo (alle optional, validiert).
  utm_source: z.string().trim().max(120).regex(UTM_VALUE_RE).optional(),
  utm_medium: z.string().trim().max(120).regex(UTM_VALUE_RE).optional(),
  utm_campaign: z.string().trim().max(120).regex(UTM_VALUE_RE).optional(),
  utm_term: z.string().trim().max(120).regex(UTM_VALUE_RE).optional(),
  utm_content: z.string().trim().max(120).regex(UTM_VALUE_RE).optional(),
  referral_code: z.string().trim().toUpperCase().max(16).regex(/^[A-Z0-9]{4,16}$/).optional(),
}).strict();

export type ApolloIdentifyTraits = z.infer<typeof apolloTraitsSchema>;

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

/**
 * Identifiziert den Visitor in Apollo (Form-Submits, Logins).
 * Validiert Traits mit Zod, normalisiert E-Mail (lowercase/trim) und droppt
 * leere optionale Felder, bevor sie an den externen Tracker gehen.
 * Reichert automatisch die in sessionStorage gespeicherten UTM-Parameter
 * (first-touch via captureUtmParams) sowie den persistierten Referral-Code
 * (localStorage via ReferralTracker) an, sofern der Aufrufer sie nicht
 * explizit überschreibt. Respektiert Marketing-Consent.
 *
 * @returns true wenn an Apollo gesendet, false bei No-Consent / Validation-Fail / kein Tracker
 */
export function identifyApollo(traits: {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referral_code?: string | null;
}): boolean {
  if (typeof window === "undefined") return false;
  if (!hasMarketingConsent()) return false;

  // Auto-Anreicherung aus persistierter Attribution.
  const storedUtms = getStoredUtmParams();
  let storedRef: string | null = null;
  try {
    const raw = window.localStorage.getItem("krs_ref_code");
    if (raw) {
      const parsed = JSON.parse(raw) as { code?: string; expires?: number };
      if (parsed?.code && (!parsed.expires || Date.now() < parsed.expires)) {
        storedRef = parsed.code;
      }
    }
  } catch {
    /* ignore */
  }

  const merged: Record<string, string> = {};
  if (traits.email) merged.email = traits.email;
  if (traits.name) merged.name = traits.name;
  if (traits.phone) merged.phone = traits.phone;
  if (traits.company) merged.company = traits.company;
  for (const key of UTM_KEYS) {
    const explicit = traits[key];
    const fromStore = storedUtms[key];
    if (explicit) merged[key] = explicit;
    else if (fromStore) merged[key] = fromStore;
  }
  if (traits.referral_code) merged.referral_code = traits.referral_code;
  else if (storedRef) merged.referral_code = storedRef;

  const parsed = apolloTraitsSchema.safeParse(merged);
  if (!parsed.success) {
    if (typeof console !== "undefined") {
      console.debug("[apollo] identify rejected by schema", parsed.error.flatten());
    }
    return false;
  }

  try {
    const fns = (window as unknown as { trackingFunctions?: ApolloTrackingFunctions })
      .trackingFunctions;
    if (fns && typeof fns.identify === "function") {
      fns.identify({ app_id: APOLLO_APP_ID, ...parsed.data });
      return true;
    }
  } catch {
    /* never throw */
  }
  return false;
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

