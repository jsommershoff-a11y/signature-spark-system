import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Mail, Webhook, ShieldCheck, ShieldAlert, Activity as ActivityIcon,
  AlertTriangle, Copy, RefreshCw, Inbox,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type Status = {
  webhook: { url: string; secret_configured: boolean };
  reply: {
    domain: string | null;
    domain_configured: boolean;
    sample_address: string;
  };
  notifications: {
    resend_configured: boolean;
    teams_configured: boolean;
    team_inbox: string;
  };
  health: {
    last_inbound_at: string | null;
    recent_inbound_count: number;
    needs_review_open: number;
  };
  recent_inbound: Array<{
    id: string; content: string | null; created_at: string;
    metadata: any; lead_id: string | null;
  }>;
  needs_review_tickets: Array<{
    id: string; subject: string; status: string; priority: string; created_at: string;
  }>;
};

const fmt = (iso: string | null) =>
  iso ? format(new Date(iso), "dd.MM.yyyy HH:mm", { locale: de }) : "—";

export default function AdminInboundEmail() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("inbound-email-status");
      if (error) throw error;
      setStatus(data as Status);
    } catch (e: any) {
      setError(e?.message ?? "Status konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const copy = (s: string, label: string) => {
    navigator.clipboard.writeText(s);
    toast.success(`${label} kopiert`);
  };

  // === Validation: Inbound-Adresse ===
  const validateInboxAddress = (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v) return { ok: false, reason: "Bitte eine Adresse eingeben." };
    const re = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!re.test(v)) return { ok: false, reason: "Ungültiges E-Mail-Format." };
    if (!status?.reply.domain) {
      return {
        ok: false,
        reason:
          "Reply-Domain (INBOUND_REPLY_DOMAIN) ist nicht konfiguriert. Postfach kann nicht zugeordnet werden.",
      };
    }
    const domain = v.split("@")[1];
    if (domain !== status.reply.domain) {
      return {
        ok: false,
        reason: `Domain "${domain}" passt nicht zur Reply-Domain "${status.reply.domain}".`,
      };
    }
    const local = v.split("@")[0];
    if (!local.startsWith("ticket+") && local !== "ticket") {
      return {
        ok: false,
        reason: 'Postfach existiert nicht — erwartet wird "ticket+<id>" oder "ticket".',
      };
    }
    return { ok: true as const, reason: "Adresse ist gültig und wird vom Webhook akzeptiert." };
  };

  const validation = testEmail ? validateInboxAddress(testEmail) : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="space-y-2">
          <div>{error ?? "Unbekannter Fehler"}</div>
          <Button size="sm" variant="outline" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const allOk =
    status.webhook.secret_configured &&
    status.reply.domain_configured &&
    status.notifications.resend_configured &&
    status.notifications.teams_configured;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" />
            Inbound E-Mail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Konfiguration und Status der eingehenden Mail-Pipeline (Webhook → Ticket).
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Aktualisieren
        </Button>
      </div>

      {/* Gesamt-Status */}
      <Alert variant={allOk ? "default" : "destructive"}>
        {allOk ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
        <AlertTitle>{allOk ? "Pipeline einsatzbereit" : "Konfiguration unvollständig"}</AlertTitle>
        <AlertDescription>
          {allOk
            ? "Webhook, Reply-Domain und Benachrichtigungen sind konfiguriert."
            : "Mindestens eine Komponente ist nicht konfiguriert. Details siehe unten."}
        </AlertDescription>
      </Alert>

      {/* Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="h-4 w-4 text-primary" /> Webhook (Provider → Lovable)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Field label="Endpoint">
            <div className="flex items-center gap-2 min-w-0">
              <code className="px-2 py-1 rounded bg-muted text-xs truncate flex-1">
                {status.webhook.url}
              </code>
              <Button size="sm" variant="ghost" onClick={() => copy(status.webhook.url, "Endpoint")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Field>
          <Field label="Provider">
            <span>SendGrid Inbound Parse (oder kompatibel)</span>
          </Field>
          <Field label="Shared Secret">
            <StatusBadge ok={status.webhook.secret_configured}
              okLabel="INBOUND_EMAIL_SECRET gesetzt"
              failLabel="INBOUND_EMAIL_SECRET fehlt — Webhook ist offen!" />
          </Field>
        </CardContent>
      </Card>

      {/* Reply-Adresse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> Reply-Adresse / Postfach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Field label="Reply-Domain">
            {status.reply.domain ? (
              <code className="px-2 py-1 rounded bg-muted text-xs">{status.reply.domain}</code>
            ) : (
              <Badge variant="destructive">Nicht konfiguriert (INBOUND_REPLY_DOMAIN)</Badge>
            )}
          </Field>
          <Field label="Beispiel-Adresse">
            <div className="flex items-center gap-2 min-w-0">
              <code className="px-2 py-1 rounded bg-muted text-xs truncate flex-1">
                {status.reply.sample_address}
              </code>
              <Button size="sm" variant="ghost"
                onClick={() => copy(status.reply.sample_address, "Adresse")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Field>

          {/* Validierung Postfach */}
          <div className="pt-3 border-t space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Postfach-Validierung
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="z. B. ticket+abcd1234@reply.deine-domain.de"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                maxLength={255}
              />
            </div>
            {validation && (
              <Alert variant={validation.ok ? "default" : "destructive"}>
                {validation.ok
                  ? <ShieldCheck className="h-4 w-4" />
                  : <ShieldAlert className="h-4 w-4" />}
                <AlertDescription>{validation.reason}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              Erwartetes Schema: <code>ticket+&lt;id&gt;@{status.reply.domain ?? "&lt;reply-domain&gt;"}</code>.
              Andere Postfächer werden vom Webhook nicht zugeordnet und landen als „Needs Review".
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Benachrichtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-primary" /> Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Field label="E-Mail (Resend)">
            <StatusBadge ok={status.notifications.resend_configured}
              okLabel={`Aktiv → ${status.notifications.team_inbox}`}
              failLabel="RESEND_API_KEY fehlt" />
          </Field>
          <Field label="Microsoft Teams">
            <StatusBadge ok={status.notifications.teams_configured}
              okLabel="Aktiv → KI Power Team Channel"
              failLabel="MICROSOFT_TEAMS_API_KEY oder LOVABLE_API_KEY fehlt" />
          </Field>
        </CardContent>
      </Card>

      {/* Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live-Status</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3 text-sm">
          <Stat label="Letzter Eingang" value={fmt(status.health.last_inbound_at)} />
          <Stat label="Eingänge (letzte 10)" value={String(status.health.recent_inbound_count)} />
          <Stat label="Needs Review offen" value={String(status.health.needs_review_open)}
            tone={status.health.needs_review_open > 0 ? "warn" : undefined} />
        </CardContent>
      </Card>

      {/* Letzte Eingänge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Letzte eingehende E-Mails</CardTitle>
        </CardHeader>
        <CardContent>
          {status.recent_inbound.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-4">
              Noch keine eingehenden Mails erfasst.
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              {status.recent_inbound.map((a) => {
                const meta = a.metadata ?? {};
                return (
                  <li key={a.id} className="rounded border bg-card/40 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                      <span className="truncate">{meta.from ?? "—"}</span>
                      <span className="shrink-0">{fmt(a.created_at)}</span>
                    </div>
                    {meta.subject && (
                      <div className="font-medium mt-0.5 truncate">{meta.subject}</div>
                    )}
                    {a.content && (
                      <div className="text-xs mt-1 line-clamp-2 text-muted-foreground">
                        {a.content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Needs Review */}
      {status.needs_review_tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              „Needs Review" Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {status.needs_review_tickets.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded border bg-card/40 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">{fmt(t.created_at)}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[160px_1fr] gap-2 sm:items-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function StatusBadge({ ok, okLabel, failLabel }: { ok: boolean; okLabel: string; failLabel: string }) {
  return ok ? (
    <Badge variant="outline" className="border-green-500/40 text-green-600">
      <ShieldCheck className="h-3 w-3 mr-1" /> {okLabel}
    </Badge>
  ) : (
    <Badge variant="destructive">
      <ShieldAlert className="h-3 w-3 mr-1" /> {failLabel}
    </Badge>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className={`rounded-lg border p-3 ${tone === "warn" ? "border-destructive/40 bg-destructive/5" : "bg-card/40"}`}>
      <div className={`text-lg font-semibold ${tone === "warn" ? "text-destructive" : ""}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
