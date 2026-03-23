import { useState } from "react";
import { Brain, ChevronRight, CheckCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
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

interface AnalysisResult {
  score: number;
  level: string;
  headline: string;
  description: string;
  savings: string;
  color: string;
}

function getResult(totalScore: number): AnalysisResult {
  if (totalScore >= 16) {
    return {
      score: totalScore,
      level: "KRITISCH",
      headline: "Du verlierst massiv Zeit und Umsatz.",
      description: "Dein Unternehmen hat enormes Automatisierungs-Potenzial. Du verschwendest aktuell geschätzt 15–25 Stunden pro Woche mit Aufgaben, die ein System in Sekunden erledigen kann.",
      savings: "15–25 Std./Woche",
      color: "text-destructive",
    };
  }
  if (totalScore >= 11) {
    return {
      score: totalScore,
      level: "HOCH",
      headline: "Du hast deutliches Optimierungspotenzial.",
      description: "Viele deiner Prozesse laufen noch manuell. Mit einfachen Automatisierungen kannst du sofort 8–15 Stunden pro Woche einsparen und dein Team entlasten.",
      savings: "8–15 Std./Woche",
      color: "text-orange-500",
    };
  }
  return {
    score: totalScore,
    level: "MODERAT",
    headline: "Du bist auf einem guten Weg – aber da geht mehr.",
    description: "Dein Unternehmen hat solide Grundlagen, aber gezielte Automatisierungen können dir noch 3–8 Stunden pro Woche sparen und Fehlerquellen eliminieren.",
    savings: "3–8 Std./Woche",
    color: "text-primary",
  };
}

export const AiAnalysisWidget = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1); // -1 = intro, 0-4 = questions, 5 = analyzing, 6 = result
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
      setStep(5); // analyzing
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

  return (
    <section id="ki-analyse" className={t.sectionPadding}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-primary-foreground" />
              <span className="text-primary-foreground/80 text-sm font-semibold uppercase tracking-wider">
                Kostenlose KI-Analyse
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Wie viel Zeit verlierst du pro Woche?
            </h3>
            <p className="text-primary-foreground/70 mt-2">
              5 Fragen • 60 Sekunden • Sofortige Auswertung
            </p>
          </div>

          <div className="p-6 md:p-8">
            {/* Intro */}
            {step === -1 && (
              <div className="text-center space-y-6">
                <p className="text-lg text-muted-foreground">
                  Finde in 60 Sekunden heraus, wie viel Automatisierungs-Potenzial in deinem Unternehmen steckt – und wie viele Stunden du pro Woche einsparen kannst.
                </p>
                <button
                  onClick={handleStart}
                  className={`${t.ctaPrimary} group`}
                >
                  <Sparkles className="inline-block mr-2 w-5 h-5" />
                  Jetzt analysieren
                </button>
                <p className="text-xs text-muted-foreground">
                  Keine E-Mail nötig • 100 % kostenlos
                </p>
              </div>
            )}

            {/* Questions */}
            {step >= 0 && step < questions.length && (
              <div>
                {/* Progress */}
                <div className="flex gap-1 mb-6">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  Frage {step + 1} von {questions.length}
                </p>
                <h4 className="text-xl font-semibold text-foreground mb-6">
                  {questions[step].question}
                </h4>

                <div className="space-y-3">
                  {questions[step].options.map((option, i) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(i)}
                      className="w-full text-left p-4 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between group"
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
              <div className="text-center py-10 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-lg font-semibold text-foreground">KI analysiert deine Antworten...</p>
                <p className="text-muted-foreground">Berechne dein Automatisierungs-Potenzial</p>
              </div>
            )}

            {/* Result */}
            {step === 6 && result && (
              <div className="space-y-6">
                {/* Score Badge */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-lg ${
                    result.level === "KRITISCH" ? "bg-destructive/10 text-destructive" :
                    result.level === "HOCH" ? "bg-orange-500/10 text-orange-500" :
                    "bg-primary/10 text-primary"
                  }`}>
                    <span>Potenzial: {result.level}</span>
                  </div>
                </div>

                <h4 className="text-2xl font-bold text-foreground text-center">
                  {result.headline}
                </h4>

                <p className="text-muted-foreground text-center text-lg">
                  {result.description}
                </p>

                {/* Savings Card */}
                <div className="bg-foreground text-background rounded-2xl p-6 text-center">
                  <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Geschätzte Zeitersparnis durch Automatisierung</p>
                  <p className="text-4xl font-bold">{result.savings}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => navigate("/qualifizierung")}
                    className={`${t.ctaPrimary} group`}
                  >
                    Kostenloses Strategiegespräch sichern
                    <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  In 45 Min. zeigen wir dir, welche Automatisierungen bei dir sofort wirken.
                </p>

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
