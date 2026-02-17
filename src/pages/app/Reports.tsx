import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type TimeRange } from '@/hooks/useReportsData';
import RevenueChart from '@/components/reports/RevenueChart';
import TeamPerformanceTable from '@/components/reports/TeamPerformanceTable';
import ConversionFunnel from '@/components/reports/ConversionFunnel';
import ActivityChart from '@/components/reports/ActivityChart';

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '7d', label: 'Letzte 7 Tage' },
  { value: '30d', label: 'Letzte 30 Tage' },
  { value: '90d', label: 'Letzte 90 Tage' },
  { value: '12m', label: 'Letzte 12 Monate' },
];

export default function Reports() {
  const [range, setRange] = useState<TimeRange>('30d');

  return (
    <div className="space-y-6" id="reports-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analysen und Berichte</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <SelectTrigger className="w-[200px] print:hidden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="print:hidden">
          <TabsTrigger value="revenue">Umsatz</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="conversion">Konvertierung</TabsTrigger>
          <TabsTrigger value="activity">Aktivität</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueChart range={range} />
        </TabsContent>

        <TabsContent value="team">
          <TeamPerformanceTable range={range} />
        </TabsContent>

        <TabsContent value="conversion">
          <ConversionFunnel />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityChart range={range} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
