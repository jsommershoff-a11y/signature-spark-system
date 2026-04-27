import { PublicLayout } from '@/components/landing/PublicLayout';
import { SEOHead } from '@/components/landing/SEOHead';
import { DEFAULT_AGB, VARIABLE_OFFER_AGB_ADDENDUM } from '@/lib/legal-templates';

export default function AGB() {
  return (
    <PublicLayout>
      <SEOHead
        title="Allgemeine Geschäftsbedingungen | KI-Automationen"
        description="AGB für alle Produkte und Dienstleistungen von KI-Automationen. Transparente Vertragsbedingungen für Mitgliedschaften und Beratungspakete."
        canonical="/agb"
        noIndex
      />
      <div className="container mx-auto px-4 sm:px-6 py-10 md:py-16 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          Allgemeine Geschäftsbedingungen
        </h1>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-transparent p-0 border-none">
            {DEFAULT_AGB}
          </pre>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-transparent p-0 border-none mt-8">
            {VARIABLE_OFFER_AGB_ADDENDUM}
          </pre>
        </div>
      </div>
    </PublicLayout>
  );
}
