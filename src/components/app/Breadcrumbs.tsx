import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Lesbare Labels für bekannte Pfadsegmente.
 * Unbekannte Segmente werden capitalized angezeigt; reine IDs (UUIDs / lange Hashes)
 * werden zu „Detail" abgekürzt.
 */
const LABELS: Record<string, string> = {
  app: "Start",
  admin: "Admin",
  academy: "Mein System",
  prompts: "Prompt-Bibliothek",
  tools: "Meine Tools",
  contracts: "Dokumente",
  calendar: "Live Calls",
  pricing: "Pakete & Preise",
  crm: "CRM",
  leads: "Leads",
  pipeline: "Pipeline",
  calls: "Calls",
  offers: "Angebote",
  customers: "Kunden",
  members: "Kunden",
  "member-management": "Mitgliederbereich",
  tasks: "Aufgaben",
  goals: "Ziele",
  "social-media": "Social Media",
  "email-kampagnen": "Email Kampagnen",
  email: "Email",
  inbox: "Inbox",
  posteingang: "Posteingang",
  outlook: "Outlook",
  tickets: "Tickets",
  "email-log": "Email Log",
  "email-consents": "Email Consents",
  reports: "Reports",
  settings: "Einstellungen",
  affiliate: "Affiliate",
  "coo-cockpit": "COO Cockpit",
  webhooks: "Webhooks",
  users: "Nutzer",
  subscriptions: "Abos",
  welcome: "Willkommen",
  katalog: "Katalog",
  courses: "Kurse",
  unauthorized: "Kein Zugriff",
};

const isOpaqueId = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s) || s.length > 24;

const labelFor = (segment: string) => {
  if (LABELS[segment]) return LABELS[segment];
  if (isOpaqueId(segment)) return "Detail";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
};

/**
 * Auto-generierte Breadcrumbs aus der aktuellen Route.
 * Wird auf der reinen /app-Übersicht ausgeblendet (kein Mehrwert).
 */
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  // /app oder kürzer → keine Breadcrumbs anzeigen
  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    label: labelFor(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Link
            to="/app"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Start</span>
          </Link>
        </li>
        {crumbs.slice(1).map((c) => (
          <li key={c.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            {c.isLast ? (
              <span className="text-foreground font-medium">{c.label}</span>
            ) : (
              <Link to={c.href} className="hover:text-foreground transition-colors">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
