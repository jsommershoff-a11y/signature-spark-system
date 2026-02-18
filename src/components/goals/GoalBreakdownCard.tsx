import type { GoalBreakdown } from '@/lib/goalBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const HORIZON_LABELS: Record<string, string> = {
  YEAR: 'Jahr',
  HALF_YEAR: '6 Monate',
  MONTH: 'Monat',
};

interface Props {
  breakdown: GoalBreakdown;
  onClick?: () => void;
}

function fmt(n: number, unit: string | null): string {
  if (unit === 'EUR' || unit === '€') return `${n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

export function GoalBreakdownCard({ breakdown: b, onClick }: Props) {
  const pct = b.targetTotal > 0 ? Math.min(100, Math.round((b.actualToDate / b.targetTotal) * 100)) : 0;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{b.goalTitle}</CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {HORIZON_LABELS[b.horizon] ?? b.horizon}
            </Badge>
            {b.status === 'green' ? (
              <Badge variant="secondary" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Auf Kurs
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Nicht auf Kurs
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{fmt(b.actualToDate, b.unit)} von {fmt(b.targetTotal, b.unit)}</span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {/* Soll-Tabelle */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-muted p-2">
            <p className="text-lg font-bold">{fmt(b.requiredPerMonth, b.unit)}</p>
            <p className="text-xs text-muted-foreground">/ Monat</p>
          </div>
          <div className="rounded-md bg-muted p-2">
            <p className="text-lg font-bold">{fmt(b.requiredPerWeek, b.unit)}</p>
            <p className="text-xs text-muted-foreground">/ Woche</p>
          </div>
          <div className="rounded-md bg-muted p-2">
            <p className="text-lg font-bold">{fmt(b.requiredPerDay, b.unit)}</p>
            <p className="text-xs text-muted-foreground">/ Tag</p>
          </div>
        </div>

        {/* Heute zu tun */}
        {b.todosToday.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Heute zu tun</p>
            <ul className="space-y-1">
              {b.todosToday.map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-primary">{t.value}</span>
                  <span>{t.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
