// CRM Role definitions and utilities
export type AppRole = 'admin' | 'geschaeftsfuehrung' | 'teamleiter' | 'mitarbeiter' | 'kunde';

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  admin: 5,
  geschaeftsfuehrung: 4,
  teamleiter: 3,
  mitarbeiter: 2,
  kunde: 1,
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  geschaeftsfuehrung: 'Geschäftsführung',
  teamleiter: 'Teamleiter',
  mitarbeiter: 'Mitarbeiter',
  kunde: 'Kunde',
};

export const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-red-500',
  geschaeftsfuehrung: 'bg-purple-500',
  teamleiter: 'bg-blue-500',
  mitarbeiter: 'bg-green-500',
  kunde: 'bg-gray-500',
};

/**
 * Check if a role has at least the minimum required role level
 */
export function hasMinRole(userRole: AppRole | null | undefined, minRole: AppRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

/**
 * Get the highest role from an array of roles
 */
export function getHighestRole(roles: AppRole[]): AppRole | null {
  if (!roles || roles.length === 0) return null;
  
  return roles.reduce((highest, current) => {
    if (!highest) return current;
    return ROLE_HIERARCHY[current] > ROLE_HIERARCHY[highest] ? current : highest;
  }, roles[0]);
}

/**
 * Check if user has a specific role
 */
export function hasRole(roles: AppRole[], role: AppRole): boolean {
  return roles.includes(role);
}

/**
 * Check if user is at least staff (mitarbeiter or higher)
 */
export function isStaff(roles: AppRole[]): boolean {
  const highest = getHighestRole(roles);
  return hasMinRole(highest, 'mitarbeiter');
}

/**
 * Check if user is admin
 */
export function isAdmin(roles: AppRole[]): boolean {
  return hasRole(roles, 'admin');
}
