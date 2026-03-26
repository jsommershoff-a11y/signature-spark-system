import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole?: 'kunde' | 'mitarbeiter' | 'teamleiter' | 'geschaeftsfuehrung' | 'admin';
  exactRole?: 'kunde' | 'admin';
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'Mein System', href: '/app/academy', icon: GraduationCap, exactRole: 'kunde' },
  { label: 'Dokumente', href: '/app/contracts', icon: ScrollText, exactRole: 'kunde' },
  { label: 'Pakete & Preise', href: '/app/pricing', icon: Kanban },
  { label: 'CRM', href: '/app/crm', icon: Building2, minRole: 'mitarbeiter' },
  { label: 'Leads', href: '/app/leads', icon: UserPlus, minRole: 'mitarbeiter' },
  { label: 'Pipeline', href: '/app/pipeline', icon: Kanban, minRole: 'mitarbeiter' },
  { label: 'Calls', href: '/app/calls', icon: Phone, minRole: 'mitarbeiter' },
  { label: 'Angebote', href: '/app/offers', icon: FileText, minRole: 'mitarbeiter' },
  { label: 'Kunden', href: '/app/customers', icon: Users, minRole: 'mitarbeiter' },
  { label: 'Mitglieder', href: '/app/members', icon: UserCheck, minRole: 'mitarbeiter' },
  { label: 'Mitgliederbereich', href: '/app/member-management', icon: GraduationCap, minRole: 'teamleiter' },
  { label: 'Aufgaben', href: '/app/tasks', icon: CheckSquare },
  { label: 'Ziele', href: '/app/goals', icon: Target, minRole: 'mitarbeiter' },
  { label: 'Social Media', href: '/app/social-media', icon: Share2, minRole: 'mitarbeiter' },
  { label: 'Email Kampagnen', href: '/app/email-kampagnen', icon: Mail, minRole: 'mitarbeiter' },
  { label: 'Reports', href: '/app/reports', icon: BarChart3, minRole: 'teamleiter' },
  { label: 'Einstellungen', href: '/app/settings', icon: Settings },
  { label: 'COO Cockpit', href: '/app/coo-cockpit', icon: Gauge, exactRole: 'admin' },
  { label: 'Admin', href: '/app/admin', icon: Shield, exactRole: 'admin' },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { hasMinRole, effectiveRole, isRealAdmin } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!item.minRole && !item.exactRole) return true;
    if (item.exactRole === 'admin' && isRealAdmin) return true;
    if (item.exactRole) return effectiveRole === item.exactRole;
    if (item.minRole) {
      if (isRealAdmin) {
        const roleHierarchy = ['kunde', 'mitarbeiter', 'teamleiter', 'geschaeftsfuehrung', 'admin'];
        const effectiveIndex = effectiveRole ? roleHierarchy.indexOf(effectiveRole) : -1;
        const minIndex = roleHierarchy.indexOf(item.minRole);
        return effectiveIndex >= minIndex;
      }
      return hasMinRole(item.minRole);
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
