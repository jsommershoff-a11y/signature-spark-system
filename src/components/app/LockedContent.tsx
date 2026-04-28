import { Lock, ArrowUpRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

type ModuleType = 'prompts' | 'tools' | 'lessons' | 'community' | 'generic';

interface LockedContentProps {
  /** The content to show blurred/locked */
  children: React.ReactNode;
  /** Whether the user has access */
  hasAccess: boolean;
  /** Required tier label for the upgrade CTA */
  requiredTier?: string;
  /** Custom message (overrides default reason) */
  message?: string;
  /** Show as inline overlay (default) or full card */
  variant?: 'overlay' | 'card';
  /** Additional class */
  className?: string;
  /** Module type used to render a sensible default reason ("Was du als Basis-Mitglied verpasst") */
  moduleType?: ModuleType;
  /** Custom benefit bullets (overrides moduleType defaults) */
  benefits?: string[];
}

/** Default benefit messaging per module — what a Basis member is currently missing */
const DEFAULT_BENEFITS: Record<ModuleType, { headline: string; bullets: string[] }> = {
  prompts: {
    headline: 'Diesen Prompt aktuell nicht freigeschaltet',
    bullets: [
      'Vollständiger Prompt-Text zum Kopieren',
      'Kuratierte Profi-Prompts für deinen Use Case',
      'Regelmäßige Updates & neue Vorlagen',
    ],
  },
  tools: {
    headline: 'Dieses Tool gehört zum erweiterten Stack',
    bullets: [
      'Direkter Zugang zu allen empfohlenen Tools',
      'Setup-Anleitungen & Lizenz-Vorteile',
      'Kein eigenes Recherchieren mehr nötig',
    ],
  },
  lessons: {
    headline: 'Diese Lektion ist Teil eines höheren Pakets',
    bullets: [
      'Vollständige Lektionen inkl. Aufgaben',
      'Zugang zu allen Lernpfaden & Workbooks',
      'Live-Calls & Q&A Sessions',
    ],
  },
  community: {
    headline: 'Dieser Bereich ist für aktive Mitglieder reserviert',
    bullets: [
      'Live-Calls & Gruppencoaching',
      'Direkter Austausch mit Experten',
      'Implementierungs-Support',
    ],
  },
  generic: {
    headline: 'Inhalt aktuell gesperrt',
    bullets: [
      'Vollzugriff auf alle Inhalte des Pakets',
      'Mehr Funktionen & Vorlagen',
      'Direkte Umsetzungs-Hilfe',
    ],
  },
};

function buildReason(moduleType: ModuleType, requiredTier: string, customBenefits?: string[]) {
  const base = DEFAULT_BENEFITS[moduleType] ?? DEFAULT_BENEFITS.generic;
  return {
    headline: base.headline,
    bullets: customBenefits && customBenefits.length > 0 ? customBenefits : base.bullets,
    cta: `Upgrade auf ${requiredTier}`,
  };
}

export function LockedContent({
  children,
  hasAccess,
  requiredTier = 'Starter',
  message,
  variant = 'overlay',
  className,
  moduleType = 'generic',
  benefits,
}: LockedContentProps) {
  if (hasAccess) return <>{children}</>;

  const reason = buildReason(moduleType, requiredTier, benefits);

  const logUpgradeClick = (placement: 'card' | 'overlay' | 'compare') => {
    void trackEvent('upgrade_cta_click', {
      moduleType,
      requiredTier,
      placement,
      variant,
    });
  };

  if (variant === 'card') {
    return (
      <Card className={cn('relative overflow-hidden border-dashed', className)}>
        <CardContent className="py-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {message || reason.headline}
            </p>
            <p className="text-xs text-muted-foreground">
              Verfügbar ab dem {requiredTier} Paket
            </p>
          </div>

          <ul className="text-xs text-muted-foreground text-left max-w-xs mx-auto space-y-1.5">
            {reason.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Button asChild size="sm" variant="default">
              <Link to="/app/pricing" onClick={() => logUpgradeClick('card')}>
                <Sparkles className="h-4 w-4 mr-1" />
                {reason.cta}
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/app/pricing" onClick={() => logUpgradeClick('compare')}>
                Pakete vergleichen
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
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
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-[2px] rounded-lg z-10 p-3">
        <div className="flex flex-col items-center gap-3 text-center max-w-[260px]">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              {message || reason.headline}
            </p>
            <p className="text-xs text-muted-foreground">
              Ab dem {requiredTier} Paket freigeschaltet
            </p>
          </div>

          <ul className="text-[11px] text-muted-foreground text-left space-y-1 hidden sm:block">
            {reason.bullets.slice(0, 2).map((b) => (
              <li key={b} className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-1.5 w-full">
            <Button asChild size="sm" variant="default" className="w-full">
              <Link to="/app/pricing" onClick={() => logUpgradeClick('overlay')}>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                {reason.cta}
              </Link>
            </Button>
            <Link
              to="/app/pricing"
              onClick={() => logUpgradeClick('compare')}
              className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              Pakete vergleichen →
            </Link>
          </div>
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
