import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

type AuditLog = {
  id: string;
  action: string;
  source: string | null;
  details: any;
  affected_count: number;
  performed_by: string | null;
  created_at: string;
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error("Audit-Log konnte nicht geladen werden");
    else setLogs((data ?? []) as AuditLog[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const runPurgeNow = async () => {
    setPurging(true);
    const { data, error } = await supabase.rpc("purge_old_soft_deleted" as any);
    if (error) toast.error(`Purge fehlgeschlagen: ${error.message}`);
    else {
      const total = (data as any)?.total ?? 0;
      toast.success(`Purge ausgeführt: ${total} Datensätze endgültig gelöscht`);
      await load();
    }
    setPurging(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Audit-Log</h1>
          <p className="text-sm text-muted-foreground">
            Systemweite Admin-Aktionen. Soft-Deleted Datensätze werden nach 30 Tagen automatisch endgültig gelöscht.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Neu laden
          </Button>
          <Button size="sm" onClick={runPurgeNow} disabled={purging}>
            {purging ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Purge jetzt ausführen
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Noch keine Audit-Einträge.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{log.action}</CardTitle>
                    {log.source && <Badge variant="outline">{log.source}</Badge>}
                    {log.affected_count > 0 && (
                      <Badge variant="secondary">{log.affected_count} Datensätze</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {format(new Date(log.created_at), "dd.MM.yyyy HH:mm:ss", { locale: de })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-x-auto max-h-64">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
