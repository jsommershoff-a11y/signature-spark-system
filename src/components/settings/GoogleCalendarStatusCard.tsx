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

  const loadLogs = useCallback(async () => {
    if (!profile?.id) return;
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("google_calendar_sync_logs")
      .select(
        "id, created_at, status, synced_count, cancelled_count, duration_ms, error_message, calendar_id, window_from, window_to",
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
