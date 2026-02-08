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
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4 text-primary" />
          <span>
            Du siehst die App als{' '}
            <strong className="text-primary">{ROLE_LABELS[effectiveRole]}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {remainingMinutes !== null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {remainingMinutes} Min.
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewAsRole(null)}
            className="h-7 gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Beenden
          </Button>
        </div>
      </div>
    </div>
  );
}
