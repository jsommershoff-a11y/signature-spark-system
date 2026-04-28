import { Link } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useLiveCallEligibility } from '@/hooks/useLiveCallEligibility';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, Calendar, ArrowRight, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Schmaler, persistenter Statusbalken unter dem Header.
 * Nur für Trial-User (laufend oder abgelaufen). Active/Admin → unsichtbar.
 */
export function TrialTopBar() {
  const trial = useTrialStatus();
  const { eligibility } = useLiveCallEligibility();

  if (trial.state === 'loading' || trial.isActive || trial.state === 'none') return null;

  const isExpired = trial.isExpired;
  const days = trial.daysRemaining ?? 0;
  const urgent = !isExpired && days <= 3;

  // Live-Call Status-Text
  const liveCallText =
    eligibility.reason === 'trial_available'
      ? '1 Live-Call verfügbar'
      : eligibility.reason === 'trial_used'
      ? 'Live-Call eingelöst'
      : eligibility.reason === 'expired'
      ? 'Live-Call gesperrt'
      : null;

  const LiveCallIcon = eligibility.reason === 'trial_available' ? Ticket : Calendar;

  return (
    <div
      className={cn(
        'sticky top-14 md:top-16 z-30 border-b backdrop-blur-md',
        isExpired
          ? 'bg-destructive/10 border-destructive/30 text-destructive-foreground'
          : urgent
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-primary/5 border-primary/20'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm flex-wrap min-w-0">
          {isExpired ? (
            <span className="flex items-center gap-1.5 font-medium text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              Trial abgelaufen — Vollzugriff aktuell gesperrt
            </span>
          ) : (
            <span
              className={cn(
                'flex items-center gap-1.5 font-medium',
                urgent ? 'text-amber-700 dark:text-amber-400' : 'text-primary'
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              Trial aktiv — noch {days} Tag{days === 1 ? '' : 'e'}
            </span>
          )}

          {liveCallText && !isExpired && (
            <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
              <LiveCallIcon className="h-3.5 w-3.5" />
              {liveCallText}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {eligibility.reason === 'trial_available' && (
            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs hidden md:inline-flex">
              <Link to="/app/calendar">
                Live-Call wählen
              </Link>
            </Button>
          )}
          <Button
            asChild
            size="sm"
            className={cn(
              'h-7 px-3 text-xs',
              isExpired
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                : ''
            )}
          >
            <Link to="/app/upgrade">
              {isExpired ? 'Jetzt freischalten' : 'Upgrade'}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
