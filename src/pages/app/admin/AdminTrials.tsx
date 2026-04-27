import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  Phone,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type TrialRow = {
  profile_id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  subscription_status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_days_remaining: number | null;
  live_call_used_at: string | null;
  live_call_event_id: string | null;
  live_call_event_title: string | null;
  live_call_event_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  converted_at: string | null;
  created_at: string;
};

type Kpis = {
  total_trials: number;
  active_trials: number;
  expired_trials: number;
  active_subs: number;
  trial_call_used: number;
  conversions_30d: number;
  conversion_rate: number;
};

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trialing: { label: "Trial", variant: "secondary" },
  active: { label: "Aktiv", variant: "default" },
  past_due: { label: "Überfällig", variant: "destructive" },
  expired: { label: "Abgelaufen", variant: "destructive" },
  canceled: { label: "Gekündigt", variant: "outline" },
  none: { label: "Kein Abo", variant: "outline" },
};

function fmt(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE");
}

export default function AdminTrials() {
  const [rows, setRows] = useState<TrialRow[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const [overviewRes, kpiRes] = await Promise.all([
        supabase.rpc("get_trial_overview" as any),
        supabase.rpc("get_trial_kpis" as any),
      ]);
      if (overviewRes.error) throw overviewRes.error;
      if (kpiRes.error) throw kpiRes.error;
      setRows((overviewRes.data ?? []) as TrialRow[]);
      const k = Array.isArray(kpiRes.data) ? kpiRes.data[0] : kpiRes.data;
      setKpis(k as Kpis);
    } catch (e: any) {
      toast.error("Fehler beim Laden der Trial-Übersicht: " + (e?.message ?? "unbekannt"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.subscription_status !== statusFilter) return false;
      if (!q) return true;
      return (
        (r.full_name ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.stripe_customer_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Trial-Übersicht
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status, Live-Call-Nutzung und Konvertierungen aller Mitglieder.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Aktualisieren
        </Button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiTile
          icon={<Users className="h-4 w-4" />}
          label="Trials gesamt"
          value={kpis?.total_trials ?? 0}
        />
        <KpiTile
          icon={<Clock className="h-4 w-4 text-primary" />}
          label="Aktive Trials"
          value={kpis?.active_trials ?? 0}
          accent="primary"
        />
        <KpiTile
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          label="Abgelaufen"
          value={kpis?.expired_trials ?? 0}
          accent="destructive"
        />
        <KpiTile
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          label="Aktive Abos"
          value={kpis?.active_subs ?? 0}
          accent="success"
        />
        <KpiTile
          icon={<Phone className="h-4 w-4" />}
          label="Trial-Calls genutzt"
          value={kpis?.trial_call_used ?? 0}
        />
        <KpiTile
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          label="Konvertierungs-Rate"
          value={`${Number(kpis?.conversion_rate ?? 0).toFixed(1)}%`}
          sub={`${kpis?.conversions_30d ?? 0} in 30T`}
          accent="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mitglieder-Liste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name, E-Mail oder Stripe-ID suchen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="expired">Abgelaufen</SelectItem>
                <SelectItem value="past_due">Überfällig</SelectItem>
                <SelectItem value="canceled">Gekündigt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nutzer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial-Ende</TableHead>
                  <TableHead>Rest</TableHead>
                  <TableHead>Live-Call</TableHead>
                  <TableHead>Konvertiert</TableHead>
                  <TableHead>Stripe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      Keine Einträge gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => {
                    const meta = STATUS_LABEL[r.subscription_status] ?? {
                      label: r.subscription_status,
                      variant: "outline" as const,
                    };
                    const urgent =
                      r.subscription_status === "trialing" &&
                      (r.trial_days_remaining ?? 99) <= 2;
                    return (
                      <TableRow key={r.profile_id}>
                        <TableCell>
                          <div className="font-medium">{r.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{r.email || "—"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {fmtDate(r.trial_ends_at)}
                        </TableCell>
                        <TableCell>
                          {r.subscription_status === "trialing" && r.trial_days_remaining != null ? (
                            <Badge variant={urgent ? "destructive" : "secondary"}>
                              {r.trial_days_remaining}T
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.live_call_used_at ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>{fmt(r.live_call_used_at)}</span>
                              </div>
                              {r.live_call_event_title && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {r.live_call_event_title}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Nicht genutzt</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.converted_at ? (
                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
                              {fmtDate(r.converted_at)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground max-w-[160px] truncate">
                          {r.stripe_customer_id || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-muted-foreground">
            {filtered.length} von {rows.length} Einträgen
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  accent?: "primary" | "success" | "destructive";
}) {
  const accentClass =
    accent === "primary"
      ? "border-primary/30 bg-primary/5"
      : accent === "success"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : accent === "destructive"
      ? "border-destructive/30 bg-destructive/5"
      : "";
  return (
    <Card className={accentClass}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}
