/**
 * Google Ads Conversion Tracking
 * Conversion-ID: AW-18031969359
 * Label: GVlGCK-N26McEM-IqJZD (Lead-Formular senden)
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const CONVERSION_SEND_TO = "AW-18031969359/GVlGCK-N26McEM-IqJZD";

/**
 * Fires the Google Ads "Lead-Formular senden" conversion event.
 * Safe to call multiple times — Google deduplicates by transaction_id if provided.
 */
export function trackLeadConversion(opts?: { value?: number; currency?: string; transactionId?: string }): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  const payload: Record<string, unknown> = {
    send_to: CONVERSION_SEND_TO,
    value: opts?.value ?? 1.0,
    currency: opts?.currency ?? "EUR",
  };
  if (opts?.transactionId) {
    payload.transaction_id = opts.transactionId;
  }
  window.gtag("event", "conversion", payload);
}

export {};
