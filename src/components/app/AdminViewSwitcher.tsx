import { useAuth } from '@/contexts/AuthContext';
import { AppRole, ROLE_LABELS } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, ChevronDown, Shield } from 'lucide-react';

const VIEW_AS_ROLES: AppRole[] = ['admin', 'geschaeftsfuehrung', 'teamleiter', 'mitarbeiter', 'kunde'];

export function AdminViewSwitcher() {
  const { roles, viewAsRole, setViewAsRole, effectiveRole, isViewingAs } = useAuth();
  
  // Only show for real admins
  const isRealAdmin = roles.includes('admin');
  if (!isRealAdmin) return null;

  const currentLabel = effectiveRole ? ROLE_LABELS[effectiveRole] : 'Keine Rolle';

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isViewingAs ? "secondary" : "ghost"} 
                size="sm" 
                className={isViewingAs 
                  ? "gap-2 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border border-primary-foreground/30" 
                  : "gap-2 text-primary-foreground hover:bg-primary-foreground/20"
                }
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Ansicht:</span>
                <span className="font-medium">{currentLabel}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[220px]">
            <p className="text-sm">
              Wechsle die Ansicht, um die App aus der Perspektive verschiedener Benutzerrollen zu erleben.
            </p>
          </TooltipContent>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Ansicht wechseln
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {VIEW_AS_ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => setViewAsRole(role === 'admin' ? null : role)}
            className={effectiveRole === role ? 'bg-accent' : ''}
          >
            <span className="flex-1">{ROLE_LABELS[role]}</span>
            {effectiveRole === role && (
              <span className="text-xs text-muted-foreground">Aktiv</span>
            )}
          </DropdownMenuItem>
        ))}
        
        {isViewingAs && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setViewAsRole(null)}
              className="text-primary font-medium"
            >
              <Shield className="h-4 w-4 mr-2" />
              Zurück zu Admin
            </DropdownMenuItem>
          </>
        )}
        </DropdownMenuContent>
      </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}
