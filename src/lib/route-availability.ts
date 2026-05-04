/**
 * Route Availability Registry
 * ---------------------------
 * Robuste Existenzprüfung für interne Zielrouten.
 * Wird von Quick-Action-Buttons (z. B. in CustomerDetail) genutzt,
 * um Buttons zu deaktivieren oder zu verstecken, falls eine Route
 * (noch) nicht im Router registriert ist.
 *
 * WICHTIG: Diese Liste muss synchron zu den in src/App.tsx definierten
 * <Route path="..."> Einträgen unter dem `/app/*` Layout gehalten werden.
 */

// Statisch registrierte App-Routen (Pfad ohne Query-/Hash-Anteil).
const REGISTERED_APP_ROUTES: ReadonlySet<string> = new Set([
  '/app',
  '/app/inbox',
  '/app/offers',
  '/app/tasks',
  '/app/pipeline',
  '/app/crm',
  '/app/customers',
  '/app/calls',
  '/app/goals',
  '/app/admin',
]);

/**
 * Normalisiert einen Pfad/URL-String auf den reinen Pfad
 * (entfernt Query-String, Hash und trimmt trailing slash).
 */
function normalizePath(path: string): string {
  if (!path) return '';
  const noHash = path.split('#')[0];
  const noQuery = noHash.split('?')[0];
  // entferne trailing slash (außer für Root)
  return noQuery.length > 1 && noQuery.endsWith('/')
    ? noQuery.slice(0, -1)
    : noQuery;
}

/**
 * Prüft, ob die gegebene Ziel-Route im Router registriert ist.
 * Akzeptiert auch URLs mit Query-Parametern (z. B. "/app/inbox?customer=123").
 */
export function isRouteAvailable(path: string | null | undefined): boolean {
  if (!path) return false;
  const normalized = normalizePath(path);
  if (REGISTERED_APP_ROUTES.has(normalized)) return true;
  // Erlaube Sub-Pfade registrierter Routen (z. B. /app/offers/<uuid>)
  for (const route of REGISTERED_APP_ROUTES) {
    if (route !== '/app' && normalized.startsWith(route + '/')) return true;
  }
  return false;
}

/**
 * Hook-freundlicher Wrapper (rein synchron, kein State nötig — Routen sind statisch).
 */
export function useRouteAvailable(path: string | null | undefined): boolean {
  return isRouteAvailable(path);
}
