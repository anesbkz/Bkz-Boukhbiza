import { describe, it, expect } from 'vitest';
import {
  ROLE_PERMISSIONS,
  getEffectivePermissions,
  hasPermission,
  hasRole,
  isSuperAdmin,
  isAdmin,
  isStaff,
  validateRoleTransition,
  ALL_ROLES,
} from './permissions';
import { UserProfile } from '@/types/models';
import { AppRole, AppPermission } from '@/types/rbac';

const mockCustomer: UserProfile = {
  uid: 'cust-123',
  email: 'subject@ziron.dz',
  displayName: 'Subject Zero',
  photoURL: '',
  phoneNumber: '+213555000111',
  status: 'active',
  roles: ['CUSTOMER'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  onboardingCompleted: true,
  communityAccess: false,
  schoolAccess: false,
  xp: 0,
  level: 1,
  locale: 'en',
};

const mockAdmin: UserProfile = {
  ...mockCustomer,
  uid: 'admin-456',
  email: 'admin@virexon.com',
  displayName: 'Operations Admin',
  roles: ['ADMIN'],
};

const mockSuperAdmin: UserProfile = {
  ...mockCustomer,
  uid: 'super-789',
  email: 'superadmin.test@virexon-biosciences.com',
  displayName: 'Root Architect',
  roles: ['SUPER_ADMIN'],
};

const mockCommunityManager: UserProfile = {
  ...mockCustomer,
  uid: 'comm-001',
  email: 'community@virexon.com',
  displayName: 'Community Moderator',
  roles: ['COMMUNITY_MANAGER'],
};

describe('Role & Permission Aggregation Engine', () => {
  it('correctly grants MANAGE_ALL and full permissions to SUPER_ADMIN', () => {
    expect(isSuperAdmin(mockSuperAdmin)).toBe(true);
    expect(isAdmin(mockSuperAdmin)).toBe(true);
    expect(isStaff(mockSuperAdmin)).toBe(true);
    expect(hasPermission(mockSuperAdmin, 'MANAGE_ALL')).toBe(true);
    expect(hasPermission(mockSuperAdmin, 'MANAGE_ADMINS')).toBe(true);
    expect(hasPermission(mockSuperAdmin, 'MANAGE_ROLES')).toBe(true);
    expect(hasPermission(mockSuperAdmin, 'MANAGE_SETTINGS')).toBe(true);
  });

  it('correctly aggregates ADMIN permissions while restricting SUPER_ADMIN only tasks', () => {
    expect(isAdmin(mockAdmin)).toBe(true);
    expect(isSuperAdmin(mockAdmin)).toBe(false);
    expect(isStaff(mockAdmin)).toBe(true);
    expect(hasPermission(mockAdmin, 'MANAGE_USERS')).toBe(true);
    expect(hasPermission(mockAdmin, 'MANAGE_ROLES')).toBe(true);
    expect(hasPermission(mockAdmin, 'MANAGE_COMMUNITY')).toBe(true);
    // ADMIN does not have MANAGE_ALL or MANAGE_ADMINS
    expect(hasPermission(mockAdmin, 'MANAGE_ALL')).toBe(false);
    expect(hasPermission(mockAdmin, 'MANAGE_ADMINS')).toBe(false);
  });

  it('strictly denies administrative permissions to standard CUSTOMER', () => {
    expect(isStaff(mockCustomer)).toBe(false);
    expect(isAdmin(mockCustomer)).toBe(false);
    expect(isSuperAdmin(mockCustomer)).toBe(false);
    expect(hasPermission(mockCustomer, 'MANAGE_USERS')).toBe(false);
    expect(hasPermission(mockCustomer, 'MANAGE_ROLES')).toBe(false);
    expect(hasPermission(mockCustomer, 'VIEW_AUDIT_LOGS')).toBe(false);
    expect(hasPermission(mockCustomer, 'MANAGE_CMS')).toBe(false);
  });

  it('correctly gates ACCESS_COMMUNITY and ACCESS_SCHOOL based on customer entitlement flags', () => {
    // Unactivated customer
    expect(hasPermission(mockCustomer, 'ACCESS_COMMUNITY')).toBe(false);
    expect(hasPermission(mockCustomer, 'ACCESS_SCHOOL')).toBe(false);

    // Customer with community entitlement
    const commCustomer: UserProfile = { ...mockCustomer, communityAccess: true };
    expect(hasPermission(commCustomer, 'ACCESS_COMMUNITY')).toBe(true);
    expect(hasPermission(commCustomer, 'ACCESS_SCHOOL')).toBe(false);

    // Customer with school entitlement
    const schoolCustomer: UserProfile = { ...mockCustomer, schoolAccess: true };
    expect(hasPermission(schoolCustomer, 'ACCESS_COMMUNITY')).toBe(false);
    expect(hasPermission(schoolCustomer, 'ACCESS_SCHOOL')).toBe(true);

    // Customer with both entitlements
    const fullyEntitled: UserProfile = { ...mockCustomer, communityAccess: true, schoolAccess: true };
    expect(hasPermission(fullyEntitled, 'ACCESS_COMMUNITY')).toBe(true);
    expect(hasPermission(fullyEntitled, 'ACCESS_SCHOOL')).toBe(true);

    // Entitled customer NEVER receives administrative or moderation privileges
    expect(hasPermission(fullyEntitled, 'MANAGE_COMMUNITY')).toBe(false);
    expect(hasPermission(fullyEntitled, 'MANAGE_SCHOOL')).toBe(false);
    expect(hasPermission(fullyEntitled, 'MANAGE_USERS')).toBe(false);
    expect(hasPermission(fullyEntitled, 'MANAGE_ROLES')).toBe(false);
    expect(hasPermission(fullyEntitled, 'VIEW_AUDIT_LOGS')).toBe(false);
  });

  it('aggregates permissions across multiple assigned roles without duplicates', () => {
    const multiRoleUser: UserProfile = {
      ...mockCustomer,
      roles: ['COMMUNITY_MANAGER', 'SCHOOL_MANAGER'],
    };
    const perms = getEffectivePermissions(multiRoleUser.roles);
    expect(perms).toContain('MANAGE_COMMUNITY');
    expect(perms).toContain('MODERATE_COMMUNITY');
    expect(perms).toContain('MANAGE_SCHOOL');
    expect(perms).toContain('MANAGE_COURSES');
    // Ensure uniqueness
    const uniquePerms = new Set(perms);
    expect(perms.length).toBe(uniquePerms.size);
  });
});

describe('Strict Anti-Privilege Escalation Governance', () => {
  it('blocks unauthenticated actors from modifying roles', () => {
    const result = validateRoleTransition(null, mockCustomer, ['ADMIN']);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Unauthenticated actor/);
  });

  it('blocks inactive or suspended staff from modifying roles', () => {
    const suspendedAdmin: UserProfile = {
      ...mockAdmin,
      status: 'suspended',
    };
    const result = validateRoleTransition(suspendedAdmin, mockCustomer, ['ADMIN']);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Inactive or suspended/);
  });

  it('blocks customers from self-assigning any staff role', () => {
    const result = validateRoleTransition(mockCustomer, mockCustomer, ['ADMIN']);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Actor lacks MANAGE_ROLES/);
  });

  it('blocks standard ADMIN from promoting self or others to SUPER_ADMIN', () => {
    const escalationAttempt = validateRoleTransition(mockAdmin, mockCustomer, ['SUPER_ADMIN']);
    expect(escalationAttempt.allowed).toBe(false);
    expect(escalationAttempt.reason).toMatch(/Privilege escalation blocked/);
  });

  it('blocks standard ADMIN from modifying or demoting an existing SUPER_ADMIN', () => {
    const modifySuperAdmin = validateRoleTransition(mockAdmin, mockSuperAdmin, ['CUSTOMER']);
    expect(modifySuperAdmin.allowed).toBe(false);
    expect(modifySuperAdmin.reason).toMatch(/Privilege boundary/);
  });

  it('allows SUPER_ADMIN to assign any role, including promoting or demoting SUPER_ADMIN', () => {
    const promoteResult = validateRoleTransition(mockSuperAdmin, mockCustomer, ['ADMIN', 'SCHOOL_MANAGER']);
    expect(promoteResult.allowed).toBe(true);

    const superAdminPromotion = validateRoleTransition(mockSuperAdmin, mockAdmin, ['SUPER_ADMIN']);
    expect(superAdminPromotion.allowed).toBe(true);
  });

  it('allows standard ADMIN to assign standard staff and customer roles', () => {
    const grantSupport = validateRoleTransition(mockAdmin, mockCustomer, ['SUPPORT']);
    expect(grantSupport.allowed).toBe(true);

    const grantCommunity = validateRoleTransition(mockAdmin, mockCustomer, ['COMMUNITY_MANAGER']);
    expect(grantCommunity.allowed).toBe(true);
  });

  it('rejects completely invalid role strings', () => {
    const invalidRoleAttempt = validateRoleTransition(mockSuperAdmin, mockCustomer, ['HACKER_ROLE' as AppRole]);
    expect(invalidRoleAttempt.allowed).toBe(false);
    expect(invalidRoleAttempt.reason).toMatch(/Invalid role/);
  });

  it('rejects removing all roles (must retain at least CUSTOMER)', () => {
    const emptyRolesAttempt = validateRoleTransition(mockSuperAdmin, mockCustomer, []);
    expect(emptyRolesAttempt.allowed).toBe(false);
    expect(emptyRolesAttempt.reason).toMatch(/at least one role/);
  });
});
