import { CalendarClock, Clock, ShieldCheck } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

interface FaqDirectCtaProps {
  onCtaClick: () => void;
}

const trust = [
  { icon: Clock, text: "30 Min · unverbindlich" },
  { icon: ShieldCheck, text: "Kein Verkaufsgespräch" },
  { icon: CalendarClock, text: "Termin innerhalb von 3–5 Werktagen" },
];

export const FaqDirectCta = ({ onCtaClick }: FaqDirectCtaProps) => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className={t.container}>
        <div className="max-w-3xl mx-auto rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-[#FFF3EB] to-background p-7 md:p-10 text-center shadow-[0_8px_32px_rgba(246,113,31,0.08)]">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide px-3 py-1 mb-4">
            <CalendarClock className="w-3.5 h-3.5" aria-hidden />
            Frage offen geblieben?
          </span>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3 leading-tight">
            Buche dein kostenloses Klarheitsgespräch
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl mx-auto">
            30 Minuten, in denen wir gemeinsam auf deine Engpässe, Abhängigkeiten und Hebel schauen. Du bekommst klare Prioritäten – ohne Tool-Pitch.
          </p>

          <button onClick={onCtaClick} className={`${t.ctaPrimary} w-full sm:w-auto`}>
            Jetzt Potenzial-Analyse buchen
          </button>

          <ul className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2 sm:gap-x-5 sm:gap-y-2 text-xs sm:text-sm text-muted-foreground">
            {trust.map((item) => (
              <li key={item.text} className="inline-flex items-center gap-1.5">
                <item.icon className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
