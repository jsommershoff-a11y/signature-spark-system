import { Link } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Kompakter Trial-/Status-Hinweis für Inline-Verwendung auf
 * Pricing, Calendar, Academy etc. Rendert nichts für Active/Admin.
 */
export function TrialInlineNotice({ className }: { className?: string }) {
  const trial = useTrialStatus();

  if (trial.state === 'loading' || trial.state === 'none') return null;

  if (trial.isActive) {
    return (
      <div
        className={cn(
          'rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 flex items-center gap-3 text-sm',
          className
        )}
      >
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
        <span className="font-medium">Mitgliedschaft aktiv — voller Zugriff freigeschaltet.</span>
      </div>
    );
  }

  const isExpired = trial.isExpired;
  const days = trial.daysRemaining ?? 0;
  const urgent = !isExpired && days <= 3;

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 flex items-center gap-3 flex-wrap',
        isExpired
          ? 'border-destructive/30 bg-destructive/5'
          : urgent
          ? 'border-amber-500/40 bg-amber-500/5'
          : 'border-primary/30 bg-primary/5',
        className
      )}
      role="status"
    >
      {isExpired ? (
        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
      ) : (
        <Clock
          className={cn(
            'h-4 w-4 shrink-0',
            urgent ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
          )}
        />
      )}
      <div className="flex-1 min-w-0 text-sm">
        <span className="font-semibold">
          {isExpired
            ? 'Trial abgelaufen'
            : `Trial aktiv — noch ${days} Tag${days === 1 ? '' : 'e'}`}
        </span>
        <span className="text-muted-foreground ml-2 hidden sm:inline">
          {isExpired
            ? 'Schalte alle Module wieder frei.'
            : 'Sichere dir vor Ablauf den Vollzugriff.'}
        </span>
      </div>
      <Button asChild size="sm" variant={isExpired ? 'destructive' : 'default'}>
        <Link to="/app/upgrade">
          Upgrade
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
