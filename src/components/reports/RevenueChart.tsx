import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useRevenueData, type TimeRange } from '@/hooks/useReportsData';
import { exportToCSV, exportToPDF } from '@/lib/report-export';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  'hsl(210 60% 50%)',
  'hsl(150 60% 45%)',
  'hsl(30 80% 55%)',
  'hsl(0 70% 55%)',
];

import { PIPELINE_STAGE_LABELS } from '@/types/crm';
const STAGE_LABELS: Record<string, string> = PIPELINE_STAGE_LABELS as Record<string, string>;

interface Props {
  range: TimeRange;
}

export default function RevenueChart({ range }: Props) {
  const { data, isLoading } = useRevenueData(range);

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden…</p>;

  const revenueByMonth = data?.revenueByMonth ?? [];
  const pipelineDistribution = data?.pipelineDistribution ?? [];

  return (
    <div className="space-y-6 print-section">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Umsatz-Entwicklung</CardTitle>
          <div className="flex gap-2 print:hidden">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCSV(revenueByMonth as Record<string, unknown>[], 'umsatz')}
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportToPDF('Umsatz-Bericht')}>
              <Printer className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {revenueByMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Umsatzdaten vorhanden.</p>
          ) : (
            <ChartContainer config={{ revenue: { label: 'Umsatz (€)', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pipeline-Verteilung</CardTitle>
          <div className="flex gap-2 print:hidden">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportToCSV(
                  pipelineDistribution.map((p) => ({ Stage: STAGE_LABELS[p.stage] ?? p.stage, Anzahl: p.count })) as Record<string, unknown>[],
                  'pipeline-verteilung',
                )
              }
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pipelineDistribution.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Pipeline-Daten vorhanden.</p>
          ) : (
            <ChartContainer
              config={Object.fromEntries(pipelineDistribution.map((p, i) => [p.stage, { label: STAGE_LABELS[p.stage] ?? p.stage, color: PIE_COLORS[i % PIE_COLORS.length] }]))}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie data={pipelineDistribution} dataKey="count" nameKey="stage" cx="50%" cy="50%" outerRadius={100} label={({ stage }) => STAGE_LABELS[stage] ?? stage}>
                  {pipelineDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
