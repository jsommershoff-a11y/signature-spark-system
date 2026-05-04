import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import type { RoiData } from '@/lib/roi-calc';
import { RoiSummaryCard } from './RoiSummaryCard';

interface RoiCalculatorFormProps {
  value: RoiData;
  onChange: (next: RoiData) => void;
  /** Investitionsfelder vorbefüllen (z.B. aus Angebotssumme) */
  suggestedOneTimeEur?: number;
  suggestedDurationMonths?: number;
}

const numberOrUndef = (raw: string): number | undefined => {
  if (raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

export function RoiCalculatorForm({
  value,
  onChange,
  suggestedOneTimeEur,
  suggestedDurationMonths,
}: RoiCalculatorFormProps) {
  const set = <K extends keyof RoiData>(key: K, raw: string) => {
    onChange({ ...value, [key]: numberOrUndef(raw) });
  };

  // Effektive Werte mit Fallback auf Suggestions (für Live-Berechnung)
  const effective: RoiData = {
    ...value,
    one_time_price_eur:
      value.one_time_price_eur ?? suggestedOneTimeEur,
    duration_months: value.duration_months ?? suggestedDurationMonths,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          Optional. Alle Felder dürfen leer bleiben — fehlende Werte werden im
          Angebot transparent als „—" dargestellt. Formeln basieren auf{' '}
          <strong>4,33 Wochen/Monat</strong>.
        </p>
      </div>

      {/* 1. Aktueller Aufwand */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">1. Aktueller Aufwand</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Stunden pro Woche</Label>
            <Input
              type="number"
              min={0}
              step="0.5"
              placeholder="z.B. 8"
              value={value.current_hours_per_week ?? ''}
              onChange={e => set('current_hours_per_week', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Interner Stundensatz (€)</Label>
            <Input
              type="number"
              min={0}
              step="1"
              placeholder="z.B. 60"
              value={value.internal_hourly_rate_eur ?? ''}
              onChange={e => set('internal_hourly_rate_eur', e.target.value)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* 2. Aktuelle Kosten */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">2. Weitere Kosten (optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Manueller Prozessverlust (€/Mon.)</Label>
            <Input
              type="number" min={0} step="10" placeholder="0"
              value={value.manual_process_loss_eur_month ?? ''}
              onChange={e => set('manual_process_loss_eur_month', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Entgangene Leads (€/Mon.)</Label>
            <Input
              type="number" min={0} step="10" placeholder="0"
              value={value.lost_leads_eur_month ?? ''}
              onChange={e => set('lost_leads_eur_month', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fehlerkosten (€/Mon.)</Label>
            <Input
              type="number" min={0} step="10" placeholder="0"
              value={value.error_costs_eur_month ?? ''}
              onChange={e => set('error_costs_eur_month', e.target.value)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* 3. Investition */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">3. Investition</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Einmaliger Preis (€)</Label>
            <Input
              type="number" min={0} step="10"
              placeholder={suggestedOneTimeEur ? `auto: ${suggestedOneTimeEur.toFixed(0)}` : '0'}
              value={value.one_time_price_eur ?? ''}
              onChange={e => set('one_time_price_eur', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Monatlicher Preis (€)</Label>
            <Input
              type="number" min={0} step="10" placeholder="0"
              value={value.monthly_price_eur ?? ''}
              onChange={e => set('monthly_price_eur', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Laufzeit (Monate)</Label>
            <Input
              type="number" min={1} step="1"
              placeholder={suggestedDurationMonths ? `auto: ${suggestedDurationMonths}` : '12'}
              value={value.duration_months ?? ''}
              onChange={e => set('duration_months', e.target.value)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* 4. Erwarteter Nutzen */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">4. Erwarteter Nutzen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Eingesparte Stunden / Monat</Label>
            <Input
              type="number" min={0} step="1" placeholder="z.B. 30"
              value={value.saved_hours_per_month ?? ''}
              onChange={e => set('saved_hours_per_month', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Umsatzsteigerung (€/Mon.)</Label>
            <Input
              type="number" min={0} step="100" placeholder="0"
              value={value.expected_revenue_uplift_eur_month ?? ''}
              onChange={e => set('expected_revenue_uplift_eur_month', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kostenersparnis (€/Mon.)</Label>
            <Input
              type="number" min={0} step="50" placeholder="0"
              value={value.expected_cost_savings_eur_month ?? ''}
              onChange={e => set('expected_cost_savings_eur_month', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Qualitative Vorteile</Label>
          <Textarea
            rows={2}
            placeholder="z.B. weniger Stress im Team, schnellere Reaktion auf Anfragen, höhere Datenqualität..."
            value={value.qualitative_benefits ?? ''}
            onChange={e =>
              onChange({ ...value, qualitative_benefits: e.target.value || undefined })
            }
          />
        </div>
      </section>

      <Separator />

      {/* Live-Vorschau */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Live-Vorschau Kosten-Nutzen</CardTitle>
        </CardHeader>
        <CardContent>
          <RoiSummaryCard data={effective} compact />
        </CardContent>
      </Card>
    </div>
  );
}
