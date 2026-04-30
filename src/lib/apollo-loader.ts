/**
 * Lädt das Apollo.io Website-Tracker-Skript dynamisch nach Marketing-Consent.
 * Kein Auto-Load in index.html — DSGVO-konform.
 */
import { hasMarketingConsent, onConsentChange } from "@/lib/consent";

const APOLLO_APP_ID = "69eaf28dcab75b0011d9e969";
let loadingPromise: Promise<void> | null = null;
let initialized = false;

interface ApolloTrackingFunctions {
  onLoad?: (opts: { appId: string }) => void;
}

function injectScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (initialized) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve) => {
    try {
      const nocache = Math.random().toString(36).substring(7);
      const s = document.createElement("script");
      s.src =
        "https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=" +
        nocache;
      s.async = true;
      s.defer = true;
      s.onload = () => {
        try {
          const fns = (window as unknown as {
            trackingFunctions?: ApolloTrackingFunctions;
          }).trackingFunctions;
          fns?.onLoad?.({ appId: APOLLO_APP_ID });
          initialized = true;
        } catch {
          /* ignore */
        }
        resolve();
      };
      s.onerror = () => resolve(); // never throw
      document.head.appendChild(s);
    } catch {
      resolve();
    }
  });

  return loadingPromise;
}

/** Lädt Apollo nur, wenn Consent erteilt wurde. Idempotent. */
export function loadApolloIfConsented(): void {
  if (typeof window === "undefined") return;
  if (hasMarketingConsent()) {
    void injectScript();
  }
}

/** Bei App-Start aufrufen: lädt Apollo sofort wenn Consent vorhanden, sonst sobald gegeben. */
export function initApolloAutoload(): void {
  if (typeof window === "undefined") return;
  loadApolloIfConsented();
  onConsentChange((status) => {
    if (status === "granted") void injectScript();
  });
}
