import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  CreditCard,
  Clock,
  Settings as SettingsIcon,
  TrendingUp,
  ScrollText,
  Inbox,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Übersicht", href: "/app/admin", icon: LayoutDashboard, end: true },
  { label: "Nutzer", href: "/app/admin/users", icon: Users },
  { label: "Leads", href: "/app/admin/leads", icon: UserPlus },
  { label: "Kunden", href: "/app/admin/customers", icon: Building2 },
  { label: "Abos", href: "/app/admin/subscriptions", icon: CreditCard },
  { label: "Trials", href: "/app/admin/trials", icon: Clock },
  { label: "Upgrade-Funnel", href: "/app/admin/upgrade-funnel", icon: TrendingUp },
  { label: "Audit-Log", href: "/app/admin/audit-log", icon: ScrollText },
  { label: "Inbound E-Mail", href: "/app/admin/inbound-email", icon: Inbox },
  { label: "Support-Tickets", href: "/app/admin/support-tickets", icon: LifeBuoy },
  { label: "Einstellungen", href: "/app/admin/settings", icon: SettingsIcon },
];

/**
 * Sub-layout for the /app/admin/* area.
 * Provides a sticky vertical sub-navigation on desktop and a horizontal
 * scrollable strip on mobile — same brand language as the main app shell.
 */
export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      {/* Sub-nav: vertical on desktop, horizontal scroll on mobile */}
      <aside className="lg:w-56 lg:flex-shrink-0">
        <nav
          className="
            -mx-4 sm:-mx-6 lg:mx-0
            flex lg:flex-col gap-1
            overflow-x-auto lg:overflow-visible
            px-4 sm:px-6 lg:px-0
            lg:sticky lg:top-24
            scrollbar-none
          "
        >
          {adminNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-2xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
