import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, Mail, FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Run {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  emails_scanned: number;
  summaries_parsed: number;
  leads_matched: number;
  pending_matches: number;
  offers_drafted: number;
  followups_created: number;
  errors: any[];
}

interface PendingMatch {
  id: string;
  participants: any[];
  reason: string;
  status: string;
  created_at: string;
  zoom_summary_id: string;
}

interface Draft {
  id: string;
  lead_id: string;
  status: string;
  qa_passed: boolean;
  suggested_price_cents: number | null;
  margin_percent: number | null;
  is_custom_solution: boolean;
  solution_concept: any;
  created_at: string;
}

export function AdminZoomAutomation() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [pending, setPending] = useState<PendingMatch[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [r1, r2, r3] = await Promise.all([
      supabase.from("zoom_summary_runs").select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("pending_zoom_matches").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(50),
      supabase.from("offer_drafts").select("*").in("status", ["draft", "review_required", "correction"]).order("created_at", { ascending: false }).limit(50),
    ]);
    if (r1.data) setRuns(r1.data as Run[]);
    if (r2.data) setPending(r2.data as PendingMatch[]);
    if (r3.data) setDrafts(r3.data as Draft[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerSync = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-zoom-summaries", { body: {} });
      if (error) throw error;
      toast.success(`Sync ok — ${data?.parsed || 0} neu, ${data?.matched || 0} gematcht, ${data?.drafted || 0} Entwürfe`);
      await load();
    } catch (e: any) {
      toast.error(`Sync fehlgeschlagen: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const approveDraft = async (draftId: string) => {
    try {
      const { data, error } = await supabase.rpc("approve_offer_draft", { _draft_id: draftId });
      if (error) throw error;
      toast.success(`Angebot freigegeben — Pipeline aktualisiert, Follow-up in 3 Tagen geplant`);
      await load();
      return data;
    } catch (e: any) {
      toast.error(`Freigabe fehlgeschlagen: ${e.message}`);
    }
  };

  const lastRun = runs[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Zoom-Automatisierung
          </CardTitle>
          <CardDescription>
            Stündlich: verbundenes Google-Postfach → Meeting-Summary-Erkennung (Zoom, Fathom, Fireflies, Otter, tl;dv, Read.ai u.a.) → Lead-Match → KI-Angebotsentwurf
          </CardDescription>
        </div>
        <Button onClick={triggerSync} disabled={running} size="sm">
          {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Jetzt synchronisieren
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32" />
        ) : (
          <>
            {/* Last-Run KPI */}
            {lastRun && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                <KpiTile label="Mails" value={lastRun.emails_scanned} />
                <KpiTile label="Geparst" value={lastRun.summaries_parsed} />
                <KpiTile label="Gematcht" value={lastRun.leads_matched} accent="success" />
                <KpiTile label="Pending" value={lastRun.pending_matches} accent={lastRun.pending_matches > 0 ? "warn" : undefined} />
                <KpiTile label="Entwürfe" value={lastRun.offers_drafted} />
                <KpiTile label="Follow-ups" value={lastRun.followups_created} />
              </div>
            )}

            <Tabs defaultValue="drafts">
              <TabsList>
                <TabsTrigger value="drafts">
                  Entwürfe <Badge variant="secondary" className="ml-2">{drafts.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Manuelle Prüfung <Badge variant="secondary" className="ml-2">{pending.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="runs">Run-Historie</TabsTrigger>
              </TabsList>

              <TabsContent value="drafts" className="mt-4">
                <ScrollArea className="h-[400px]">
                  {drafts.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4">Keine offenen Entwürfe.</p>
                  ) : (
                    <div className="space-y-2">
                      {drafts.map((d) => (
                        <div key={d.id} className="p-3 border rounded-lg flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{d.solution_concept?.title || "—"}</span>
                              {d.is_custom_solution && <Badge variant="outline" className="text-xs">Custom</Badge>}
                              {d.qa_passed ? (
                                <Badge className="text-xs bg-green-600">QA ✓</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">QA ✗</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {d.suggested_price_cents ? `${(d.suggested_price_cents / 100).toLocaleString("de-DE")} €` : "—"}
                              {d.margin_percent ? ` · Marge ${d.margin_percent}%` : ""}
                              {" · "}
                              {formatDistanceToNow(new Date(d.created_at), { addSuffix: true, locale: de })}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => window.open(`/app/leads?lead=${d.lead_id}`, "_blank")}>
                            Öffnen
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <ScrollArea className="h-[400px]">
                  {pending.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4">Keine offenen Matches.</p>
                  ) : (
                    <div className="space-y-2">
                      {pending.map((p) => (
                        <div key={p.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium text-sm">
                              {(p.participants || []).map((x: any) => x.name).join(", ") || "Unbekannt"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{p.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: de })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="runs" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {runs.map((r) => (
                      <div key={r.id} className="p-3 border rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={r.status} />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(r.started_at), { addSuffix: true, locale: de })}
                            </span>
                          </div>
                          <span className="text-xs">{r.emails_scanned} Mails · {r.summaries_parsed} geparst · {r.offers_drafted} Entwürfe</span>
                        </div>
                        {r.errors?.length > 0 && (
                          <p className="text-xs text-destructive mt-1">{r.errors.length} Fehler — siehe Logs</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function KpiTile({ label, value, accent }: { label: string; value: number; accent?: "success" | "warn" }) {
  const color = accent === "success" ? "text-green-600" : accent === "warn" ? "text-yellow-600" : "text-foreground";
  return (
    <div className="p-3 border rounded-lg bg-muted/30">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: any }> = {
    success: { label: "Erfolg", cls: "bg-green-600", icon: CheckCircle2 },
    partial: { label: "Teilweise", cls: "bg-yellow-600", icon: AlertTriangle },
    failed: { label: "Fehler", cls: "bg-destructive", icon: AlertTriangle },
    running: { label: "Läuft", cls: "bg-blue-600", icon: Loader2 },
  };
  const m = map[status] || map.failed;
  return <Badge className={`text-xs ${m.cls}`}>{m.label}</Badge>;
}
