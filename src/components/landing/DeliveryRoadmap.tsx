import { Rocket, PackageCheck, Settings2, Repeat2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type RoadmapStep = {
  day: number;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const DEFAULT_ROADMAP: RoadmapStep[] = [
  {
    day: 0,
    icon: Rocket,
    title: "Kickoff",
    desc: "Zugänge, Ziele, Use-Case-Schärfung. Wir starten den Bau direkt.",
  },
  {
    day: 7,
    icon: PackageCheck,
    title: "Delivery",
    desc: "Setup ist live in deiner Umgebung. End-to-End getestet, einsatzbereit.",
  },
  {
    day: 10,
    icon: Settings2,
    title: "Setup-Check",
    desc: "Wir prüfen das Setup gemeinsam und passen Prompts, Regeln & Trigger an.",
  },
  {
    day: 20,
    icon: Repeat2,
    title: "Optimierung",
    desc: "Praxisdaten ausgewertet, finale Anpassungen, sauber dokumentiert.",
  },
];

interface Props {
  steps?: RoadmapStep[];
  title?: string;
  subtitle?: string;
  variant?: "light" | "dark";
}

export function DeliveryRoadmap({
  steps = DEFAULT_ROADMAP,
  title = "Dein Weg zum laufenden System",
  subtitle = "4 Termine, 20 Tage. Bugfixes innerhalb der Termine inklusive.",
  variant = "light",
}: Props) {
  const isDark = variant === "dark";
  return (
    <section
      className={
        isDark
          ? "bg-[#0F3E2E] text-white py-12 md:py-16 rounded-2xl"
          : "bg-[#FFF3EB] py-12 md:py-16 rounded-2xl"
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-10">
          <Badge
            className={
              isDark
                ? "bg-primary/20 text-primary-light border-primary/30 mb-3"
                : "bg-primary/15 text-primary border-primary/30 mb-3"
            }
          >
            Roadmap & Lieferung
          </Badge>
          <h2
            className={
              isDark
                ? "text-2xl md:text-3xl font-bold tracking-tight mb-2"
                : "text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2"
            }
          >
            {title}
          </h2>
          <p
            className={
              isDark
                ? "text-white/70 text-sm md:text-base max-w-2xl mx-auto"
                : "text-muted-foreground text-sm md:text-base max-w-2xl mx-auto"
            }
          >
            {subtitle}
          </p>
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden md:block">
          <div className="relative">
            <div
              className={
                isDark
                  ? "absolute left-0 right-0 top-7 h-px bg-white/15"
                  : "absolute left-0 right-0 top-7 h-px bg-primary/20"
              }
              aria-hidden
            />
            <div className="grid grid-cols-4 gap-4 relative">
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div
                    className={
                      isDark
                        ? "h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-[#0F3E2E]"
                        : "h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-[#FFF3EB]"
                    }
                  >
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div
                    className={
                      isDark
                        ? "mt-3 text-xs font-mono uppercase tracking-wider text-primary-light"
                        : "mt-3 text-xs font-mono uppercase tracking-wider text-primary"
                    }
                  >
                    Tag {s.day}
                  </div>
                  <div
                    className={
                      isDark
                        ? "mt-1 font-semibold"
                        : "mt-1 font-semibold text-foreground"
                    }
                  >
                    {s.title}
                  </div>
                  <p
                    className={
                      isDark
                        ? "mt-2 text-xs text-white/70 leading-relaxed max-w-[16rem]"
                        : "mt-2 text-xs text-muted-foreground leading-relaxed max-w-[16rem]"
                    }
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertikal */}
        <div className="md:hidden">
          <ol className="relative border-l-2 border-primary/30 ml-3 space-y-6">
            {steps.map((s, i) => (
              <li key={i} className="pl-6 relative">
                <div
                  className={
                    isDark
                      ? "absolute -left-[17px] h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-4 ring-[#0F3E2E]"
                      : "absolute -left-[17px] h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-4 ring-[#FFF3EB]"
                  }
                >
                  <s.icon className="h-4 w-4" />
                </div>
                <div
                  className={
                    isDark
                      ? "text-[11px] font-mono uppercase tracking-wider text-primary-light"
                      : "text-[11px] font-mono uppercase tracking-wider text-primary"
                  }
                >
                  Tag {s.day}
                </div>
                <div
                  className={
                    isDark ? "font-semibold mt-0.5" : "font-semibold text-foreground mt-0.5"
                  }
                >
                  {s.title}
                </div>
                <p
                  className={
                    isDark
                      ? "text-xs text-white/70 leading-relaxed mt-1"
                      : "text-xs text-muted-foreground leading-relaxed mt-1"
                  }
                >
                  {s.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div
          className={
            isDark
              ? "mt-8 flex items-center justify-center gap-2 text-xs text-white/70"
              : "mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"
          }
        >
          <ShieldCheck className="h-4 w-4 text-primary" />
          Bugfixes innerhalb der Termine inklusive · 30 Tage Optimierungssupport
        </div>
      </div>
    </section>
  );
}
