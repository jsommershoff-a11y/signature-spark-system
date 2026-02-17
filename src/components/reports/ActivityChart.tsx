import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useActivityData, type TimeRange } from '@/hooks/useReportsData';
import { exportToCSV, exportToPDF } from '@/lib/report-export';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const TYPE_LABELS: Record<string, string> = {
  anruf: 'Anruf',
  email: 'E-Mail',
  meeting: 'Meeting',
  notiz: 'Notiz',
  fehler: 'Fehler',
};

const LINE_COLORS = [
  'hsl(var(--primary))',
  'hsl(210 60% 50%)',
  'hsl(150 60% 45%)',
  'hsl(30 80% 55%)',
  'hsl(0 70% 55%)',
];

interface Props {
  range: TimeRange;
}

export default function ActivityChart({ range }: Props) {
  const { data, isLoading } = useActivityData(range);

  const series = data?.series ?? [];
  const types = data?.types ?? [];

  return (
    <Card className="print-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Kundenaktivitäten</CardTitle>
        <div className="flex gap-2 print:hidden">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportToCSV(series as Record<string, unknown>[], 'aktivitaeten')}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportToPDF('Kundenaktivitäten')}>
            <Printer className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Laden…</p>
        ) : series.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Aktivitätsdaten vorhanden.</p>
        ) : (
          <ChartContainer
            config={Object.fromEntries(
              types.map((t, i) => [t, { label: TYPE_LABELS[t] ?? t, color: LINE_COLORS[i % LINE_COLORS.length] }]),
            )}
            className="h-[300px] w-full"
          >
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              {types.map((t, i) => (
                <Line
                  key={t}
                  type="monotone"
                  dataKey={t}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
