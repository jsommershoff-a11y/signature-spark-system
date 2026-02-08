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
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole?: 'kunde' | 'mitarbeiter' | 'teamleiter' | 'geschaeftsfuehrung' | 'admin';
  exactRole?: 'kunde' | 'admin';
}

const navItems: NavItem[] = [
  { 
    label: 'Dashboard', 
    href: '/app', 
    icon: LayoutDashboard 
  },
  { 
    label: 'Kurse', 
    href: '/app/courses', 
    icon: GraduationCap,
    exactRole: 'kunde'
  },
  { 
    label: 'CRM', 
    href: '/app/crm', 
    icon: Building2,
    minRole: 'mitarbeiter'
  },
  { 
    label: 'Leads', 
    href: '/app/leads', 
    icon: UserPlus,
    minRole: 'mitarbeiter'
  },
  { 
    label: 'Pipeline', 
    href: '/app/pipeline', 
    icon: Kanban,
    minRole: 'mitarbeiter'
  },
  { 
    label: 'Calls', 
    href: '/app/calls', 
    icon: Phone,
    minRole: 'mitarbeiter'
  },
  { 
    label: 'Angebote', 
    href: '/app/offers', 
    icon: FileText,
    minRole: 'mitarbeiter'
  },
  {
    label: 'Kunden', 
    href: '/app/customers', 
    icon: Users,
    minRole: 'mitarbeiter'
  },
  {
    label: 'Mitglieder', 
    href: '/app/members', 
    icon: UserCheck,
    minRole: 'mitarbeiter'
  },
  { 
    label: 'Aufgaben', 
    href: '/app/tasks', 
    icon: CheckSquare 
  },
  { 
    label: 'Reports', 
    href: '/app/reports', 
    icon: BarChart3,
    minRole: 'teamleiter'
  },
  { 
    label: 'Einstellungen', 
    href: '/app/settings', 
    icon: Settings 
  },
  { 
    label: 'Admin', 
    href: '/app/admin', 
    icon: Shield,
    exactRole: 'admin'
  },
];

export function AppSidebar() {
  const { hasRole, hasMinRole, highestRole } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    // No role requirement - show to everyone
    if (!item.minRole && !item.exactRole) return true;
    
    // Check exact role
    if (item.exactRole) {
      // Special case: admin can see everything
      if (hasRole('admin')) return true;
      return hasRole(item.exactRole);
    }
    
    // Check minimum role
    if (item.minRole) {
      return hasMinRole(item.minRole);
    }
    
    return true;
  });

  return (
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/app'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
