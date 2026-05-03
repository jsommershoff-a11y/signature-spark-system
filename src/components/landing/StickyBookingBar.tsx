import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics";

interface StickyBookingBarProps {
  onCtaClick: () => void;
  ctaText?: string;
  label?: string;
  /** Pixel scrolled before the bar appears (Default: 600) */
  showAfter?: number;
  /** Analytics: CTA-Quelle (Default: "erstgespraech") */
  trackingCta?: string;
}

/**
 * Persistenter unten fixierter CTA-Banner.
 * - Erscheint erst nach `showAfter` Pixel Scroll, damit Hero nicht überdeckt wird.
 * - Lässt sich pro Session via "X" schließen (sessionStorage).
 * - Mobile-optimiert: Vollbreite, Safe-Area-Padding für iOS.
 */
export const StickyBookingBar = ({
  onCtaClick,
  ctaText = "Termin sichern",
  label = "Kostenloses 30-Min. Erstgespräch – unverbindlich",
  showAfter = 600,
  trackingCta = "erstgespraech",
}: StickyBookingBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-300"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label="Termin buchen"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground truncate">{label}</p>
        </div>
        <p className="sm:hidden text-sm font-semibold text-foreground truncate flex-1">
          {label}
        </p>
        <Button
          onClick={() => {
            trackCtaClick({
              stage: "sticky_bottom",
              cta: trackingCta,
              label: ctaText,
            });
            onCtaClick();
          }}
          size="lg"
          className="shrink-0 font-semibold shadow-md"
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};
