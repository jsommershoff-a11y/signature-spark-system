import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { cn } from '@/lib/utils';
import { AppRole, STAFF_ROLES, MEMBER_ROLES } from '@/lib/roles';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CheckSquare,
  BarChart3,
  Settings,
  Shield,
  GraduationCap,
  Building2,
  Kanban,
  Phone,
  FileText,
  ScrollText,
  Target,
  Share2,
  Mail,
  Gauge,
  Sparkles,
  Wrench,
  Video,
  Handshake,
  Inbox,
  Lock,
  Rocket,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole?: AppRole;
  exactRole?: AppRole;
  staffOnly?: boolean;
  memberOnly?: boolean;
}

interface NavGroup {
  label: string | null; // null = ungelabelt (Dashboard ganz oben)
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [{ label: 'Dashboard', href: '/app', icon: LayoutDashboard }],
  },
  {
    label: 'Lernen',
    items: [
      { label: 'Mein System', href: '/app/academy', icon: GraduationCap, memberOnly: true },
      { label: 'Prompt-Bibliothek', href: '/app/prompts', icon: Sparkles, memberOnly: true },
      { label: 'Meine Tools', href: '/app/tools', icon: Wrench, memberOnly: true },
    ],
  },
  {
    label: 'Mitgliedschaft',
    items: [
      { label: 'Live Calls', href: '/app/calendar', icon: Video },
      { label: 'Dokumente', href: '/app/contracts', icon: ScrollText, memberOnly: true },
      { label: 'Pakete & Preise', href: '/app/pricing', icon: Kanban },
    ],
  },
  {
    label: 'Vertrieb',
    items: [
      { label: 'CRM', href: '/app/crm', icon: Building2, staffOnly: true },
      { label: 'Leads', href: '/app/leads', icon: UserPlus, staffOnly: true },
      { label: 'Pipeline', href: '/app/pipeline', icon: Kanban, staffOnly: true },
      { label: 'Calls', href: '/app/calls', icon: Phone, staffOnly: true },
      { label: 'Angebote', href: '/app/offers', icon: FileText, staffOnly: true },
      { label: 'Kunden', href: '/app/customers', icon: Users, staffOnly: true },
      { label: 'Ziele', href: '/app/goals', icon: Target, staffOnly: true },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Social Media', href: '/app/social-media', icon: Share2, staffOnly: true },
      { label: 'Email Kampagnen', href: '/app/email', icon: Mail, staffOnly: true },
    ],
  },
  {
    label: 'Persönlich',
    items: [
      { label: 'Aufgaben', href: '/app/tasks', icon: CheckSquare },
      { label: 'Affiliate', href: '/app/affiliate', icon: Handshake },
      { label: 'Einstellungen', href: '/app/settings', icon: Settings },
    ],
  },
  {
    label: 'Verwaltung',
    items: [
      { label: 'Reports', href: '/app/reports', icon: BarChart3, minRole: 'gruppenbetreuer' },
      { label: 'Inbox', href: '/app/inbox', icon: Inbox, exactRole: 'admin' },
      { label: 'COO Cockpit', href: '/app/coo-cockpit', icon: Gauge, exactRole: 'admin' },
      { label: 'Admin', href: '/app/admin', icon: Shield, exactRole: 'admin' },
    ],
  },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { effectiveRole, isRealAdmin } = useAuth();

  const isVisible = (item: NavItem) => {
    if (item.exactRole === 'admin' && isRealAdmin) return true;
    if (item.exactRole) return effectiveRole === item.exactRole;
    if (item.staffOnly) return effectiveRole ? STAFF_ROLES.includes(effectiveRole) : false;
    if (item.memberOnly) return effectiveRole ? MEMBER_ROLES.includes(effectiveRole) : false;
    if (item.minRole) {
      if (!effectiveRole) return false;
      const hierarchy: Record<string, number> = {
        admin: 100, vertriebspartner: 50, gruppenbetreuer: 50,
        member_pro: 30, member_starter: 20, member_basic: 10, guest: 0,
      };
      return (hierarchy[effectiveRole] || 0) >= (hierarchy[item.minRole] || 0);
    }
    return true;
  };

  const visibleGroups = navGroups
    .map(g => ({ ...g, items: g.items.filter(isVisible) }))
    .filter(g => g.items.length > 0);

  return (
    <aside className="w-64 bg-background border-r border-border/40 h-full flex flex-col">
      <nav className="flex-1 p-3 md:p-4 space-y-5 overflow-y-auto overscroll-contain">
        {visibleGroups.map((group, gi) => (
          <div key={group.label ?? `group-${gi}`} className="space-y-0.5">
            {group.label && (
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/app'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-2xl text-sm font-medium transition-all duration-200 touch-manipulation',
                    'min-h-[44px] md:min-h-0',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70'
                  )
                }
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
