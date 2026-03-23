import { AlertTriangle, Rocket } from "lucide-react";
import founderPortrait from "@/assets/founder-portrait.jpeg";
import { landingTokens as t } from "@/styles/landing-tokens";

interface FinalCtaSectionProps {
  onCtaClick: () => void;
}

export const FinalCtaSection = ({ onCtaClick }: FinalCtaSectionProps) => {
  const handleScrollDown = () => {
    const el = document.getElementById("problem-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${founderPortrait})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/85 via-foreground/80 to-foreground/90" />

      <div className={`${t.container} relative z-10`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-10">
            Du hast jetzt zwei Optionen:
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
                <p className="font-bold text-white text-lg">Option 1:</p>
              </div>
              <p className="text-white/90 mb-2 font-medium">Du machst weiter wie bisher</p>
              <p className="text-white/60">
                → mehr Stress, mehr Chaos, mehr Abhängigkeit.
                Jeden Tag verlierst du Geld, Kunden und Lebenszeit.
              </p>
            </div>
            <div className="bg-primary/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-primary/50 ring-2 ring-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="w-7 h-7 text-primary" />
                <p className="font-bold text-white text-lg">Option 2:</p>
              </div>
              <p className="text-white/90 mb-2 font-medium">Du baust ein System, das dich entlastet</p>
              <p className="text-white/60">
                → mehr Struktur, mehr Zeit, mehr Kontrolle.
                In 14 Tagen spürst du den Unterschied.
              </p>
            </div>
          </div>

          <p className="text-xl text-white/80 mb-8 font-medium">
            Warte nicht, bis es zu spät ist. Deine Konkurrenz automatisiert bereits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleScrollDown} className="border-2 border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              Automatisierungen verstehen
            </button>
            <button onClick={onCtaClick} className={t.ctaPrimary}>
              Jetzt System aufbauen →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
