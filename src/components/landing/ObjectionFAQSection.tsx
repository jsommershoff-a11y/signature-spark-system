import { ShieldQuestion } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";

export interface ObjectionItem {
  /** Der Einwand (Originalton Kunde) */
  objection: string;
  /** Die Auflösung */
  answer: string;
}

interface ObjectionFAQSectionProps {
  eyebrow?: string;
  headline?: string;
  intro?: string;
  items?: ObjectionItem[];
  /** Logischer Section-Identifier für faq_open-Analytics. */
  trackingSection?: string;
}

/**
 * Top-Einwände aus &gt; 50 Verkaufsgesprächen, sortiert nach realer Häufigkeit:
 * 1. Preis (kommt in ~70 % der Gespräche)
 * 2. Zeit / Bandbreite (~55 %)
 * 3. Risiko: "Was wenn die KI Fehler macht?" (~40 %)
 * 4. Agentur-Reinfall / Vertrauen (~30 %)
 *
 * Bewusst auf 4 reduziert: weniger Scroll-Friktion, höhere Read-Through-Rate.
 * "Wir warten lieber" und "Prozesse zu individuell" sind in Hero/Solution-Texten
 * bereits adressiert und werden hier nicht doppelt aufgegriffen.
 */
export const COMMON_OBJECTIONS: ObjectionItem[] = [
  {
    objection: '\u201EDas ist mir zu teuer.\u201C',
    answer:
      "Eine Vollzeitkraft kostet 4.000–6.000 € pro Monat — inkl. Lohnnebenkosten, Krankheit, Einarbeitung. Unsere Bots amortisieren sich typischerweise in unter 90 Tagen über die gesparten Personalstunden. Du bekommst Festpreis statt Stundenfass.",
  },
  {
    objection: '\u201EWir haben gerade keine Zeit für so ein Projekt.\u201C',
    answer:
      "Dein Aufwand: 1–2 h Onboarding plus 30 min pro Woche. Wir bauen, testen und schulen — ihr nutzt nur das Ergebnis. Wer heute keine Zeit für Automatisierung hat, hat in 12 Monaten noch weniger.",
  },
  {
    objection: '\u201EWas, wenn die KI Fehler macht?\u201C',
    answer:
      "Jede Automatisierung hat ein klares Eskalationsmodell: Bei Unsicherheit gibt die KI an einen Menschen ab, statt selbst zu entscheiden. Volle Kontrolle, alle Logs, 30 Tage Optimierungssupport inklusive.",
  },
  {
    objection: '\u201EWir hatten schon mal eine Agentur — war ein Reinfall.\u201C',
    answer:
      "Klassisch. Der Unterschied bei uns: Festpreis (kein Stundenfass), klare Roadmap (Tag 0–20), produktiver Code statt PoC, live in 7 Tagen. Wenn wir nicht liefern, zahlst du nicht.",
  },
];

/**
 * Einwand-FAQ. Akzentstärker als normale FAQ – setzt Einwände in Anführungszeichen,
 * antwortet direkt und auflösend.
 */
export const ObjectionFAQSection = ({
  eyebrow = "Die 4 häufigsten Einwände",
  headline = "Was wir vor fast jedem Abschluss gefragt werden",
  intro = "Sortiert nach realer Häufigkeit aus über 50 Verkaufsgesprächen — Preis und Zeit zuerst.",
  items = COMMON_OBJECTIONS,
  trackingSection = "objections",
}: ObjectionFAQSectionProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.objection.replace(/[„""]/g, ""),
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const handleValueChange = (value: string) => {
    if (!value) return;
    const idx = Number(value.replace("obj-", ""));
    const item = items[idx];
    if (!item) return;
    void trackEvent("faq_open", {
      section: trackingSection,
      question: item.objection,
      index: idx,
      kind: "objection",
    });
  };

  return (
    <section className="bg-muted/40 py-14 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge className="bg-primary/15 text-primary border-primary/30 mb-3 inline-flex items-center gap-1.5">
            <ShieldQuestion className="h-3.5 w-3.5" />
            {eyebrow}
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            {headline}
          </h2>
          {intro && (
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">{intro}</p>
          )}
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="obj-0"
          onValueChange={handleValueChange}
          className="space-y-3"
        >
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`obj-${i}`}
              className="bg-card rounded-2xl border border-border/40 px-6 data-[state=open]:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                {item.objection}
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
