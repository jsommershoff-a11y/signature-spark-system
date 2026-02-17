import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTeamPerformance, type TimeRange } from '@/hooks/useReportsData';
import { exportToCSV, exportToPDF } from '@/lib/report-export';

interface Props {
  range: TimeRange;
}

export default function TeamPerformanceTable({ range }: Props) {
  const { data, isLoading } = useTeamPerformance(range);

  const rows = data ?? [];

  return (
    <Card className="print-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Team-Performance</CardTitle>
        <div className="flex gap-2 print:hidden">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportToCSV(
                rows.map((r) => ({ Mitarbeiter: r.name, Leads: r.leads, Calls: r.calls })) as Record<string, unknown>[],
                'team-performance',
              )
            }
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportToPDF('Team-Performance')}>
            <Printer className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Laden…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Daten vorhanden.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitarbeiter</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Calls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-right">{r.leads}</TableCell>
                  <TableCell className="text-right">{r.calls}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
