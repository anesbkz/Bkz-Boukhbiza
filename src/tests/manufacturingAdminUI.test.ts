import { describe, it, expect } from 'vitest';
import { CANONICAL_CATALOG_SKUS } from '@/lib/codes/productCodeGenerator';
import { ROLE_PERMISSIONS, hasPermission } from '@/lib/rbac/permissions';
import { AppRole } from '@/types/rbac';
import { UserProfile, ProductBatch, ProductCode } from '@/types/models';
import { generateCodesCsv, generateCodesJson } from '@/lib/export/codeExport';

describe('Manufacturing Admin UI & Workflow Integration', () => {
  describe('RBAC Access Control for Manufacturing Workspace', () => {
    it('grants MANAGE_PRODUCTS and MANAGE_CODES to SUPER_ADMIN', () => {
      const profile: UserProfile = {
        uid: 'sa-1',
        email: 'superadmin@virexon.com',
        displayName: 'Super Admin',
        roles: ['SUPER_ADMIN'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        onboardingCompleted: true,
        communityAccess: true,
        schoolAccess: true,
        xp: 0,
        level: 1,
        locale: 'en',
      };
      expect(hasPermission(profile, 'MANAGE_PRODUCTS')).toBe(true);
      expect(hasPermission(profile, 'MANAGE_CODES')).toBe(true);
    });

    it('grants MANAGE_PRODUCTS and MANAGE_CODES to ADMIN', () => {
      const profile: UserProfile = {
        uid: 'adm-1',
        email: 'admin@virexon.com',
        displayName: 'Admin User',
        roles: ['ADMIN'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        onboardingCompleted: true,
        communityAccess: true,
        schoolAccess: true,
        xp: 0,
        level: 1,
        locale: 'en',
      };
      expect(hasPermission(profile, 'MANAGE_PRODUCTS')).toBe(true);
      expect(hasPermission(profile, 'MANAGE_CODES')).toBe(true);
    });

    it('grants MANAGE_PRODUCTS and MANAGE_CODES to PRODUCT_MANAGER', () => {
      const profile: UserProfile = {
        uid: 'pm-1',
        email: 'productmanager@virexon.com',
        displayName: 'Product Manager',
        roles: ['PRODUCT_MANAGER'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        onboardingCompleted: true,
        communityAccess: true,
        schoolAccess: true,
        xp: 0,
        level: 1,
        locale: 'en',
      };
      expect(hasPermission(profile, 'MANAGE_PRODUCTS')).toBe(true);
      expect(hasPermission(profile, 'MANAGE_CODES')).toBe(true);
    });

    it('denies MANAGE_PRODUCTS and MANAGE_CODES to non-product staff and customers', () => {
      const nonPermittedRoles: AppRole[] = [
        'CONTENT_MANAGER',
        'COMMUNITY_MANAGER',
        'SCHOOL_MANAGER',
        'ORDER_MANAGER',
        'SUPPORT',
        'ANALYST',
        'CUSTOMER',
      ];

      for (const role of nonPermittedRoles) {
        const profile: UserProfile = {
          uid: `user-${role}`,
          email: `${role.toLowerCase()}@test.com`,
          displayName: `User ${role}`,
          roles: [role],
          status: 'active',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          onboardingCompleted: true,
          communityAccess: false,
          schoolAccess: false,
          xp: 0,
          level: 1,
          locale: 'en',
        };
        expect(hasPermission(profile, 'MANAGE_PRODUCTS')).toBe(false);
        expect(hasPermission(profile, 'MANAGE_CODES')).toBe(false);
      }
    });
  });

  describe('Quantity Validation (1 - 500 limit)', () => {
    function validateQuantity(qty: any): { valid: boolean; reason?: string } {
      const num = typeof qty === 'number' ? qty : parseInt(qty, 10);
      if (isNaN(num) || !Number.isInteger(num)) {
        return { valid: false, reason: 'Must be an integer' };
      }
      if (num < 1) {
        return { valid: false, reason: 'Must be at least 1' };
      }
      if (num > 500) {
        return { valid: false, reason: 'Exceeds maximum of 500' };
      }
      return { valid: true };
    }

    it('accepts quantities within valid range', () => {
      expect(validateQuantity(1).valid).toBe(true);
      expect(validateQuantity(50).valid).toBe(true);
      expect(validateQuantity(500).valid).toBe(true);
    });

    it('rejects zero, negative, fractional, and above-500 quantities', () => {
      expect(validateQuantity(0).valid).toBe(false);
      expect(validateQuantity(-5).valid).toBe(false);
      expect(validateQuantity(501).valid).toBe(false);
      expect(validateQuantity(1000).valid).toBe(false);
      expect(validateQuantity(12.5).valid).toBe(false);
      expect(validateQuantity(NaN).valid).toBe(false);
    });
  });

  describe('SKU Catalog Integration', () => {
    it('has all canonical catalog SKUs with phase definitions', () => {
      const requiredSkus = ['ZR-PH01-30C', 'ZR-PH02-30C', 'ZR-PH03-30C'];
      for (const sku of requiredSkus) {
        expect(CANONICAL_CATALOG_SKUS[sku]).toBeDefined();
        expect(CANONICAL_CATALOG_SKUS[sku].name).toBeDefined();
        expect(CANONICAL_CATALOG_SKUS[sku].phasePrefix).toBeDefined();
      }
    });
  });

  describe('Batch Math and Statistics', () => {
    it('calculates unused codes accurately as total minus activated', () => {
      const mockBatches: ProductBatch[] = [
        {
          id: 'b-1',
          batchNumber: 'LOT-26-01',
          productSku: 'ZR-PH01-30C',
          manufactureDate: '2026-03-01',
          expiryDate: '2028-03-01',
          status: 'ACTIVE',
          testingStatus: 'PASS',
          totalCodes: 200,
          activatedCodes: 75,
          disabledCodes: 0,
          createdAt: '2026-03-01T00:00:00Z',
          createdBy: 'admin-1',
          updatedAt: '2026-03-01T00:00:00Z',
        },
        {
          id: 'b-2',
          batchNumber: 'LOT-26-02',
          productSku: 'ZR-PH02-30C',
          manufactureDate: '2026-03-05',
          expiryDate: '2028-03-05',
          status: 'DISABLED',
          testingStatus: 'PASS',
          totalCodes: 100,
          activatedCodes: 100,
          disabledCodes: 0,
          createdAt: '2026-03-05T00:00:00Z',
          createdBy: 'admin-1',
          updatedAt: '2026-03-05T00:00:00Z',
        },
      ];

      const totalCodes = mockBatches.reduce((acc, b) => acc + (b.totalCodes || 0), 0);
      const activatedCodes = mockBatches.reduce((acc, b) => acc + (b.activatedCodes || 0), 0);
      const unusedCodes = Math.max(0, totalCodes - activatedCodes);

      expect(totalCodes).toBe(300);
      expect(activatedCodes).toBe(175);
      expect(unusedCodes).toBe(125);
    });
  });

  describe('Commercial Export Integration', () => {
    const mockBatch: ProductBatch = {
      id: 'b-test',
      batchNumber: 'LOT-ZR-TEST',
      productSku: 'ZR-PH01-30C',
      manufactureDate: '2026-04-01',
      expiryDate: '2028-04-01',
      status: 'ACTIVE',
      testingStatus: 'PASS',
      totalCodes: 2,
      activatedCodes: 0,
      disabledCodes: 0,
      createdAt: '2026-04-01T00:00:00Z',
      createdBy: 'admin-1',
      updatedAt: '2026-04-01T00:00:00Z',
    };

    const mockCodes: ProductCode[] = [
      {
        id: 'c-1',
        code: 'ZR-PH01-7K9A-3F2W-M8PX',
        normalizedCode: 'ZRPH017K9A3F2WM8PX',
        batchId: 'b-test',
        batchNumber: 'LOT-ZR-TEST',
        productSku: 'ZR-PH01-30C',
        status: 'UNUSED',
        isActivated: false,
        grantsSchoolAccess: true,
        grantsCommunityAccess: true,
        createdAt: '2026-04-01T00:00:00Z',
      },
      {
        id: 'c-2',
        code: 'ZR-PH01-2B4C-6D8E-9GHJ',
        normalizedCode: 'ZRPH012B4C6D8E9GHJ',
        batchId: 'b-test',
        batchNumber: 'LOT-ZR-TEST',
        productSku: 'ZR-PH01-30C',
        status: 'UNUSED',
        isActivated: false,
        grantsSchoolAccess: true,
        grantsCommunityAccess: true,
        createdAt: '2026-04-01T00:00:00Z',
      },
    ];

    it('generates compliant CSV with headers and records', () => {
      const csv = generateCodesCsv(mockBatch, mockCodes);
      expect(csv.filename).toContain('ZR-PH01-30C');
      expect(csv.filename).toContain('LOT-ZR-TEST');
      expect(csv.rowCount).toBe(2);
      expect(csv.csvString).toContain('Sequence,Serial_Code,Product_SKU');
      expect(csv.csvString).toContain('ZR-PH01-7K9A-3F2W-M8PX');
      expect(csv.csvString).toContain('/verify?code=ZR-PH01-7K9A-3F2W-M8PX');
    });

    it('generates compliant JSON with packaging manifest', () => {
      const json = generateCodesJson(mockBatch, mockCodes);
      expect(json.data.manifest.totalCodes).toBe(2);
      expect(json.data.codes.length).toBe(2);
      expect(json.data.codes[0].code).toBe('ZR-PH01-7K9A-3F2W-M8PX');
    });
  });
});
