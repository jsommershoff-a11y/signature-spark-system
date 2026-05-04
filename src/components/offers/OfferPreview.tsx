import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { OfferContent } from '@/types/offers';
import { formatCents } from '@/types/offers';
import { PainPointRadar } from './PainPointRadar';
import { RoiSummaryCard } from './RoiSummaryCard';

interface OfferPreviewProps {
  content: OfferContent;
  companyLogo?: string;
}

export function OfferPreview({ content, companyLogo }: OfferPreviewProps) {
  const isVariable = content.offer_mode === 'variable';
  const variableData = content.variable_offer_data;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 bg-card rounded-lg border">
      {/* Header */}
      <div className="flex items-start justify-between">
        {companyLogo ? (
          <img src={companyLogo} alt="Logo" className="h-12" />
        ) : (
          <div className="text-2xl font-bold text-primary">KI-Automationen</div>
        )}
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{isVariable ? 'Kurzangebot' : 'Angebot'}</p>
          <p className="text-sm">Gültig bis: {content.valid_until}</p>
        </div>
      </div>

      <Separator />

      {/* Customer */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">An:</p>
        <p className="font-medium">{content.customer?.name}</p>
        {content.customer?.company && <p className="text-sm text-muted-foreground">{content.customer.company}</p>}
        <p className="text-sm text-muted-foreground">{content.customer?.email}</p>
      </div>

      {/* Variable Offer: compact layout */}
      {isVariable && variableData ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Erwartete Leistung</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{variableData.expected_service}</p></CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Geschätzte Kosten</p>
                <p className="text-lg font-bold text-primary">{formatCents(variableData.estimated_cost_cents)}</p>
                <p className="text-xs text-muted-foreground">zzgl. MwSt</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Voraussichtliche Fertigstellung</p>
                <p className="text-sm font-medium mt-1">{variableData.estimated_completion || '—'}</p>
              </CardContent>
            </Card>
          </div>
          {variableData.additional_cost_note && (
            <div className="bg-accent/50 border border-accent rounded-lg p-4">
              <p className="text-xs font-medium mb-1">Hinweis zu Mehrkosten</p>
              <p className="text-xs text-muted-foreground">{variableData.additional_cost_note}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Personalized Intro */}
          {content.ai_generated?.personalized_intro && (
            <div className="bg-accent/50 p-4 rounded-lg">
              <p className="text-sm italic">{content.ai_generated.personalized_intro}</p>
            </div>
          )}

          {/* Pain-Point Radar */}
          {content.discovery_data && (
            <PainPointRadar
              discoveryData={content.discovery_data}
              selectedModules={content.selected_modules}
              offerMode={content.offer_mode}
            />
          )}

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold">{content.title}</h2>
            {content.subtitle && <p className="text-muted-foreground">{content.subtitle}</p>}
          </div>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Ihre Lösung</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-muted-foreground border-b">
                    <th className="text-left py-2">Leistung</th>
                    <th className="text-right py-2">Menge</th>
                    <th className="text-right py-2">Preis</th>
                    <th className="text-right py-2">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {content.line_items?.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-medium">{item.name}</p>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">{formatCents(item.unit_price_cents)}</td>
                      <td className="text-right py-3 font-medium">{formatCents(item.total_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Totals */}
          <div className="space-y-2 text-right">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zwischensumme:</span>
              <span>{formatCents(content.subtotal_cents || 0)}</span>
            </div>
            {content.discount_cents && content.discount_cents > 0 && (
              <div className="flex justify-between text-primary">
                <span>Rabatt{content.discount_reason ? ` (${content.discount_reason})` : ''}:</span>
                <span>-{formatCents(content.discount_cents)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">MwSt ({content.tax_rate || 19}%):</span>
              <span>{formatCents(content.tax_cents || 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Gesamt:</span>
              <span className="text-primary">{formatCents(content.total_cents || 0)}</span>
            </div>
            {content.payment_terms?.type === 'installments' && content.payment_terms.installments && (
              <p className="text-sm text-muted-foreground">in {content.payment_terms.installments} Raten</p>
            )}
          </div>

          {/* Value Propositions */}
          {content.ai_generated?.value_propositions && content.ai_generated.value_propositions.length > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Ihre Vorteile:</h3>
              <ul className="space-y-1">
                {content.ai_generated.value_propositions.map((prop, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">✓</span>
                    {prop}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Urgency Message */}
          {content.ai_generated?.urgency_message && (
            <div className="bg-accent p-4 rounded-lg text-center">
              <p className="text-sm font-medium">{content.ai_generated.urgency_message}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
