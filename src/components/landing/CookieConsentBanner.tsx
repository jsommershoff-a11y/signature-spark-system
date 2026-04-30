import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMarketingConsent,
  grantMarketingConsent,
  revokeMarketingConsent,
} from "@/lib/consent";

/**
 * Cookie-Consent-Banner für Marketing/Tracking-Skripte (Apollo, Remarketing).
 * Zeigt sich, solange noch keine Entscheidung getroffen wurde.
 */
export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Nach Mount prüfen, damit SSR/CSR-Hydration konsistent bleibt.
    setVisible(getMarketingConsent() === null);
  }, []);

  if (!visible) return null;

  const accept = () => {
    grantMarketingConsent();
    setVisible(false);
  };

  const decline = () => {
    revokeMarketingConsent();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md"
    >
      <div className="rounded-2xl border border-border bg-card shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 shrink-0">
            <Cookie className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Cookies & Tracking
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Wir nutzen optionale Cookies für Marketing- und Reichweiten­messung
              (z. B. Apollo, Google Ads). Technisch notwendige Cookies sind davon
              nicht betroffen. Mehr in der{" "}
              <Link
                to="/datenschutz"
                className="underline hover:text-foreground"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={accept}
                className="h-8 px-3 text-xs"
              >
                Alle akzeptieren
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={decline}
                className="h-8 px-3 text-xs"
              >
                Nur notwendige
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={decline}
            aria-label="Banner schließen (lehnt Marketing-Cookies ab)"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
