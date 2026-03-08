import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Eye, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

const VIEW_AS_START_KEY = 'admin_viewAsStartTime';
const VIEW_AS_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minuten

export function ViewAsBanner() {
  const { isViewingAs, effectiveRole, setViewAsRole } = useAuth();
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (!isViewingAs) {
      setRemainingMinutes(null);
      return;
    }

    const checkExpiry = () => {
      try {
        const startTime = sessionStorage.getItem(VIEW_AS_START_KEY);
        if (startTime) {
          const elapsed = Date.now() - parseInt(startTime);
          const remaining = VIEW_AS_TIMEOUT_MS - elapsed;
          
          if (remaining <= 0) {
            setViewAsRole(null);
            toast.info('View-As Modus nach 30 Minuten automatisch beendet');
          } else {
            setRemainingMinutes(Math.ceil(remaining / 60000));
          }
        }
      } catch {
        // sessionStorage not available
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Jede Minute prüfen
    
    return () => clearInterval(interval);
  }, [isViewingAs, setViewAsRole]);

  if (!isViewingAs || !effectiveRole) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-3 md:px-4 py-2">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto gap-2">
        <div className="flex items-center gap-2 text-xs md:text-sm min-w-0">
          <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
          <span className="truncate">
            Ansicht als{' '}
            <strong className="text-primary">{ROLE_LABELS[effectiveRole]}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {remainingMinutes !== null && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {remainingMinutes} Min.
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewAsRole(null)}
            className="h-7 gap-1 text-muted-foreground hover:text-foreground text-xs px-2"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">Beenden</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
