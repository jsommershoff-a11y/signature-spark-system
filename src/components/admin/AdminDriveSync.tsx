import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, ExternalLink, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Send, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface SyncState {
  id: string;
  sheet_id: string;
  sheet_title: string | null;
  tab_name: string;
  enabled: boolean;
  last_sync_at: string | null;
  last_status: string | null;
  last_error: string | null;
  total_inserted: number;
}

interface SyncRun {
  id: string;
  sheet_id: string;
  started_at: string;
  finished_at: string | null;
  triggered_by: string;
  inserted: number;
  skipped_dedupe: number;
  skipped_invalid: number;
  rows_total: number;
  errors: unknown;
  status: string;
}

export default function AdminDriveSync() {
  const [states, setStates] = useState<SyncState[]>([]);
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [testingTelegram, setTestingTelegram] = useState<"daily" | "weekly" | null>(null);

  async function load() {
    setLoading(true);
    const [s, r] = await Promise.all([
      supabase.from("drive_sync_state").select("*").order("created_at", { ascending: true }),
      supabase
        .from("drive_sync_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20),
    ]);
    if (s.error) toast.error("Sync-Status konnte nicht geladen werden: " + s.error.message);
    else setStates((s.data ?? []) as SyncState[]);
    if (r.error) toast.error("Run-Historie konnte nicht geladen werden: " + r.error.message);
    else setRuns((r.data ?? []) as SyncRun[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function runNow(sheet_id: string) {
    setSyncing(sheet_id);
    try {
      const { data, error } = await supabase.functions.invoke("sync-drive-leads", {
        body: { sheet_id, triggered_by: "manual" },
      });
      if (error) throw error;
      const result = (data as any)?.results?.[0];
      if (result?.status === "failed") {
        toast.error("Sync fehlgeschlagen: " + (result.error ?? "unbekannt"));
      } else {
        toast.success(
          `Sync fertig: ${result?.inserted ?? 0} neu, ${result?.skippedDedupe ?? 0} doppelt, ${result?.skippedInvalid ?? 0} ungueltig`,
        );
      }
      await load();
    } catch (e) {
      toast.error("Fehler beim Sync: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSyncing(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" /> Drive-Leadliste-Sync
        </CardTitle>
        <CardDescription>
          Stuendlich werden neue Eintraege aus den verbundenen Google Sheets in <code>crm_leads</code> uebernommen
          (insert-only). Der CRM-Status wird zurueck in das Sheet geschrieben.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> lade...
          </div>
        ) : states.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch kein Sheet konfiguriert.</p>
        ) : (
          <div className="space-y-3">
            {states.map((s) => (
              <div key={s.id} className="border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="font-medium flex items-center gap-2">
                    {s.sheet_title ?? s.sheet_id}
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${s.sheet_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Sheet oeffnen"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                    <span>Tab: {s.tab_name}</span>
                    <span>Importiert gesamt: {s.total_inserted}</span>
                    {s.last_sync_at && (
                      <span>
                        Letzter Sync: {formatDistanceToNow(new Date(s.last_sync_at), { locale: de, addSuffix: true })}
                      </span>
                    )}
                    {s.last_status && (
                      <Badge variant={s.last_status === "completed" ? "secondary" : s.last_status === "failed" ? "destructive" : "outline"} className="gap-1">
                        {s.last_status === "completed" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {s.last_status}
                      </Badge>
                    )}
                  </div>
                  {s.last_error && (
                    <p className="text-xs text-destructive truncate" title={s.last_error}>
                      Letzter Fehler: {s.last_error}
                    </p>
                  )}
                </div>
                <Button onClick={() => runNow(s.sheet_id)} disabled={syncing === s.sheet_id} size="sm">
                  {syncing === s.sheet_id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Jetzt synchronisieren
                </Button>
              </div>
            ))}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold mb-2">Letzte Laeufe</h3>
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Sync-Laeufe.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start</TableHead>
                    <TableHead>Quelle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Neu</TableHead>
                    <TableHead className="text-right">Duplikate</TableHead>
                    <TableHead className="text-right">Ungueltig</TableHead>
                    <TableHead className="text-right">Zeilen gesamt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDistanceToNow(new Date(r.started_at), { locale: de, addSuffix: true })}
                      </TableCell>
                      <TableCell>{r.triggered_by}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "completed"
                              ? "secondary"
                              : r.status === "failed"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{r.inserted}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{r.skipped_dedupe}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{r.skipped_invalid}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{r.rows_total}</TableCell>
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
