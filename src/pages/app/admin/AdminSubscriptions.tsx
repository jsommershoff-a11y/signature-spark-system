import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  ExternalLink,
  RefreshCw,
  Search,
  AlertCircle,
  TrendingUp,
  Users,
  CalendarX,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Subscription = {
  id: string;
  status: string;
  customer_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  product_name: string | null;
  amount_cents: number | null;
  currency: string | null;
  interval: string | null;
  interval_count: number | null;
  current_period_end: string | null;
  start_date: string | null;
  cancel_at_period_end: boolean;
  cancel_at: string | null;
  canceled_at: string | null;
  trial_end: string | null;
  created: string;
  profile: { full_name: string | null; email: string | null; user_id: string } | null;
};

type Stats = {
  total: number;
  status_counts: Record<string, number>;
  mrr_cents: number;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  past_due: "destructive",
  unpaid: "destructive",
  canceled: "outline",
  incomplete: "outline",
  incomplete_expired: "outline",
  paused: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktiv",
  trialing: "Trial",
  past_due: "Zahlungsverzug",
  unpaid: "Unbezahlt",
  canceled: "Gekündigt",
  incomplete: "Unvollständig",
  incomplete_expired: "Abgelaufen",
  paused: "Pausiert",
};

const fmtMoney = (cents: number | null, currency: string | null) => {
  if (cents == null) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: (currency ?? "eur").toUpperCase(),
  }).format(cents / 100);
};

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-subscriptions");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSubs(data.subscriptions ?? []);
      setStats(data.stats ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error("Subscriptions konnten nicht geladen werden", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.customer_email?.toLowerCase().includes(q) ||
        s.customer_name?.toLowerCase().includes(q) ||
        s.profile?.full_name?.toLowerCase().includes(q) ||
        s.product_name?.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    });
  }, [subs, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verwaltung"
        title="Abos"
        description="Live-Subscriptions aus Stripe inkl. Status, Plan, Laufzeit und Kündigungsdatum."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://dashboard.stripe.com/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Stripe
              </a>
            </Button>
          </div>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Subscriptions gesamt</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {(stats.status_counts.active ?? 0) + (stats.status_counts.trialing ?? 0)}
                </div>
                <div className="text-xs text-muted-foreground">Aktiv / Trial</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{fmtMoney(stats.mrr_cents, "eur")}</div>
                <div className="text-xs text-muted-foreground">MRR (geschätzt)</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <CalendarX className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {subs.filter((s) => s.cancel_at_period_end && s.status === "active").length}
                </div>
                <div className="text-xs text-muted-foreground">Kündigung zum Periodenende</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Name, E-Mail, Plan oder Subscription-ID …"
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
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="trialing">Trial</SelectItem>
              <SelectItem value="past_due">Zahlungsverzug</SelectItem>
              <SelectItem value="canceled">Gekündigt</SelectItem>
              <SelectItem value="incomplete">Unvollständig</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {error ? (
            <div className="p-12 flex flex-col items-center text-center gap-3 text-muted-foreground">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p>Fehler beim Laden: {error}</p>
              <Button onClick={load} variant="outline" size="sm">
                Erneut versuchen
              </Button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-muted-foreground">Lade Subscriptions …</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Keine Subscriptions gefunden.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Nächste Verlängerung</TableHead>
                    <TableHead>Kündigung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => {
                    const name = s.profile?.full_name || s.customer_name || "—";
                    const email = s.profile?.email || s.customer_email || "—";
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">{email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{s.product_name ?? "—"}</div>
                          {s.interval && (
                            <div className="text-xs text-muted-foreground">
                              pro{" "}
                              {s.interval_count && s.interval_count > 1
                                ? `${s.interval_count} `
                                : ""}
                              {s.interval === "month"
                                ? "Monat"
                                : s.interval === "year"
                                  ? "Jahr"
                                  : s.interval === "week"
                                    ? "Woche"
                                    : s.interval}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                            {STATUS_LABEL[s.status] ?? s.status}
                          </Badge>
                          {s.cancel_at_period_end && s.status === "active" && (
                            <div className="mt-1 text-[10px] text-destructive font-medium">
                              läuft aus
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {fmtMoney(s.amount_cents, s.currency)}
                        </TableCell>
                        <TableCell className="text-sm">{fmtDate(s.start_date)}</TableCell>
                        <TableCell className="text-sm">
                          {s.status === "canceled" || s.ended_at
                            ? "—"
                            : fmtDate(s.current_period_end)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {s.canceled_at
                            ? fmtDate(s.canceled_at)
                            : s.cancel_at
                              ? `zum ${fmtDate(s.cancel_at)}`
                              : s.cancel_at_period_end
                                ? `zum ${fmtDate(s.current_period_end)}`
                                : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
