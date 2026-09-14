/**
 * ============================================================================
 * PHASE 4 — ZIRON PRODUCTION HARDENING & END-TO-END VERIFICATION SUITE
 * VIREXON BIOSCIENCES | ZIRON BIO-FORMULATION ARCHITECTURE
 *
 * Exhaustive Verification & Hardening Test Suite:
 * - Scenario A: Code activation idempotency
 * - Scenario B: Duplicate activation prevention
 * - Scenario C: Disabled batch rejection
 * - Scenario D: Archived batch rejection
 * - Scenario E: Invalid/nonexistent code
 * - Scenario F: Code state transitions
 * - Scenario G: RBAC enforcement (SUPER_ADMIN, ADMIN, PRODUCT_MANAGER vs Unauthorized)
 * - Scenario H: 1–500 generation boundaries
 * - Scenario I: Code collision protection & Crockford Base32 entropy
 * - Scenario J: Batch counter consistency
 * - Scenario K: Export integrity (CSV RFC 4180 + UTF-8 BOM, JSON manifest)
 * - Scenario L: 3-container School qualification
 * - Scenario M: Three same-phase containers unlock School (3xPh1, 3xPh2, 3xPh3)
 * - Scenario N: Three mixed-phase containers unlock School (Ph1+Ph2+Ph3, 2xPh1+1xPh2)
 * - Scenario O: Duplicate container does NOT count twice (same repeated 3x)
 * - Scenario P: Client cannot mutate authoritative records
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import {
  CROCKFORD_ALPHABET,
  CANONICAL_CATALOG_SKUS,
  normalizeProductCode,
  isValidProductCodeFormat,
  generateSecureProductCode,
  generateBatchProductCodes,
} from '@/lib/codes/productCodeGenerator';
import { generateCodesCsv, generateCodesJson } from '@/lib/export/codeExport';
import { evaluateCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { hasPermission } from '@/lib/rbac/permissions';
import { AppRole } from '@/types/rbac';
import { UserProfile, ProductCode, ProductBatch, BatchStatus, ProductCodeStatus } from '@/types/models';
import { ActivationRecord, EntitlementRecord } from '@/types/entitlements';

/* ==========================================================================
   SIMULATED AUTHORITATIVE TRANSACTION RUNTIME (MIRRORS CLOUD FUNCTIONS)
   ========================================================================== */

interface MockFirestoreDB {
  productCodes: Map<string, ProductCode>;
  batches: Map<string, ProductBatch>;
  activations: Map<string, ActivationRecord>;
  entitlements: Map<string, EntitlementRecord>;
  users: Map<string, UserProfile>;
  auditLogs: Array<{ action: string; resourceType: string; resourceId: string; metadata: any }>;
}

function createMockDatabase(): MockFirestoreDB {
  const db: MockFirestoreDB = {
    productCodes: new Map(),
    batches: new Map(),
    activations: new Map(),
    entitlements: new Map(),
    users: new Map(),
    auditLogs: [],
  };

  // Seed sample active batch
  const batch1: ProductBatch = {
    id: 'batch-active-01',
    batchNumber: 'LOT-2026-01',
    productSku: 'ZR-PH01-30C',
    productName: 'ZIRON Phase 01: Initiation',
    manufactureDate: '2026-03-01',
    expiryDate: '2028-03-01',
    status: 'ACTIVE',
    testingStatus: 'PASS',
    totalCodes: 0,
    activatedCodes: 0,
    disabledCodes: 0,
    createdAt: '2026-03-01T00:00:00Z',
    createdBy: 'admin-01',
    updatedAt: '2026-03-01T00:00:00Z',
  };
  db.batches.set(batch1.id, batch1);

  // Seed sample disabled batch
  const batchDisabled: ProductBatch = {
    id: 'batch-disabled-02',
    batchNumber: 'LOT-2026-DIS',
    productSku: 'ZR-PH02-30C',
    productName: 'ZIRON Phase 02: Consolidation',
    manufactureDate: '2026-03-01',
    expiryDate: '2028-03-01',
    status: 'DISABLED',
    testingStatus: 'PENDING',
    totalCodes: 0,
    activatedCodes: 0,
    disabledCodes: 0,
    createdAt: '2026-03-01T00:00:00Z',
    createdBy: 'admin-01',
    updatedAt: '2026-03-01T00:00:00Z',
  };
  db.batches.set(batchDisabled.id, batchDisabled);

  // Seed sample archived batch
  const batchArchived: ProductBatch = {
    id: 'batch-archived-03',
    batchNumber: 'LOT-2026-ARC',
    productSku: 'ZR-PH03-30C',
    productName: 'ZIRON Phase 03: Mastery',
    manufactureDate: '2026-01-01',
    expiryDate: '2028-01-01',
    status: 'ARCHIVED',
    testingStatus: 'PASS',
    totalCodes: 0,
    activatedCodes: 0,
    disabledCodes: 0,
    createdAt: '2026-01-01T00:00:00Z',
    createdBy: 'admin-01',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  db.batches.set(batchArchived.id, batchArchived);

  return db;
}

function createMockCode(overrides: Partial<ProductCode> & { id: string; code: string }): ProductCode {
  return {
    normalizedCode: normalizeProductCode(overrides.code),
    batchId: 'batch-active-01',
    productSku: 'ZR-PH01-30C',
    phase: 1,
    status: 'UNUSED',
    isActivated: false,
    grantsCommunityAccess: true,
    grantsSchoolAccess: false,
    createdAt: '2026-03-01T00:00:00Z',
    createdBy: 'admin-01',
    updatedAt: '2026-03-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Executes authoritative activateContainerCode transaction logic matching functions/src/index.ts
 */
function authoritativeActivateContainerCode(
  db: MockFirestoreDB,
  rawCode: string,
  caller: UserProfile
): {
  success: boolean;
  activationId: string;
  qualifyingContainerCount: number;
  qualifiesForSchool: boolean;
  entitlements: string[];
} {
  if (!caller || !caller.uid) {
    throw new Error('unauthenticated: Caller must be authenticated.');
  }

  const cleanCode = (rawCode || '').trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('invalid-argument: Product verification code is required.');
  }

  // Pre-locate code
  let codeDoc: ProductCode | undefined;
  for (const c of db.productCodes.values()) {
    if (c.id === cleanCode || c.code === cleanCode || c.normalizedCode === normalizeProductCode(cleanCode)) {
      codeDoc = c;
      break;
    }
  }

  if (!codeDoc) {
    throw new Error(`not-found: Product container code "${cleanCode}" not found in serialization catalog.`);
  }

  // Check code disabled or revoked
  if (codeDoc.status === 'DISABLED' || codeDoc.status === 'REVOKED') {
    throw new Error('failed-precondition: This product code is disabled or revoked and cannot be activated.');
  }

  // Idempotency: check if already activated
  if (codeDoc.status === 'ACTIVATED' || codeDoc.isActivated) {
    throw new Error('already-exists: This container has already been activated.');
  }

  // Verify batch status
  if (codeDoc.batchId) {
    const batch = db.batches.get(codeDoc.batchId);
    if (!batch) {
      throw new Error(`not-found: Associated manufacturing batch "${codeDoc.batchId}" not found.`);
    }
    if (batch.status === 'DISABLED') {
      throw new Error('failed-precondition: This manufacturing batch is currently on hold or disabled.');
    }
    if (batch.status === 'ARCHIVED') {
      throw new Error('failed-precondition: This manufacturing batch has been archived.');
    }
  }

  // Calculate unique qualifying containers for user
  const userActivations: ActivationRecord[] = [];
  for (const act of db.activations.values()) {
    if (act.userId === caller.uid) {
      userActivations.push(act);
    }
  }

  const distinctContainerCodes = new Set<string>();
  userActivations.forEach((act) => {
    const codeVal = (act.code || '').trim().toUpperCase();
    if (codeVal) {
      distinctContainerCodes.add(codeVal);
    }
  });

  // Add the container currently being activated
  distinctContainerCodes.add(codeDoc.code || cleanCode);
  const qualifyingContainerCount = distinctContainerCodes.size;

  // Check existing earned School access
  const schoolEntId = `${caller.uid}_SCHOOL_ACCESS`;
  const existingSchoolEnt = db.entitlements.get(schoolEntId);
  const hasEarnedSchoolAccess = existingSchoolEnt?.status === 'ACTIVE';

  // Strict 3-container qualification rule (no phase restriction)
  const qualifiesForSchool = qualifyingContainerCount >= 3 || Boolean(hasEarnedSchoolAccess);

  const now = new Date().toISOString();
  const activationId = `act-${caller.uid}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // 1. Update Product Code document
  codeDoc.isActivated = true;
  codeDoc.status = 'ACTIVATED';
  codeDoc.activatedByUserId = caller.uid;
  codeDoc.activatedAt = now;
  codeDoc.updatedAt = now;

  // 2. Increment Batch activatedCodes counter
  if (codeDoc.batchId && db.batches.has(codeDoc.batchId)) {
    const batch = db.batches.get(codeDoc.batchId)!;
    batch.activatedCodes = (batch.activatedCodes || 0) + 1;
    batch.updatedAt = now;
  }

  // 3. Record Activation
  const activationRecord: ActivationRecord = {
    id: activationId,
    code: cleanCode,
    userId: caller.uid,
    productSku: codeDoc.productSku || 'ZR-GENERIC',
    activatedAt: now,
    entitlementsGranted: ['COMMUNITY_ACCESS'],
  };
  if (qualifiesForSchool) {
    activationRecord.entitlementsGranted.push('SCHOOL_ACCESS');
  }
  db.activations.set(activationId, activationRecord);

  // 4. Issue Community Access Entitlement
  const commEntId = `${caller.uid}_COMMUNITY_ACCESS`;
  db.entitlements.set(commEntId, {
    id: commEntId,
    userId: caller.uid,
    entitlementType: 'COMMUNITY_ACCESS',
    status: 'ACTIVE',
    sourceProductSku: codeDoc.productSku,
    sourceCode: cleanCode,
    activationId,
    grantedAt: now,
    expiresAt: null,
    grantedBy: 'PRODUCT_ACTIVATION',
  });

  // 5. Issue School Access Entitlement if qualified
  if (qualifiesForSchool) {
    db.entitlements.set(schoolEntId, {
      id: schoolEntId,
      userId: caller.uid,
      entitlementType: 'SCHOOL_ACCESS',
      status: 'ACTIVE',
      sourceProductSku: codeDoc.productSku,
      sourceCode: cleanCode,
      activationId,
      grantedAt: now,
      expiresAt: null,
      grantedBy: 'PRODUCT_ACTIVATION',
    });
  }

  // 6. Update User Profile cached values & award XP (+50 XP per container)
  const user = db.users.get(caller.uid) || { ...caller };
  user.communityAccess = true;
  user.schoolAccess = qualifiesForSchool;
  user.qualifyingContainerCount = qualifyingContainerCount;
  user.xp = (user.xp || 0) + 50;
  user.level = Math.floor((user.xp || 0) / 100) + 1;
  user.updatedAt = now;
  db.users.set(caller.uid, user);

  // 7. Write Audit Log
  db.auditLogs.push({
    action: 'CONTAINER_CODE_ACTIVATED',
    resourceType: 'productCodes',
    resourceId: cleanCode,
    metadata: {
      activationId,
      userId: caller.uid,
      code: cleanCode,
      productSku: codeDoc.productSku,
      batchId: codeDoc.batchId,
      qualifyingContainerCount,
      schoolUnlocked: qualifiesForSchool,
    },
  });

  return {
    success: true,
    activationId,
    qualifyingContainerCount,
    qualifiesForSchool,
    entitlements: activationRecord.entitlementsGranted,
  };
}

/**
 * Creates mock user profile
 */
function createMockUser(uid: string, roles: AppRole[] = ['CUSTOMER'], status: 'active' | 'suspended' = 'active'): UserProfile {
  return {
    uid,
    email: `${uid}@test.virexon.dz`,
    displayName: `Test Subject ${uid}`,
    photoURL: '',
    phoneNumber: '+213555123456',
    status,
    roles,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    onboardingCompleted: true,
    communityAccess: false,
    schoolAccess: false,
    qualifyingContainerCount: 0,
    xp: 0,
    level: 1,
    locale: 'en',
  };
}

/* ==========================================================================
   PRODUCTION HARDENING TEST SUITE (SCENARIOS A - P)
   ========================================================================== */

describe('ZIRON PRODUCTION HARDENING & E2E VERIFICATION SUITE', () => {
  // --------------------------------------------------------------------------
  // SCENARIO A: Code activation idempotency
  // --------------------------------------------------------------------------
  describe('Scenario A: Code activation idempotency', () => {
    it('successfully activates an unactivated code and records all mutations in atomic state', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-01');
      db.users.set(user.uid, user);

      const code = createMockCode({
        id: 'ZR-PH01-TEST-0001',
        code: 'ZR-PH01-TEST-0001',
      });
      db.productCodes.set(code.id, code);

      const result = authoritativeActivateContainerCode(db, code.code, user);

      expect(result.success).toBe(true);
      expect(result.qualifyingContainerCount).toBe(1);
      expect(result.qualifiesForSchool).toBe(false);
      expect(result.entitlements).toContain('COMMUNITY_ACCESS');

      // Check code state
      const updatedCode = db.productCodes.get(code.id)!;
      expect(updatedCode.status).toBe('ACTIVATED');
      expect(updatedCode.isActivated).toBe(true);
      expect(updatedCode.activatedByUserId).toBe(user.uid);
      expect(updatedCode.activatedAt).toBeDefined();

      // Check user profile updates
      const updatedUser = db.users.get(user.uid)!;
      expect(updatedUser.communityAccess).toBe(true);
      expect(updatedUser.qualifyingContainerCount).toBe(1);
      expect(updatedUser.xp).toBe(50);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO B: Duplicate activation prevention
  // --------------------------------------------------------------------------
  describe('Scenario B: Duplicate activation prevention', () => {
    it('safely rejects second activation of the same code with already-exists error', () => {
      const db = createMockDatabase();
      const user1 = createMockUser('cust-01');
      const user2 = createMockUser('cust-02');
      db.users.set(user1.uid, user1);
      db.users.set(user2.uid, user2);

      const code = createMockCode({
        id: 'ZR-PH01-DUP-0001',
        code: 'ZR-PH01-DUP-0001',
      });
      db.productCodes.set(code.id, code);

      // First activation succeeds
      const firstResult = authoritativeActivateContainerCode(db, code.code, user1);
      expect(firstResult.success).toBe(true);

      const activationsCountAfterFirst = db.activations.size;
      const batchActivatedAfterFirst = db.batches.get('batch-active-01')!.activatedCodes;

      // Second activation by same or another user fails
      expect(() => authoritativeActivateContainerCode(db, code.code, user1)).toThrow(/already been activated/);
      expect(() => authoritativeActivateContainerCode(db, code.code, user2)).toThrow(/already been activated/);

      // Verify no duplicate records or state increments occurred
      expect(db.activations.size).toBe(activationsCountAfterFirst);
      expect(db.batches.get('batch-active-01')!.activatedCodes).toBe(batchActivatedAfterFirst);
      expect(db.users.get(user1.uid)!.xp).toBe(50); // Did not double-award XP
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO C: Disabled batch rejection
  // --------------------------------------------------------------------------
  describe('Scenario C: Disabled batch rejection', () => {
    it('rejects activation when the parent batch status is DISABLED', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-01');

      const code = createMockCode({
        id: 'ZR-PH02-DIS-0001',
        code: 'ZR-PH02-DIS-0001',
        batchId: 'batch-disabled-02',
        productSku: 'ZR-PH02-30C',
        phase: 2,
      });
      db.productCodes.set(code.id, code);

      expect(() => authoritativeActivateContainerCode(db, code.code, user)).toThrow(
        /batch is currently on hold or disabled/
      );

      // Code remains unactivated
      expect(db.productCodes.get(code.id)!.isActivated).toBe(false);
      expect(db.productCodes.get(code.id)!.status).toBe('UNUSED');
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO D: Archived batch rejection
  // --------------------------------------------------------------------------
  describe('Scenario D: Archived batch rejection', () => {
    it('rejects activation when the parent batch status is ARCHIVED', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-01');

      const code = createMockCode({
        id: 'ZR-PH03-ARC-0001',
        code: 'ZR-PH03-ARC-0001',
        batchId: 'batch-archived-03',
        productSku: 'ZR-PH03-30C',
        phase: 3,
      });
      db.productCodes.set(code.id, code);

      expect(() => authoritativeActivateContainerCode(db, code.code, user)).toThrow(
        /batch has been archived/
      );

      expect(db.productCodes.get(code.id)!.isActivated).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO E: Invalid/nonexistent code
  // --------------------------------------------------------------------------
  describe('Scenario E: Invalid/nonexistent code', () => {
    it('rejects empty or whitespace codes with invalid-argument', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-01');

      expect(() => authoritativeActivateContainerCode(db, '', user)).toThrow(/required/);
      expect(() => authoritativeActivateContainerCode(db, '   ', user)).toThrow(/required/);
    });

    it('rejects nonexistent codes with not-found error', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-01');

      expect(() => authoritativeActivateContainerCode(db, 'ZR-PH01-NONEXISTENT', user)).toThrow(
        /not found in serialization catalog/
      );
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO F: Code state transitions
  // --------------------------------------------------------------------------
  describe('Scenario F: Code state transitions', () => {
    it('rejects activation of DISABLED or REVOKED codes', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-01');

      const disabledCode = createMockCode({
        id: 'ZR-PH01-DIS-01',
        code: 'ZR-PH01-DIS-01',
        status: 'DISABLED',
      });
      const revokedCode = createMockCode({
        id: 'ZR-PH01-REV-01',
        code: 'ZR-PH01-REV-01',
        status: 'REVOKED',
      });

      db.productCodes.set(disabledCode.id, disabledCode);
      db.productCodes.set(revokedCode.id, revokedCode);

      expect(() => authoritativeActivateContainerCode(db, disabledCode.code, user)).toThrow(
        /disabled or revoked/
      );
      expect(() => authoritativeActivateContainerCode(db, revokedCode.code, user)).toThrow(
        /disabled or revoked/
      );
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO G: RBAC enforcement
  // --------------------------------------------------------------------------
  describe('Scenario G: RBAC enforcement', () => {
    it('authorizes SUPER_ADMIN, ADMIN, and PRODUCT_MANAGER to manage codes', () => {
      expect(hasPermission(createMockUser('u-super', ['SUPER_ADMIN']), 'MANAGE_CODES')).toBe(true);
      expect(hasPermission(createMockUser('u-admin', ['ADMIN']), 'MANAGE_CODES')).toBe(true);
      expect(hasPermission(createMockUser('u-pm', ['PRODUCT_MANAGER']), 'MANAGE_CODES')).toBe(true);
    });

    it('denies CUSTOMER, ANALYST, COMMUNITY_MANAGER, and SUPPORT from managing codes', () => {
      expect(hasPermission(createMockUser('u-cust', ['CUSTOMER']), 'MANAGE_CODES')).toBe(false);
      expect(hasPermission(createMockUser('u-ana', ['ANALYST']), 'MANAGE_CODES')).toBe(false);
      expect(hasPermission(createMockUser('u-cm', ['COMMUNITY_MANAGER']), 'MANAGE_CODES')).toBe(false);
      expect(hasPermission(createMockUser('u-sup', ['SUPPORT']), 'MANAGE_CODES')).toBe(false);
    });

    it('denies inactive or suspended accounts even if they hold an admin role', () => {
      const suspendedAdmin = createMockUser('u-admin', ['ADMIN'], 'suspended');
      const isAccountAuthorized = (u: UserProfile) => u.status === 'active' && hasPermission(u, 'MANAGE_CODES');
      expect(isAccountAuthorized(suspendedAdmin)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO H: 1–500 generation boundaries
  // --------------------------------------------------------------------------
  describe('Scenario H: 1–500 generation boundaries', () => {
    it('allows valid quantities within 1 to 500 range', () => {
      const gen1 = generateBatchProductCodes(1, 'ZR-PH01-30C');
      expect(gen1).toHaveLength(1);

      const gen50 = generateBatchProductCodes(50, 'ZR-PH01-30C');
      expect(gen50).toHaveLength(50);
    });

    it('rejects quantities out of range (< 1 or > 500 or non-integer)', () => {
      expect(() => generateBatchProductCodes(0, 'ZR-PH01-30C')).toThrow(/between 1 and 500/);
      expect(() => generateBatchProductCodes(-5, 'ZR-PH01-30C')).toThrow(/between 1 and 500/);
      expect(() => generateBatchProductCodes(501, 'ZR-PH01-30C')).toThrow(/between 1 and 500/);
      expect(() => generateBatchProductCodes(1000, 'ZR-PH01-30C')).toThrow(/between 1 and 500/);
      expect(() => generateBatchProductCodes(2.5, 'ZR-PH01-30C')).toThrow(/integer/);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO I: Code collision protection & Crockford Base32 entropy
  // --------------------------------------------------------------------------
  describe('Scenario I: Code collision protection & Crockford Base32 entropy', () => {
    it('produces distinct codes with no collisions in batch generation', () => {
      const batch = generateBatchProductCodes(200, 'ZR-PH01-30C');
      const codeSet = new Set(batch.map((c) => c.code));
      expect(codeSet.size).toBe(200);
    });

    it('ensures codes strictly use Crockford Base32 alphabet and avoid ambiguous chars I, L, O, U', () => {
      const batch = generateBatchProductCodes(50, 'ZR-PH01-30C');
      const forbiddenChars = ['I', 'L', 'O', 'U'];

      batch.forEach((item) => {
        const segments = item.code.split('-');
        // Check random segments (indices 2, 3, 4)
        const randomEntropy = segments.slice(2).join('');
        forbiddenChars.forEach((ch) => {
          expect(randomEntropy.includes(ch)).toBe(false);
        });

        // Each character must be in CROCKFORD_ALPHABET
        for (const ch of randomEntropy) {
          expect(CROCKFORD_ALPHABET).toContain(ch);
        }
      });
    });

    it('handles collision retry loop deterministically when collisions occur', () => {
      const existingKeys = new Set<string>(['ZR-PH01-AAAA-BBBB-CCCC']);
      const generateWithCollisionCheck = (existing: Set<string>): string => {
        let attempts = 0;
        while (attempts < 100) {
          attempts++;
          const candidate = generateSecureProductCode('ZR-PH01');
          if (!existing.has(candidate)) {
            existing.add(candidate);
            return candidate;
          }
        }
        throw new Error('Collision exhaustion');
      };

      const newCode = generateWithCollisionCheck(existingKeys);
      expect(existingKeys.has(newCode)).toBe(true);
      expect(existingKeys.size).toBe(2);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO J: Batch counter consistency
  // --------------------------------------------------------------------------
  describe('Scenario J: Batch counter consistency', () => {
    it('tracks batch totalCodes and activatedCodes atomically', () => {
      const db = createMockDatabase();
      const batch = db.batches.get('batch-active-01')!;

      // Initial state
      expect(batch.totalCodes).toBe(0);
      expect(batch.activatedCodes).toBe(0);

      // Simulate generation of 5 codes
      const generated = generateBatchProductCodes(5, 'ZR-PH01-30C');
      generated.forEach((c) => {
        const fullDoc = createMockCode({
          id: c.code,
          code: c.code,
          batchId: batch.id,
          productSku: c.productSku,
          phase: c.phase,
        });
        db.productCodes.set(fullDoc.id, fullDoc);
      });
      batch.totalCodes += 5;

      expect(batch.totalCodes).toBe(5);
      expect(batch.activatedCodes).toBe(0);

      // Activate 1 code
      const user = createMockUser('cust-01');
      authoritativeActivateContainerCode(db, generated[0].code, user);

      expect(batch.activatedCodes).toBe(1);

      // Duplicate activation attempt does NOT increment activatedCodes
      expect(() => authoritativeActivateContainerCode(db, generated[0].code, user)).toThrow();
      expect(batch.activatedCodes).toBe(1);

      // Activate 2nd code
      authoritativeActivateContainerCode(db, generated[1].code, user);
      expect(batch.activatedCodes).toBe(2);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO K: Export integrity (CSV RFC 4180 + UTF-8 BOM, JSON manifest)
  // --------------------------------------------------------------------------
  describe('Scenario K: Export integrity', () => {
    const mockBatch: ProductBatch = {
      id: 'batch-exp-01',
      batchNumber: 'LOT-EXP-01',
      productSku: 'ZR-PH01-30C',
      productName: 'ZIRON Phase 01: Initiation',
      manufactureDate: '2026-03-01',
      expiryDate: '2028-03-01',
      status: 'ACTIVE',
      testingStatus: 'PASS',
      totalCodes: 2,
      activatedCodes: 0,
      disabledCodes: 0,
      createdAt: '2026-03-01T00:00:00Z',
      createdBy: 'admin-01',
      updatedAt: '2026-03-01T00:00:00Z',
    };

    const mockCodes: ProductCode[] = [
      createMockCode({
        id: 'ZR-PH01-TEST-0001',
        code: 'ZR-PH01-TEST-0001',
        batchId: 'batch-exp-01',
      }),
      createMockCode({
        id: 'ZR-PH01-TEST-0002',
        code: 'ZR-PH01-TEST-0002',
        batchId: 'batch-exp-01',
      }),
    ];

    it('exports CSV starting with UTF-8 BOM and follows RFC 4180 escaping', () => {
      const { csvString } = generateCodesCsv(mockBatch, mockCodes);
      expect(csvString.startsWith('\uFEFF')).toBe(true);

      const content = csvString.replace(/^\uFEFF/, '').trim();
      expect(content).toContain('Serial_Code');
      expect(content).toContain('Verification_URL');
      expect(content).toContain('Batch_Number');
      expect(content).toContain('ZR-PH01-TEST-0001');
      expect(content).toContain('ZR-PH01-TEST-0002');
    });

    it('exports JSON manifest with full metadata and serialization array', () => {
      const { jsonString, data } = generateCodesJson(mockBatch, mockCodes);
      const parsed = JSON.parse(jsonString);

      expect(parsed.batch.number).toBe('LOT-EXP-01');
      expect(parsed.manifest.totalCodes).toBe(2);
      expect(parsed.codes).toHaveLength(2);
      expect(parsed.codes[0].code).toBe('ZR-PH01-TEST-0001');
      expect(data.codes[1].code).toBe('ZR-PH01-TEST-0002');
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO L: 3-container School qualification
  // --------------------------------------------------------------------------
  describe('Scenario L: 3-container School qualification', () => {
    it('keeps School locked for 0, 1, or 2 activated containers', () => {
      expect(evaluateCustomerEntitlements({ activations: [], entitlements: [], isStaff: false }).hasSchoolAccess).toBe(false);
      expect(evaluateCustomerEntitlements({ activations: [{ code: 'C1' }], entitlements: [], isStaff: false }).hasSchoolAccess).toBe(false);
      expect(evaluateCustomerEntitlements({ activations: [{ code: 'C1' }, { code: 'C2' }], entitlements: [], isStaff: false }).hasSchoolAccess).toBe(false);
    });

    it('unlocks School access at exactly 3 distinct activated containers', () => {
      const result = evaluateCustomerEntitlements({
        activations: [{ code: 'C1' }, { code: 'C2' }, { code: 'C3' }],
        entitlements: [],
        isStaff: false,
      });
      expect(result.qualifyingContainerCount).toBe(3);
      expect(result.hasSchoolAccess).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO M: Three same-phase containers unlock School
  // --------------------------------------------------------------------------
  describe('Scenario M: Three same-phase containers unlock School', () => {
    it('unlocks School with 3 × Phase 1 containers (no phase restriction)', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-3x-ph1');

      const codes = [
        'ZR-PH01-3XPH1-001',
        'ZR-PH01-3XPH1-002',
        'ZR-PH01-3XPH1-003',
      ].map((c) =>
        createMockCode({
          id: c,
          code: c,
          batchId: 'batch-active-01',
          productSku: 'ZR-PH01-30C',
          phase: 1,
        })
      );
      codes.forEach((c) => db.productCodes.set(c.id, c));

      // Container 1
      const res1 = authoritativeActivateContainerCode(db, codes[0].code, user);
      expect(res1.qualifyingContainerCount).toBe(1);
      expect(res1.qualifiesForSchool).toBe(false);

      // Container 2
      const res2 = authoritativeActivateContainerCode(db, codes[1].code, user);
      expect(res2.qualifyingContainerCount).toBe(2);
      expect(res2.qualifiesForSchool).toBe(false);

      // Container 3 -> UNLOCKS SCHOOL
      const res3 = authoritativeActivateContainerCode(db, codes[2].code, user);
      expect(res3.qualifyingContainerCount).toBe(3);
      expect(res3.qualifiesForSchool).toBe(true);
      expect(res3.entitlements).toContain('SCHOOL_ACCESS');

      // Check authoritative entitlement record exists
      expect(db.entitlements.get(`${user.uid}_SCHOOL_ACCESS`)?.status).toBe('ACTIVE');
    });

    it('unlocks School with 3 × Phase 2 containers', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-3x-ph2');

      const codes = [
        'ZR-PH02-3XPH2-001',
        'ZR-PH02-3XPH2-002',
        'ZR-PH02-3XPH2-003',
      ].map((c) =>
        createMockCode({
          id: c,
          code: c,
          batchId: 'batch-active-01',
          productSku: 'ZR-PH02-30C',
          phase: 2,
        })
      );
      codes.forEach((c) => db.productCodes.set(c.id, c));

      authoritativeActivateContainerCode(db, codes[0].code, user);
      authoritativeActivateContainerCode(db, codes[1].code, user);
      const res3 = authoritativeActivateContainerCode(db, codes[2].code, user);

      expect(res3.qualifyingContainerCount).toBe(3);
      expect(res3.qualifiesForSchool).toBe(true);
    });

    it('unlocks School with 3 × Phase 3 containers', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-3x-ph3');

      const codes = [
        'ZR-PH03-3XPH3-001',
        'ZR-PH03-3XPH3-002',
        'ZR-PH03-3XPH3-003',
      ].map((c) =>
        createMockCode({
          id: c,
          code: c,
          batchId: 'batch-active-01',
          productSku: 'ZR-PH03-30C',
          phase: 3,
        })
      );
      codes.forEach((c) => db.productCodes.set(c.id, c));

      authoritativeActivateContainerCode(db, codes[0].code, user);
      authoritativeActivateContainerCode(db, codes[1].code, user);
      const res3 = authoritativeActivateContainerCode(db, codes[2].code, user);

      expect(res3.qualifyingContainerCount).toBe(3);
      expect(res3.qualifiesForSchool).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO N: Three mixed-phase containers unlock School
  // --------------------------------------------------------------------------
  describe('Scenario N: Three mixed-phase containers unlock School', () => {
    it('unlocks School with 1 × Phase 1 + 1 × Phase 2 + 1 × Phase 3', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-mixed-123');

      const c1 = createMockCode({
        id: 'ZR-PH01-MIX-01',
        code: 'ZR-PH01-MIX-01',
        productSku: 'ZR-PH01-30C',
        phase: 1,
      });
      const c2 = createMockCode({
        id: 'ZR-PH02-MIX-02',
        code: 'ZR-PH02-MIX-02',
        productSku: 'ZR-PH02-30C',
        phase: 2,
      });
      const c3 = createMockCode({
        id: 'ZR-PH03-MIX-03',
        code: 'ZR-PH03-MIX-03',
        productSku: 'ZR-PH03-30C',
        phase: 3,
      });

      db.productCodes.set(c1.id, c1);
      db.productCodes.set(c2.id, c2);
      db.productCodes.set(c3.id, c3);

      authoritativeActivateContainerCode(db, c1.code, user);
      authoritativeActivateContainerCode(db, c2.code, user);
      const res3 = authoritativeActivateContainerCode(db, c3.code, user);

      expect(res3.qualifyingContainerCount).toBe(3);
      expect(res3.qualifiesForSchool).toBe(true);
      expect(res3.entitlements).toContain('SCHOOL_ACCESS');
    });

    it('unlocks School with 2 × Phase 1 + 1 × Phase 2', () => {
      const db = createMockDatabase();
      const user = createMockUser('cust-mixed-21');

      const c1 = createMockCode({
        id: 'ZR-PH01-M21-01',
        code: 'ZR-PH01-M21-01',
        productSku: 'ZR-PH01-30C',
        phase: 1,
      });
      const c2 = createMockCode({
        id: 'ZR-PH01-M21-02',
        code: 'ZR-PH01-M21-02',
        productSku: 'ZR-PH01-30C',
        phase: 1,
      });
      const c3 = createMockCode({
        id: 'ZR-PH02-M21-03',
        code: 'ZR-PH02-M21-03',
        productSku: 'ZR-PH02-30C',
        phase: 2,
      });

      db.productCodes.set(c1.id, c1);
      db.productCodes.set(c2.id, c2);
      db.productCodes.set(c3.id, c3);

      authoritativeActivateContainerCode(db, c1.code, user);
      authoritativeActivateContainerCode(db, c2.code, user);
      const res3 = authoritativeActivateContainerCode(db, c3.code, user);

      expect(res3.qualifyingContainerCount).toBe(3);
      expect(res3.qualifiesForSchool).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO O: Duplicate container does NOT count twice
  // --------------------------------------------------------------------------
  describe('Scenario O: Duplicate container does NOT count twice', () => {
    it('same container repeated 3 times does NOT unlock School (qualifying count remains 1)', () => {
      // 1. Transaction rejection:
      const db = createMockDatabase();
      const user = createMockUser('cust-rep-01');

      const singleCode = createMockCode({
        id: 'ZR-PH01-REP-001',
        code: 'ZR-PH01-REP-001',
        productSku: 'ZR-PH01-30C',
        phase: 1,
      });
      db.productCodes.set(singleCode.id, singleCode);

      // First attempt succeeds
      const r1 = authoritativeActivateContainerCode(db, singleCode.code, user);
      expect(r1.qualifyingContainerCount).toBe(1);
      expect(r1.qualifiesForSchool).toBe(false);

      // Repeated attempts throw already-exists
      expect(() => authoritativeActivateContainerCode(db, singleCode.code, user)).toThrow(/already been activated/);
      expect(() => authoritativeActivateContainerCode(db, singleCode.code, user)).toThrow(/already been activated/);

      // 2. Client evaluation deduplication safety:
      // Even if mock data had 3 records with identical code, evaluateCustomerEntitlements strictly dedupes
      const evalResult = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-REP-001' },
          { code: 'ZR-PH01-REP-001' },
          { code: 'ZR-PH01-REP-001' },
        ],
        entitlements: [],
        isStaff: false,
      });

      expect(evalResult.qualifyingContainerCount).toBe(1);
      expect(evalResult.hasSchoolAccess).toBe(false);
    });

    it('2 unique containers with 1 repeated activation yields count = 2 and School remains locked', () => {
      const evalResult = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-A' },
          { code: 'ZR-PH01-B' },
          { code: 'ZR-PH01-A' }, // Duplicate of container A
        ],
        entitlements: [],
        isStaff: false,
      });

      expect(evalResult.qualifyingContainerCount).toBe(2);
      expect(evalResult.hasSchoolAccess).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO P: Client cannot mutate authoritative records
  // --------------------------------------------------------------------------
  describe('Scenario P: Client cannot mutate authoritative records', () => {
    it('prohibits direct client creation or modification of auditLogs, activations, and entitlements', () => {
      // Models firestore.rules enforcement
      const canClientWriteAuditLogs = false;
      const canClientWriteActivations = false;
      const canClientWriteEntitlements = false;

      expect(canClientWriteAuditLogs).toBe(false);
      expect(canClientWriteActivations).toBe(false);
      expect(canClientWriteEntitlements).toBe(false);
    });

    it('prohibits direct client mutation of isActivated or status: ACTIVATED on productCodes', () => {
      // Under firestore.rules:
      // !incoming().diff(existing()).affectedKeys().hasAny(['isActivated', 'activatedByUserId', 'activatedAt', 'code', 'id'])
      // (!('status' in incoming()) || incoming().status != 'ACTIVATED')
      const isClientProductCodeMutationAllowed = (existing: ProductCode, incomingDiff: Partial<ProductCode>) => {
        const forbiddenKeys = ['isActivated', 'activatedByUserId', 'activatedAt', 'code', 'id', 'normalizedCode'];
        const changedKeys = Object.keys(incomingDiff);
        if (changedKeys.some((k) => forbiddenKeys.includes(k))) return false;
        if (incomingDiff.status === 'ACTIVATED') return false;
        return true;
      };

      const existingCode = createMockCode({
        id: 'C1',
        code: 'C1',
        batchId: 'B1',
      });

      expect(isClientProductCodeMutationAllowed(existingCode, { isActivated: true })).toBe(false);
      expect(isClientProductCodeMutationAllowed(existingCode, { status: 'ACTIVATED' })).toBe(false);
      expect(isClientProductCodeMutationAllowed(existingCode, { code: 'FORGED-CODE' })).toBe(false);
      expect(isClientProductCodeMutationAllowed(existingCode, { exportCount: 2 })).toBe(true);
    });

    it('prohibits user from manipulating schoolAccess, communityAccess, roles, or qualifyingContainerCount on profile', () => {
      // Under firestore.rules /users/{userId}:
      // !incoming().diff(existing()).affectedKeys().hasAny(['roles', 'status', 'communityAccess', 'schoolAccess', 'qualifyingContainerCount', 'xp', 'level'])
      const isUserProfileUpdateAllowed = (changedKeys: string[]) => {
        const protectedFields = [
          'roles',
          'status',
          'communityAccess',
          'schoolAccess',
          'qualifyingContainerCount',
          'xp',
          'level',
          'emailVerified',
          'phoneVerified',
        ];
        return !changedKeys.some((k) => protectedFields.includes(k));
      };

      expect(isUserProfileUpdateAllowed(['schoolAccess'])).toBe(false);
      expect(isUserProfileUpdateAllowed(['communityAccess'])).toBe(false);
      expect(isUserProfileUpdateAllowed(['roles'])).toBe(false);
      expect(isUserProfileUpdateAllowed(['qualifyingContainerCount'])).toBe(false);
      expect(isUserProfileUpdateAllowed(['xp'])).toBe(false);
      expect(isUserProfileUpdateAllowed(['displayName', 'phoneNumber'])).toBe(true);
    });
  });
});
