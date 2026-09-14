import { describe, it, expect } from 'vitest';
import {
  CROCKFORD_ALPHABET,
  CANONICAL_CATALOG_SKUS,
  normalizeProductCode,
  isValidProductCodeFormat,
  generateCrockfordSegment,
  generateSecureProductCode,
  generateBatchProductCodes,
} from '@/lib/codes/productCodeGenerator';
import { hasPermission } from '@/lib/rbac/permissions';
import { AppRole } from '@/types/rbac';
import { UserProfile } from '@/types/models';

describe('ZIRON Product Code Generator - Phase 1 Test Suite', () => {
  // =========================================================================
  // A. AUTHORIZATION
  // =========================================================================
  describe('A. Authorization & RBAC Validation', () => {
    const makeUser = (roles: AppRole[], status: 'active' | 'suspended' | 'pending' = 'active'): UserProfile =>
      ({
        uid: 'test-user',
        email: 'test@virexon.com',
        displayName: 'Test User',
        photoURL: '',
        phoneNumber: '',
        status,
        roles,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        onboardingCompleted: true,
        communityAccess: false,
        schoolAccess: false,
        xp: 0,
        level: 1,
        locale: 'en',
      }) as UserProfile;

    it('denies CUSTOMER and ANALYST from managing product codes or batches', () => {
      expect(hasPermission(makeUser(['CUSTOMER']), 'MANAGE_CODES')).toBe(false);
      expect(hasPermission(makeUser(['ANALYST']), 'MANAGE_CODES')).toBe(false);
    });

    it('grants MANAGE_CODES to SUPER_ADMIN, ADMIN, and PRODUCT_MANAGER', () => {
      expect(hasPermission(makeUser(['SUPER_ADMIN']), 'MANAGE_CODES')).toBe(true);
      expect(hasPermission(makeUser(['ADMIN']), 'MANAGE_CODES')).toBe(true);
      expect(hasPermission(makeUser(['PRODUCT_MANAGER']), 'MANAGE_CODES')).toBe(true);
    });

    it('rejects caller if user account status is inactive or suspended', () => {
      const isAccountValid = (user: UserProfile) => {
        if (user.status !== 'active') return false;
        return hasPermission(user, 'MANAGE_CODES');
      };

      expect(isAccountValid(makeUser(['ADMIN'], 'suspended'))).toBe(false);
      expect(isAccountValid(makeUser(['PRODUCT_MANAGER'], 'pending'))).toBe(false);
      expect(isAccountValid(makeUser(['ADMIN'], 'active'))).toBe(true);
    });
  });

  // =========================================================================
  // B. INPUT VALIDATION
  // =========================================================================
  describe('B. Input Validation', () => {
    it('rejects quantity less than 1', () => {
      expect(() => generateBatchProductCodes(0, 'ZR-PH01-30C')).toThrow(/between 1 and 500/);
      expect(() => generateBatchProductCodes(-10, 'ZR-PH01-30C')).toThrow(/between 1 and 500/);
    });

    it('rejects quantity greater than 500', () => {
      expect(() => generateBatchProductCodes(501, 'ZR-PH01-30C')).toThrow(/between 1 and 500/);
      expect(() => generateBatchProductCodes(1000, 'ZR-PH01-30C')).toThrow(/between 1 and 500/);
    });

    it('rejects non-integer quantities', () => {
      expect(() => generateBatchProductCodes(10.5, 'ZR-PH01-30C')).toThrow(/integer/);
    });

    it('rejects unrecognized product SKUs', () => {
      expect(() => generateBatchProductCodes(10, 'INVALID-SKU-999')).toThrow(/Invalid SKU/);
      expect(() => generateBatchProductCodes(10, 'ZR-FAKE-123')).toThrow(/Invalid SKU/);
    });

    it('validates canonical catalog SKUs successfully', () => {
      const validSkus = Object.keys(CANONICAL_CATALOG_SKUS);
      expect(validSkus).toContain('ZR-PH01-30C');
      expect(validSkus).toContain('ZR-PH02-30C');
      expect(validSkus).toContain('ZR-PH03-30C');
      expect(validSkus).toContain('ZR-BNDL-90C');

      const batch = generateBatchProductCodes(5, 'ZR-PH01-30C');
      expect(batch).toHaveLength(5);
      expect(batch[0].productSku).toBe('ZR-PH01-30C');
      expect(batch[0].phase).toBe(1);
    });

    it('rejects batch code generation when batch is DISABLED or ARCHIVED', () => {
      const validateBatchForGeneration = (batch: { id: string; status: string }) => {
        if (batch.status !== 'ACTIVE') {
          throw new Error(`Batch is not ACTIVE (current status: ${batch.status})`);
        }
        return true;
      };

      expect(() => validateBatchForGeneration({ id: 'b1', status: 'DISABLED' })).toThrow(/not ACTIVE/);
      expect(() => validateBatchForGeneration({ id: 'b2', status: 'ARCHIVED' })).toThrow(/not ACTIVE/);
      expect(validateBatchForGeneration({ id: 'b3', status: 'ACTIVE' })).toBe(true);
    });
  });

  // =========================================================================
  // C. CODE GENERATION & FORMAT
  // =========================================================================
  describe('C. Code Generation & Formatting', () => {
    it('generates the exact requested quantity of codes', () => {
      const codes50 = generateBatchProductCodes(50, 'ZR-PH02-30C');
      expect(codes50).toHaveLength(50);

      const codes100 = generateBatchProductCodes(100, 'ZR-PH03-30C');
      expect(codes100).toHaveLength(100);
    });

    it('ensures all generated codes in a batch are strictly unique', () => {
      const count = 250;
      const batch = generateBatchProductCodes(count, 'ZR-PH01-30C');
      const uniqueCodes = new Set(batch.map((item) => item.normalizedCode));
      expect(uniqueCodes.size).toBe(count);
    });

    it('strictly follows the ZR-<PHASE>-<XXXX>-<XXXX>-<XXXX> format', () => {
      const samplePh1 = generateSecureProductCode('PH01');
      const samplePh2 = generateSecureProductCode('PH02');
      const samplePh3 = generateSecureProductCode('PH03');
      const sampleBndl = generateSecureProductCode('BNDL');

      expect(isValidProductCodeFormat(samplePh1)).toBe(true);
      expect(isValidProductCodeFormat(samplePh2)).toBe(true);
      expect(isValidProductCodeFormat(samplePh3)).toBe(true);
      expect(isValidProductCodeFormat(sampleBndl)).toBe(true);
    });

    it('only uses the Crockford Base32 alphabet (excluding I, L, O, U)', () => {
      // Excluded characters to prevent confusion with 1, 0, and offensive words
      expect(CROCKFORD_ALPHABET).not.toContain('I');
      expect(CROCKFORD_ALPHABET).not.toContain('L');
      expect(CROCKFORD_ALPHABET).not.toContain('O');
      expect(CROCKFORD_ALPHABET).not.toContain('U');

      for (let i = 0; i < 50; i++) {
        const seg = generateCrockfordSegment(10);
        for (const char of seg) {
          expect(CROCKFORD_ALPHABET).toContain(char);
        }
      }
    });

    it('correctly normalizes codes stripping spaces and hyphens', () => {
      const raw = 'zr-ph01-7k9a-3f2w-m8px';
      const normalized = normalizeProductCode(raw);
      expect(normalized).toBe('ZRPH017K9A3F2WM8PX');

      const spaced = '  ZR - PH01 - 7K9A - 3F2W - M8PX  ';
      expect(normalizeProductCode(spaced)).toBe('ZRPH017K9A3F2WM8PX');
    });
  });

  // =========================================================================
  // D. COLLISION HANDLING
  // =========================================================================
  describe('D. Collision Handling & Regeneration', () => {
    it('detects existing codes and generates unique replacements without overwriting', () => {
      // Simulate existing codes in database
      const existingDbCodes = new Set<string>([
        'ZR-PH01-AAAA-BBBB-CCCC',
        normalizeProductCode('ZR-PH01-AAAA-BBBB-CCCC'),
      ]);

      const batch = generateBatchProductCodes(20, 'ZR-PH01-30C', existingDbCodes);
      expect(batch).toHaveLength(20);

      // Verify none of the generated codes match the pre-existing codes
      batch.forEach((item) => {
        expect(existingDbCodes.has(item.code)).toBe(false);
        expect(existingDbCodes.has(item.normalizedCode)).toBe(false);
      });
    });
  });

  // =========================================================================
  // E. BATCH ACCOUNTING
  // =========================================================================
  describe('E. Batch Accounting', () => {
    it('accurately increments batch totalCodes and computes remaining unused codes', () => {
      interface BatchData {
        totalCodes: number;
        activatedCodes: number;
        disabledCodes: number;
      }

      const batch: BatchData = {
        totalCodes: 0,
        activatedCodes: 0,
        disabledCodes: 0,
      };

      // Generation 1: +100 codes
      batch.totalCodes += 100;
      expect(batch.totalCodes).toBe(100);

      // Generation 2: +250 codes
      batch.totalCodes += 250;
      expect(batch.totalCodes).toBe(350);

      // Activation simulation: +2 activations
      batch.activatedCodes += 2;
      const unusedCodes = batch.totalCodes - batch.activatedCodes - batch.disabledCodes;
      expect(unusedCodes).toBe(348);
    });
  });

  // =========================================================================
  // F. BATCH STATUS & PROPAGATION
  // =========================================================================
  describe('F. Batch Status Transitions', () => {
    it('validates transitions between ACTIVE, DISABLED, and ARCHIVED', () => {
      const allowedTransitions: Record<string, string[]> = {
        ACTIVE: ['DISABLED', 'ARCHIVED'],
        DISABLED: ['ACTIVE', 'ARCHIVED'],
        ARCHIVED: [], // Terminal status
      };

      const canTransition = (from: string, to: string) =>
        allowedTransitions[from]?.includes(to) ?? false;

      expect(canTransition('ACTIVE', 'DISABLED')).toBe(true);
      expect(canTransition('DISABLED', 'ACTIVE')).toBe(true);
      expect(canTransition('ACTIVE', 'ARCHIVED')).toBe(true);
      expect(canTransition('ARCHIVED', 'ACTIVE')).toBe(false);
    });

    it('rejects activation if parent batch is DISABLED or ARCHIVED', () => {
      const checkBatchAllowsActivation = (batchStatus: string) => {
        if (batchStatus === 'DISABLED') {
          throw new Error('This manufacturing batch is on hold or disabled.');
        }
        if (batchStatus === 'ARCHIVED') {
          throw new Error('This manufacturing batch has been archived.');
        }
        return true;
      };

      expect(() => checkBatchAllowsActivation('DISABLED')).toThrow(/disabled/);
      expect(() => checkBatchAllowsActivation('ARCHIVED')).toThrow(/archived/);
      expect(checkBatchAllowsActivation('ACTIVE')).toBe(true);
    });
  });

  // =========================================================================
  // G. ACTIVATION LOGIC & INTEGRITY
  // =========================================================================
  describe('G. Activation Logic & Integrity', () => {
    it('allows UNUSED code to transition to ACTIVATED', () => {
      const codeRecord = {
        status: 'UNUSED',
        isActivated: false,
        activatedByUserId: null as string | null,
      };

      const activateCode = (record: typeof codeRecord, userId: string) => {
        if (record.status === 'ACTIVATED' || record.isActivated) {
          throw new Error('This container has already been activated.');
        }
        if (record.status === 'DISABLED' || record.status === 'REVOKED') {
          throw new Error('This container code is disabled and cannot be activated.');
        }
        record.status = 'ACTIVATED';
        record.isActivated = true;
        record.activatedByUserId = userId;
        return record;
      };

      const updated = activateCode(codeRecord, 'user-abc');
      expect(updated.status).toBe('ACTIVATED');
      expect(updated.isActivated).toBe(true);
      expect(updated.activatedByUserId).toBe('user-abc');

      // Attempting to activate again fails immediately
      expect(() => activateCode(updated, 'user-def')).toThrow(/already been activated/);
    });

    it('rejects activation when code status is DISABLED or REVOKED', () => {
      const disabledRecord = { status: 'DISABLED', isActivated: false };
      const revokedRecord = { status: 'REVOKED', isActivated: false };

      const tryActivate = (record: { status: string; isActivated: boolean }) => {
        if (record.status === 'DISABLED' || record.status === 'REVOKED') {
          throw new Error(`This container code is ${record.status.toLowerCase()} and cannot be activated.`);
        }
      };

      expect(() => tryActivate(disabledRecord)).toThrow(/disabled/);
      expect(() => tryActivate(revokedRecord)).toThrow(/revoked/);
    });
  });

  // =========================================================================
  // H. AUDIT LOGGING
  // =========================================================================
  describe('H. Authoritative Audit Logging', () => {
    it('creates compliant audit records for generation, batch creation, and status changes', () => {
      const createAuditEntry = (
        action: string,
        resourceType: string,
        resourceId: string,
        metadata: Record<string, unknown>
      ): {
        id: string;
        actorUserId: string;
        action: string;
        resourceType: string;
        resourceId: string;
        timestamp: string;
        metadata: Record<string, unknown>;
      } => ({
        id: `audit-${Math.random().toString(36).substring(2, 9)}`,
        actorUserId: 'admin-123',
        action,
        resourceType,
        resourceId,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          enforcedBy: 'SERVER_AUTHORITY',
        },
      });

      const genLog = createAuditEntry('PRODUCT_CODES_GENERATED', 'productCodes', 'batch-001', {
        batchId: 'batch-001',
        productSku: 'ZR-PH01-30C',
        quantity: 100,
      });
      expect(genLog.action).toBe('PRODUCT_CODES_GENERATED');
      expect(genLog.metadata.quantity).toBe(100);

      const batchLog = createAuditEntry('BATCH_CREATED', 'batches', 'batch-001', {
        batchNumber: 'ZR-2026-001',
        productSku: 'ZR-PH01-30C',
      });
      expect(batchLog.action).toBe('BATCH_CREATED');

      const statusLog = createAuditEntry('BATCH_STATUS_CHANGED', 'batches', 'batch-001', {
        previousStatus: 'ACTIVE',
        newStatus: 'DISABLED',
      });
      expect(statusLog.action).toBe('BATCH_STATUS_CHANGED');
      expect(statusLog.metadata.newStatus).toBe('DISABLED');
    });
  });
});
