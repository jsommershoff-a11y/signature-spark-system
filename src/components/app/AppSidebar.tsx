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
  { label: 'KI-Academy', href: '/app/academy', icon: GraduationCap, exactRole: 'kunde' },
  { label: 'Verträge', href: '/app/contracts', icon: ScrollText, exactRole: 'kunde' },
  { label: 'CRM', href: '/app/crm', icon: Building2, minRole: 'mitarbeiter' },
  { label: 'Leads', href: '/app/leads', icon: UserPlus, minRole: 'mitarbeiter' },
  { label: 'Pipeline', href: '/app/pipeline', icon: Kanban, minRole: 'mitarbeiter' },
  { label: 'Calls', href: '/app/calls', icon: Phone, minRole: 'mitarbeiter' },
  { label: 'Angebote', href: '/app/offers', icon: FileText, minRole: 'mitarbeiter' },
  { label: 'Kunden', href: '/app/customers', icon: Users, minRole: 'mitarbeiter' },
  { label: 'Mitglieder', href: '/app/members', icon: UserCheck, minRole: 'mitarbeiter' },
  { label: 'Aufgaben', href: '/app/tasks', icon: CheckSquare },
  { label: 'Ziele', href: '/app/goals', icon: Target, minRole: 'mitarbeiter' },
  { label: 'Social Media', href: '/app/social-media', icon: Share2, minRole: 'mitarbeiter' },
  { label: 'Email Kampagnen', href: '/app/email-kampagnen', icon: Mail, minRole: 'mitarbeiter' },
  { label: 'Reports', href: '/app/reports', icon: BarChart3, minRole: 'teamleiter' },
  { label: 'Einstellungen', href: '/app/settings', icon: Settings },
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
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col">
      <nav className="flex-1 p-3 md:p-4 space-y-0.5 overflow-y-auto overscroll-contain">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/app'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation',
                'min-h-[44px] md:min-h-0',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
