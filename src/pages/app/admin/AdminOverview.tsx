import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import {
  Users,
  UserPlus,
  Building2,
  CreditCard,
  Activity,
  Mail,
  Plug,
  Download,
  ArrowRight,
  Shield,
  Webhook,
  Inbox,
} from "lucide-react";
import { AdminKpiTiles } from "@/components/admin/AdminKpiTiles";

const sections = [
  {
    title: "Nutzer",
    description: "Rollen, Einladungen, Account-Verwaltung",
    icon: Users,
    href: "/app/admin/users",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Leads",
    description: "Inbound-Leads mit Qualifikations-Score",
    icon: UserPlus,
    href: "/app/admin/leads",
    accent: "text-accent-foreground",
    bg: "bg-accent/40",
  },
  {
    title: "Kunden",
    description: "Aktive Kunden, Verträge, Mitgliedschaften",
    icon: Building2,
    href: "/app/admin/customers",
    accent: "text-module-green",
    bg: "bg-module-green-muted",
  },
  {
    title: "Abos",
    description: "Stripe-Subscriptions, Status, Lifecycle",
    icon: CreditCard,
    href: "/app/admin/subscriptions",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Einstellungen",
    description: "Integrationen, E-Mail, Slot-Regeln, Backup",
    icon: Shield,
    href: "/app/admin/settings",
    accent: "text-foreground",
    bg: "bg-muted",
  },
];

const quickLinks = [
  { label: "Webhooks", href: "/app/webhooks", icon: Webhook },
  { label: "COO Cockpit", href: "/app/coo-cockpit", icon: Activity },
  { label: "Posteingang", href: "/app/posteingang", icon: Inbox },
  { label: "E-Mail Log", href: "/app/email-log", icon: Mail },
];

export default function AdminOverview() {
  return (
    <div>
      <PageHeader
        eyebrow="Verwaltung"
        title="Admin-Bereich"
        description="System-Administration, Benutzerverwaltung und Integrationen — alles an einem Ort."
      />

      {/* KPI tiles */}
      <AdminKpiTiles />

      {/* Section grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} to={s.href} className="group">
            <Card className="h-full surface-card-hover">
              <CardContent className="p-6 flex flex-col gap-4 h-full">
                <div className={`h-11 w-11 rounded-2xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.accent}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold tracking-tight mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                  Öffnen
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Weitere Tools
        </h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((q) => (
            <Button
              key={q.href}
              variant="outline"
              size="sm"
              asChild
              className="rounded-full"
            >
              <Link to={q.href}>
                <q.icon className="h-3.5 w-3.5 mr-1.5" />
                {q.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
