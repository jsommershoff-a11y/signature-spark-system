import { PublicLayout } from '@/components/landing/PublicLayout';
import { DEFAULT_AGB, VARIABLE_OFFER_AGB_ADDENDUM } from '@/lib/legal-templates';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Gift, Users, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
        },
        HTMLElement
      >;
    }
  }
}

const SKOOL_FEATURES = [
  'Exklusive KI-Community mit Gleichgesinnten',
  'Wöchentliche Live-Calls & Q&A Sessions',
  'Fertige KI-Vorlagen & Prompt-Bibliothek',
  'Schritt-für-Schritt Kurse zur KI-Integration',
  'Direkter Austausch mit dem Gründer',
];

export default function AGB() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 sm:px-6 py-10 md:py-16 max-w-4xl space-y-10 md:space-y-16">

        {/* Einstiegsangebot – Skool */}
        <section className="space-y-6">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="gap-1.5">
              <Gift className="h-3 w-3" />
              Einstiegsangebot
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Starte jetzt mit unserer KI-Community
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Werde Teil unseres Skool-Programms und erhalte sofortigen Zugang zu praxiserprobten
              KI-Strategien, einer aktiven Community und persönlicher Unterstützung.
            </p>
          </div>

          <Card className="border-primary/30 bg-primary/5 shadow-md">
              <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                  <Users className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">KI-Prozess Community auf Skool</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dein Einstieg in die Welt der KI-gestützten Unternehmensoptimierung –
                      gemeinsam mit anderen Unternehmern, die den gleichen Weg gehen.
                    </p>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {SKOOL_FEATURES.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://www.skool.com/ki-prozess"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-5 py-2.5 sm:w-auto w-full transition-colors"
                  >
                    Jetzt der Community beitreten
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Stripe Pricing Table */}
        <section className="space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Pakete & Preise
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wähle das passende Paket für dein Unternehmen und starte direkt mit der Buchung.
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            <stripe-pricing-table
              pricing-table-id="prctbl_1TA1NXBmqjP8eJrScytk6Mrj"
              publishable-key="pk_live_51NpX6uBmqjP8eJrSMZt8bBoobLYUDo7oxVHiGHKKdrUT6fmVeA0tEltdLGuP3Rr4a8DeeilvsbNJL5cblrNCm7tR00njg6DyC5"
            />
          </div>
        </section>

        <Separator />

        {/* AGB Text */}
        <section>
          <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-transparent p-0 border-none">
              {DEFAULT_AGB}
            </pre>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-transparent p-0 border-none mt-8">
              {VARIABLE_OFFER_AGB_ADDENDUM}
            </pre>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
