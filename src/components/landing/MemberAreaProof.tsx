import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  FileText,
  ListChecks,
  Route,
  PlayCircle,
  Sparkles,
  GraduationCap,
  LayoutDashboard,
  Bot,
  Users,
  ArrowRight,
} from "lucide-react";

const highlights = [
  {
    icon: FileText,
    title: "Sofort einsetzbare Vorlagen",
    description:
      "E-Mail-Sequenzen, Angebots-Templates, Prompt-Library und Skripte – jeweils branchenspezifisch.",
  },
  {
    icon: ListChecks,
    title: "Umsetzungs-Checklisten",
    description:
      "Jede Lektion endet mit einer konkreten Checkliste. Du weißt nach 10 Minuten, was zu tun ist.",
  },
  {
    icon: Route,
    title: "Klarer Umsetzungspfad",
    description:
      "Vom Onboarding bis zum laufenden System: Schritt-für-Schritt-Pfad statt Content-Friedhof.",
  },
  {
    icon: Bot,
    title: "Live-KI-Tools im Portal",
    description:
      "Angebots-Generator, Call-Analyse, Lead-Scoring – direkt nutzbar, nicht nur theoretisch erklärt.",
  },
  {
    icon: PlayCircle,
    title: "Wöchentliche Live-Sessions",
    description:
      "Aufzeichnungen, Q&A und Implementation-Calls – alles im Mitgliederbereich gebündelt.",
  },
  {
    icon: Users,
    title: "Community-Layer integriert",
    description:
      "Austausch, Wins und Hilfe von Unternehmern, die genau am gleichen System arbeiten.",
  },
];

export function MemberAreaProof() {
  const navigate = useNavigate();
  return (
    <section className="py-16 md:py-24 bg-muted/20 border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Blick ins Portal
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
            So sieht dein Mitgliederbereich aus
          </h2>
          <p className="text-muted-foreground">
            Kein Content-Dschungel. Ein klar strukturiertes Betriebssystem mit Vorlagen,
            Checklisten und einem geführten Umsetzungspfad – damit du dein KI-System wirklich live bekommst.
          </p>
        </div>

        {/* Number strip */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-2 mb-12">
          {[
            { value: "47", label: "Vorlagen" },
            { value: "21", label: "Checklisten" },
            { value: "38", label: "Lektionen" },
            { value: "4", label: "Kern-Module" },
            { value: "1×/Wo", label: "Live-Call" },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-baseline gap-1.5 px-4 py-2 rounded-full bg-background border border-border/50 shadow-sm"
            >
              <span className="font-bold text-primary text-sm md:text-base">{s.value}</span>
              <span className="text-xs md:text-sm text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-3xl blur-2xl -z-10" />
            <Card className="overflow-hidden border-border/60 shadow-2xl rounded-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/60 border-b border-border/40">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
                <span className="ml-3 text-[11px] text-muted-foreground font-mono truncate">
                  app.ki-automationen.io/dashboard
                </span>
              </div>

              {/* App body */}
              <div className="flex bg-background">
                {/* Sidebar */}
                <div className="hidden sm:flex flex-col gap-1 w-40 p-3 border-r border-border/40 bg-muted/30">
                  {[
                    { icon: LayoutDashboard, label: "Dashboard", active: true },
                    { icon: GraduationCap, label: "Mein System" },
                    { icon: FileText, label: "Vorlagen" },
                    { icon: Bot, label: "KI-Tools" },
                    { icon: Users, label: "Community" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs ${
                        item.active
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="flex-1 p-4 md:p-5 space-y-4">
                  {/* Progress card */}
                  <div className="rounded-lg border border-border/50 p-4 bg-gradient-to-br from-muted/30 to-background flex items-center gap-4">
                    <div className="relative w-14 h-14 shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" className="stroke-muted" strokeWidth="3" fill="none" />
                        <circle
                          cx="18" cy="18" r="15"
                          className="stroke-primary"
                          strokeWidth="3" fill="none" strokeLinecap="round"
                          strokeDasharray="94.2" strokeDashoffset="32"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        66%
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">Dein Signature System</div>
                      <div className="text-[11px] text-muted-foreground">
                        14 von 21 Lektionen abgeschlossen
                      </div>
                    </div>
                    <div className="hidden sm:block px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold">
                      Weiter →
                    </div>
                  </div>

                  {/* Module list */}
                  <div className="space-y-2">
                    {[
                      { name: "Modul 1 – Fundament & Setup", done: true, count: "5/5" },
                      { name: "Modul 2 – Lead-Engine", done: true, count: "4/4" },
                      { name: "Modul 3 – Vertriebs-KI", done: false, count: "3/5" },
                      { name: "Modul 4 – Delivery-Automation", done: false, count: "2/4" },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-md border border-border/40 bg-card"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            m.done ? "text-success" : "text-muted-foreground/40"
                          }`}
                        />
                        <span className="text-xs font-medium flex-1 truncate">{m.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{m.count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Resource chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      📄 47 Vorlagen
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      ✅ 21 Checklisten
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      🎥 38 Lektionen
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bullet highlights */}
          <div className="space-y-4">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <h.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{h.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
