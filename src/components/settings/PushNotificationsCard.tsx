import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BellRing, Loader2, ShieldAlert, UserCheck, PhoneIncoming, Sparkles, Moon } from 'lucide-react';

type PushSettings = {
  enabled: boolean;
  admin_alerts: boolean;
  member_alerts: boolean;
  incoming_calls: boolean;
  lifecycle: boolean;
  quiet_hours_start: number | null;
  quiet_hours_end: number | null;
};

const DEFAULTS: PushSettings = {
  enabled: true,
  admin_alerts: true,
  member_alerts: true,
  incoming_calls: true,
  lifecycle: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

export default function PushNotificationsCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PushSettings>(DEFAULTS);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('push_settings')
        .select('enabled, admin_alerts, member_alerts, incoming_calls, lifecycle, quiet_hours_start, quiet_hours_end')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!error && data) setSettings({ ...DEFAULTS, ...data });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const update = <K extends keyof PushSettings>(key: K, value: PushSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('push_settings')
      .upsert({ user_id: user.id, ...settings }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) {
      toast.error('Konnte Push-Einstellungen nicht speichern', { description: error.message });
    } else {
      toast.success('Push-Einstellungen gespeichert');
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" /> Push-Benachrichtigungen
        </CardTitle>
        <CardDescription>
          Steuere, welche mobilen Push-Hinweise du erhältst (App auf iOS/Android).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
              <div>
                <p className="text-sm font-medium">Push aktivieren</p>
                <p className="text-xs text-muted-foreground">
                  Globaler Schalter. Aus = keine Pushes, unabhängig von Kategorien unten.
                </p>
              </div>
              <Switch checked={settings.enabled} onCheckedChange={(v) => update('enabled', v)} />
            </div>

            <Separator />

            <div className={settings.enabled ? '' : 'opacity-50 pointer-events-none'}>
              <p className="text-sm font-medium mb-3">Kategorien</p>
              <div className="space-y-4">
                <CategoryRow
                  icon={<ShieldAlert className="h-4 w-4 text-orange-500" />}
                  title="Admin-Alerts"
                  description="Neuer Lead, neuer Kauf, Webhook-Fehler"
                  checked={settings.admin_alerts}
                  onChange={(v) => update('admin_alerts', v)}
                />
                <CategoryRow
                  icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
                  title="Mitglieder-Hinweise"
                  description="Angebot bereit, Termin bestätigt, neue Nachricht"
                  checked={settings.member_alerts}
                  onChange={(v) => update('member_alerts', v)}
                />
                <CategoryRow
                  icon={<PhoneIncoming className="h-4 w-4 text-blue-500" />}
                  title="Eingehende Anrufe"
                  description="Push beim Klingeln über Sipgate"
                  checked={settings.incoming_calls}
                  onChange={(v) => update('incoming_calls', v)}
                />
                <CategoryRow
                  icon={<Sparkles className="h-4 w-4 text-violet-500" />}
                  title="Lifecycle"
                  description="Trial endet bald, Zahlung fehlgeschlagen, Onboarding-Tipps"
                  checked={settings.lifecycle}
                  onChange={(v) => update('lifecycle', v)}
                />
              </div>
            </div>

            <Separator />

            <div className={settings.enabled ? '' : 'opacity-50 pointer-events-none'}>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Ruhezeiten (optional)</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                In diesem Zeitraum werden keine Pushes zugestellt.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Von</p>
                  <Select
                    value={settings.quiet_hours_start?.toString() ?? 'off'}
                    onValueChange={(v) => update('quiet_hours_start', v === 'off' ? null : parseInt(v))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Aus</SelectItem>
                      {hours.map((h) => (
                        <SelectItem key={h} value={h.toString()}>{h.toString().padStart(2, '0')}:00</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bis</p>
                  <Select
                    value={settings.quiet_hours_end?.toString() ?? 'off'}
                    onValueChange={(v) => update('quiet_hours_end', v === 'off' ? null : parseInt(v))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Aus</SelectItem>
                      {hours.map((h) => (
                        <SelectItem key={h} value={h.toString()}>{h.toString().padStart(2, '0')}:00</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>) : 'Push-Einstellungen speichern'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryRow({
  icon, title, description, checked, onChange,
}: { icon: React.ReactNode; title: string; description: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
