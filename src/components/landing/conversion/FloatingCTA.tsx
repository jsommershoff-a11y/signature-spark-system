import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import founderPortrait from "@/assets/founder-hero.jpeg";
import { trackCtaClick } from "@/lib/analytics";

export const FloatingCTA = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const footerThreshold = docHeight - winHeight - 300;

      setVisible(scrollY > 400 && scrollY < footerThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => navigate("/qualifizierung")}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-primary text-primary-foreground pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgba(246,113,31,0.35)] hover:shadow-[0_8px_40px_rgba(246,113,31,0.5)] transition-all duration-300 hover:scale-105 group"
      aria-label="Kostenlose Potenzial-Analyse sichern"
    >
      <img
        src={founderPortrait}
        alt="Jan Sommershoff"
        className="w-10 h-10 rounded-full object-cover border-2 border-primary-foreground/30"
      />
      <span className="font-semibold text-sm whitespace-nowrap">
        Potenzial-Analyse sichern
      </span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
};
