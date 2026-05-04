import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Clock, TrendingDown, Wallet, TrendingUp, Target, CheckCircle2,
} from 'lucide-react';
import { computeRoi, formatEur, formatMonths, type RoiData } from '@/lib/roi-calc';
import { cn } from '@/lib/utils';

interface RoiSummaryCardProps {
  data: RoiData | undefined | null;
  /** Kompakte Variante (für Live-Preview im Wizard) */
  compact?: boolean;
}

interface KpiProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'positive' | 'negative' | 'primary';
}

function Kpi({ icon, label, value, hint, tone = 'neutral' }: KpiProps) {
  const toneClasses: Record<NonNullable<KpiProps['tone']>, string> = {
    neutral: 'bg-muted/40 border-border',
    positive: 'bg-emerald-500/5 border-emerald-500/20',
    negative: 'bg-destructive/5 border-destructive/20',
    primary: 'bg-primary/5 border-primary/20',
  };
  const valueTone: Record<NonNullable<KpiProps['tone']>, string> = {
    neutral: 'text-foreground',
    positive: 'text-emerald-600 dark:text-emerald-500',
    negative: 'text-destructive',
    primary: 'text-primary',
  };
  return (
    <div className={cn('rounded-lg border p-3', toneClasses[tone])}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={cn('text-base sm:text-lg font-bold tabular-nums', valueTone[tone])}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

export function RoiSummaryCard({ data, compact = false }: RoiSummaryCardProps) {
  const r = computeRoi(data);

  if (!r.hasAnyInput) {
    return (
      <div className="text-sm text-muted-foreground italic text-center py-4">
        Noch keine Werte für die Kosten-Nutzen-Rechnung erfasst.
      </div>
    );
  }

  const fmt = (v: number) => (v > 0 ? formatEur(v) : '—');

  // Tone für Netto-Nutzen
  const tone3 = r.net_benefit_3m_eur > 0 ? 'positive' : r.net_benefit_3m_eur < 0 ? 'negative' : 'neutral';
  const tone12 = r.net_benefit_12m_eur > 0 ? 'positive' : r.net_benefit_12m_eur < 0 ? 'negative' : 'neutral';

  return (
    <div className="space-y-4">
      {/* Block 1: Aktueller Schmerz */}
      <div>
        {!compact && (
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Aktueller Zustand
          </h4>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Kpi
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Zeitverlust / Monat"
            value={fmt(r.monthly_time_loss_eur)}
            tone="negative"
          />
          <Kpi
            icon={<TrendingDown className="h-3.5 w-3.5" />}
            label="Gesamter Schmerz / Monat"
            value={fmt(r.current_monthly_pain_eur)}
            tone="negative"
          />
        </div>
      </div>

      {/* Block 2: Investition vs. Nutzen */}
      <div>
        {!compact && (
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Lösung
          </h4>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Kpi
            icon={<Wallet className="h-3.5 w-3.5" />}
            label="Investition / Monat"
            value={fmt(r.monthly_investment_eur)}
            tone="primary"
          />
          <Kpi
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Nutzen / Monat"
            value={fmt(r.total_monthly_benefit_eur)}
            tone="positive"
          />
        </div>
      </div>

      {/* Block 3: Break-even & Netto */}
      <div>
        {!compact && (
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Wirtschaftlicher Hebel
          </h4>
        )}
        <div className="grid grid-cols-3 gap-2">
          <Kpi
            icon={<Target className="h-3.5 w-3.5" />}
            label="Break-even"
            value={formatMonths(r.break_even_months)}
            tone="primary"
          />
          <Kpi
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Netto nach 3 Mon."
            value={fmt(Math.abs(r.net_benefit_3m_eur)) === '—' ? '—' :
              (r.net_benefit_3m_eur >= 0 ? '+' : '−') + formatEur(Math.abs(r.net_benefit_3m_eur))}
            tone={tone3}
          />
          <Kpi
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Netto nach 12 Mon."
            value={fmt(Math.abs(r.net_benefit_12m_eur)) === '—' ? '—' :
              (r.net_benefit_12m_eur >= 0 ? '+' : '−') + formatEur(Math.abs(r.net_benefit_12m_eur))}
            tone={tone12}
          />
        </div>
      </div>

      {/* Qualitative Vorteile */}
      {data?.qualitative_benefits && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <p className="text-xs font-semibold mb-1">Qualitative Vorteile</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.qualitative_benefits}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Formel-Transparenz */}
      {!compact && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground transition-colors">
            Formeln & Annahmen anzeigen
          </summary>
          <div className="mt-2 space-y-1 pl-2 border-l-2 border-muted">
            <p><strong>Zeitverlust/Monat</strong> = Std/Woche × Stundensatz × 4,33</p>
            <p><strong>Gesamter Schmerz</strong> = Zeitverlust + Prozessverlust + entgangene Leads + Fehlerkosten</p>
            <p><strong>Investition/Monat</strong> = Einmalpreis ÷ Laufzeit + monatlicher Preis</p>
            <p><strong>Nutzen/Monat</strong> = (eingesparte Stunden × Satz) + Umsatzsteigerung + Kostenersparnis</p>
            <p><strong>Break-even</strong> = (Einmalpreis + 1. Monatsrate) ÷ Nutzen/Monat</p>
            <p><strong>Netto 12 Mon.</strong> = Nutzen × 12 − (Einmalpreis + Monatsrate × 12)</p>
          </div>
        </details>
      )}

      {!r.hasInvestment && (
        <div className="text-xs text-muted-foreground italic">
          Hinweis: Ohne Investitionsbeträge wird Break-even nicht berechnet.
        </div>
      )}
    </div>
  );
}

export default RoiSummaryCard;
