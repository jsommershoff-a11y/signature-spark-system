import { BookOpen, Lock, Play } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

interface AcademyPreviewSectionProps {
  onCtaClick: () => void;
}

const previewModules = [
  {
    title: "Prompting Grundlagen",
    lessons: ["Willkommen zur KI-Revolution", "Wie funktionieren LLMs?", "Prompt-Cheatsheet: Deine ersten 10 Prompts"],
    free: true,
  },
  {
    title: "KI im Vertrieb",
    lessons: ["Der KI-gestützte Vertriebsprozess", "CRM & KI: Die perfekte Kombination", "ICP-Scoring mit KI"],
    free: false,
  },
  {
    title: "Automatisierung",
    lessons: ["Was ist No-Code Automation?", "Make vs. Zapier vs. n8n", "Workflow: Lead → E-Mail → CRM"],
    free: false,
  },
];

export const AcademyPreviewSection = ({ onCtaClick }: AcademyPreviewSectionProps) => {
  return (
    <section className={`${t.sectionPadding} bg-muted/20`}>
      <div className={t.container}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            KI-Academy – Exklusiv für Mitglieder
          </div>
          <h2 className={`${t.headline.h2} text-foreground mb-4`}>
            Über 170 Lektionen. Sofort umsetzbar.
          </h2>
          <p className={`${t.text.body} max-w-2xl mx-auto`}>
            Von Prompting-Grundlagen bis zur vollautomatisierten Sales-Pipeline – 
            unsere KI-Academy macht dich in Wochen zum Experten.
          </p>
        </div>

        {/* Module Preview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {previewModules.map((mod) => (
            <div
              key={mod.title}
              className="bg-card border border-border rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{mod.title}</h3>
                {mod.free ? (
                  <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                    Kostenlos testen
                  </span>
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground/50" />
                )}
              </div>
              <ul className="space-y-2">
                {mod.lessons.map((lesson, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    {mod.free && i < 2 ? (
                      <Play className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
                    )}
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


        {/* Stats + CTA */}
        <div className="text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {[
              ["170+", "Lektionen"],
              ["4", "Lernpfade"],
              ["12", "Praxis-Workshops"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-foreground">{num}</div>
                <div className="text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <button onClick={onCtaClick} className={t.ctaPrimary}>
            Zugang zur KI-Academy sichern
          </button>
        </div>
      </div>
    </section>
  );
};
