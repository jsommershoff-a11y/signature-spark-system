import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Inbox,
  GraduationCap,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { STAFF_ROLES, MEMBER_ROLES } from '@/lib/roles';

interface MobileBottomNavProps {
  onMore: () => void;
}

interface BottomItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

/**
 * Bottom-tab bar for mobile (<md). Surfaces the 4 most important routes
 * for the current role + a "Mehr" trigger that opens the full sidebar drawer.
 *
 * - Hidden on md+ (desktop uses sidebar).
 * - Respects iOS safe-area inset.
 * - Uses semantic design tokens (no raw colors).
 */
export function MobileBottomNav({ onMore }: MobileBottomNavProps) {
  const { effectiveRole, isRealAdmin } = useAuth();
  const trial = useTrialStatus();
  const isTrialMode = !isRealAdmin && (trial.isTrialing || trial.isExpired);

  let items: BottomItem[];

  if (isTrialMode) {
    items = [
      { label: 'Start', href: '/app', icon: LayoutDashboard, end: true },
      { label: 'Mein System', href: '/app/academy', icon: GraduationCap },
      { label: 'Aufgaben', href: '/app/tasks', icon: CheckSquare },
      { label: 'Upgrade', href: '/app/upgrade', icon: Inbox },
    ];
  } else if (effectiveRole && STAFF_ROLES.includes(effectiveRole)) {
    items = [
      { label: 'Start', href: '/app', icon: LayoutDashboard, end: true },
      { label: 'CRM', href: '/app/crm', icon: Building2 },
      { label: 'Aufgaben', href: '/app/tasks', icon: CheckSquare },
      { label: 'Inbox', href: '/app/inbox', icon: Inbox },
    ];
  } else if (effectiveRole && MEMBER_ROLES.includes(effectiveRole)) {
    items = [
      { label: 'Start', href: '/app', icon: LayoutDashboard, end: true },
      { label: 'Mein System', href: '/app/academy', icon: GraduationCap },
      { label: 'Aufgaben', href: '/app/tasks', icon: CheckSquare },
      { label: 'Live Calls', href: '/app/calendar', icon: Inbox },
    ];
  } else {
    items = [
      { label: 'Start', href: '/app', icon: LayoutDashboard, end: true },
      { label: 'Aufgaben', href: '/app/tasks', icon: CheckSquare },
      { label: 'Live Calls', href: '/app/calendar', icon: Inbox },
      { label: 'Pakete', href: '/app/pricing', icon: Building2 },
    ];
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        'md:hidden fixed bottom-0 inset-x-0 z-40',
        'bg-background/95 backdrop-blur-md border-t border-border/40',
        'pb-safe px-safe'
      )}
    >
      <ul className="grid grid-cols-5 h-16">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium leading-tight',
                  'touch-manipulation transition-colors active:bg-muted/40',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </NavLink>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onMore}
            className="h-full w-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium leading-tight text-muted-foreground touch-manipulation active:bg-muted/40"
            aria-label="Weitere Navigation öffnen"
          >
            <Menu className="h-5 w-5" />
            <span>Mehr</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
