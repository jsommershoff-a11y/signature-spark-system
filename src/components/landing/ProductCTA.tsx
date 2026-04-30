import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Clock, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCtaClick, type FunnelStage } from "@/lib/analytics";

interface ProductCTAProps {
  /** Slug oder Slug-Liste für Pre-Selection im Qualifizierungs-Formular */
  slug?: string;
  /** Mehrere Slugs (Komma-Separator wird automatisch gesetzt) */
  slugs?: string[];
  /** "Eigener Bot" Flag */
  eigenerBot?: boolean;
  /** Sichtbarer Button-Text */
  label?: string;
  /** Variante: hero | inline | sticky */
  variant?: "hero" | "inline" | "sticky";
  /** Trust-Zeile unter dem Button anzeigen */
  showTrust?: boolean;
  className?: string;
}

/**
 * Einheitliche Sales-CTA für alle Produkt- und Angebotsseiten.
 * Sorgt dafür, dass jeder Funnel auf /qualifizierung mit Pre-Selection landet.
 */
export function ProductCTA({
  slug,
  slugs,
  eigenerBot,
  label = "Jetzt unverbindlich anfragen",
  variant = "inline",
  showTrust = true,
  className = "",
}: ProductCTAProps) {
  const params = new URLSearchParams();
  if (slugs && slugs.length > 0) params.set("automations", slugs.join(","));
  else if (slug) params.set("automation", slug);
  if (eigenerBot) params.set("eigener-bot", "1");
  const href = `/qualifizierung${params.toString() ? `?${params.toString()}` : ""}`;

  if (variant === "sticky") {
    return (
      <div
        className={`fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur md:hidden ${className}`}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Festpreis-Angebot
            </div>
            <div className="text-sm font-semibold text-foreground truncate">
              Antwort innerhalb 24 h
            </div>
          </div>
          <Button asChild size="sm" className="bg-primary hover:bg-primary-deep shrink-0">
            <Link to={href}>
              Anfragen
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        asChild
        size={variant === "hero" ? "lg" : "default"}
        className="bg-primary hover:bg-primary-deep"
      >
        <Link to={href}>
          {label}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </Button>
      {showTrust && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Antwort &lt; 24 h
          </span>
          <span className="inline-flex items-center gap-1">
            <FileCheck2 className="h-3.5 w-3.5" />
            Festpreis-Angebot
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            DSGVO &amp; AVV inklusive
          </span>
        </div>
      )}
    </div>
  );
}
