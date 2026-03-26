import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  UserCheck,
  ScrollText,
  Target,
  Share2,
  Mail,
  Gauge,
  Sparkles,
  Wrench,
  Video,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Requires at least this role level */
  minRole?: AppRole;
  /** Only visible for this exact role */
  exactRole?: AppRole;
  /** Only visible for staff roles */
  staffOnly?: boolean;
  /** Only visible for member roles */
  memberOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  // Member-only items
  { label: 'Mein System', href: '/app/academy', icon: GraduationCap, memberOnly: true },
  { label: 'Prompt-Bibliothek', href: '/app/prompts', icon: Sparkles, memberOnly: true },
  { label: 'Meine Tools', href: '/app/tools', icon: Wrench, memberOnly: true },
  { label: 'Dokumente', href: '/app/contracts', icon: ScrollText, memberOnly: true },
  { label: 'Live Calls', href: '/app/calendar', icon: Video },
  { label: 'Pakete & Preise', href: '/app/pricing', icon: Kanban },
  // Staff-only items
  { label: 'CRM', href: '/app/crm', icon: Building2, staffOnly: true },
  { label: 'Leads', href: '/app/leads', icon: UserPlus, staffOnly: true },
  { label: 'Pipeline', href: '/app/pipeline', icon: Kanban, staffOnly: true },
  { label: 'Calls', href: '/app/calls', icon: Phone, staffOnly: true },
  { label: 'Angebote', href: '/app/offers', icon: FileText, staffOnly: true },
  { label: 'Kunden', href: '/app/customers', icon: Users, staffOnly: true },
  { label: 'Mitglieder', href: '/app/members', icon: UserCheck, staffOnly: true },
  { label: 'Mitgliederbereich', href: '/app/member-management', icon: GraduationCap, minRole: 'gruppenbetreuer' },
  { label: 'Aufgaben', href: '/app/tasks', icon: CheckSquare },
  { label: 'Ziele', href: '/app/goals', icon: Target, staffOnly: true },
  { label: 'Social Media', href: '/app/social-media', icon: Share2, staffOnly: true },
  { label: 'Email Kampagnen', href: '/app/email-kampagnen', icon: Mail, staffOnly: true },
  { label: 'Reports', href: '/app/reports', icon: BarChart3, minRole: 'gruppenbetreuer' },
  { label: 'Einstellungen', href: '/app/settings', icon: Settings },
  { label: 'COO Cockpit', href: '/app/coo-cockpit', icon: Gauge, exactRole: 'admin' },
  { label: 'Admin', href: '/app/admin', icon: Shield, exactRole: 'admin' },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { effectiveRole, isRealAdmin } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    // Admin always sees admin-only items
    if (item.exactRole === 'admin' && isRealAdmin) return true;
    if (item.exactRole) return effectiveRole === item.exactRole;

    // Staff-only: visible if effective role is a staff role
    if (item.staffOnly) {
      return effectiveRole ? STAFF_ROLES.includes(effectiveRole) : false;
    }

    // Member-only: visible if effective role is a member role
    if (item.memberOnly) {
      return effectiveRole ? MEMBER_ROLES.includes(effectiveRole) : false;
    }

    // Min role check
    if (item.minRole) {
      if (!effectiveRole) return false;
      const hierarchy: Record<string, number> = {
        admin: 100, vertriebspartner: 50, gruppenbetreuer: 50,
        member_pro: 30, member_starter: 20, member_basic: 10, guest: 0,
      };
      return (hierarchy[effectiveRole] || 0) >= (hierarchy[item.minRole] || 0);
    }

    return true;
  });

  return (
    <aside className="w-64 bg-gradient-to-b from-card to-muted/30 border-r border-border/50 h-full flex flex-col">
      <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto overscroll-contain">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/app'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 touch-manipulation',
                'min-h-[44px] md:min-h-0',
                isActive
                  ? 'bg-muted text-foreground border-l-[3px] border-foreground/30 pl-[9px]'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground active:bg-muted/70'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
