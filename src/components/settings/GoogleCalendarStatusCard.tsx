import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Webhook, Clock } from "lucide-react";

interface GCalAccount {
  id: string;
  email: string;
  is_active: boolean;
  scope: string | null;
  token_expires_at: string | null;
  last_sync_at: string | null;
  last_sync_error: string | null;
  watch_channel_id: string | null;
  watch_resource_id: string | null;
  watch_expires_at: string | null;
  primary_calendar_id: string;
  created_at: string;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

function relativeTime(d: string | null): string {
  if (!d) return "noch nie";
  const diffMs = Date.now() - new Date(d).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const days = Math.round(h / 24);
  return `vor ${days} Tg.`;
}

export default function GoogleCalendarStatusCard() {
  const { profile } = useAuth();
  const [account, setAccount] = useState<GCalAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!profile?.id) return;
    setLoading(true);
    const { data } = await (supabase
      .from("google_calendar_accounts" as never) as any)
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle();
    setAccount((data as GCalAccount) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const oauthOk = !!account && account.is_active;
  const tokenExpired = account?.token_expires_at
    ? new Date(account.token_expires_at).getTime() < Date.now()
    : false;
  const watchOk = !!account?.watch_channel_id &&
    (!account.watch_expires_at || new Date(account.watch_expires_at).getTime() > Date.now());
  const watchExpiringSoon = account?.watch_expires_at
    ? new Date(account.watch_expires_at).getTime() - Date.now() < 1000 * 60 * 60 * 24
    : false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Google Kalender</CardTitle>
              <CardDescription className="text-xs">
                OAuth- und Webhook-Status deiner Kalender-Synchronisierung
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : !account ? (
          <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
            <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Nicht verbunden</p>
              <p className="text-xs text-muted-foreground">
                Verbinde deinen Google-Kalender, damit Termine automatisch synchronisiert werden.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Account */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verbundener Account</span>
              <span className="font-medium">{account.email}</span>
            </div>

            {/* OAuth Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">OAuth-Status</span>
              {oauthOk && !tokenExpired ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Aktiv
                </Badge>
              ) : tokenExpired ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> Token abgelaufen
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" /> Inaktiv
                </Badge>
              )}
            </div>

            {/* Token expiry */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Token läuft ab</span>
              <span className="font-mono text-xs">{formatDate(account.token_expires_at)}</span>
            </div>

            {/* Webhook */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Webhook className="h-3.5 w-3.5" /> Webhook (Push-Channel)
              </span>
              {watchOk && !watchExpiringSoon ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Aktiv
                </Badge>
              ) : watchOk && watchExpiringSoon ? (
                <Badge variant="outline" className="gap-1 border-warning/50 text-warning">
                  <AlertTriangle className="h-3 w-3" /> Läuft bald ab
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" /> Nicht registriert
                </Badge>
              )}
            </div>

            {account.watch_expires_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Webhook läuft ab</span>
                <span className="font-mono text-xs">{formatDate(account.watch_expires_at)}</span>
              </div>
            )}

            {/* Last Sync */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Letzte Synchronisierung
              </span>
              <div className="text-right">
                <div className="font-medium">{relativeTime(account.last_sync_at)}</div>
                {account.last_sync_at && (
                  <div className="text-xs text-muted-foreground font-mono">
                    {formatDate(account.last_sync_at)}
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {account.last_sync_error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium text-destructive">Letzter Sync-Fehler</p>
                  <p className="text-xs text-destructive/80 break-words">{account.last_sync_error}</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
