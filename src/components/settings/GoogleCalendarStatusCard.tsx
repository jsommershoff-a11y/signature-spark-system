import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, RefreshCw, CheckCircle2, AlertTriangle, Plug } from "lucide-react";

export default function GoogleCalendarStatusCard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    ok: boolean;
    synced?: number;
    cancelled?: number;
    error?: string;
    at: string;
  } | null>(null);

  const runSync = async () => {
    if (!profile?.id) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar-sync", {
        body: { profile_id: profile.id, days_ahead: 30 },
      });
      if (error) throw error;
      setLastResult({ ...(data as any), at: new Date().toISOString() });
      if ((data as any)?.ok) {
        toast({
          title: "Sync abgeschlossen",
          description: `${(data as any).synced} Termine importiert, ${(data as any).cancelled ?? 0} entfernt.`,
        });
      } else {
        throw new Error((data as any)?.error ?? "Unbekannter Fehler");
      }
    } catch (e: any) {
      setLastResult({ ok: false, error: e.message ?? String(e), at: new Date().toISOString() });
      toast({ title: "Sync fehlgeschlagen", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Importiert „busy"-Termine der nächsten 30 Tage und blockt die zugehörigen Slots automatisch.
          </div>
          <Button onClick={runSync} disabled={syncing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Synchronisiere…" : "Jetzt synchronisieren"}
          </Button>
        </div>

        {lastResult && (
          <div
            className={`flex items-start gap-2 p-3 rounded-md border ${
              lastResult.ok
                ? "bg-muted/40 border-border"
                : "bg-destructive/10 border-destructive/20"
            }`}
          >
            {lastResult.ok ? (
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            )}
            <div className="text-xs space-y-0.5 min-w-0">
              {lastResult.ok ? (
                <>
                  <p className="font-medium">
                    {lastResult.synced} Termine importiert · {lastResult.cancelled ?? 0} entfernt
                  </p>
                  <p className="text-muted-foreground font-mono">
                    {new Date(lastResult.at).toLocaleString("de-DE")}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-destructive">Fehler</p>
                  <p className="text-destructive/80 break-words">{lastResult.error}</p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
