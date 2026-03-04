import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSocialStrategy } from '@/hooks/useSocialStrategy';
import { PLATFORM_LABELS } from '@/types/social';
import { Save, Loader2 } from 'lucide-react';

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

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Lade Einstellungen...</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Posting-Frequenz pro Plattform</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <Label className="w-24 text-sm">{label}</Label>
              <Input type="number" min={0} className="w-20" value={freq[key] || 0} onChange={e => setFreq(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} />
              <span className="text-sm text-muted-foreground">Posts/Woche</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Content-Pillars</CardTitle></CardHeader>
          <CardContent>
            <Label>Themen (kommagetrennt)</Label>
            <Input value={pillars} onChange={e => setPillars(e.target.value)} placeholder="KI-Systeme, Unternehmer-Entscheidungen, Prozesse, Cases" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>KPI-Ziele</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[{ key: 'leads_per_month', label: 'Leads/Monat' }, { key: 'engagement_rate', label: 'Engagement Rate (%)' }, { key: 'ctr', label: 'CTR (%)' }].map(kpi => (
              <div key={kpi.key} className="flex items-center gap-3">
                <Label className="w-32 text-sm">{kpi.label}</Label>
                <Input type="number" min={0} className="w-24" value={kpis[kpi.key] || 0} onChange={e => setKpis(k => ({ ...k, [kpi.key]: parseFloat(e.target.value) || 0 }))} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Button onClick={handleSave} disabled={upsertSettings.isPending}>
          {upsertSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
