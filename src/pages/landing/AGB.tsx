import { PublicLayout } from '@/components/landing/PublicLayout';
import { DEFAULT_AGB, VARIABLE_OFFER_AGB_ADDENDUM } from '@/lib/legal-templates';

export default function AGB() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
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
