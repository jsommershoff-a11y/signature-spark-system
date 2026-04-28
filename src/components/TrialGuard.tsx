import { Navigate, useLocation, matchPath } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { Loader2 } from 'lucide-react';

/**
 * Pfade die Trial-User (trialing ODER trial_expired) sehen dürfen.
 * Patterns folgen react-router matchPath syntax.
 */
const TRIAL_ALLOWED_PATHS: string[] = [
  '/app',                  // Dashboard
  '/app/pricing',          // Pakete & Preise (Conversion)
  '/app/calendar',         // 1× Live-Call (durch RPC begrenzt)
  '/app/welcome',          // Onboarding
  '/app/upgrade',          // Upgrade-Landing
  '/app/settings',         // eigenes Profil
  '/app/unauthorized',
  '/app/academy',          // Erfahrungs-Preview (Preview-Modus in Komponente)
  '/app/academy/*',
  '/app/tasks',            // eigene Aufgaben
];

/**
 * Trial-Expired-User dürfen NUR noch auf Pricing/Upgrade — nicht mehr buchen.
 */
const EXPIRED_ALLOWED_PATHS: string[] = [
  '/app',
  '/app/pricing',
  '/app/upgrade',
  '/app/settings',
  '/app/unauthorized',
];

function isPathAllowed(pathname: string, allowList: string[]): boolean {
  return allowList.some(pattern => matchPath({ path: pattern, end: pattern.endsWith('/*') ? false : true }, pathname) !== null);
}

interface TrialGuardProps {
  children: React.ReactNode;
}

/**
 * Wrappt alle /app/* Routen. Schickt Trial-User auf /app/upgrade,
 * wenn sie eine gesperrte Seite öffnen.
 */
export function TrialGuard({ children }: TrialGuardProps) {
  const location = useLocation();
  const trial = useTrialStatus();

  if (trial.state === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Active oder Admin → freier Zugriff
  if (trial.isActive) return <>{children}</>;

  // Trial laufend → Whitelist prüfen
  if (trial.isTrialing) {
    if (isPathAllowed(location.pathname, TRIAL_ALLOWED_PATHS)) {
      return <>{children}</>;
    }
    return <Navigate to="/app/upgrade" replace state={{ from: location.pathname, reason: 'trial' }} />;
  }

  // Trial abgelaufen → strikteres Set
  if (trial.isExpired) {
    if (isPathAllowed(location.pathname, EXPIRED_ALLOWED_PATHS)) {
      return <>{children}</>;
    }
    return <Navigate to="/app/upgrade" replace state={{ from: location.pathname, reason: 'expired' }} />;
  }

  // state === 'none' (z.B. Gast ohne Trial-Daten) → durchlassen,
  // ProtectedRoute regelt Auth, Rollen-Checks regeln Rest.
  return <>{children}</>;
}
