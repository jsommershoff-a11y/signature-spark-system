import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useSocialStrategy } from '@/hooks/useSocialStrategy';
import { PLATFORM_LABELS, PLATFORM_ICONS } from '@/types/social';
import type { SocialPlatform } from '@/types/social';
import { Save, Loader2, Settings, Target, Columns3 } from 'lucide-react';

export function SettingsTab() {
  const { settings, isLoading, upsertSettings } = useSocialStrategy();
  const [freq, setFreq] = useState<Record<string, number>>({});
  const [pillars, setPillars] = useState('');
  const [kpis, setKpis] = useState<Record<string, number>>({});

  useEffect(() => {
    if (settings) {
      setFreq(settings.posting_frequency || {});
      setPillars((settings.content_pillars || []).join(', '));
      setKpis(settings.kpi_targets || {});
    }
  }, [settings]);

  const handleSave = () => {
    upsertSettings.mutate({
      posting_frequency: freq,
      content_pillars: pillars.split(',').map(s => s.trim()).filter(Boolean),
      kpi_targets: kpis,
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posting Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-module-green" />
              Posting-Frequenz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(PLATFORM_LABELS) as [SocialPlatform, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-lg">{PLATFORM_ICONS[key]}</span>
                <Label className="w-24 text-sm font-medium">{label}</Label>
                <Input
                  type="number"
                  min={0}
                  className="w-20"
                  value={freq[key] || 0}
                  onChange={e => setFreq(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))}
                />
                <span className="text-sm text-muted-foreground">/ Woche</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Content Pillars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Columns3 className="h-5 w-5 text-module-green" />
                Content-Pillars
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Themen (kommagetrennt)</Label>
              <Input
                value={pillars}
                onChange={e => setPillars(e.target.value)}
                placeholder="KI-Systeme, Unternehmer-Entscheidungen, Cases, Prozesse"
                className="mt-1"
              />
            </CardContent>
          </Card>

          {/* KPI Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-module-green" />
                KPI-Ziele
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'leads_per_month', label: 'Leads / Monat' },
                { key: 'engagement_rate', label: 'Engagement Rate (%)' },
                { key: 'ctr', label: 'CTR (%)' },
              ].map(kpi => (
                <div key={kpi.key} className="flex items-center gap-3">
                  <Label className="w-40 text-sm">{kpi.label}</Label>
                  <Input
                    type="number"
                    min={0}
                    className="w-24"
                    value={kpis[kpi.key] || 0}
                    onChange={e => setKpis(k => ({ ...k, [kpi.key]: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Button onClick={handleSave} disabled={upsertSettings.isPending} className="bg-module-green hover:bg-module-green-dark text-module-green-foreground">
        {upsertSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Einstellungen speichern
      </Button>
    </div>
  );
}
