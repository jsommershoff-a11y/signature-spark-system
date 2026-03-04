import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmailAnalytics } from '@/hooks/useEmailAnalytics';
import { Mail, MousePointerClick, Eye, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function AnalyticsTab() {
  const { stats, isLoading } = useEmailAnalytics();

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Lade Analytics...</div>;
  if (!stats) return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-3 rounded-full bg-module-green-muted mb-3">
          <TrendingUp className="h-8 w-8 text-module-green" />
        </div>
        <h3 className="font-semibold mb-1">Noch keine Daten</h3>
        <p className="text-sm text-muted-foreground">Versende deine ersten Emails, um Analytics zu sehen</p>
      </CardContent>
    </Card>
  );

  const metrics = [
    { label: 'Gesendet', value: stats.totalSent, icon: Mail, color: 'text-module-green', bg: 'bg-module-green-muted' },
    { label: 'Open Rate', value: `${stats.openRate}%`, icon: Eye, color: 'text-module-green-light', bg: 'bg-module-green-muted' },
    { label: 'Click Rate', value: `${stats.clickRate}%`, icon: MousePointerClick, color: 'text-module-green', bg: 'bg-module-green-muted' },
    { label: 'Bounce Rate', value: `${stats.bounceRate}%`, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(m => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{m.label}</span>
                <div className={`p-1.5 rounded ${m.bg}`}>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-module-green" />
              Zustellungs-Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow label="Zugestellt" value={stats.delivered} total={stats.totalSent} color="bg-module-green" />
            <MetricRow label="Geöffnet (unique)" value={stats.opened} total={stats.totalSent} color="bg-module-green-light" />
            <MetricRow label="Geklickt (unique)" value={stats.clicked} total={stats.totalSent} color="bg-module-green" />
            <MetricRow label="Bounced" value={stats.bounced} total={stats.totalSent} color="bg-destructive" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Abmeldungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold">{stats.unsubscribeRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">Unsubscribe Rate</p>
              <div className="mt-4 p-3 rounded-lg bg-module-green-muted">
                <p className="text-xs text-module-green-muted-foreground">
                  {stats.unsubscribeRate <= 0.5 
                    ? '✅ Unter dem Zielwert von 0.5%' 
                    : '⚠️ Über dem Zielwert von 0.5%'}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Abmeldungen gesamt</span>
                <span className="font-medium">{stats.unsubscribed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value} <span className="text-muted-foreground">({pct}%)</span></span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}
