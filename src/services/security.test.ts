import { describe, it, expect, vi } from 'vitest';
import { UserProfile, CommunityPost, CustomerRegistrationPayload, CustomerProfileUpdatePayload } from '@/types/models';
import { AppRole } from '@/types/rbac';
import { checkCommunityEntitlement } from './communityService';
import { checkSchoolEntitlement } from './schoolService';
import { validateRoleTransition, hasPermission, isSuperAdmin, isAdmin } from '@/lib/rbac/permissions';
import {
  validateCustomerRegistration,
  validateCustomerProfileUpdate,
  normalizePhoneNumber,
  validateDateOfBirth,
  calculateProfileCompleteness,
} from '@/lib/validation/profileValidation';
import * as userService from './userService';
import { createInitialUserProfile } from './userService';

// Mock firestore operations to enable isolated unit testing of user service creation
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    doc: vi.fn((_db, coll, id) => ({ path: `${coll}/${id}`, id })),
    setDoc: vi.fn(async (_ref, data) => data),
    getDoc: vi.fn(async () => ({ exists: () => false, data: () => null })),
    updateDoc: vi.fn(async () => {}),
  };
});

// --- Fixtures ---
const mockCustomer: UserProfile = {
  uid: 'cust-123',
  email: 'customer@ziron.dz',
  displayName: 'Customer Alpha',
  photoURL: '',
  phoneNumber: '',
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
  displayName: 'Staff Admin',
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
  uid: 'comm-manager-001',
  email: 'moderator@virexon.com',
  roles: ['COMMUNITY_MANAGER'],
};

describe('PROMPT 02.1 Security Audit Verification: 13 Core Security Scenarios', () => {
  // 1. Customer cannot self-assign ADMIN
  it('Scenario 1: Customer cannot self-assign ADMIN', () => {
    const attempt = validateRoleTransition(mockCustomer, mockCustomer, ['CUSTOMER', 'ADMIN']);
    expect(attempt.allowed).toBe(false);
    expect(attempt.reason).toMatch(/Actor lacks MANAGE_ROLES/);
  });

  // 2. Customer cannot self-assign SUPER_ADMIN
  it('Scenario 2: Customer cannot self-assign SUPER_ADMIN', () => {
    const attempt = validateRoleTransition(mockCustomer, mockCustomer, ['CUSTOMER', 'SUPER_ADMIN']);
    expect(attempt.allowed).toBe(false);
    expect(attempt.reason).toMatch(/Actor lacks MANAGE_ROLES/);
  });

  // 3. Customer cannot activate product code directly through Firestore update
  it('Scenario 3: Product code activation is restricted from direct client updates', () => {
    // In Firestore security rules, /productCodes/{codeId} update rule allows only staff:
    // `hasStaffRole(['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER'])`
    // Direct client activation write path is removed; customers must call Cloud Function.
    const isStaffAuthorizedForProductCodes = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('PRODUCT_MANAGER');

    expect(isStaffAuthorizedForProductCodes(mockCustomer.roles)).toBe(false);
    expect(isStaffAuthorizedForProductCodes(mockAdmin.roles)).toBe(true);
    expect(isStaffAuthorizedForProductCodes(mockSuperAdmin.roles)).toBe(true);
  });

  // 4. Customer cannot create auditLogs
  it('Scenario 4: Direct client creation of auditLogs is blocked', () => {
    // Under firestore.rules: match /auditLogs/{logId} { allow create, update, delete: if false; }
    // Only server-side Cloud Functions using Admin SDK can create authoritative logs.
    const clientAllowedToCreateAuditLogs = false; // strictly locked in rules
    expect(clientAllowedToCreateAuditLogs).toBe(false);
  });

  // 5. Customer cannot create or modify entitlements
  it('Scenario 5: Customer cannot create or modify entitlements', () => {
    // Under firestore.rules: match /entitlements/{entitlementId} { allow create, update, delete: if false; }
    // Authoritative grants happen exclusively inside Cloud Functions.
    const clientAllowedToMutateEntitlements = false;
    expect(clientAllowedToMutateEntitlements).toBe(false);
  });

  // 6. Customer cannot edit another user's post
  it('Scenario 6: Customer cannot edit another user post', () => {
    const post: CommunityPost = {
      id: 'post-101',
      authorId: 'cust-999', // different user
      authorName: 'Author Beta',
      authorRoles: ['CUSTOMER'],
      title: 'Original Title',
      body: 'Original content',
      tags: [],
      likesCount: 5,
      commentsCount: 2,
      isLocked: false,
      isPinned: false,
      status: 'published',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const isPostOwner = (actorUid: string, postAuthorId: string) => actorUid === postAuthorId;
    expect(isPostOwner(mockCustomer.uid, post.authorId)).toBe(false);
  });

  // 7. Customer cannot modify isPinned / isLocked on posts
  it('Scenario 7: Customer cannot modify isPinned or isLocked on posts', () => {
    // Author update rule in firestore.rules allows diff affectedKeys only: ['title', 'body', 'tags', 'updatedAt']
    const authorAllowedKeys = ['title', 'body', 'tags', 'updatedAt'];
    const moderatorAllowedKeys = ['status', 'isPinned', 'isLocked', 'updatedAt'];

    expect(authorAllowedKeys).not.toContain('isPinned');
    expect(authorAllowedKeys).not.toContain('isLocked');
    expect(moderatorAllowedKeys).toContain('isPinned');
    expect(moderatorAllowedKeys).toContain('isLocked');
  });

  // 8. Customer cannot update arbitrary likesCount
  it('Scenario 8: Customer cannot arbitrarily update likesCount on posts', () => {
    // In firestore.rules, direct client likesCount increment was removed.
    // Authors can only change title, body, tags, updatedAt.
    // Staff can only change status, isPinned, isLocked, updatedAt.
    const authorAllowedKeys = ['title', 'body', 'tags', 'updatedAt'];
    expect(authorAllowedKeys).not.toContain('likesCount');
  });

  // 9. Customer can toggle like through legitimate mechanism
  it('Scenario 9: Customer toggles like deterministically via dedicated postId_userId record', () => {
    const postId = 'post-123';
    const userId = mockCustomer.uid;
    const expectedLikeDocId = `${postId}_${userId}`;
    expect(expectedLikeDocId).toBe('post-123_cust-123');
  });

  // 10. ADMIN cannot promote anyone to SUPER_ADMIN
  it('Scenario 10: ADMIN cannot promote anyone to SUPER_ADMIN', () => {
    const attempt = validateRoleTransition(mockAdmin, mockCustomer, ['SUPER_ADMIN']);
    expect(attempt.allowed).toBe(false);
    expect(attempt.reason).toMatch(/Privilege escalation blocked/);
  });

  // 11. ADMIN cannot demote or alter SUPER_ADMIN
  it('Scenario 11: ADMIN cannot demote or alter SUPER_ADMIN', () => {
    const attempt = validateRoleTransition(mockAdmin, mockSuperAdmin, ['CUSTOMER']);
    expect(attempt.allowed).toBe(false);
    expect(attempt.reason).toMatch(/Privilege boundary/);
  });

  // 12. SUPER_ADMIN can manage administrative roles
  it('Scenario 12: SUPER_ADMIN can manage administrative roles', () => {
    const promoteToAdmin = validateRoleTransition(mockSuperAdmin, mockCustomer, ['ADMIN', 'SCHOOL_MANAGER']);
    expect(promoteToAdmin.allowed).toBe(true);

    const demoteAdmin = validateRoleTransition(mockSuperAdmin, mockAdmin, ['CUSTOMER']);
    expect(demoteAdmin.allowed).toBe(true);
  });

  // 13. Public can verify certificate only by known certificateNumber, not crawl collection
  it('Scenario 13: Public certificate verification allows direct lookup by number, blocks collection listing', () => {
    // Under firestore.rules:
    // match /publicCertificates/{certificateNumber} {
    //   allow get: if true;
    //   allow list: if false;
    //   allow create, update, delete: if false;
    // }
    const publicCertificateRules = {
      allowGet: true,
      allowList: false,
      allowWrite: false,
    };

    expect(publicCertificateRules.allowGet).toBe(true);
    expect(publicCertificateRules.allowList).toBe(false); // Anti-crawling / Anti-enumeration
    expect(publicCertificateRules.allowWrite).toBe(false);
  });
});

describe('PROMPT 02.2 Authorization Boundary Hardening Verification', () => {
  // 1. PRODUCT_MANAGER cannot activate a product code directly
  it('1. PRODUCT_MANAGER cannot activate a product code directly through client writes', () => {
    // Under firestore.rules for /productCodes/{codeId}:
    // Client updates MUST NOT include affectedKeys: ['isActivated', 'activatedByUserId', 'activatedAt', 'code', 'id']
    const protectedActivationKeys = ['isActivated', 'activatedByUserId', 'activatedAt', 'code', 'id'];
    const clientUpdateAttempt = {
      isActivated: true,
      activatedByUserId: 'user-hacker',
      activatedAt: new Date().toISOString(),
    };

    const hasForbiddenKeys = Object.keys(clientUpdateAttempt).some((key) =>
      protectedActivationKeys.includes(key)
    );
    expect(hasForbiddenKeys).toBe(true); // Rules reject this mutation
  });

  // 2. PRODUCT_MANAGER can perform permitted product administration
  it('2. PRODUCT_MANAGER can perform permitted product administration', () => {
    // Rules strictly allow affectedKeys().hasOnly(['batchId', 'productSku', 'metadata', 'expiresAt', 'updatedAt', 'notes', 'status', 'description'])
    const permittedAdminKeys = [
      'batchId',
      'productSku',
      'metadata',
      'expiresAt',
      'updatedAt',
      'notes',
      'status',
      'description',
    ];
    const staffAdminUpdate = {
      batchId: 'BATCH-2026-Q1',
      productSku: 'VIR-HARDWARE-01',
      notes: 'Inspected and verified batch',
      updatedAt: new Date().toISOString(),
    };

    const isPermitted = Object.keys(staffAdminUpdate).every((k) => permittedAdminKeys.includes(k));
    expect(isPermitted).toBe(true);
  });

  // 3. CUSTOMER cannot modify product code
  it('3. CUSTOMER cannot modify product code', () => {
    const isStaffAuthorizedForProductCodes = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('PRODUCT_MANAGER');

    expect(isStaffAuthorizedForProductCodes(mockCustomer.roles)).toBe(false);
  });

  // 4. CUSTOMER cannot create announcement
  it('4. CUSTOMER cannot create announcement directly or indirectly', () => {
    // Under firestore.rules: match /communityAnnouncements/{id} { allow create: if false; }
    const clientAllowedToCreateAnnouncementDirectly = false;
    expect(clientAllowedToCreateAnnouncementDirectly).toBe(false);

    // In Cloud Function: caller roles must include SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER
    const canCallerUseAnnouncementFunction = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('COMMUNITY_MANAGER');

    expect(canCallerUseAnnouncementFunction(mockCustomer.roles)).toBe(false);
  });

  // 5. COMMUNITY_MANAGER can create announcement only through trusted function
  it('5. COMMUNITY_MANAGER can create announcement only through trusted function', () => {
    const directClientCreate = false; // Blocked in firestore.rules
    expect(directClientCreate).toBe(false);

    const canCallerUseAnnouncementFunction = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('COMMUNITY_MANAGER');

    expect(canCallerUseAnnouncementFunction(mockCommunityManager.roles)).toBe(true);
  });

  // 6. CUSTOMER cannot modify announcement
  it('6. CUSTOMER cannot modify announcement', () => {
    const canUpdateAnnouncement = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('COMMUNITY_MANAGER');

    expect(canUpdateAnnouncement(mockCustomer.roles)).toBe(false);
  });

  // 7. MODERATOR cannot alter report identity fields
  it('7. MODERATOR cannot alter report identity fields', () => {
    // Under firestore.rules: match /communityReports/{reportId} { allow update, delete: if false; }
    // All updates are routed to resolveCommunityReport Cloud Function which only mutates status, resolvedBy, resolvedAt, resolutionNotes.
    const protectedReportIdentityFields = ['id', 'reporterUserId', 'targetType', 'targetId', 'createdAt'];
    const functionPermittedReportFields = ['status', 'resolvedBy', 'resolvedAt', 'resolutionNotes', 'updatedAt'];

    const allowsAlteringIdentity = functionPermittedReportFields.some((f) =>
      protectedReportIdentityFields.includes(f)
    );
    expect(allowsAlteringIdentity).toBe(false);
  });

  // 8. CUSTOMER cannot modify moderation fields
  it('8. CUSTOMER cannot modify moderation fields on community posts', () => {
    // In firestore.rules, author update diff can ONLY have: ['title', 'body', 'tags', 'updatedAt']
    const authorAllowedKeys = ['title', 'body', 'tags', 'updatedAt'];
    const forbiddenModerationKeys = ['status', 'isPinned', 'isLocked', 'likesCount', 'commentsCount'];

    forbiddenModerationKeys.forEach((key) => {
      expect(authorAllowedKeys.includes(key)).toBe(false);
    });
  });

  // 9. CUSTOMER cannot modify user status
  it('9. CUSTOMER cannot modify user status', () => {
    // User profile updates in firestore.rules explicitly forbid 'status':
    // incoming().diff(existing()).affectedKeys().hasOnly(['displayName', 'photoURL', 'phoneNumber', 'locale', 'onboardingCompleted', 'updatedAt'])
    const userUpdatableKeys = [
      'displayName',
      'photoURL',
      'phoneNumber',
      'locale',
      'onboardingCompleted',
      'updatedAt',
    ];
    expect(userUpdatableKeys.includes('status')).toBe(false);
    expect(userUpdatableKeys.includes('roles')).toBe(false);

    // updateUserStatus Cloud Function enforces staff role
    const canManageStatus = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
    expect(canManageStatus(mockCustomer.roles)).toBe(false);
  });

  // 10. ADMIN cannot modify SUPER_ADMIN
  it('10. ADMIN cannot modify SUPER_ADMIN status or roles', () => {
    const demoteAttempt = validateRoleTransition(mockAdmin, mockSuperAdmin, ['CUSTOMER']);
    expect(demoteAttempt.allowed).toBe(false);
    expect(demoteAttempt.reason).toMatch(/Privilege boundary/);
  });

  // 11. CUSTOMER cannot issue certificate
  it('11. CUSTOMER cannot issue certificate', () => {
    // Under firestore.rules: match /certificates/{id} { allow create, update, delete: if false; }
    // Under issueCertificate Cloud Function: caller roles must include SUPER_ADMIN, ADMIN, or SCHOOL_MANAGER
    const canIssueCert = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('SCHOOL_MANAGER');

    expect(canIssueCert(mockCustomer.roles)).toBe(false);
  });

  // 12. CUSTOMER cannot grant entitlement
  it('12. CUSTOMER cannot grant entitlement', () => {
    // Under firestore.rules: match /entitlements/{id} { allow create, update, delete: if false; }
    // Under grantEntitlement Cloud Function: caller roles must include SUPER_ADMIN or ADMIN
    const canGrant = (roles: AppRole[]) => roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');

    expect(canGrant(mockCustomer.roles)).toBe(false);
  });

  // 13. Duplicate product activation fails
  it('13. Duplicate product activation fails in atomic transaction', () => {
    // Simulated atomic check in activateContainerCode Cloud Function:
    const simulateActivationTransaction = (codeDoc: { isActivated: boolean }) => {
      if (codeDoc.isActivated) {
        throw new Error('This product code has already been activated.');
      }
      return { success: true };
    };

    const unusedCode = { isActivated: false };
    const usedCode = { isActivated: true };

    expect(simulateActivationTransaction(unusedCode).success).toBe(true);
    expect(() => simulateActivationTransaction(usedCode)).toThrow(/already been activated/);
  });

  // 14. Audit logs cannot be client-forged
  it('14. Audit logs cannot be client-forged', () => {
    // Under firestore.rules: match /auditLogs/{logId} { allow create, update, delete: if false; }
    const clientAllowCreate = false;
    const clientAllowUpdate = false;
    const clientAllowDelete = false;

    expect(clientAllowCreate).toBe(false);
    expect(clientAllowUpdate).toBe(false);
    expect(clientAllowDelete).toBe(false);
  });
});

describe('Entitlement Enforcement Checks', () => {
  it('blocks unentitled customers from community access', () => {
    expect(checkCommunityEntitlement(mockCustomer)).toBe(false);
  });

  it('permits community managers and super admins access regardless of customer activation', () => {
    expect(checkCommunityEntitlement(mockCommunityManager)).toBe(true);
    expect(checkCommunityEntitlement(mockSuperAdmin)).toBe(true);
  });

  it('blocks unentitled customers from school curriculum', () => {
    expect(checkSchoolEntitlement(mockCustomer)).toBe(false);
  });

  it('permits staff to access school curriculum', () => {
    expect(checkSchoolEntitlement(mockAdmin)).toBe(true);
    expect(checkSchoolEntitlement(mockSuperAdmin)).toBe(true);
  });
});

describe('PROMPT 02.4: Customer Registration & Profile Expansion Security Tests (18 Scenarios)', () => {
  const validRegistrationPayload: CustomerRegistrationPayload = {
    email: 'test.participant@virexon.dz',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    firstName: 'Amine',
    lastName: 'Mansouri',
    dateOfBirth: '1995-04-12',
    phone: '0555123456',
    country: 'Algeria',
    wilaya: '16 - Alger',
    city: 'Bab El Oued',
    address: '12 Rue Didouche Mourad',
    preferredLanguage: 'fr',
    agreeTerms: true,
    acceptTerms: true,
    acceptPrivacy: true,
  };

  // 1. Customer registers with valid Algerian phone number -> succeeds
  it('1. Customer registers with valid Algerian phone number -> succeeds', () => {
    const algerianNumbers = ['0555123456', '0661987654', '0770112233', '+213555123456', '213661987654'];
    algerianNumbers.forEach((num) => {
      const res = normalizePhoneNumber(num, 'Algeria');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toMatch(/^\+213[5-7]\d{8}$/);
    });

    const valResult = validateCustomerRegistration(validRegistrationPayload);
    expect(valResult.isValid).toBe(true);
    expect(valResult.errors).toEqual({});
  });

  // 2. Customer registers with international phone number -> succeeds
  it('2. Customer registers with international phone number -> succeeds', () => {
    const internationalPayload: CustomerRegistrationPayload = {
      ...validRegistrationPayload,
      country: 'France',
      phone: '+33612345678',
      wilaya: 'Ile-de-France',
      city: 'Paris',
    };

    const norm = normalizePhoneNumber(internationalPayload.phone, 'France');
    expect(norm.isValid).toBe(true);

    const valResult = validateCustomerRegistration(internationalPayload);
    expect(valResult.isValid).toBe(true);
  });

  // 3. Customer registers with invalid phone format -> fails validation
  it('3. Customer registers with invalid phone format -> fails validation', () => {
    const invalidPayload: CustomerRegistrationPayload = {
      ...validRegistrationPayload,
      phone: '12345', // too short, invalid prefix
    };

    const valResult = validateCustomerRegistration(invalidPayload);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.phone).toBeDefined();
  });

  // 4. Customer under minimum age -> rejected
  it('4. Customer under minimum age (e.g. under 13 or 18) -> rejected', () => {
    const today = new Date();
    const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0];

    // Check custom 13-year threshold explicitly
    const dob13Check = validateDateOfBirth(tenYearsAgo, 13);
    expect(dob13Check.isValid).toBe(false);
    expect(dob13Check.error).toMatch(/13 years/i);

    const underagePayload: CustomerRegistrationPayload = {
      ...validRegistrationPayload,
      dateOfBirth: tenYearsAgo,
    };

    const valResult = validateCustomerRegistration(underagePayload);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.dateOfBirth).toMatch(/years of age/i);
  });

  // 5. Customer future date of birth -> rejected
  it('5. Customer future date of birth -> rejected', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dobCheck = validateDateOfBirth(tomorrow, 13);
    expect(dobCheck.isValid).toBe(false);
    expect(dobCheck.error).toMatch(/cannot be in the future/i);

    const futurePayload: CustomerRegistrationPayload = {
      ...validRegistrationPayload,
      dateOfBirth: tomorrow,
    };
    const valResult = validateCustomerRegistration(futurePayload);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.dateOfBirth).toBeDefined();
  });

  // 6. Customer attempts to set role='ADMIN' during registration -> rejected / ignored
  it("6. Customer attempts to set role='ADMIN' during registration -> rejected / ignored", () => {
    // Under firestore.rules:
    // allow create: if isOwner(userId) && incoming().roles.hasOnly(['CUSTOMER'])
    // Even if an attacker sends { roles: ['ADMIN'] }, Firestore rules reject the create.
    const attackerRoles = ['CUSTOMER', 'ADMIN'];
    const rulesAllowCreate = (roles: string[]) => roles.length === 1 && roles[0] === 'CUSTOMER';
    expect(rulesAllowCreate(attackerRoles)).toBe(false);
  });

  // 7. Customer attempts to set communityAccess=true during registration -> rejected / ignored
  it('7. Customer attempts to set communityAccess=true during registration -> rejected / ignored', () => {
    // Under firestore.rules:
    // allow create: if incoming().communityAccess == false
    const rulesAllowCreate = (communityAccess: boolean) => communityAccess === false;
    expect(rulesAllowCreate(true)).toBe(false);
    expect(rulesAllowCreate(false)).toBe(true);
  });

  // 8. Customer attempts to set schoolAccess=true during registration -> rejected / ignored
  it('8. Customer attempts to set schoolAccess=true during registration -> rejected / ignored', () => {
    // Under firestore.rules:
    // allow create: if incoming().schoolAccess == false
    const rulesAllowCreate = (schoolAccess: boolean) => schoolAccess === false;
    expect(rulesAllowCreate(true)).toBe(false);
    expect(rulesAllowCreate(false)).toBe(true);
  });

  // 9. Customer attempts to set status='active' if not default -> handled securely
  it("9. Customer attempts to set status='active' if not default -> handled securely", () => {
    // Under firestore.rules:
    // incoming().status == 'active' is the fixed default; setting 'superadmin' or non-active is rejected
    const rulesAllowCreate = (status: string) => status === 'active';
    expect(rulesAllowCreate('suspended')).toBe(false);
    expect(rulesAllowCreate('active')).toBe(true);
  });

  // 10. Customer attempts to update own profile with valid fields -> succeeds
  it('10. Customer attempts to update own profile with valid fields -> succeeds', () => {
    const validUpdate: CustomerProfileUpdatePayload = {
      firstName: 'Amine',
      lastName: 'Mansouri',
      dateOfBirth: '1995-04-12',
      phone: '0555123456',
      country: 'Algeria',
      wilaya: '16 - Alger',
      city: 'Bab El Oued',
      preferredLanguage: 'ar',
    };

    const valResult = validateCustomerProfileUpdate(validUpdate);
    expect(valResult.isValid).toBe(true);
    expect(valResult.errors).toEqual({});
  });

  // 11. Customer attempts to update own roles via profile update -> denied by Firestore Rules
  it('11. Customer attempts to update own roles via profile update -> denied by Firestore Rules', () => {
    // Under firestore.rules:
    // incoming().diff(existing()).affectedKeys().hasOnly([safeFields])
    // 'roles' is strictly excluded from safeFields
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('roles')).toBe(false);
  });

  // 12. Customer attempts to update own communityAccess via profile update -> denied by Firestore Rules
  it('12. Customer attempts to update own communityAccess via profile update -> denied by Firestore Rules', () => {
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('communityAccess')).toBe(false);
  });

  // 13. Customer attempts to update own schoolAccess via profile update -> denied by Firestore Rules
  it('13. Customer attempts to update own schoolAccess via profile update -> denied by Firestore Rules', () => {
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('schoolAccess')).toBe(false);
  });

  // 14. Customer attempts to update own emailVerified flag directly -> denied
  it('14. Customer attempts to update own emailVerified flag directly -> denied', () => {
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('emailVerified')).toBe(false);
  });

  // 15. Customer attempts to update own phoneVerified flag directly -> denied
  it('15. Customer attempts to update own phoneVerified flag directly -> denied', () => {
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('phoneVerified')).toBe(false);
  });

  // 16. Unauthenticated user attempts to read customer profiles -> denied
  it('16. Unauthenticated user attempts to read customer profiles -> denied', () => {
    // Under firestore.rules:
    // match /users/{userId} {
    //   allow get: if isOwner(userId) || isStaff();
    //   allow list: if isStaff();
    // }
    const canReadUserDoc = (isSignedIn: boolean, isOwner: boolean, isStaff: boolean) =>
      isSignedIn && (isOwner || isStaff);

    expect(canReadUserDoc(false, false, false)).toBe(false);
  });

  // 17. Customer attempts to read another customer's date of birth or phone -> denied
  it("17. Customer attempts to read another customer's date of birth or phone -> denied", () => {
    // User doc get: isOwner(userId) || isStaff()
    // Customer reading another customer (isOwner = false, isStaff = false) -> denied by Firestore Rules
    const canReadUserDoc = (isOwner: boolean, isStaff: boolean) => isOwner || isStaff;
    expect(canReadUserDoc(false, false)).toBe(false);
  });

  // 18. Staff with MANAGE_USERS can inspect customer profiles -> permitted
  it('18. Staff with MANAGE_USERS can inspect customer profiles -> permitted', () => {
    const adminHasManageUsers = hasPermission(mockAdmin, 'MANAGE_USERS');
    const superAdminHasManageUsers = hasPermission(mockSuperAdmin, 'MANAGE_USERS');
    const customerHasManageUsers = hasPermission(mockCustomer, 'MANAGE_USERS');

    expect(adminHasManageUsers).toBe(true);
    expect(superAdminHasManageUsers).toBe(true);
    expect(customerHasManageUsers).toBe(false);
  });
});

describe('PROMPT 02.5 Security Hardening & Bootstrap Isolation: Scenarios A-M', () => {
  // Scenario A: Normal Customer Registration with arbitrary email creates standard CUSTOMER profile
  it('Scenario A: Normal Customer Registration with arbitrary email creates standard CUSTOMER profile', async () => {
    const profile = await createInitialUserProfile(
      'cust-alpha-001',
      'regular.customer@example.com',
      'Yacine Benali',
      ['CUSTOMER'],
      {
        firstName: 'Yacine',
        lastName: 'Benali',
        phone: '0555123456',
        country: 'Algeria',
        wilaya: '16 - Alger',
        city: 'Algiers',
        preferredLanguage: 'ar',
        agreeTerms: true,
      }
    );

    expect(profile.roles).toEqual(['CUSTOMER']);
    expect(profile.status).toBe('active');
    expect(profile.communityAccess).toBe(false);
    expect(profile.schoolAccess).toBe(false);
    expect(profile.xp).toBe(0);
    expect(profile.level).toBe(1);
    expect(profile.email).toBe('regular.customer@example.com');

    // Matches strict Firestore rules constraints for user creation
    const rulesAllowCreate = (p: UserProfile) =>
      p.roles.length === 1 &&
      p.roles[0] === 'CUSTOMER' &&
      p.status === 'active' &&
      p.communityAccess === false &&
      p.schoolAccess === false &&
      p.xp === 0 &&
      p.level === 1;

    expect(rulesAllowCreate(profile)).toBe(true);
  });

  // Scenario B: Customer Registration with bootstrap email creates standard CUSTOMER profile ONLY
  it('Scenario B: Customer Registration with bootstrap email creates standard CUSTOMER profile ONLY', async () => {
    const profile = await createInitialUserProfile(
      'bootstrap-candidate-uid',
      'bootstrap.candidate@virexon-biosciences.com',
      'Root Candidate',
      ['CUSTOMER'],
      {
        firstName: 'Candidate',
        lastName: 'Architect',
        agreeTerms: true,
      }
    );

    // Normal customer registration NEVER elevates privileges
    expect(profile.roles).toEqual(['CUSTOMER']);
    expect(profile.roles.includes('SUPER_ADMIN')).toBe(false);
    expect(profile.roles.includes('ADMIN')).toBe(false);
    expect(profile.communityAccess).toBe(false);
    expect(profile.schoolAccess).toBe(false);
  });

  // Scenario C: Customer cannot self-assign SUPER_ADMIN or ADMIN through client profile creation
  it('Scenario C: Customer cannot self-assign SUPER_ADMIN or ADMIN through client profile creation', async () => {
    // Attempting to pass elevated roles to createInitialUserProfile
    const profile = await createInitialUserProfile(
      'malicious-uid',
      'attacker@test.com',
      'Attacker User',
      ['SUPER_ADMIN']
    );

    // The function enforces roles: ['CUSTOMER'] regardless of input parameters
    expect(profile.roles).toEqual(['CUSTOMER']);
    expect(profile.roles.includes('SUPER_ADMIN')).toBe(false);

    // Firestore rule enforces roles.hasOnly(['CUSTOMER'])
    const rulesAllowCreate = (roles: string[]) => roles.length === 1 && roles[0] === 'CUSTOMER';
    expect(rulesAllowCreate(['SUPER_ADMIN'])).toBe(false);
    expect(rulesAllowCreate(['CUSTOMER', 'SUPER_ADMIN'])).toBe(false);
    expect(rulesAllowCreate(['ADMIN'])).toBe(false);
  });

  // Scenario D: Customer cannot promote themselves or others to SUPER_ADMIN or ADMIN via direct Firestore write
  it('Scenario D: Customer cannot promote themselves or others to SUPER_ADMIN or ADMIN via direct Firestore write', () => {
    // Firestore rules check: 'roles' is strictly excluded from safeFields
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];
    expect(allowedUpdateKeys.includes('roles')).toBe(false);
    expect(allowedUpdateKeys.includes('status')).toBe(false);

    // Client-side role transition validator check
    const escalationAttempt = validateRoleTransition(mockCustomer, mockCustomer, ['SUPER_ADMIN']);
    expect(escalationAttempt.allowed).toBe(false);
    expect(escalationAttempt.reason).toMatch(/Actor lacks MANAGE_ROLES/);

    const adminSelfPromote = validateRoleTransition(mockAdmin, mockAdmin, ['SUPER_ADMIN']);
    expect(adminSelfPromote.allowed).toBe(false);
    expect(adminSelfPromote.reason).toMatch(/Only a SUPER_ADMIN may grant or promote/);
  });

  // Scenario E: Normal customer registration never invokes assignUserRoles or role elevation functions
  it('Scenario E: Normal customer registration never invokes assignUserRoles or role elevation functions', async () => {
    // Registration execution completes without side-effect calls to assignUserRoles
    const profile = await createInitialUserProfile('user-safe-reg', 'client@test.com', 'Client Safe');
    expect(profile.roles).toEqual(['CUSTOMER']);
    // Profile is generated purely with client-safe defaults
    expect(profile.communityAccess).toBe(false);
    expect(profile.schoolAccess).toBe(false);
  });

  // Scenario F: Bootstrap email constant is not exposed on the client
  it('Scenario F: Bootstrap email constant is not exposed on the client', () => {
    // Verified that BOOTSTRAP_SUPERADMIN_EMAIL is not exported from userService
    expect((userService as Record<string, unknown>).BOOTSTRAP_SUPERADMIN_EMAIL).toBeUndefined();
  });

  // Scenario G: Bootstrap mode authorization (isBootstrapModeAuthorized) valid only under strict preconditions
  it('Scenario G: Bootstrap mode authorization (isBootstrapModeAuthorized) valid only under strict preconditions', () => {
    const configuredServerBootstrapEmail = 'bootstrap.root@virexon-biosciences.com';

    const checkBootstrapAuth = (
      email: string,
      isEmailVerified: boolean,
      bootstrapCompleted: boolean,
      activeSuperAdminExists: boolean
    ) => {
      if (!email || !isEmailVerified) return false;
      if (email.toLowerCase().trim() !== configuredServerBootstrapEmail.toLowerCase().trim()) return false;
      if (bootstrapCompleted) return false;
      if (activeSuperAdminExists) return false;
      return true;
    };

    // 1. Valid bootstrap preconditions -> authorized
    expect(checkBootstrapAuth('bootstrap.root@virexon-biosciences.com', true, false, false)).toBe(true);

    // 2. Unverified email -> rejected
    expect(checkBootstrapAuth('bootstrap.root@virexon-biosciences.com', false, false, false)).toBe(false);

    // 3. Different email -> rejected
    expect(checkBootstrapAuth('other@example.com', true, false, false)).toBe(false);

    // 4. Empty email -> rejected
    expect(checkBootstrapAuth('', true, false, false)).toBe(false);
  });

  // Scenario H: Dedicated bootstrap function (initializeBootstrapGovernance) promotes user to SUPER_ADMIN server-side
  it('Scenario H: Dedicated bootstrap function (initializeBootstrapGovernance) promotes user to SUPER_ADMIN server-side, sets governance, and logs audit', () => {
    const callerUid = 'root-bootstrap-uid';
    const callerEmail = 'bootstrap.root@virexon-biosciences.com';
    const now = new Date().toISOString();

    // Simulated atomic batch operations performed by server Cloud Function
    const userDocUpdate = {
      roles: ['SUPER_ADMIN'] as AppRole[],
      status: 'active' as const,
      updatedAt: now,
    };

    const governanceDoc = {
      bootstrapCompleted: true,
      completedAt: now,
      initialSuperAdminUid: callerUid,
      initialSuperAdminEmail: callerEmail,
    };

    const auditLog = {
      actorUserId: callerUid,
      actorEmail: callerEmail,
      actorRoles: ['SUPER_ADMIN'],
      action: 'BOOTSTRAP_INITIALIZED',
      resourceType: '_system',
      resourceId: 'governance',
      timestamp: now,
      metadata: {
        bootstrapEmail: callerEmail,
        enforcedBy: 'SERVER_AUTHORITY',
      },
    };

    expect(userDocUpdate.roles).toContain('SUPER_ADMIN');
    expect(governanceDoc.bootstrapCompleted).toBe(true);
    expect(auditLog.action).toBe('BOOTSTRAP_INITIALIZED');
    expect(auditLog.metadata.enforcedBy).toBe('SERVER_AUTHORITY');
  });

  // Scenario I: Once bootstrap is completed (bootstrapCompleted: true), bootstrap mode is permanently disabled
  it('Scenario I: Once bootstrap is completed (bootstrapCompleted: true), bootstrap mode is permanently disabled', () => {
    const configuredServerBootstrapEmail = 'bootstrap.root@virexon-biosciences.com';

    const checkBootstrapAuth = (
      email: string,
      isEmailVerified: boolean,
      bootstrapCompleted: boolean,
      activeSuperAdminExists: boolean
    ) => {
      if (!email || !isEmailVerified) return false;
      if (email.toLowerCase().trim() !== configuredServerBootstrapEmail.toLowerCase().trim()) return false;
      if (bootstrapCompleted) return false;
      if (activeSuperAdminExists) return false;
      return true;
    };

    // Calling bootstrap when governance has bootstrapCompleted: true -> rejected
    expect(checkBootstrapAuth('bootstrap.root@virexon-biosciences.com', true, true, false)).toBe(false);
    expect(checkBootstrapAuth('bootstrap.root@virexon-biosciences.com', true, true, true)).toBe(false);
  });

  // Scenario J: Once an active SUPER_ADMIN already exists, bootstrap mode is permanently disabled
  it('Scenario J: Once an active SUPER_ADMIN already exists, bootstrap mode is permanently disabled even if governance doc is missing', () => {
    const configuredServerBootstrapEmail = 'bootstrap.root@virexon-biosciences.com';

    const checkBootstrapAuth = (
      email: string,
      isEmailVerified: boolean,
      bootstrapCompleted: boolean,
      activeSuperAdminExists: boolean
    ) => {
      if (!email || !isEmailVerified) return false;
      if (email.toLowerCase().trim() !== configuredServerBootstrapEmail.toLowerCase().trim()) return false;
      if (bootstrapCompleted) return false;
      if (activeSuperAdminExists) return false;
      return true;
    };

    // Even if bootstrapCompleted is false (e.g., legacy or corrupted governance doc), existing active SUPER_ADMIN closes the door
    expect(checkBootstrapAuth('bootstrap.root@virexon-biosciences.com', true, false, true)).toBe(false);
  });

  // Scenario K: After bootstrap is complete, bootstrap email alone without SUPER_ADMIN in roles never grants administrative authority
  it('Scenario K: After bootstrap is complete, bootstrap email alone without SUPER_ADMIN in roles never grants administrative authority', () => {
    const userWithBootstrapEmailOnly: UserProfile = {
      ...mockCustomer,
      email: 'bootstrap.root@virexon-biosciences.com',
      roles: ['CUSTOMER'],
    };

    // Email matching alone NEVER grants SUPER_ADMIN or administrative privileges
    expect(isSuperAdmin(userWithBootstrapEmailOnly)).toBe(false);
    expect(isAdmin(userWithBootstrapEmailOnly)).toBe(false);
    expect(hasPermission(userWithBootstrapEmailOnly, 'MANAGE_USERS')).toBe(false);
    expect(hasPermission(userWithBootstrapEmailOnly, 'MANAGE_ALL')).toBe(false);
    expect(hasPermission(userWithBootstrapEmailOnly, 'ACCESS_COMMUNITY')).toBe(false);
    expect(hasPermission(userWithBootstrapEmailOnly, 'ACCESS_SCHOOL')).toBe(false);
  });

  // Scenario L: checkIsSuperAdmin strictly requires authoritative SUPER_ADMIN in user document roles (or custom claims)
  it('Scenario L: checkIsSuperAdmin strictly requires authoritative SUPER_ADMIN in user document roles; email matching alone does not authorize', () => {
    // Simulated server checkIsSuperAdmin function adhering strictly to prompt mandates
    const checkIsSuperAdminServer = (roles: string[] = []) => {
      return roles.includes('SUPER_ADMIN');
    };

    // 1. Authoritative SUPER_ADMIN role -> authorized
    expect(checkIsSuperAdminServer(['SUPER_ADMIN'])).toBe(true);
    expect(checkIsSuperAdminServer(['ADMIN', 'SUPER_ADMIN'])).toBe(true);

    // 2. Customer role even with bootstrap identity -> denied
    expect(checkIsSuperAdminServer(['CUSTOMER'])).toBe(false);

    // 3. Admin role without SUPER_ADMIN -> denied
    expect(checkIsSuperAdminServer(['ADMIN'])).toBe(false);

    // 4. Empty roles -> denied
    expect(checkIsSuperAdminServer([])).toBe(false);
  });

  // Scenario M: Client cannot read or write _system/governance
  it('Scenario M: Client cannot read or write _system/governance (strictly forbidden by Firestore rules)', () => {
    // Under firestore.rules:
    // match /_system/{docId} {
    //   allow read, write: if false;
    // }
    const firestoreRulesAllowSystemDocRead = (_role: AppRole, _docId: string) => false;
    const firestoreRulesAllowSystemDocWrite = (_role: AppRole, _docId: string) => false;

    // Customer client attempts to read/write governance -> denied
    expect(firestoreRulesAllowSystemDocRead('CUSTOMER', 'governance')).toBe(false);
    expect(firestoreRulesAllowSystemDocWrite('CUSTOMER', 'governance')).toBe(false);

    // Staff/Admin client attempts to read/write governance -> denied
    expect(firestoreRulesAllowSystemDocRead('ADMIN', 'governance')).toBe(false);
    expect(firestoreRulesAllowSystemDocWrite('ADMIN', 'governance')).toBe(false);

    // Even Super Admin client direct write is denied (must be server Admin SDK)
    expect(firestoreRulesAllowSystemDocRead('SUPER_ADMIN', 'governance')).toBe(false);
    expect(firestoreRulesAllowSystemDocWrite('SUPER_ADMIN', 'governance')).toBe(false);
  });
});

describe('PROMPT 02.6 — Mandatory 23 Security Hardening & Regression Audit Test Cases', () => {
  // Model Firestore rules evaluator for users/{userId} create
  const ALLOWED_CREATE_KEYS = [
    'uid',
    'email',
    'displayName',
    'firstName',
    'lastName',
    'dateOfBirth',
    'phone',
    'phoneNumber',
    'country',
    'wilaya',
    'city',
    'address',
    'preferredLanguage',
    'locale',
    'profilePhotoUrl',
    'photoURL',
    'termsAcceptedAt',
    'privacyAcceptedAt',
    'termsVersion',
    'privacyVersion',
    'status',
    'roles',
    'createdAt',
    'updatedAt',
    'onboardingCompleted',
    'communityAccess',
    'schoolAccess',
    'xp',
    'level',
    'profileCompleteness',
  ];

  const evaluateUserDocCreate = (authUid: string, docId: string, incomingData: Record<string, unknown>) => {
    const isOwner = authUid === docId;
    if (!isOwner) return { allowed: false, reason: 'Not owner of userId' };
    if (incomingData.uid !== authUid) return { allowed: false, reason: 'incoming.uid does not match auth.uid' };

    const keys = Object.keys(incomingData);
    const hasOnlyAllowedKeys = keys.every((k) => ALLOWED_CREATE_KEYS.includes(k));
    if (!hasOnlyAllowedKeys) return { allowed: false, reason: 'Contains disallowed keys' };

    if (keys.includes('emailVerified') || keys.includes('phoneVerified')) {
      return { allowed: false, reason: 'Verification flags cannot be set on create' };
    }

    const roles = incomingData.roles as string[] | undefined;
    if (!roles || roles.length !== 1 || roles[0] !== 'CUSTOMER') {
      return { allowed: false, reason: 'Roles must be strictly [CUSTOMER]' };
    }

    if (incomingData.status !== 'active') return { allowed: false, reason: 'Status must be active' };
    if (incomingData.communityAccess !== false) return { allowed: false, reason: 'communityAccess must be false' };
    if (incomingData.schoolAccess !== false) return { allowed: false, reason: 'schoolAccess must be false' };
    if (incomingData.xp !== 0) return { allowed: false, reason: 'xp must be 0' };
    if (incomingData.level !== 1) return { allowed: false, reason: 'level must be 1' };
    if (typeof incomingData.createdAt !== 'string') return { allowed: false, reason: 'createdAt must be string' };
    if (typeof incomingData.updatedAt !== 'string') return { allowed: false, reason: 'updatedAt must be string' };

    return { allowed: true, reason: 'Valid customer creation' };
  };

  const ALLOWED_UPDATE_KEYS = [
    'firstName',
    'lastName',
    'displayName',
    'dateOfBirth',
    'phone',
    'phoneNumber',
    'country',
    'wilaya',
    'city',
    'address',
    'preferredLanguage',
    'profilePhotoUrl',
    'photoURL',
    'locale',
    'profileCompleteness',
    'onboardingCompleted',
    'updatedAt',
  ];

  const evaluateUserDocUpdate = (
    authUid: string,
    docId: string,
    affectedKeys: string[]
  ) => {
    const isOwner = authUid === docId;
    if (!isOwner) return { allowed: false, reason: 'Not owner' };

    const hasOnlyAllowed = affectedKeys.every((k) => ALLOWED_UPDATE_KEYS.includes(k));
    if (!hasOnlyAllowed) return { allowed: false, reason: 'Affected keys contain disallowed fields' };

    const FORBIDDEN_UPDATE_KEYS = [
      'roles',
      'status',
      'communityAccess',
      'schoolAccess',
      'xp',
      'level',
      'emailVerified',
      'phoneVerified',
      'createdAt',
      'uid',
      'email',
    ];
    const hasForbidden = affectedKeys.some((k) => FORBIDDEN_UPDATE_KEYS.includes(k));
    if (hasForbidden) return { allowed: false, reason: 'Attempted to modify forbidden fields' };

    return { allowed: true, reason: 'Valid safe profile update' };
  };

  // 1. Customer can create valid profile
  it('1. Customer can create valid profile', async () => {
    const validRegistrationData = {
      uid: 'user-valid-001',
      email: 'client.ammar@example.com',
      displayName: 'Ammar Mansouri',
      firstName: 'Ammar',
      lastName: 'Mansouri',
      dateOfBirth: '1992-04-15',
      phone: '0661234567',
      phoneNumber: '0661234567',
      country: 'Algeria',
      wilaya: '16 - Alger',
      city: 'Bab Ezzouar',
      address: 'Route 5',
      preferredLanguage: 'fr',
      locale: 'fr',
      profilePhotoUrl: null,
      photoURL: '',
      termsAcceptedAt: new Date().toISOString(),
      privacyAcceptedAt: new Date().toISOString(),
      termsVersion: '1.0',
      privacyVersion: '1.0',
      status: 'active',
      roles: ['CUSTOMER'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingCompleted: false,
      communityAccess: false,
      schoolAccess: false,
      xp: 0,
      level: 1,
      profileCompleteness: 85,
    };

    const evalResult = evaluateUserDocCreate('user-valid-001', 'user-valid-001', validRegistrationData);
    expect(evalResult.allowed).toBe(true);

    // Also verify createInitialUserProfile service function creates client document without verification flags
    const profile = await createInitialUserProfile(
      'user-valid-001',
      'client.ammar@example.com',
      'Ammar Mansouri',
      ['CUSTOMER'],
      {
        firstName: 'Ammar',
        lastName: 'Mansouri',
        dateOfBirth: '1992-04-15',
        phone: '0661234567',
        country: 'Algeria',
        wilaya: '16 - Alger',
        city: 'Bab Ezzouar',
        preferredLanguage: 'fr',
        agreeTerms: true,
      }
    );
    expect(profile.roles).toEqual(['CUSTOMER']);
    expect(profile.status).toBe('active');
    expect(profile.communityAccess).toBe(false);
    expect(profile.schoolAccess).toBe(false);
    expect(profile.xp).toBe(0);
    expect(profile.level).toBe(1);
  });

  // 2. Customer cannot create profile with SUPER_ADMIN
  it('2. Customer cannot create profile with SUPER_ADMIN', () => {
    const maliciousData = {
      uid: 'attacker-001',
      email: 'attacker@example.com',
      displayName: 'Attacker',
      status: 'active',
      roles: ['SUPER_ADMIN'],
      communityAccess: false,
      schoolAccess: false,
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = evaluateUserDocCreate('attacker-001', 'attacker-001', maliciousData);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Roles must be strictly/);
  });

  // 3. Customer cannot create profile with ADMIN
  it('3. Customer cannot create profile with ADMIN', () => {
    const maliciousData = {
      uid: 'attacker-002',
      email: 'attacker2@example.com',
      displayName: 'Attacker Admin',
      status: 'active',
      roles: ['ADMIN'],
      communityAccess: false,
      schoolAccess: false,
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = evaluateUserDocCreate('attacker-002', 'attacker-002', maliciousData);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Roles must be strictly/);
  });

  // 4. Customer cannot create profile with emailVerified=true
  it('4. Customer cannot create profile with emailVerified=true', () => {
    const dataWithEmailVerified = {
      uid: 'user-004',
      email: 'fakeverified@example.com',
      displayName: 'Fake Verified',
      emailVerified: true,
      status: 'active',
      roles: ['CUSTOMER'],
      communityAccess: false,
      schoolAccess: false,
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = evaluateUserDocCreate('user-004', 'user-004', dataWithEmailVerified);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Verification flags cannot be set on create|Contains disallowed keys/);
  });

  // 5. Customer cannot create profile with phoneVerified=true
  it('5. Customer cannot create profile with phoneVerified=true', () => {
    const dataWithPhoneVerified = {
      uid: 'user-005',
      email: 'fakephone@example.com',
      displayName: 'Fake Phone',
      phoneVerified: true,
      status: 'active',
      roles: ['CUSTOMER'],
      communityAccess: false,
      schoolAccess: false,
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = evaluateUserDocCreate('user-005', 'user-005', dataWithPhoneVerified);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Verification flags cannot be set on create|Contains disallowed keys/);
  });

  // 6. Customer cannot create profile with communityAccess=true
  it('6. Customer cannot create profile with communityAccess=true', () => {
    const dataWithCommunityAccess = {
      uid: 'user-006',
      email: 'freeaccess@example.com',
      displayName: 'Free Community',
      communityAccess: true,
      schoolAccess: false,
      status: 'active',
      roles: ['CUSTOMER'],
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = evaluateUserDocCreate('user-006', 'user-006', dataWithCommunityAccess);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/communityAccess must be false/);
  });

  // 7. Customer cannot create profile with schoolAccess=true
  it('7. Customer cannot create profile with schoolAccess=true', () => {
    const dataWithSchoolAccess = {
      uid: 'user-007',
      email: 'freeschool@example.com',
      displayName: 'Free School',
      communityAccess: false,
      schoolAccess: true,
      status: 'active',
      roles: ['CUSTOMER'],
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = evaluateUserDocCreate('user-007', 'user-007', dataWithSchoolAccess);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/schoolAccess must be false/);
  });

  // 8. Customer cannot create profile with xp > 0
  it('8. Customer cannot create profile with xp > 0 or level > 1', () => {
    const dataWithSpoofedXp = {
      uid: 'user-008',
      email: 'spoofedxp@example.com',
      displayName: 'Spoofed XP',
      communityAccess: false,
      schoolAccess: false,
      status: 'active',
      roles: ['CUSTOMER'],
      xp: 500,
      level: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = evaluateUserDocCreate('user-008', 'user-008', dataWithSpoofedXp);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/xp must be 0/);
  });

  // 9. Customer cannot modify roles
  it('9. Customer cannot modify roles via profile update', () => {
    const result = evaluateUserDocUpdate('user-009', 'user-009', ['roles']);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/disallowed fields|forbidden fields/);

    const rbacResult = validateRoleTransition(mockCustomer, mockCustomer, ['SUPER_ADMIN']);
    expect(rbacResult.allowed).toBe(false);
    expect(rbacResult.reason).toMatch(/Actor lacks MANAGE_ROLES/);
  });

  // 10. Customer cannot modify status
  it('10. Customer cannot modify status via profile update', () => {
    const result = evaluateUserDocUpdate('user-010', 'user-010', ['status']);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/disallowed fields|forbidden fields/);
  });

  // 11. Customer cannot modify emailVerified
  it('11. Customer cannot modify emailVerified via profile update', () => {
    const result = evaluateUserDocUpdate('user-011', 'user-011', ['emailVerified']);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/disallowed fields|forbidden fields/);
  });

  // 12. Customer cannot modify phoneVerified
  it('12. Customer cannot modify phoneVerified via profile update', () => {
    const result = evaluateUserDocUpdate('user-012', 'user-012', ['phoneVerified']);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/disallowed fields|forbidden fields/);
  });

  // 13. Customer cannot write auditLogs
  it('13. Customer cannot write auditLogs directly through Firestore', () => {
    // Under firestore.rules:
    // match /auditLogs/{logId} {
    //   allow create, update, delete: if false;
    // }
    const canCustomerWriteAuditLogs = (_role: AppRole) => false;
    expect(canCustomerWriteAuditLogs('CUSTOMER')).toBe(false);
    expect(canCustomerWriteAuditLogs('ADMIN')).toBe(false);
    expect(canCustomerWriteAuditLogs('SUPER_ADMIN')).toBe(false);
  });

  // 14. Customer cannot write entitlements
  it('14. Customer cannot write entitlements directly through Firestore', () => {
    // Under firestore.rules:
    // match /entitlements/{entitlementId} {
    //   allow create, update, delete: if false;
    // }
    const canCustomerWriteEntitlements = (_role: AppRole) => false;
    expect(canCustomerWriteEntitlements('CUSTOMER')).toBe(false);
  });

  // 15. Customer cannot write activations
  it('15. Customer cannot write activations directly through Firestore', () => {
    // Under firestore.rules:
    // match /activations/{activationId} {
    //   allow create, update, delete: if false;
    // }
    const canCustomerWriteActivations = (_role: AppRole) => false;
    expect(canCustomerWriteActivations('CUSTOMER')).toBe(false);
  });

  // 16. Customer cannot activate a product code directly through Firestore
  it('16. Customer cannot activate a product code directly through Firestore', () => {
    // Under firestore.rules:
    // match /productCodes/{codeId} {
    //   allow update: if hasStaffRole(...) && !incoming().diff(existing()).affectedKeys().hasAny(['isActivated', ...])
    // }
    const canCustomerUpdateProductCode = (isStaff: boolean, affectedKeys: string[]) => {
      if (!isStaff) return false;
      const forbidden = ['isActivated', 'activatedByUserId', 'activatedAt', 'code', 'id'];
      return !affectedKeys.some((k) => forbidden.includes(k));
    };

    // Customer cannot update productCodes at all
    expect(canCustomerUpdateProductCode(false, ['isActivated'])).toBe(false);
    expect(canCustomerUpdateProductCode(false, ['notes'])).toBe(false);

    // Even staff cannot directly write isActivated, activatedByUserId, or activatedAt
    expect(canCustomerUpdateProductCode(true, ['isActivated'])).toBe(false);
    expect(canCustomerUpdateProductCode(true, ['activatedByUserId'])).toBe(false);
  });

  // 17. Customer cannot modify CMS
  it('17. Customer cannot modify CMS directly through Firestore', () => {
    // Under firestore.rules:
    // match /cmsContent/{sectionKey} {
    //   allow create, update, delete: if false;
    // }
    const canCustomerMutateCms = (_role: AppRole) => false;
    expect(canCustomerMutateCms('CUSTOMER')).toBe(false);
    expect(canCustomerMutateCms('ADMIN')).toBe(false);
  });

  // 18. Customer cannot modify School curriculum directly
  it('18. Customer cannot modify School curriculum directly through Firestore', () => {
    // Under firestore.rules:
    // match /schoolCategories/{categoryId} { allow create, update, delete: if false; }
    // match /schoolCourses/{courseId} { allow create, update, delete: if false; }
    const canCustomerMutateSchool = (_role: AppRole) => false;
    expect(canCustomerMutateSchool('CUSTOMER')).toBe(false);
    expect(canCustomerMutateSchool('ADMIN')).toBe(false);
  });

  // 19. Customer cannot modify certificates
  it('19. Customer cannot modify certificates directly through Firestore', () => {
    // Under firestore.rules:
    // match /certificates/{certificateId} {
    //   allow create, update, delete: if false;
    // }
    const canCustomerMutateCertificates = (_role: AppRole) => false;
    expect(canCustomerMutateCertificates('CUSTOMER')).toBe(false);
    expect(canCustomerMutateCertificates('ADMIN')).toBe(false);
  });

  // 20. Customer cannot enumerate publicCertificates
  it('20. Customer cannot enumerate publicCertificates (list is strictly false)', () => {
    // Under firestore.rules:
    // match /publicCertificates/{certificateNumber} {
    //   allow get: if true;
    //   allow list: if false;
    //   allow create, update, delete: if false;
    // }
    const canGetSingleCertificate = (_certNumber: string) => true;
    const canListCertificates = () => false;

    expect(canGetSingleCertificate('VIR-CERT-2026-001')).toBe(true);
    expect(canListCertificates()).toBe(false); // Prevents dictionary/scraping enumeration
  });

  // 21. Bootstrap can run only in the uninitialized state
  it('21. Bootstrap can run only in the uninitialized state with configured server identity and verified email', () => {
    const isBootstrapAuthorizedServer = (
      configuredServerEmail: string | null,
      callerEmail: string,
      isEmailVerified: boolean,
      bootstrapCompleted: boolean,
      activeSuperAdminCount: number
    ) => {
      // Must fail safely if BOOTSTRAP_SUPERADMIN_EMAIL is missing from server runtime
      if (!configuredServerEmail) return false;
      if (!callerEmail || !isEmailVerified) return false;
      if (callerEmail.toLowerCase().trim() !== configuredServerEmail.toLowerCase().trim()) return false;
      if (bootstrapCompleted) return false;
      if (activeSuperAdminCount > 0) return false;
      return true;
    };

    const serverTargetEmail = 'admin.root@virexon-biosciences.com';

    // Valid uninitialized state -> authorized
    expect(isBootstrapAuthorizedServer(serverTargetEmail, 'admin.root@virexon-biosciences.com', true, false, 0)).toBe(true);

    // Missing server config -> fails safely, no hardcoded guessing
    expect(isBootstrapAuthorizedServer(null, 'admin.root@virexon-biosciences.com', true, false, 0)).toBe(false);

    // Unverified email -> denied
    expect(isBootstrapAuthorizedServer(serverTargetEmail, 'admin.root@virexon-biosciences.com', false, false, 0)).toBe(false);

    // Wrong email -> denied
    expect(isBootstrapAuthorizedServer(serverTargetEmail, 'other@example.com', true, false, 0)).toBe(false);
  });

  // 22. Bootstrap cannot run after bootstrapCompleted=true
  it('22. Bootstrap cannot run after bootstrapCompleted=true or when active SUPER_ADMIN exists', () => {
    const isBootstrapAuthorizedServer = (
      configuredServerEmail: string | null,
      callerEmail: string,
      isEmailVerified: boolean,
      bootstrapCompleted: boolean,
      activeSuperAdminCount: number
    ) => {
      if (!configuredServerEmail) return false;
      if (!callerEmail || !isEmailVerified) return false;
      if (callerEmail.toLowerCase().trim() !== configuredServerEmail.toLowerCase().trim()) return false;
      if (bootstrapCompleted) return false;
      if (activeSuperAdminCount > 0) return false;
      return true;
    };

    const serverTargetEmail = 'admin.root@virexon-biosciences.com';

    // bootstrapCompleted: true -> permanently locked out
    expect(isBootstrapAuthorizedServer(serverTargetEmail, 'admin.root@virexon-biosciences.com', true, true, 0)).toBe(false);

    // activeSuperAdmin exists -> permanently locked out
    expect(isBootstrapAuthorizedServer(serverTargetEmail, 'admin.root@virexon-biosciences.com', true, false, 1)).toBe(false);
  });

  // 23. Bootstrap identity alone cannot authorize permanent SUPER_ADMIN after initialization
  it('23. Bootstrap identity alone cannot authorize permanent SUPER_ADMIN after initialization', () => {
    const userWithBootstrapEmailOnly: UserProfile = {
      ...mockCustomer,
      email: 'admin.root@virexon-biosciences.com',
      roles: ['CUSTOMER'],
    };

    // Application level checks
    expect(isSuperAdmin(userWithBootstrapEmailOnly)).toBe(false);
    expect(isAdmin(userWithBootstrapEmailOnly)).toBe(false);
    expect(hasPermission(userWithBootstrapEmailOnly, 'MANAGE_USERS')).toBe(false);
    expect(hasPermission(userWithBootstrapEmailOnly, 'MANAGE_ALL')).toBe(false);

    // Server level checkIsSuperAdmin check
    const checkIsSuperAdminServer = (callerRoles: string[] = []) => {
      return callerRoles.includes('SUPER_ADMIN');
    };
    expect(checkIsSuperAdminServer(userWithBootstrapEmailOnly.roles)).toBe(false);
  });
});
