import { AppRole, AppPermission } from '@/types/rbac';
import { UserProfile } from '@/types/models';

/**
 * Explicit Role-to-Permissions Mapping
 */
export const ROLE_PERMISSIONS: Record<AppRole, AppPermission[]> = {
  SUPER_ADMIN: [
    'MANAGE_ALL',
    'MANAGE_ADMINS',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'MANAGE_CMS',
    'MANAGE_COMMUNITY',
    'MODERATE_COMMUNITY',
    'MANAGE_SCHOOL',
    'MANAGE_COURSES',
    'MANAGE_PRODUCTS',
    'MANAGE_CODES',
    'MANAGE_ORDERS',
    'SUPPORT_TICKETS',
    'VIEW_AUDIT_LOGS',
    'VIEW_ANALYTICS',
    'MANAGE_SETTINGS',
    'ACCESS_COMMUNITY',
    'ACCESS_SCHOOL',
  ],
  ADMIN: [
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'MANAGE_CMS',
    'MANAGE_COMMUNITY',
    'MODERATE_COMMUNITY',
    'MANAGE_SCHOOL',
    'MANAGE_COURSES',
    'MANAGE_PRODUCTS',
    'MANAGE_CODES',
    'MANAGE_ORDERS',
    'SUPPORT_TICKETS',
    'VIEW_AUDIT_LOGS',
    'VIEW_ANALYTICS',
    'ACCESS_COMMUNITY',
    'ACCESS_SCHOOL',
  ],
  CONTENT_MANAGER: [
    'MANAGE_CMS',
    'VIEW_ANALYTICS',
  ],
  COMMUNITY_MANAGER: [
    'MANAGE_COMMUNITY',
    'MODERATE_COMMUNITY',
    'ACCESS_COMMUNITY',
  ],
  SCHOOL_MANAGER: [
    'MANAGE_SCHOOL',
    'MANAGE_COURSES',
    'ACCESS_SCHOOL',
  ],
  PRODUCT_MANAGER: [
    'MANAGE_PRODUCTS',
    'MANAGE_CODES',
    'VIEW_ANALYTICS',
  ],
  ORDER_MANAGER: [
    'MANAGE_ORDERS',
  ],
  SUPPORT: [
    'SUPPORT_TICKETS',
    'MANAGE_USERS',
  ],
  ANALYST: [
    'VIEW_ANALYTICS',
    'VIEW_AUDIT_LOGS',
  ],
  CUSTOMER: [],
};

/**
 * Aggregates all permissions for a list of roles into a unique set.
 * Supports multi-role users (e.g. COMMUNITY_MANAGER + SCHOOL_MANAGER).
 */
export function aggregatePermissions(roles: AppRole[] = []): Set<AppPermission> {
  const permissions = new Set<AppPermission>();

  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (rolePerms) {
      for (const perm of rolePerms) {
        permissions.add(perm);
      }
    }
  }

  return permissions;
}

/**
 * Returns an array of deduplicated permissions aggregated from the given roles.
 */
export function getEffectivePermissions(roles: AppRole[] = []): AppPermission[] {
  return Array.from(aggregatePermissions(roles));
}

/**
 * Returns true if the user profile has the exact role specified.
 */
export function hasRole(user: UserProfile | null | undefined, role: AppRole): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Returns true if the user profile has AT LEAST ONE of the roles specified.
 */
export function hasAnyRole(user: UserProfile | null | undefined, roles: AppRole[]): boolean {
  if (!user || !user.roles) return false;
  return roles.some((role) => user.roles.includes(role));
}

/**
 * Returns true if the user has the specified permission, either via roles
 * or via verified user entitlements (communityAccess, schoolAccess).
 */
export function hasPermission(
  user: UserProfile | null | undefined,
  permission: AppPermission
): boolean {
  if (!user) return false;

  // SUPER_ADMIN has unconditional permission
  if (user.roles?.includes('SUPER_ADMIN')) return true;

  const permissions = aggregatePermissions(user.roles);

  // Check role-based permission
  if (permissions.has(permission)) return true;

  // Check entitlement-based permissions for users
  if (permission === 'ACCESS_COMMUNITY' && user.communityAccess === true) {
    return true;
  }
  if (permission === 'ACCESS_SCHOOL' && user.schoolAccess === true) {
    return true;
  }

  return false;
}

/**
 * Returns true if user has all specified permissions.
 */
export function hasAllPermissions(
  user: UserProfile | null | undefined,
  permissions: AppPermission[]
): boolean {
  if (!user) return false;
  return permissions.every((p) => hasPermission(user, p));
}

/**
 * Checks if user has administrative rights to access the Admin Command Center.
 */
export function isStaff(user: UserProfile | null | undefined): boolean {
  if (!user || !user.roles) return false;
  const staffRoles: AppRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'CONTENT_MANAGER',
    'COMMUNITY_MANAGER',
    'SCHOOL_MANAGER',
    'PRODUCT_MANAGER',
    'ORDER_MANAGER',
    'SUPPORT',
    'ANALYST',
  ];
  return hasAnyRole(user, staffRoles);
}

export function isSuperAdmin(user: UserProfile | null | undefined): boolean {
  return hasRole(user, 'SUPER_ADMIN');
}

export function isAdmin(user: UserProfile | null | undefined): boolean {
  return hasRole(user, 'ADMIN') || hasRole(user, 'SUPER_ADMIN');
}

export const ALL_ROLES: AppRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'CONTENT_MANAGER',
  'COMMUNITY_MANAGER',
  'SCHOOL_MANAGER',
  'PRODUCT_MANAGER',
  'ORDER_MANAGER',
  'SUPPORT',
  'ANALYST',
  'CUSTOMER',
];

export interface RoleChangeValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether an actor has authority to transition a target user to a new set of roles.
 * Strictly prevents privilege escalation:
 * - Non-staff cannot assign any role.
 * - Actors without MANAGE_ROLES or SUPER_ADMIN cannot modify roles.
 * - Only SUPER_ADMIN may grant, demote, or modify SUPER_ADMIN.
 * - ADMIN cannot promote themselves or others to SUPER_ADMIN.
 */
export function validateRoleTransition(
  actor: UserProfile | null | undefined,
  targetUser: UserProfile | null | undefined,
  newRoles: AppRole[]
): RoleChangeValidationResult {
  if (!actor) {
    return { allowed: false, reason: 'Unauthenticated actor cannot perform role governance.' };
  }

  if (actor.status !== 'active') {
    return { allowed: false, reason: 'Inactive or suspended actor cannot modify privileges.' };
  }

  const actorIsSuperAdmin = isSuperAdmin(actor);
  const actorHasManageRoles = hasPermission(actor, 'MANAGE_ROLES');

  if (!actorIsSuperAdmin && !actorHasManageRoles) {
    return { allowed: false, reason: 'Actor lacks MANAGE_ROLES permission.' };
  }

  // Check if target currently holds SUPER_ADMIN
  const targetIsSuperAdmin = targetUser ? isSuperAdmin(targetUser) : false;

  // Modifying a SUPER_ADMIN requires SUPER_ADMIN actor
  if (targetIsSuperAdmin && !actorIsSuperAdmin) {
    return {
      allowed: false,
      reason: 'Privilege boundary: Only a SUPER_ADMIN may modify an account currently holding the SUPER_ADMIN role.',
    };
  }

  // Granting SUPER_ADMIN requires SUPER_ADMIN actor
  const grantingSuperAdmin = newRoles.includes('SUPER_ADMIN');
  if (grantingSuperAdmin && !actorIsSuperAdmin) {
    return {
      allowed: false,
      reason: 'Privilege escalation blocked: Only a SUPER_ADMIN may grant or promote a user to SUPER_ADMIN.',
    };
  }

  // Ensure all requested roles are valid
  for (const role of newRoles) {
    if (!ALL_ROLES.includes(role)) {
      return { allowed: false, reason: `Invalid role requested: ${role}` };
    }
  }

  // Must have at least one role; if none specified, default to CUSTOMER
  if (newRoles.length === 0) {
    return { allowed: false, reason: 'A user must retain at least one role (e.g. CUSTOMER).' };
  }

  return { allowed: true };
}
