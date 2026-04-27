import { useState } from "react";
import { Brain, ChevronRight, Loader2, Sparkles, ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { landingTokens as t } from "@/styles/landing-tokens";

const questions = [
  {
    question: "Wie viele Stunden pro Woche verbringst du mit wiederkehrenden Aufgaben?",
    options: ["Unter 5 Stunden", "5–10 Stunden", "10–20 Stunden", "Über 20 Stunden"],
    weights: [1, 2, 3, 4],
  },
  {
    question: "Wie organisierst du aktuell deine Kundenanfragen?",
    options: ["Excel / Notizen", "E-Mail-Postfach", "Ein CRM-System", "Gar nicht strukturiert"],
    weights: [2, 2, 1, 4],
  },
  {
    question: "Wie oft gehen Aufgaben oder Anfragen unter?",
    options: ["Selten", "Gelegentlich", "Regelmäßig", "Ständig"],
    weights: [1, 2, 3, 4],
  },
  {
    question: "Wie viele Mitarbeiter hast du?",
    options: ["Ich allein", "2–5", "6–15", "Über 15"],
    weights: [1, 2, 3, 3],
  },
  {
    question: "Hast du bereits digitale Tools im Einsatz?",
    options: ["Kaum / keine", "Einzelne Tools, aber nicht vernetzt", "Mehrere, aber ohne Automatisierung", "Gut aufgestellt, aber möchte optimieren"],
    weights: [4, 3, 2, 1],
  },
];

const HOURLY_RATE = 80;

interface AnalysisResult {
  score: number;
  level: string;
  headline: string;
  description: string;
  savingsHoursLow: number;
  savingsHoursHigh: number;
  color: string;
}

function getResult(totalScore: number): AnalysisResult {
  if (totalScore >= 16) {
    return {
      score: totalScore, level: "KRITISCH",
      headline: "Du verlierst massiv Zeit und Umsatz.",
      description: "Dein Unternehmen hat enormes Automatisierungs-Potenzial. Du verschwendest aktuell geschätzt 15–25 Stunden pro Woche mit Aufgaben, die ein System in Sekunden erledigen kann.",
      savingsHoursLow: 15, savingsHoursHigh: 25, color: "text-destructive",
    };
  }
  if (totalScore >= 11) {
    return {
      score: totalScore, level: "HOCH",
      headline: "Du hast deutliches Optimierungspotenzial.",
      description: "Viele deiner Prozesse laufen noch manuell. Mit einfachen Automatisierungen kannst du sofort 8–15 Stunden pro Woche einsparen und dein Team entlasten.",
      savingsHoursLow: 8, savingsHoursHigh: 15, color: "text-orange-500",
    };
  }
  return {
    score: totalScore, level: "MODERAT",
    headline: "Du bist auf einem guten Weg – aber da geht mehr.",
    description: "Dein Unternehmen hat solide Grundlagen, aber gezielte Automatisierungen können dir noch 3–8 Stunden pro Woche sparen und Fehlerquellen eliminieren.",
    savingsHoursLow: 3, savingsHoursHigh: 8, color: "text-primary",
  };
}

export const AiAnalysisWidget = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleStart = () => setStep(0);

  const handleAnswer = (weightIndex: number) => {
    const weight = questions[step].weights[weightIndex];
    const newAnswers = [...answers, weight];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(5);
      const total = newAnswers.reduce((a, b) => a + b, 0);
      setTimeout(() => {
        setResult(getResult(total));
        setStep(6);
      }, 2500);
    }
  };

  const handleReset = () => {
    setStep(-1);
    setAnswers([]);
    setResult(null);
  };

  const fmt = (n: number) => n.toLocaleString("de-DE");

  return (
    <section id="ki-analyse" className={t.sectionPadding}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Intro text above widget */}
        <div className="text-center mb-10">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Die meisten Unternehmer unterschätzen, wie viel Zeit und Geld sie jeden Monat durch manuelle Prozesse verlieren. Diese Analyse zeigt dir in 60 Sekunden, wo dein größtes Einsparpotenzial liegt.
          </p>
        </div>

        <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-deep via-primary to-primary-light p-7 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Brain className="w-6 h-6 text-primary-foreground" />
              <span className="text-primary-foreground/80 text-sm font-semibold uppercase tracking-wider">
                Kostenlose KI-Analyse
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Wie viel Zeit und Geld verlierst du pro Woche?
            </h3>
            <p className="text-primary-foreground/60 mt-2 text-sm">
              5 Fragen • 60 Sekunden • Sofortige Auswertung
            </p>
          </div>

          <div className="p-7 md:p-10">
            {/* Intro */}
            {step === -1 && (
              <div className="text-center space-y-7">
                <p className="text-lg text-muted-foreground">
                  Finde heraus, wie viele Stunden und Euro du jede Woche verlierst – weil Prozesse manuell laufen, die längst automatisiert sein könnten.
                </p>
                <button onClick={handleStart} className={`${t.ctaPrimary} group`}>
                  <Sparkles className="inline-block mr-2 w-5 h-5" />
                  Jetzt analysieren
                </button>
                <p className="text-xs text-muted-foreground">
                  Keine E-Mail nötig • 100 % kostenlos • Dauert nur 2 Minuten
                </p>
              </div>
            )}

            {/* Questions */}
            {step >= 0 && step < questions.length && (
              <div>
                <div className="flex gap-1.5 mb-7">
                  {questions.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-2">Frage {step + 1} von {questions.length}</p>
                <h4 className="text-xl md:text-2xl font-bold text-foreground mb-7">{questions[step].question}</h4>
                <div className="space-y-3">
                  {questions[step].options.map((option, i) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(i)}
                      className="w-full text-left p-5 rounded-2xl border border-border/40 bg-card hover:border-primary/30 hover:bg-primary/3 hover:scale-[1.01] transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="text-foreground font-medium">{option}</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analyzing */}
            {step === 5 && (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-lg font-semibold text-foreground">KI analysiert deine Antworten...</p>
                <p className="text-muted-foreground">Berechne dein Automatisierungs-Potenzial</p>
              </div>
            )}

            {/* Result */}
            {step === 6 && result && (
              <div className="space-y-7">
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-lg ${
                    result.level === "KRITISCH" ? "bg-destructive/10 text-destructive" :
                    result.level === "HOCH" ? "bg-orange-500/10 text-orange-500" :
                    "bg-primary/10 text-primary"
                  }`}>
                    <span>Potenzial: {result.level}</span>
                  </div>
                </div>

                <h4 className="text-2xl md:text-3xl font-bold text-foreground text-center">{result.headline}</h4>
                <p className="text-muted-foreground text-center text-lg">{result.description}</p>

                {/* Savings Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-[#0F3E2E] to-[#0a2a20] text-white rounded-2xl p-5 text-center">
                    <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Pro Woche</p>
                    <p className="text-2xl md:text-3xl font-bold">{result.savingsHoursLow}–{result.savingsHoursHigh} Std.</p>
                  </div>
                  <div className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-2xl p-5 text-center">
                    <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Pro Monat</p>
                    <p className="text-2xl md:text-3xl font-bold">{fmt(result.savingsHoursLow * HOURLY_RATE * 4)}–{fmt(result.savingsHoursHigh * HOURLY_RATE * 4)} €</p>
                  </div>
                  <div className="bg-destructive text-white rounded-2xl p-5 text-center">
                    <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Auf 12 Monate</p>
                    <p className="text-2xl md:text-3xl font-bold">{fmt(result.savingsHoursLow * HOURLY_RATE * 4 * 12)}–{fmt(result.savingsHoursHigh * HOURLY_RATE * 4 * 12)} €</p>
                  </div>
                </div>

                <p className="text-center text-foreground font-semibold text-lg">
                  Wenn du nichts änderst, bleibt das exakt so. Jeden Monat.
                </p>

                <div className="flex flex-col items-center gap-4 pt-2">
                  <button
                    onClick={() => navigate("/qualifizierung")}
                    className={`${t.ctaPrimary} group`}
                  >
                    <Calendar className="inline-block mr-2 w-5 h-5" />
                    Potenzial-Analyse sichern
                    <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-sm text-muted-foreground font-medium">
                    Wir setzen die ersten Automatisierungen innerhalb von 14 Tagen um.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dauert nur 2 Minuten • Kostenlos und unverbindlich
                  </p>
                </div>

                <button onClick={handleReset} className="block mx-auto text-sm text-muted-foreground underline hover:text-foreground transition-colors">
                  Analyse wiederholen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
