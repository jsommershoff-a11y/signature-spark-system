import { Link } from "react-router-dom";
import { ArrowRight, Hammer, Stethoscope, Briefcase, Building2, Key } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const branches = [
  {
    icon: Hammer,
    title: "Handwerk",
    text: "Wenn Aufträge, Material und Mitarbeiter nicht systematisiert sind, kosten dich manuelle Abläufe jeden Tag Geld.",
    path: "/handwerk",
  },
  {
    icon: Stethoscope,
    title: "Praxen",
    text: "Patienten, Termine und Dokumentation laufen an zu vielen Stellen gleichzeitig – ohne klare Struktur.",
    path: "/praxen",
  },
  {
    icon: Briefcase,
    title: "Dienstleister",
    text: "Wenn Wissen, Kundenkommunikation und Übergaben nicht systematisiert sind, bremst dich jedes Wachstum doppelt aus.",
    path: "/dienstleister",
  },
  {
    icon: Building2,
    title: "Immobilien",
    text: "Objekte, Mieter und Verträge brauchen ein zentrales System statt verstreuter Tabellen und Ordner.",
    path: "/immobilien",
  },
  {
    icon: Key,
    title: "Kurzzeitvermietung",
    text: "Buchungen, Check-ins und Gästekommunikation sind ohne Automatisierung nicht skalierbar.",
    path: "/kurzzeitvermietung",
  },
];

export const BranchenSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={t.container}>
        <h2 className={`${t.headline.h2} text-foreground text-center mb-14`}>
          Für diese Unternehmen ist Systematisierung besonders relevant
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {branches.map((b) => (
            <Link
              key={b.path}
              to={b.path}
              className="group rounded-2xl border border-border/40 bg-card p-7 flex flex-col hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <b.icon className="w-7 h-7 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{b.text}</p>
              <span className="flex items-center gap-1.5 text-primary text-sm font-medium group-hover:gap-2.5 transition-all">
                Mehr erfahren <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
