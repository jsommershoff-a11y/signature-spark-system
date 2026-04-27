import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plug,
  History,
  Eye,
} from "lucide-react";

interface SyncLog {
  id: string;
  created_at: string;
  status: string;
  synced_count: number;
  cancelled_count: number;
  duration_ms: number | null;
  error_message: string | null;
  calendar_id: string | null;
  window_from: string | null;
  window_to: string | null;
  meta: any | null;
}

export default function GoogleCalendarStatusCard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);

  const loadLogs = useCallback(async () => {
    if (!profile?.id) return;
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("google_calendar_sync_logs")
      .select(
        "id, created_at, status, synced_count, cancelled_count, duration_ms, error_message, calendar_id, window_from, window_to, meta",
      )
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error) setLogs((data ?? []) as SyncLog[]);
    setLoadingLogs(false);
  }, [profile?.id]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const runSync = async () => {
    if (!profile?.id) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar-sync", {
        body: { profile_id: profile.id, days_ahead: 30, triggered_by: profile.id },
      });
      if (error) throw error;
      if ((data as any)?.ok) {
        toast({
          title: "Sync abgeschlossen",
          description: `${(data as any).synced} Termine importiert, ${(data as any).cancelled ?? 0} entfernt.`,
        });
      } else {
        throw new Error((data as any)?.error ?? "Unbekannter Fehler");
      }
    } catch (e: any) {
      toast({ title: "Sync fehlgeschlagen", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
      loadLogs();
    }
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              Google Kalender
              <Badge variant="secondary" className="gap-1">
                <Plug className="h-3 w-3" /> via Connector
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Synchronisiert deinen verbundenen Google-Kalender (primary) mit den Slots der App.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Importiert „busy"-Termine der nächsten 30 Tage und blockt die zugehörigen Slots automatisch.
          </div>
          <Button onClick={runSync} disabled={syncing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Synchronisiere…" : "Jetzt synchronisieren"}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4" />
              Letzte Sync-Läufe
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLogs}
              disabled={loadingLogs}
              className="h-7 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loadingLogs ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
          </div>

          {logs.length === 0 ? (
            <div className="text-xs text-muted-foreground p-4 text-center border rounded-md bg-muted/30">
              Noch keine Sync-Läufe vorhanden.
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9 text-xs">Status</TableHead>
                    <TableHead className="h-9 text-xs">Zeitpunkt</TableHead>
                    <TableHead className="h-9 text-xs text-right">Importiert</TableHead>
                    <TableHead className="h-9 text-xs text-right">Entfernt</TableHead>
                    <TableHead className="h-9 text-xs text-right">Dauer</TableHead>
                    <TableHead className="h-9 text-xs">Details</TableHead>
                    <TableHead className="h-9 text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="py-2">
                        {log.status === "success" ? (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            OK
                          </Badge>
                        ) : log.status === "partial" ? (
                          <Badge variant="outline" className="gap-1">
                            <AlertTriangle className="h-3 w-3 text-warning" />
                            Teilweise
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Fehler
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-xs font-mono">
                        {fmtTime(log.created_at)}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-right tabular-nums">
                        {log.synced_count}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-right tabular-nums">
                        {log.cancelled_count}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-right tabular-nums text-muted-foreground">
                        {log.duration_ms != null ? `${log.duration_ms} ms` : "—"}
                      </TableCell>
                      <TableCell className="py-2 text-xs max-w-xs">
                        {log.error_message ? (
                          <span
                            className="text-destructive break-words line-clamp-2"
                            title={log.error_message}
                          >
                            {log.error_message}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {log.calendar_id ?? "primary"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSelectedLog(log)}
                          title="Details anzeigen"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={!!selectedLog} onOpenChange={(o) => !o && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Sync-Lauf Details
              {selectedLog?.status === "success" && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" /> OK
                </Badge>
              )}
              {selectedLog?.status === "partial" && (
                <Badge variant="outline" className="gap-1">
                  <AlertTriangle className="h-3 w-3 text-warning" /> Teilweise
                </Badge>
              )}
              {selectedLog?.status === "error" && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> Fehler
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedLog && fmtTime(selectedLog.created_at)} · Kalender:{" "}
              {selectedLog?.calendar_id ?? "primary"} · Dauer:{" "}
              {selectedLog?.duration_ms ?? "—"} ms
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-4 text-xs">
                <Section title="Zeitfenster">
                  <KV k="von" v={selectedLog.window_from ?? "—"} />
                  <KV k="bis" v={selectedLog.window_to ?? "—"} />
                </Section>

                <Section title="Zähler">
                  <KV k="Importiert" v={String(selectedLog.synced_count)} />
                  <KV k="Entfernt" v={String(selectedLog.cancelled_count)} />
                  <KV
                    k="Fehler (Events)"
                    v={String(selectedLog.meta?.errors?.length ?? 0)}
                  />
                </Section>

                {selectedLog.error_message && (
                  <Section title="Fehlermeldung">
                    <pre className="whitespace-pre-wrap break-words text-destructive bg-destructive/10 p-2 rounded">
                      {selectedLog.error_message}
                    </pre>
                  </Section>
                )}

                {selectedLog.meta?.stack && (
                  <Section title="Stacktrace">
                    <pre className="whitespace-pre-wrap break-words bg-muted p-2 rounded font-mono text-[11px] leading-relaxed">
                      {selectedLog.meta.stack}
                    </pre>
                  </Section>
                )}

                {selectedLog.meta?.google_api && (
                  <Section title="Google API Antwort">
                    <KV
                      k="Status"
                      v={`${selectedLog.meta.google_api.status ?? "—"} ${
                        selectedLog.meta.google_api.ok ? "OK" : ""
                      }`}
                    />
                    <KV
                      k="URL"
                      v={selectedLog.meta.google_api.url ?? "—"}
                      mono
                    />
                    <KV
                      k="Items insgesamt"
                      v={String(selectedLog.meta.google_api.total_items ?? 0)}
                    />
                    <KV
                      k="Davon busy"
                      v={String(selectedLog.meta.google_api.busy_items ?? 0)}
                    />
                    {selectedLog.meta.google_api.response_sample && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-muted-foreground">
                          Response-Probe (Auszug)
                        </summary>
                        <pre className="mt-1 whitespace-pre-wrap break-words bg-muted p-2 rounded font-mono text-[11px]">
                          {JSON.stringify(
                            selectedLog.meta.google_api.response_sample,
                            null,
                            2,
                          )}
                        </pre>
                      </details>
                    )}
                    {selectedLog.meta.google_api.error_body && (
                      <details className="mt-2" open>
                        <summary className="cursor-pointer text-destructive">
                          Google API Fehler-Body
                        </summary>
                        <pre className="mt-1 whitespace-pre-wrap break-words bg-destructive/10 p-2 rounded font-mono text-[11px]">
                          {JSON.stringify(
                            selectedLog.meta.google_api.error_body,
                            null,
                            2,
                          )}
                        </pre>
                      </details>
                    )}
                  </Section>
                )}

                {selectedLog.meta?.events && (
                  <Section title="Betroffene Event-IDs">
                    <EventIdList
                      label="Importiert / aktualisiert"
                      ids={selectedLog.meta.events.synced_event_ids ?? []}
                      tone="success"
                    />
                    <EventIdList
                      label="Entfernt"
                      ids={selectedLog.meta.events.cancelled_event_ids ?? []}
                      tone="muted"
                    />
                    <EventIdList
                      label="Übersprungen (free/cancelled/all-day)"
                      ids={selectedLog.meta.events.skipped_event_ids ?? []}
                      tone="muted"
                    />
                  </Section>
                )}

                {selectedLog.meta?.errors?.length > 0 && (
                  <Section title="Event-Fehler">
                    <div className="space-y-2">
                      {selectedLog.meta.errors.map((e: any, i: number) => (
                        <div
                          key={i}
                          className="border border-destructive/30 bg-destructive/5 rounded p-2"
                        >
                          <div className="flex gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {e.phase}
                            </Badge>
                            {e.event_id && (
                              <code className="text-[10px] text-muted-foreground">
                                {e.event_id}
                              </code>
                            )}
                          </div>
                          <div className="text-destructive break-words">
                            {e.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground min-w-[140px]">{k}</span>
      <span className={mono ? "font-mono break-all" : "break-words"}>{v}</span>
    </div>
  );
}

function EventIdList({
  label,
  ids,
  tone,
}: {
  label: string;
  ids: string[];
  tone: "success" | "muted";
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-muted-foreground">{label}</span>
        <Badge variant="outline" className="text-[10px]">
          {ids.length}
        </Badge>
      </div>
      {ids.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ids.slice(0, 50).map((id) => (
            <code
              key={id}
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                tone === "success" ? "bg-success/10" : "bg-muted"
              }`}
            >
              {id}
            </code>
          ))}
          {ids.length > 50 && (
            <span className="text-[10px] text-muted-foreground">
              +{ids.length - 50} weitere
            </span>
          )}
        </div>
      )}
    </div>
  );
}
