/**
 * Google Ads Conversion Tracking
 * Conversion-ID: AW-18031969359
 *
 * Labels:
 *  - Lead-Formular senden: GVlGCK-N26McEM-IqJZD
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const CONVERSION_ID = "AW-18031969359";
const LEAD_LABEL = "GVlGCK-N26McEM-IqJZD";

const SESSION_FIRED_PREFIX = "krs_gads_fired:";

/** Returns true if this conversion label has already fired in the current session. */
function alreadyFiredThisSession(label: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(SESSION_FIRED_PREFIX + label) === "1";
  } catch {
    // sessionStorage may be unavailable (private mode, blocked) — fail open
    return false;
  }
}

function markFired(label: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_FIRED_PREFIX + label, "1");
  } catch {
    /* ignore */
  }
}

interface ConversionOpts {
  value?: number;
  currency?: string;
  transactionId?: string;
  /** Bypass per-session deduplication (default: false). */
  force?: boolean;
}

function fireConversion(label: string, opts?: ConversionOpts): boolean {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return false;
  }
  if (!opts?.force && alreadyFiredThisSession(label)) {
    return false;
  }
  const payload: Record<string, unknown> = {
    send_to: `${CONVERSION_ID}/${label}`,
    value: opts?.value ?? 1.0,
    currency: opts?.currency ?? "EUR",
  };
  if (opts?.transactionId) {
    payload.transaction_id = opts.transactionId;
  }
  window.gtag("event", "conversion", payload);
  markFired(label);
  return true;
}

/**
 * Fires the Google Ads "Lead-Formular senden" conversion event.
 * Deduplicated per browser session — safe to call from /danke and ContactModal.
 */
export function trackLeadConversion(opts?: ConversionOpts): boolean {
  return fireConversion(LEAD_LABEL, opts);
}

export {};
