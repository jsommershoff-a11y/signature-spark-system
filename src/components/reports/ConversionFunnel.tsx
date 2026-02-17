import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useConversionFunnel } from '@/hooks/useReportsData';
import { exportToCSV, exportToPDF } from '@/lib/report-export';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ConversionFunnel() {
  const { data, isLoading } = useConversionFunnel();
  const rows = data ?? [];

  return (
    <Card className="print-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Lead-Konvertierungstrichter</CardTitle>
        <div className="flex gap-2 print:hidden">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportToCSV(rows.map((r) => ({ Stage: r.label, Anzahl: r.count })) as Record<string, unknown>[], 'konvertierung')
            }
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportToPDF('Lead-Konvertierung')}>
            <Printer className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Laden…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Pipeline-Daten vorhanden.</p>
        ) : (
          <ChartContainer
            config={{ count: { label: 'Anzahl', color: 'hsl(var(--primary))' } }}
            className="h-[350px] w-full"
          >
            <BarChart data={rows} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="label" type="category" width={150} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
