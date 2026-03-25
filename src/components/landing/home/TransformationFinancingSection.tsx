import { Shield, TrendingUp, CheckCircle2, Clock, Banknote, AlertTriangle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

export const TransformationFinancingSection = () => {
  return (
    <section className={`${t.sectionPadding} bg-gradient-to-b from-muted/20 to-background`}>
      <div className={t.container}>
        {/* Opener */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className={t.badgeAccent}>Transformation ohne Risiko</span>
          <h2 className={`${t.headline.h2} text-foreground mt-5 mb-6`}>
            Die meisten Unternehmer wissen, dass sie ihr Unternehmen verändern müssen.
          </h2>
          <p className={`${t.text.body} text-lg`}>
            Sie tun es nicht. Nicht, weil sie es nicht verstehen.
            <br className="hidden md:block" />
            Sondern weil ihnen die Zeit fehlt – und weil der Cashflow an ihnen hängt.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-10">
          {/* Angst-Block */}
          <div className="rounded-3xl border border-destructive/15 bg-gradient-to-br from-destructive/5 to-transparent p-7 md:p-10">
            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <p className="text-foreground font-semibold text-lg">
                Genau hier scheitern die meisten.
              </p>
            </div>
            <p className={t.text.body}>
              Wenn du dein Unternehmen umbaust, arbeitest du weniger operativ.
              Und genau davor haben viele Angst:
            </p>
            <blockquote className="border-l-4 border-destructive/30 pl-5 my-5 text-foreground font-semibold text-lg italic">
              „Dann verliere ich Umsatz."
            </blockquote>
            <p className="text-foreground font-bold text-xl mb-5">
              Das Gegenteil ist der Fall.
            </p>
            <div className="space-y-2">
              {["Du gewinnst Struktur.", "Du gewinnst Kontrolle.", "Du gewinnst Wachstum."].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-foreground font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Finanzierungs-Erklärung */}
          <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-7 md:p-10">
            <div className="flex items-start gap-3 mb-5">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <p className="text-foreground font-semibold text-lg">
                Deshalb haben wir die Signature Transformation Finanzierung aufgebaut.
              </p>
            </div>
            <p className={`${t.text.body} mb-4`}>
              Ein Modell, das es dir ermöglicht, dein Unternehmen zu verändern –
              ohne deinen Cashflow zu gefährden.
            </p>
            <p className={t.text.body}>
              Eine Bank erkennt den Wert funktionierender Systeme
              und unterstützt genau diese Transformation.
            </p>
            <p className="text-foreground font-bold text-xl mt-7 text-center">
              Du kannst dein Unternehmen umbauen, während es weiterläuft.
            </p>
          </div>

          {/* Konkretes Beispiel */}
          <div className={`${t.card} flex items-start gap-5`}>
            <Clock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-foreground font-semibold text-lg mb-2">
                In der Umsetzung bedeutet das:
              </p>
              <p className={t.text.body}>
                Du reduzierst bewusst deine operative Zeit. Zum Beispiel:
              </p>
              <p className="text-foreground font-bold text-lg my-4 bg-muted/50 rounded-xl px-5 py-3 inline-block">
                2 Tage pro Woche → nur noch halbtags = 1 Tag pro Woche zurückgewonnen
              </p>
              <p className={t.text.body}>
                Diese Zeit nutzt du, um dein Unternehmen richtig aufzubauen.
                Und genau dieser Schritt wird finanziell abgefedert.
              </p>
            </div>
          </div>

          {/* Realitäts-Block */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className={t.text.body}>Viele glauben:</p>
            <blockquote className="text-foreground font-semibold text-xl italic">
              „Dann verliere ich Umsatz."
            </blockquote>
            <p className={t.text.body}>Die Realität:</p>
            <p className="text-foreground font-medium text-lg">
              Du verlierst kurzfristig operative Zeit, gewinnst aber ein System,
              das langfristig mehr Umsatz ermöglicht – mit weniger Abhängigkeit von dir.
            </p>
          </div>

          {/* Finanzierungsrahmen */}
          <div className="rounded-3xl border border-border/30 bg-card shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 md:p-10 text-center max-w-2xl mx-auto">
            <Banknote className="w-10 h-10 text-primary mx-auto mb-5" />
            <p className="text-foreground font-bold text-3xl md:text-4xl mb-3">
              Finanzierungen von bis zu 250.000 €
            </p>
            <p className={`${t.text.body} mb-4`}>
              Je nach Unternehmensgröße und individuellen Voraussetzungen.
            </p>
            <p className={t.text.small}>
              Das ist keine pauschale Zusage, sondern basiert auf individuellen
              Voraussetzungen und bereits realisierten Fällen.
            </p>
            <div className="mt-7 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <p className="text-foreground font-semibold">
                Es zeigt, was möglich ist, wenn Unternehmen diesen Schritt gehen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
