import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, FlaskConical, Loader2, CheckCircle2, XCircle, AlertTriangle, BellOff, Smartphone } from 'lucide-react';

type Category = 'admin_alerts' | 'member_alerts' | 'incoming_calls' | 'lifecycle';

interface UserOption {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface DryRunResult {
  dry_run?: boolean;
  would_send?: boolean;
  settings_allowed?: boolean;
  settings_reason?: string | null;
  tokens?: number;
  platforms?: Record<string, number>;
  fcm_configured?: boolean;
  forced?: boolean;
  sent?: number;
  total?: number;
  skipped?: string;
  error?: string;
}

const PRESETS: Array<{ category: Category; title: string; body: string; link?: string }> = [
  { category: 'admin_alerts', title: '🧪 Test: Neuer Lead', body: 'Max Mustermann hat sich qualifiziert.', link: '/app/leads' },
  { category: 'member_alerts', title: '🧪 Test: Neue Buchung', body: 'Du hast einen neuen Termin.', link: '/app/calendar' },
  { category: 'incoming_calls', title: '🧪 Test: Eingehender Anruf', body: '+49 30 12345678', link: '/app/calls' },
  { category: 'lifecycle', title: '🧪 Test: Trial endet bald', body: 'Noch 3 Tage in deinem Testzeitraum.', link: '/app/billing' },
];

export function PushTestCard() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('admin_alerts');
  const [title, setTitle] = useState('🧪 Test-Push');
  const [body, setBody] = useState('Dies ist ein Test aus dem Admin-Bereich.');
  const [link, setLink] = useState('/app/admin/push-log');
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState<'dry' | 'send' | null>(null);
  const [result, setResult] = useState<DryRunResult | null>(null);

  // User laden
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_id')
        .not('user_id', 'is', null)
        .order('full_name', { ascending: true })
        .limit(500);
      if (error) {
        console.error(error);
        return;
      }
      setUsers(
        (data ?? []).map((p: any) => ({
          id: p.user_id,
          email: p.email,
          full_name: p.full_name,
        })),
      );
    })();
  }, []);

  // Eigene UserID als Default
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id && !userId) setUserId(data.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users.slice(0, 50);
    const q = search.toLowerCase();
    return users
      .filter(
        (u) =>
          (u.full_name ?? '').toLowerCase().includes(q) ||
          (u.email ?? '').toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [users, search]);

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx];
    setCategory(p.category);
    setTitle(p.title);
    setBody(p.body);
    if (p.link) setLink(p.link);
  };

  const invoke = async (dryRun: boolean) => {
    if (!userId || !title || !category) {
      toast.error('User, Titel und Kategorie sind erforderlich.');
      return;
    }
    setBusy(dryRun ? 'dry' : 'send');
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: {
          user_id: userId,
          category,
          title,
          body,
          link: link || undefined,
          force,
          dry_run: dryRun,
          source: dryRun ? 'admin_test_dry' : 'admin_test',
        },
      });
      if (error) throw error;
      setResult(data as DryRunResult);
      if (dryRun) {
        toast.success('Validierung abgeschlossen');
      } else if ((data as DryRunResult)?.sent && (data as DryRunResult).sent! > 0) {
        toast.success(`Push gesendet (${(data as DryRunResult).sent}/${(data as DryRunResult).total})`);
      } else if ((data as DryRunResult)?.skipped) {
        toast.warning(`Übersprungen: ${(data as DryRunResult).skipped}`);
      } else {
        toast.warning('Kein Versand – siehe Ergebnis');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? 'Fehler beim Aufruf');
      setResult({ error: e.message ?? String(e) });
    } finally {
      setBusy(null);
    }
  };

  const selectedUser = users.find((u) => u.id === userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          Push-Testmodus
        </CardTitle>
        <CardDescription>
          Sende Test-Benachrichtigungen an einen User oder validiere die Einstellungen ohne Versand (Dry-Run).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User-Auswahl */}
        <div className="space-y-2">
          <Label>Empfänger</Label>
          <Input
            placeholder="Suche nach Name, Email oder User-ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger>
              <SelectValue placeholder="User wählen">
                {selectedUser ? (
                  <span className="text-sm">
                    {selectedUser.full_name ?? selectedUser.email ?? selectedUser.id.slice(0, 8)}
                    <span className="text-muted-foreground ml-2">{selectedUser.email}</span>
                  </span>
                ) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[320px]">
              {filteredUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  <div className="flex flex-col">
                    <span className="text-sm">{u.full_name ?? '(ohne Name)'}</span>
                    <span className="text-xs text-muted-foreground">{u.email ?? u.id}</span>
                  </div>
                </SelectItem>
              ))}
              {filteredUsers.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">Keine Treffer</div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label>Schnellvorlagen</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <Button key={i} variant="outline" size="sm" onClick={() => applyPreset(i)} type="button">
                {p.title.replace('🧪 Test: ', '')}
              </Button>
            ))}
          </div>
        </div>

        {/* Kategorie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Kategorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin_alerts">Admin-Alerts</SelectItem>
                <SelectItem value="member_alerts">Mitglieder-Alerts</SelectItem>
                <SelectItem value="incoming_calls">Eingehende Anrufe</SelectItem>
                <SelectItem value="lifecycle">Lifecycle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Deeplink (optional)</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/app/..." />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Titel</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} maxLength={300} />
        </div>

        {/* Force */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">User-Einstellungen ignorieren (force)</p>
            <p className="text-xs text-muted-foreground">
              Sendet auch dann, wenn die Kategorie deaktiviert ist oder Ruhezeiten greifen.
            </p>
          </div>
          <Switch checked={force} onCheckedChange={setForce} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => invoke(true)}
            disabled={busy !== null || !userId}
            className="flex-1"
          >
            {busy === 'dry' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FlaskConical className="h-4 w-4 mr-2" />}
            Dry-Run (nur validieren)
          </Button>
          <Button
            onClick={() => invoke(false)}
            disabled={busy !== null || !userId}
            className="flex-1"
          >
            {busy === 'send' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Test-Push senden
          </Button>
        </div>

        {/* Ergebnis */}
        {result && (
          <>
            <Separator />
            <ResultPanel result={result} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ResultPanel({ result }: { result: DryRunResult }) {
  if (result.error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
        <div className="flex items-center gap-2 text-destructive font-medium text-sm">
          <XCircle className="h-4 w-4" /> Fehler
        </div>
        <p className="text-xs mt-1 break-words">{result.error}</p>
      </div>
    );
  }

  // Dry-Run Ergebnis
  if (result.dry_run) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {result.would_send ? (
            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Versand möglich
            </Badge>
          ) : (
            <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 gap-1">
              <AlertTriangle className="h-3 w-3" /> Versand würde NICHT erfolgen
            </Badge>
          )}
          {result.forced && <Badge variant="outline">force aktiv</Badge>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <Stat
            icon={result.settings_allowed ? CheckCircle2 : BellOff}
            label="User-Settings"
            value={result.settings_allowed ? 'OK' : 'Blockiert'}
            ok={result.settings_allowed}
          />
          <Stat
            icon={Smartphone}
            label="Tokens"
            value={String(result.tokens ?? 0)}
            ok={(result.tokens ?? 0) > 0}
          />
          <Stat
            icon={result.fcm_configured ? CheckCircle2 : XCircle}
            label="FCM"
            value={result.fcm_configured ? 'Konfiguriert' : 'Fehlt'}
            ok={result.fcm_configured}
          />
          <Stat
            icon={CheckCircle2}
            label="Plattformen"
            value={
              result.platforms
                ? Object.entries(result.platforms).map(([k, v]) => `${k}:${v}`).join(' · ') || '—'
                : '—'
            }
            ok={true}
          />
        </div>
        {result.settings_reason && !result.settings_allowed && (
          <p className="text-xs text-muted-foreground">Grund: {result.settings_reason}</p>
        )}
      </div>
    );
  }

  // Echter Versand
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {(result.sent ?? 0) > 0 ? (
          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Gesendet
          </Badge>
        ) : (
          <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 gap-1">
            <AlertTriangle className="h-3 w-3" /> Nicht gesendet
          </Badge>
        )}
      </div>
      <p className="text-sm">
        {result.sent ?? 0} von {result.total ?? 0} Tokens beliefert
        {result.skipped && <> · Übersprungen: {result.skipped}</>}
      </p>
      <p className="text-xs text-muted-foreground">
        Vollständige Details findest du im Push-Log unten.
      </p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  ok: boolean | undefined;
}) {
  return (
    <div className="rounded-lg border p-2">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${ok ? 'text-emerald-500' : 'text-amber-500'}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-medium mt-0.5 truncate">{value}</p>
    </div>
  );
}
