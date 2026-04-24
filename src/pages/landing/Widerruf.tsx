import { PublicLayout } from '@/components/landing/PublicLayout';
import { SEOHead } from '@/components/landing/SEOHead';
import { DEFAULT_WITHDRAWAL_POLICY } from '@/lib/legal-templates';

export default function Widerruf() {
  return (
    <PublicLayout>
      <SEOHead
        title="Widerrufsbelehrung | KI-Automationen"
        description="Widerrufsbelehrung und Widerrufsformular für Verträge mit KI-Automationen."
        canonical="/widerruf"
        noIndex
      />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Widerrufsbelehrung</h1>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-transparent p-0 border-none">
            {DEFAULT_WITHDRAWAL_POLICY}
          </pre>
        </div>
      </div>
    </PublicLayout>
  );
}
