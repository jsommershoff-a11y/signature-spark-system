import { Lock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LockedContentProps {
  /** The content to show blurred/locked */
  children: React.ReactNode;
  /** Whether the user has access */
  hasAccess: boolean;
  /** Required tier label for the upgrade CTA */
  requiredTier?: string;
  /** Custom message */
  message?: string;
  /** Show as inline overlay (default) or full card */
  variant?: 'overlay' | 'card';
  /** Additional class */
  className?: string;
}

export function LockedContent({
  children,
  hasAccess,
  requiredTier = 'Starter',
  message,
  variant = 'overlay',
  className,
}: LockedContentProps) {
  if (hasAccess) return <>{children}</>;

  if (variant === 'card') {
    return (
      <Card className={cn('relative overflow-hidden border-dashed', className)}>
        <CardContent className="py-8 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {message || `Dieser Inhalt ist Teil des ${requiredTier} Pakets.`}
          </p>
          <Button asChild size="sm" variant="default">
            <Link to="/app/pricing">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Upgrade freischalten
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg z-10">
        <div className="flex flex-col items-center gap-3 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-[220px]">
            {message || `Verfügbar ab dem ${requiredTier} Paket`}
          </p>
          <Button asChild size="sm" variant="default">
            <Link to="/app/pricing">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Upgrade freischalten
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Small inline badge showing current usage tier */
export function TierProgressHint({
  currentTier,
  className,
}: {
  currentTier: 'basic' | 'starter' | 'none';
  className?: string;
}) {
  const labels: Record<string, string> = {
    none: 'Kein aktives Paket',
    basic: 'Mitgliedschaft aktiv',
    starter: 'Starter Paket aktiv',
  };

  const progress: Record<string, number> = {
    none: 0,
    basic: 25,
    starter: 50,
  };

  return (
    <div className={cn('rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{labels[currentTier]}</span>
        <span className="font-medium">{progress[currentTier]}% freigeschaltet</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress[currentTier]}%` }}
        />
      </div>
      {currentTier !== 'starter' && (
        <p className="text-xs text-muted-foreground">
          Du nutzt aktuell nur einen Teil des Systems.{' '}
          <Link to="/app/pricing" className="underline hover:text-foreground">
            Mehr freischalten →
          </Link>
        </p>
      )}
    </div>
  );
}
