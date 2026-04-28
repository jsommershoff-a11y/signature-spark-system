import { ShieldQuestion } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

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
}

/**
 * Standard-Einwände aus &gt; 50 Verkaufsgesprächen ("Big 5").
 * Werden als Default verwendet und können pro Page erweitert werden.
 */
export const COMMON_OBJECTIONS: ObjectionItem[] = [
  {
    objection: "„Das ist mir zu teuer."",
    answer:
      "Verständlich – aber rechne ehrlich gegen: Eine MFA / Vorarbeiter / Sachbearbeiter kostet dich 4.000–6.000 € pro Monat – inklusive Lohnnebenkosten, Krankheitstage und Einarbeitung. Unsere Lösungen amortisieren sich in der Regel in weniger als 90 Tagen über die gesparten Personalstunden.",
  },
  {
    objection: "„Wir haben gerade keine Zeit für so ein Projekt."",
    answer:
      "Genau dafür ist die Lösung gebaut. Dein Team-Aufwand liegt bei 1–2 h Onboarding und einer halben Stunde pro Woche. Wir bauen, wir testen, wir schulen – ihr nutzt nur das Ergebnis. Wer keine Zeit für Automatisierung hat, hat in 12 Monaten noch weniger.",
  },
  {
    objection: "„Wir warten lieber, bis sich KI etabliert hat."",
    answer:
      "Die Technologie ist seit über zwei Jahren produktionsreif. Wer jetzt nicht startet, verschiebt nicht das Risiko – sondern den Wettbewerbsvorsprung an die Konkurrenz, die schon umsetzt. In 12 Monaten ist KI in deiner Branche kein Vorteil mehr, sondern Pflicht.",
  },
  {
    objection: "„Unsere Prozesse sind zu individuell für KI."",
    answer:
      "Genau das ist der häufigste Trugschluss. 80 % der Prozesse sind in jedem Mittelstand identisch (Anfragen, Termine, Angebote, Rechnungen, Service). Die restlichen 20 % bilden wir als Custom-Modul ab – das ist genau unsere Spezialität.",
  },
  {
    objection: "„Was, wenn die KI Fehler macht?"",
    answer:
      "Jede produktive Automatisierung hat ein klares Eskalationsmodell: Bei Unsicherheit eskaliert die KI an einen Menschen, statt selbst zu entscheiden. Du behältst volle Kontrolle und alle Logs. Außerdem: 30 Tage Optimierungssupport sind inklusive.",
  },
  {
    objection: "„Wir haben schon mal mit einer Agentur gearbeitet – das war ein Reinfall."",
    answer:
      "Klassisch. Der Unterschied: Wir liefern Festpreis (kein Stundenfass), klare Roadmap (Tag 0–20), produktiven Code (kein PoC, der versandet) – und du bist in 7 Tagen live. Falls wir nicht liefern, zahlst du nicht.",
  },
];

/**
 * Einwand-FAQ. Akzentstärker als normale FAQ – setzt Einwände in Anführungszeichen,
 * antwortet direkt und auflösend.
 */
export const ObjectionFAQSection = ({
  eyebrow = "Einwände & Antworten",
  headline = "Was wir vor jedem Vertragsabschluss gefragt werden",
  intro = "Diese sechs Bedenken hören wir in fast jedem Erstgespräch. Hier die ehrlichen Antworten.",
  items = COMMON_OBJECTIONS,
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

        <Accordion type="single" collapsible className="space-y-3">
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
