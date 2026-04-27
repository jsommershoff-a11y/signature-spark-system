import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Building2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type KPIs = {
  users: { active_30d: number; total: number };
  leads: { open: number; total: number };
  customers: { active: number };
  revenue: { last_30d_cents: number; mrr_cents: number; active_subscriptions: number };
  health: {
    ok: number;
    total: number;
    integrations: Record<string, "ok" | "warn" | "error">;
    webhook_errors_24h: number;
    sync_errors_7d: number;
  };
};

const fmtMoney = (cents: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

type TileProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hint?: string;
  to: string;
  accent?: "primary" | "success" | "warn" | "destructive";
  trailing?: React.ReactNode;
};

function Tile({ icon: Icon, label, value, hint, to, accent = "primary", trailing }: TileProps) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warn: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Link to={to} className="group">
      <Card className="h-full surface-card-hover">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          <div className="text-xs font-medium text-muted-foreground mt-0.5">{label}</div>
          {(hint || trailing) && (
            <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
              {trailing}
              {hint}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function HealthIcon({ status }: { status: "ok" | "warn" | "error" }) {
  if (status === "ok") return <CheckCircle2 className="h-3 w-3 text-success" />;
  if (status === "warn") return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
  return <XCircle className="h-3 w-3 text-destructive" />;
}

const INTEGRATION_LABELS: Record<string, string> = {
  stripe: "Stripe",
  webhooks: "Webhooks",
  sync: "n8n Sync",
};

export function AdminKpiTiles() {
  const [data, setData] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: kpis, error } = await supabase.functions.invoke("admin-kpis");
        if (error) throw error;
        if (kpis?.error) throw new Error(kpis.error);
        if (mounted) setData(kpis as KPIs);
      } catch (e) {
        console.error("[AdminKpiTiles]", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const healthAccent: TileProps["accent"] =
    data.health.ok === data.health.total
      ? "success"
      : data.health.ok >= Math.floor(data.health.total / 2)
        ? "warn"
        : "destructive";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
      <Tile
        icon={Users}
        label="Aktive Nutzer (30 Tage)"
        value={data.users.active_30d}
        hint={`${data.users.total} insgesamt`}
        to="/app/admin/users"
        accent="primary"
      />
      <Tile
        icon={UserPlus}
        label="Offene Leads"
        value={data.leads.open}
        hint={`${data.leads.total} insgesamt`}
        to="/app/admin/leads"
        accent="warn"
      />
      <Tile
        icon={Building2}
        label="Aktive Kunden"
        value={data.customers.active}
        hint={`${data.revenue.active_subscriptions} aktive Abos`}
        to="/app/admin/customers"
        accent="success"
      />
      <Tile
        icon={TrendingUp}
        label="MRR (Stripe)"
        value={fmtMoney(data.revenue.mrr_cents)}
        hint={`${fmtMoney(data.revenue.last_30d_cents)} letzte 30 T.`}
        to="/app/admin/subscriptions"
        accent="primary"
      />
      <Tile
        icon={Activity}
        label="Integrations-Health"
        value={`${data.health.ok}/${data.health.total}`}
        to="/app/admin/settings"
        accent={healthAccent}
        trailing={
          <span className="flex items-center gap-2">
            {Object.entries(data.health.integrations).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <HealthIcon status={v} />
                <span>{INTEGRATION_LABELS[k] ?? k}</span>
              </span>
            ))}
          </span>
        }
      />
    </div>
  );
}
