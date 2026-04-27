/**
 * Zentrale Feature-Flag-Konfiguration
 * ------------------------------------------------------------------
 * Steuert das Rendering von Preis-/Preislisten-Komponenten projektweit.
 *
 * Quellen (Priorität, höchste zuerst):
 *  1. Runtime-Override (window.__KRS_FLAGS) – z.B. für QA / Hotfix
 *  2. Build-Time Env (VITE_SHOW_PUBLIC_PRICING)
 *  3. Default (false) – Preise sind standardmäßig AUS
 *
 * Server-seitige Steuerung:
 *   - Setze in Lovable/Supabase die Env `VITE_SHOW_PUBLIC_PRICING`
 *     auf "true" oder "false" und re-deploye.
 *   - Alternativ kann ein Edge-Function-Endpoint /flags die
 *     Runtime-Overrides initial in window.__KRS_FLAGS schreiben.
 *
 * Wichtig: Dieser Flag betrifft AUSSCHLIESSLICH öffentliche Landing-
 * pages. Interne /app-Seiten (z.B. /app/pricing) bleiben unberührt.
 */

export type FeatureFlags = {
  /** Öffentliche Preisanzeigen auf Landingpages */
  showPublicPricing: boolean;
};

declare global {
  interface Window {
    __KRS_FLAGS?: Partial<FeatureFlags>;
  }
}

const parseBool = (v: unknown, fallback: boolean): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(s)) return true;
    if (["false", "0", "no", "off", ""].includes(s)) return false;
  }
  return fallback;
};

const envFlag = parseBool(
  import.meta.env.VITE_SHOW_PUBLIC_PRICING,
  false, // Default: Preise sind global AUS
);

export const featureFlags: FeatureFlags = {
  get showPublicPricing(): boolean {
    if (typeof window !== "undefined" && window.__KRS_FLAGS?.showPublicPricing !== undefined) {
      return !!window.__KRS_FLAGS.showPublicPricing;
    }
    return envFlag;
  },
};

/** Convenience-Helper für Komponenten */
export const isPublicPricingEnabled = (): boolean => featureFlags.showPublicPricing;
