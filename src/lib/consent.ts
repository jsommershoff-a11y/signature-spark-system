/**
 * Marketing-/Tracking-Consent (DSGVO-konformes Opt-in).
 *
 * Speichert die Entscheidung im localStorage. Externe Marketing-Skripte
 * (Apollo, Google Ads Remarketing, ...) DÜRFEN erst nach `granted` laden.
 *
 * Werte:
 *   - "granted"  → Nutzer hat Marketing-Cookies aktiv akzeptiert
 *   - "denied"   → Nutzer hat aktiv abgelehnt
 *   - null       → Noch keine Entscheidung getroffen → Banner zeigen
 */

export type ConsentStatus = "granted" | "denied" | null;

const STORAGE_KEY = "krs_marketing_consent";
const EVENT_NAME = "krs:consent-changed";

export function getMarketingConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "granted" || v === "denied") return v;
    return null;
  } catch {
    return null;
  }
}

export function hasMarketingConsent(): boolean {
  return getMarketingConsent() === "granted";
}

function setConsent(status: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, status);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: status }));
  } catch {
    /* ignore */
  }
}

export function grantMarketingConsent(): void {
  setConsent("granted");
}

export function revokeMarketingConsent(): void {
  setConsent("denied");
}

/** Subscribe to consent changes. Returns unsubscribe fn. */
export function onConsentChange(cb: (status: "granted" | "denied") => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<"granted" | "denied">).detail;
    if (detail === "granted" || detail === "denied") cb(detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
