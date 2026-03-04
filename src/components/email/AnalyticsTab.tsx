import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmailAnalytics } from '@/hooks/useEmailAnalytics';
import { Mail, MousePointerClick, Eye, AlertTriangle } from 'lucide-react';

export function AnalyticsTab() {
  const { stats, isLoading } = useEmailAnalytics();

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Lade Analytics...</div>;
  if (!stats) return <div className="text-center py-8 text-muted-foreground">Keine Daten vorhanden</div>;

  const metrics = [
    { label: 'Gesendet', value: stats.totalSent, icon: Mail, color: 'text-blue-500' },
    { label: 'Open Rate', value: `${stats.openRate}%`, icon: Eye, color: 'text-green-500' },
    { label: 'Click Rate', value: `${stats.clickRate}%`, icon: MousePointerClick, color: 'text-primary' },
    { label: 'Bounce Rate', value: `${stats.bounceRate}%`, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Email Analytics</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(m => (
          <Card key={m.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{m.label}</CardTitle>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Zugestellt</span><span className="font-medium">{stats.delivered}</span></div>
            <div className="flex justify-between"><span>Geöffnet (unique)</span><span className="font-medium">{stats.opened}</span></div>
            <div className="flex justify-between"><span>Geklickt (unique)</span><span className="font-medium">{stats.clicked}</span></div>
            <div className="flex justify-between"><span>Bounced</span><span className="font-medium">{stats.bounced}</span></div>
            <div className="flex justify-between"><span>Abgemeldet</span><span className="font-medium">{stats.unsubscribed}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Unsubscribe Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.unsubscribeRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Ziel: unter 0.5%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
