import { Rocket, Wrench, Users, CheckCircle2, UserCheck, LifeBuoy, Handshake } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const weeks = [
  {
    week: "Woche 1",
    title: "Go-Live & Stabilisierung",
    icon: Rocket,
    points: [
      "System scharf geschaltet, erste echte Vorgänge laufen durch",
      "Tägliches Monitoring von Datenflüssen und Automationen",
      "Schnelle Korrekturen bei Hakeleien – ohne Ticket-Schleife",
    ],
  },
  {
    week: "Woche 2",
    title: "Team-Onboarding",
    icon: Users,
    points: [
      "Strukturierte Einweisung der relevanten Rollen im Team",
      "Klärung wiederkehrender Fragen aus dem Tagesgeschäft",
      "Dokumentation wird an reale Nutzung angepasst",
    ],
  },
  {
    week: "Woche 3",
    title: "Feinjustierung",
    icon: Wrench,
    points: [
      "Optimierung der Prozesse anhand der ersten Praxiserfahrung",
      "Automationen werden auf Sonderfälle und Ausnahmen erweitert",
      "Übergaben und Verantwortlichkeiten werden geschärft",
    ],
  },
  {
    week: "Woche 4",
    title: "Übergabe & Entscheidung",
    icon: CheckCircle2,
    points: [
      "Finale Dokumentation und Handover an dein Team",
      "Gemeinsame Entscheidung: Eigenbetrieb, Support oder weiter zusammen",
      "Klare Reaktionszeiten und Ansprechpartner ab Tag 31",
    ],
  },
];

export const ThirtyDayTimeline = () => {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className={t.container}>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block text-primary text-sm font-semibold tracking-wide uppercase mb-3">
            30 Tage Begleitung nach Go-Live
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
            So läuft der Übergang in den Regelbetrieb
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Vier Wochen, in denen wir dein System gemeinsam stabilisieren, dein Team befähigen und sauber in den Eigenbetrieb übergeben – ohne automatische Verlängerung.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-7 left-0 right-0 h-px bg-border" aria-hidden />

          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-5 relative">
            {weeks.map((w, idx) => (
              <li
                key={w.week}
                className="relative rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex md:flex-col items-start md:items-center gap-3 md:gap-0">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center md:mx-auto md:mb-4 shrink-0">
                    <w.icon className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div className="md:text-center">
                    <p className="text-xs font-semibold tracking-wide uppercase text-primary mb-1">
                      {w.week}
                    </p>
                    <h3 className="text-base md:text-lg font-bold text-foreground leading-tight">
                      {w.title}
                    </h3>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {w.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-sm text-muted-foreground leading-snug"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <span className="absolute top-3 right-4 text-xs font-mono text-muted-foreground/40">
                  0{idx + 1}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          Spätestens am Ende von Woche 4 entscheiden wir gemeinsam, wie es weitergeht – Eigenbetrieb, schlanker Support-Vertrag oder langfristige Zusammenarbeit.
        </p>
      </div>
    </section>
  );
};
