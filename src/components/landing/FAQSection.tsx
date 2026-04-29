import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  headline?: string;
  items: FAQItem[];
  /**
   * Substrings of questions that should appear first on mobile,
   * so wichtige Antworten ohne Scrollen sichtbar sind.
   */
  mobilePriority?: string[];
}

export const FAQSection = ({
  headline = "Häufige Fragen",
  items,
  mobilePriority = ["Wie schnell reagierst", "30 Tagen Begleitung"],
}: FAQSectionProps) => {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const isPriority = (q: string) =>
    mobilePriority.some((needle) => q.toLowerCase().includes(needle.toLowerCase()));

  // Mobile: priorisierte Fragen zuerst. Desktop: ursprüngliche Reihenfolge.
  const mobileItems = useMemo(() => {
    const prio = items.filter((i) => isPriority(i.question));
    const rest = items.filter((i) => !isPriority(i.question));
    return [...prio, ...rest];
  }, [items, mobilePriority]);

  const renderItem = (item: FAQItem, index: number, highlight: boolean) => (
    <AccordionItem
      key={`${index}-${item.question}`}
      value={`item-${index}`}
      className={`bg-card rounded-2xl border px-5 sm:px-8 transition-all duration-300 data-[state=open]:shadow-[0_4px_20px_rgba(0,0,0,0.06)] ${
        highlight
          ? "border-primary/30 ring-1 ring-primary/10"
          : "border-border/40"
      }`}
    >
      <AccordionTrigger
        className="text-left text-base sm:text-lg md:text-xl font-semibold text-foreground hover:text-primary hover:no-underline py-5 sm:py-6 min-h-[56px] gap-3 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0"
      >
        <span className="flex items-center gap-2 leading-snug">
          {highlight && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 shrink-0">
              Neu
            </span>
          )}
          {item.question}
        </span>
      </AccordionTrigger>
      <AccordionContent className="text-foreground/80 text-[15px] sm:text-base leading-relaxed pb-6">
        {item.answer}
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <section className="py-14 sm:py-20 md:py-32 bg-muted/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground text-center mb-8 sm:mb-14 tracking-tight">
            {headline}
          </h2>

          {/* Mobile: priorisierte Reihenfolge */}
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="space-y-3 md:hidden"
          >
            {mobileItems.map((item, index) =>
              renderItem(item, index, isPriority(item.question))
            )}
          </Accordion>

          {/* Desktop: ursprüngliche Reihenfolge */}
          <Accordion
            type="single"
            collapsible
            className="hidden md:block space-y-4"
          >
            {items.map((item, index) =>
              renderItem(item, index, isPriority(item.question))
            )}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
