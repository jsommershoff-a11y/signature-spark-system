import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { trackCtaClick, trackEvent } from "@/lib/analytics";

export const StickyCtaBanner = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-primary text-primary-foreground py-2.5 px-4 shadow-md animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium hidden sm:block">
          Prozesse, Wissen und Übergaben systematisieren – kostenlose Analyse starten.
        </p>
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            onClick={() => navigate("/qualifizierung")}
            className="flex items-center gap-2 bg-primary-foreground text-primary font-semibold text-sm px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Kostenlose Potenzial-Analyse
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            aria-label="Banner schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
