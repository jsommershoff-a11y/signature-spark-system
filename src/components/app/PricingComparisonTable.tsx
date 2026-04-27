import { Check, Minus } from 'lucide-react';
import { STRIPE_PRODUCTS_LIST } from '@/lib/stripe-config';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Cell = boolean | string;

interface FeatureRow {
  label: string;
  /** Values per product id, in order: mitgliedschaft, starter, wachstum, ernsthaft, rakete */
  values: Record<string, Cell>;
}

interface FeatureGroup {
  title: string;
  rows: FeatureRow[];
}

const COMPARISON_GROUPS: FeatureGroup[] = [
  {
    title: 'Module & Inhalte',
    rows: [
      {
        label: 'Prompt-Bibliothek',
        values: {
          mitgliedschaft: '5 Basis-Vorlagen',
          starter: '4 individualisierte Prompts',
          wachstum: 'Erweitert + Workflows',
          ernsthaft: 'Custom Prompts',
          rakete: 'Vollständig + Multi-Channel',
        },
      },
      {
        label: 'Learning Layer („Mein System")',
        values: {
          mitgliedschaft: 'Grundlagen',
          starter: true,
          wachstum: true,
          ernsthaft: true,
          rakete: true,
        },
      },
      {
        label: 'Community & WhatsApp-Gruppe',
        values: {
          mitgliedschaft: true,
          starter: true,
          wachstum: true,
          ernsthaft: true,
          rakete: true,
        },
      },
      {
        label: 'CRM-System Setup',
        values: {
          mitgliedschaft: false,
          starter: false,
          wachstum: true,
          ernsthaft: true,
          rakete: true,
        },
      },
      {
        label: 'Automatisierungs-Workflows',
        values: {
          mitgliedschaft: false,
          starter: 'Erste Strukturen',
          wachstum: true,
          ernsthaft: 'Custom',
          rakete: 'Multi-Channel',
        },
      },
      {
        label: 'Sales-Funnel Setup',
        values: {
          mitgliedschaft: false,
          starter: false,
          wachstum: false,
          ernsthaft: true,
          rakete: true,
        },
      },
      {
        label: 'Team-Onboarding & Training',
        values: {
          mitgliedschaft: false,
          starter: false,
          wachstum: false,
          ernsthaft: false,
          rakete: true,
        },
      },
    ],
  },
  {
    title: 'Sparring & Betreuung',
    rows: [
      {
        label: 'Live-Calls (Gruppe)',
        values: {
          mitgliedschaft: 'Einblick',
          starter: true,
          wachstum: true,
          ernsthaft: true,
          rakete: true,
        },
      },
      {
        label: 'Kickoff- & Abschluss-Gespräch',
        values: {
          mitgliedschaft: false,
          starter: true,
          wachstum: true,
          ernsthaft: true,
          rakete: true,
        },
      },
      {
        label: '1:1 Strategie-Calls',
        values: {
          mitgliedschaft: false,
          starter: false,
          wachstum: true,
          ernsthaft: true,
          rakete: true,
        },
      },
      {
        label: 'Persönliche Betreuung',
        values: {
          mitgliedschaft: false,
          starter: false,
          wachstum: '8 Wochen',
          ernsthaft: '12 Wochen',
          rakete: 'Laufend',
        },
      },
      {
        label: 'Done-with-you Implementierung',
        values: {
          mitgliedschaft: false,
          starter: false,
          wachstum: false,
          ernsthaft: true,
          rakete: true,
        },
      },
      {
        label: 'Priorisierter Support',
        values: {
          mitgliedschaft: false,
          starter: false,
          wachstum: false,
          ernsthaft: true,
          rakete: 'VIP Slack',
        },
      },
      {
        label: 'Quartals-Review & Optimierung',
        values: {
          mitgliedschaft: false,
          starter: false,
          wachstum: false,
          ernsthaft: false,
          rakete: true,
        },
      },
    ],
  },
];

function CellContent({ value }: { value: Cell }) {
  if (value === true) {
    return <Check className="h-4 w-4 text-success mx-auto" aria-label="Enthalten" />;
  }
  if (value === false) {
    return (
      <Minus
        className="h-4 w-4 text-muted-foreground/40 mx-auto"
        aria-label="Nicht enthalten"
      />
    );
  }
  return <span className="text-xs text-foreground">{value}</span>;
}

export function PricingComparisonTable() {
  const products = STRIPE_PRODUCTS_LIST;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Vergleich aller Pakete</CardTitle>
        <CardDescription>
          Welche Module und Sparring-Optionen sind in welchem Paket enthalten?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 pr-4 sticky left-0 bg-card z-10 min-w-[200px]">
                  Leistung
                </th>
                {products.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      'text-center text-xs font-semibold py-3 px-2 min-w-[120px]',
                      p.highlighted && 'bg-primary/5'
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-foreground">{p.name}</span>
                      {p.badge && (
                        <Badge variant="default" className="text-[10px] py-0 px-1.5">
                          {p.badge}
                        </Badge>
                      )}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {p.directPurchase ? p.price : `ab ${p.price}`}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_GROUPS.map((group) => (
                <>
                  <tr key={`group-${group.title}`} className="bg-muted/30">
                    <td
                      colSpan={products.length + 1}
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground py-2 px-0"
                    >
                      {group.title}
                    </td>
                  </tr>
                  {group.rows.map((row, idx) => (
                    <tr
                      key={`${group.title}-${idx}`}
                      className="border-b border-border/50 last:border-b-0"
                    >
                      <td className="text-sm py-3 pr-4 sticky left-0 bg-card z-10 text-foreground">
                        {row.label}
                      </td>
                      {products.map((p) => (
                        <td
                          key={p.id}
                          className={cn(
                            'text-center py-3 px-2 align-middle',
                            p.highlighted && 'bg-primary/5'
                          )}
                        >
                          <CellContent value={row.values[p.id] ?? false} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-4">
          Preise inkl. 19% MwSt. Höhere Pakete sind individuell – Inhalte werden im Erstgespräch
          abgestimmt.
        </p>
      </CardContent>
    </Card>
  );
}
