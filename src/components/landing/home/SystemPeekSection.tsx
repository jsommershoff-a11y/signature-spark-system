import { ArrowRight, Mail, Database, Bot, Bell, CheckCircle2 } from "lucide-react";

/**
 * Mini-Beispiel-Workflow: zeigt vereinfacht, wie ein Signature-System
 * im Alltag arbeitet – als Anker fürs Verständnis, kein Tool-Pitch.
 */
const steps = [
  {
    icon: Mail,
    title: "Anfrage kommt rein",
    desc: "E-Mail, Formular oder WhatsApp – egal über welchen Kanal.",
  },
  {
    icon: Database,
    title: "System erkennt & sortiert",
    desc: "Daten landen strukturiert im CRM, doppelte Einträge werden erkannt.",
  },
  {
    icon: Bot,
    title: "Automatisierte Vorqualifizierung",
    desc: "Standardfragen werden automatisch beantwortet, Unterlagen angefordert.",
  },
  {
    icon: Bell,
    title: "Du bekommst nur Relevantes",
    desc: "Nur Anfragen, die deine Kriterien erfüllen, landen auf deinem Tisch.",
  },
  {
    icon: CheckCircle2,
    title: "Nachvollziehbar dokumentiert",
    desc: "Jeder Schritt ist im Log sichtbar – kein Blackbox-Prozess.",
  },
];

export const SystemPeekSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Beispiel-Workflow
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ein Blick ins Signature System
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              So sieht ein typischer Mini-Workflow aus – vereinfacht dargestellt,
              damit du verstehst, wie dein System im Alltag denkt und handelt.
            </p>
          </div>

          {/* Desktop: horizontale Pipeline */}
          <div className="hidden md:flex items-stretch gap-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-stretch flex-1">
                  <div className="flex-1 bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xs font-semibold text-primary mb-1">
                      Schritt {i + 1}
                    </div>
                    <div className="text-sm font-bold text-foreground mb-1.5 leading-tight">
                      {s.title}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {s.desc}
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex items-center px-1 text-muted-foreground/50">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: vertikale Liste */}
          <div className="md:hidden space-y-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="flex gap-4 bg-card border border-border rounded-xl p-4 shadow-sm"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-primary mb-0.5">
                      Schritt {i + 1}
                    </div>
                    <div className="text-[15px] font-bold text-foreground mb-1 leading-tight">
                      {s.title}
                    </div>
                    <div className="text-[13px] text-muted-foreground leading-relaxed">
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs md:text-sm text-muted-foreground italic max-w-2xl mx-auto">
              Das ist ein vereinfachtes Beispiel. Dein realer Workflow wird auf deine
              Prozesse, Kanäle und Tools zugeschnitten – aber das Prinzip bleibt gleich:
              <span className="text-foreground font-medium"> klar dokumentiert, nachvollziehbar, ohne Blackbox.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
