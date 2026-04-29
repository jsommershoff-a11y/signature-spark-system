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

        {/* Vergleichsbox: 3 Optionen nach 30 Tagen */}
        <div className="max-w-5xl mx-auto mt-10">
          <h3 className="text-center text-lg md:text-xl font-bold text-foreground mb-2">
            Deine drei Optionen ab Tag 31
          </h3>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Du entscheidest – ohne automatische Verlängerung.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: UserCheck,
                tag: "Option 1",
                title: "Eigenständig",
                desc: "Dein Team betreibt das System selbst. Alles ist dokumentiert, übergeben und einsatzbereit – ohne laufende Kosten.",
                badge: "0 € / Monat",
              },
              {
                icon: LifeBuoy,
                tag: "Option 2",
                title: "Wartung & Support",
                desc: "Schlanker Vertrag mit definierten Reaktionszeiten, Monitoring und kleineren Anpassungen, falls etwas hakt.",
                badge: "Festes Monatspaket",
                highlighted: true,
              },
              {
                icon: Handshake,
                tag: "Option 3",
                title: "Langfristige Zusammenarbeit",
                desc: "Wir bauen dein System schrittweise aus, ergänzen neue Automationen und entwickeln dein Unternehmen strukturell weiter.",
                badge: "Individuell",
              },
            ].map((opt) => (
              <div
                key={opt.title}
                className={`rounded-2xl border p-5 bg-card transition-shadow ${
                  opt.highlighted
                    ? "border-primary/40 shadow-md ring-1 ring-primary/20"
                    : "border-border shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <opt.icon className="w-5 h-5 text-primary" aria-hidden />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide uppercase text-primary">
                    {opt.tag}
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground mb-2">{opt.title}</h4>
                <p className="text-sm text-muted-foreground leading-snug mb-4">{opt.desc}</p>
                <span className="inline-block text-xs font-medium text-foreground/70 border border-border rounded-full px-2.5 py-1 bg-muted/40">
                  {opt.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
