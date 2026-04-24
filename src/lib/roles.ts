// KI-Automationen Role definitions and utilities
// Staff roles: admin, vertriebspartner, gruppenbetreuer
// Customer tiers: member_basic, member_starter, member_pro
// Default: guest

export type AppRole = 
  | 'admin' 
  | 'vertriebspartner' 
  | 'gruppenbetreuer' 
  | 'member_basic' 
  | 'member_starter' 
  | 'member_pro' 
  | 'guest';

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  admin: 100,
  vertriebspartner: 50,
  gruppenbetreuer: 50,
  member_pro: 30,
  member_starter: 20,
  member_basic: 10,
  guest: 0,
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  vertriebspartner: 'Vertriebspartner',
  gruppenbetreuer: 'Gruppenbetreuer',
  member_pro: 'Pro-Mitglied',
  member_starter: 'Starter-Mitglied',
  member_basic: 'Basis-Mitglied',
  guest: 'Gast',
};

export const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-red-500',
  vertriebspartner: 'bg-blue-500',
  gruppenbetreuer: 'bg-purple-500',
  member_pro: 'bg-amber-500',
  member_starter: 'bg-emerald-500',
  member_basic: 'bg-slate-500',
  guest: 'bg-gray-400',
};

/** Staff roles that can access CRM, pipeline, etc. */
export const STAFF_ROLES: AppRole[] = ['admin', 'vertriebspartner', 'gruppenbetreuer'];

/** Customer/member roles */
export const MEMBER_ROLES: AppRole[] = ['member_basic', 'member_starter', 'member_pro'];

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
 * Check if user is staff (admin, vertriebspartner, or gruppenbetreuer)
 */
export function isStaff(roles: AppRole[]): boolean {
  return roles.some(r => STAFF_ROLES.includes(r));
}

/**
 * Check if user is admin
 */
export function isAdmin(roles: AppRole[]): boolean {
  return hasRole(roles, 'admin');
}

/**
 * Check if user is any kind of member (basic, starter, or pro)
 */
export function isMember(roles: AppRole[]): boolean {
  return roles.some(r => MEMBER_ROLES.includes(r));
}
