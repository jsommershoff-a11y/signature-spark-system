import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Clock, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ROICalculatorSectionProps {
  /** Default-Stunden, die pro Woche manuell gebunden sind */
  defaultHoursPerWeek?: number;
  /** Default-Anzahl Mitarbeiter, die involviert sind */
  defaultEmployees?: number;
  /** Default-Stundenkostensatz (€) */
  defaultHourlyCost?: number;
  /** Optional: Pre-Selection für Qualifizierungs-Form */
  qualifizierungQuery?: string;
  /** Eyebrow-Text */
  eyebrow?: string;
  headline?: string;
  /** Annahme: % der manuellen Arbeit, die durch KI eingespart wird */
  automationFactor?: number;
}

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtHours = (n: number) => `${Math.round(n)} h`;

/**
 * Interaktiver ROI-/Zeitersparnis-Rechner.
 * Bewusst konservativ (60 % Automatisierungs-Faktor als Default), um glaubwürdig zu bleiben.
 * Berechnet Wochen-Stunden, Monats-Wertäquivalent und Jahres-Wertäquivalent.
 */
export const ROICalculatorSection = ({
  defaultHoursPerWeek = 12,
  defaultEmployees = 2,
  defaultHourlyCost = 45,
  qualifizierungQuery = "",
  eyebrow = "ROI-Rechner",
  headline = "Wie viel holst du dir mit KI-Automatisierung zurück?",
  automationFactor = 0.6,
}: ROICalculatorSectionProps) => {
  const [hours, setHours] = useState(defaultHoursPerWeek);
  const [employees, setEmployees] = useState(defaultEmployees);
  const [cost, setCost] = useState(defaultHourlyCost);

  const result = useMemo(() => {
    const savedHoursWeek = hours * employees * automationFactor;
    const savedHoursMonth = savedHoursWeek * 4.33;
    const savedHoursYear = savedHoursWeek * 52;
    const monthlyValue = savedHoursMonth * cost;
    const yearlyValue = savedHoursYear * cost;
    return {
      savedHoursWeek,
      savedHoursMonth,
      savedHoursYear,
      monthlyValue,
      yearlyValue,
    };
  }, [hours, employees, cost, automationFactor]);

  const ctaHref = `/qualifizierung${qualifizierungQuery ? `?${qualifizierungQuery}` : ""}`;

  return (
    <section className="bg-[#0F3E2E] text-white py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge className="bg-primary/20 text-primary-light border-primary/30 mb-3 inline-flex items-center gap-1.5">
            <Calculator className="h-3.5 w-3.5" />
            {eyebrow}
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3">
            {headline}
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">
            Verschiebe die Regler, um deinen Status quo abzubilden. Wir rechnen konservativ:{" "}
            {Math.round(automationFactor * 100)} % der manuellen Arbeit lassen sich realistisch
            automatisieren.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardContent className="p-6 space-y-7">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white/85 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary-light" />
                    Manuelle Stunden pro Woche
                  </label>
                  <span className="text-2xl font-bold text-white tabular-nums">{hours} h</span>
                </div>
                <Slider
                  value={[hours]}
                  onValueChange={(v) => setHours(v[0])}
                  min={2}
                  max={60}
                  step={1}
                />
                <div className="flex justify-between text-[11px] text-white/50 mt-1.5">
                  <span>2 h</span>
                  <span>60 h</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white/85 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary-light" />
                    Mitarbeiter im Prozess
                  </label>
                  <span className="text-2xl font-bold text-white tabular-nums">{employees}</span>
                </div>
                <Slider
                  value={[employees]}
                  onValueChange={(v) => setEmployees(v[0])}
                  min={1}
                  max={15}
                  step={1}
                />
                <div className="flex justify-between text-[11px] text-white/50 mt-1.5">
                  <span>1</span>
                  <span>15</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white/85 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-light" />
                    Vollkosten pro Stunde
                  </label>
                  <span className="text-2xl font-bold text-white tabular-nums">
                    {fmtEUR(cost)}
                  </span>
                </div>
                <Slider
                  value={[cost]}
                  onValueChange={(v) => setCost(v[0])}
                  min={25}
                  max={120}
                  step={5}
                />
                <div className="flex justify-between text-[11px] text-white/50 mt-1.5">
                  <span>25 €</span>
                  <span>120 €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="text-xs uppercase tracking-wider text-primary-foreground/70 mb-1">
                Dein konservatives Einsparpotenzial
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-5xl md:text-6xl font-bold tabular-nums">
                  {fmtHours(result.savedHoursWeek)}
                </div>
                <div className="text-sm font-medium opacity-80">/ Woche</div>
              </div>
              <p className="text-sm opacity-85 mb-6">
                {fmtHours(result.savedHoursMonth)} pro Monat · {fmtHours(result.savedHoursYear)}{" "}
                pro Jahr zurückgewonnene Mitarbeiterzeit.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl bg-primary-foreground/10 p-4">
                  <div className="text-xs uppercase tracking-wider opacity-75 mb-1">
                    Wertäquivalent / Monat
                  </div>
                  <div className="text-xl md:text-2xl font-bold tabular-nums">
                    {fmtEUR(result.monthlyValue)}
                  </div>
                </div>
                <div className="rounded-xl bg-primary-foreground/10 p-4">
                  <div className="text-xs uppercase tracking-wider opacity-75 mb-1">
                    Wertäquivalent / Jahr
                  </div>
                  <div className="text-xl md:text-2xl font-bold tabular-nums">
                    {fmtEUR(result.yearlyValue)}
                  </div>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                variant="secondary"
                className="mt-auto bg-white text-primary hover:bg-white/90"
              >
                <Link to={ctaHref}>
                  Jetzt Festpreis-Angebot anfordern
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-[11px] text-primary-foreground/70 mt-2 text-center">
                Antwort innerhalb 24 h · Unverbindlich
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-white/50 text-center max-w-2xl mx-auto mt-6">
          Berechnung basiert auf Erfahrungswerten aus &gt; 50 Implementierungen. Für deine
          tatsächliche Situation rechnen wir im Erstgespräch konkret nach.
        </p>
      </div>
    </section>
  );
};
