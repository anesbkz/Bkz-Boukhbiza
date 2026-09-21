import { describe, it, expect } from 'vitest';
import {
  CANONICAL_PRODUCTION_PRODUCTS,
  CANONICAL_PRODUCTION_VARIANTS,
  CANONICAL_PRODUCTION_INVENTORY,
  RESTRICTED_PHASE_SKUS,
  isRestrictedPhaseSku,
  computeIdempotentInventorySeed,
  DEFAULT_CANONICAL_STOCK_QUANTITY,
  DEFAULT_LOW_STOCK_THRESHOLD,
} from '@/services/commerce/canonicalSeedData';
import {
  ZIRON_1_MONTH_PRICE_DZD,
  ZIRON_3_MONTH_PROGRAM_PRICE_DZD,
} from '@/services/commerce/pricingService';
import { seedProductionCommerceCatalog } from '@/services/commerce/productService';

describe('MVP BLOCKER #3: Production Commerce Catalog & Seed Initialization', () => {
  describe('Canonical Public Products & Variants', () => {
    it('defines ZIRON 1 Month / 30 Capsules at canonical 8,000 DZD', () => {
      const product1M = CANONICAL_PRODUCTION_PRODUCTS.find((p) => p.id === 'ziron-1-month');
      expect(product1M).toBeDefined();
      expect(product1M?.sku).toBe('ZR-1M-30C');
      expect(product1M?.status).toBe('ACTIVE');
      expect(product1M?.productType).toBe('PHYSICAL');
      expect(product1M?.capsuleCount).toBe(30);
      expect(product1M?.name.en).toBe('ZIRON 1 Month');
      expect(product1M?.name.ar).toBeTruthy();
      expect(product1M?.name.fr).toBeTruthy();

      const variant1M = CANONICAL_PRODUCTION_VARIANTS.find((v) => v.id === 'var-zr-1m-30c');
      expect(variant1M).toBeDefined();
      expect(variant1M?.productId).toBe('ziron-1-month');
      expect(variant1M?.sku).toBe('ZR-1M-30C');
      expect(variant1M?.price).toBe(ZIRON_1_MONTH_PRICE_DZD);
      expect(variant1M?.price).toBe(8000);
      expect(variant1M?.currency).toBe('DZD');
      expect(variant1M?.quantity).toBe(30);
      expect(variant1M?.inventoryId).toBe('inv-zr-1m-30c');
    });

    it('defines ZIRON 90-Day Program / 3 Months at canonical 22,000 DZD', () => {
      const bundleProd = CANONICAL_PRODUCTION_PRODUCTS.find((p) => p.id === 'ziron-complete-bundle');
      expect(bundleProd).toBeDefined();
      expect(bundleProd?.sku).toBe('ZR-BNDL-90C');
      expect(bundleProd?.status).toBe('ACTIVE');
      expect(bundleProd?.productType).toBe('BUNDLE');
      expect(bundleProd?.capsuleCount).toBe(90);
      expect(bundleProd?.name.en).toContain('ZIRON 90-Day Complete Program Bundle');

      const bundleVariant = CANONICAL_PRODUCTION_VARIANTS.find((v) => v.id === 'var-zr-bndl-90c');
      expect(bundleVariant).toBeDefined();
      expect(bundleVariant?.productId).toBe('ziron-complete-bundle');
      expect(bundleVariant?.sku).toBe('ZR-BNDL-90C');
      expect(bundleVariant?.price).toBe(ZIRON_3_MONTH_PROGRAM_PRICE_DZD);
      expect(bundleVariant?.price).toBe(22000);
      expect(bundleVariant?.currency).toBe('DZD');
      expect(bundleVariant?.quantity).toBe(90);
      expect(bundleVariant?.inventoryId).toBe('inv-zr-bndl-90c');
    });

    it('has accurate inventory mapping for all canonical variants', () => {
      const inv1M = CANONICAL_PRODUCTION_INVENTORY.find((i) => i.id === 'inv-zr-1m-30c');
      expect(inv1M).toBeDefined();
      expect(inv1M?.variantId).toBe('var-zr-1m-30c');
      expect(inv1M?.sku).toBe('ZR-1M-30C');

      const invBndl = CANONICAL_PRODUCTION_INVENTORY.find((i) => i.id === 'inv-zr-bndl-90c');
      expect(invBndl).toBeDefined();
      expect(invBndl?.variantId).toBe('var-zr-bndl-90c');
      expect(invBndl?.sku).toBe('ZR-BNDL-90C');
    });
  });

  describe('Internal Phase SKUs Isolation', () => {
    it('strictly isolates internal phase SKUs as non-purchasable', () => {
      expect(RESTRICTED_PHASE_SKUS).toContain('ZR-PH01-30C');
      expect(RESTRICTED_PHASE_SKUS).toContain('ZR-PH02-30C');
      expect(RESTRICTED_PHASE_SKUS).toContain('ZR-PH03-30C');

      expect(isRestrictedPhaseSku('ZR-PH01-30C')).toBe(true);
      expect(isRestrictedPhaseSku('ZR-PH02-30C')).toBe(true);
      expect(isRestrictedPhaseSku('ZR-PH03-30C')).toBe(true);
      expect(isRestrictedPhaseSku('zr-ph01-30c')).toBe(true); // Case-insensitive check

      // Public SKUs must NOT be marked restricted
      expect(isRestrictedPhaseSku('ZR-1M-30C')).toBe(false);
      expect(isRestrictedPhaseSku('ZR-BNDL-90C')).toBe(false);
    });

    it('does not create restricted phase SKUs as public standalone products in canonical production seed', () => {
      const restrictedInProducts = CANONICAL_PRODUCTION_PRODUCTS.filter((p) =>
        isRestrictedPhaseSku(p.sku)
      );
      expect(restrictedInProducts.length).toBe(0);

      const restrictedInVariants = CANONICAL_PRODUCTION_VARIANTS.filter((v) =>
        isRestrictedPhaseSku(v.sku)
      );
      expect(restrictedInVariants.length).toBe(0);
    });
  });

  describe('Authoritative Idempotency & Operational Stock Preservation', () => {
    const invDef = CANONICAL_PRODUCTION_INVENTORY[0]; // inv-zr-1m-30c

    it('initializes new inventory with specified stock on clean database', () => {
      const result = computeIdempotentInventorySeed(invDef, null, {
        initialStock: 100,
        lowStockThreshold: 10,
        timestamp: '2026-09-21T00:00:00.000Z',
      });

      expect(result.preservedExistingStock).toBe(false);
      expect(result.record.id).toBe('inv-zr-1m-30c');
      expect(result.record.totalQuantity).toBe(100);
      expect(result.record.availableQuantity).toBe(100);
      expect(result.record.reservedQuantity).toBe(0);
      expect(result.record.soldQuantity).toBe(0);
      expect(result.record.lowStockThreshold).toBe(10);
      expect(result.record.status).toBe('IN_STOCK');
    });

    it('NEVER overwrites live operational inventory when re-seeded multiple times', () => {
      // Simulate live production inventory after 63 units were sold and 5 reserved
      const liveExistingInventory = {
        id: 'inv-zr-1m-30c',
        variantId: 'var-zr-1m-30c',
        productId: 'ziron-1-month',
        sku: 'ZR-1M-30C',
        totalQuantity: 100,
        availableQuantity: 32, // Operational available stock
        reservedQuantity: 5,
        soldQuantity: 63,
        lowStockThreshold: 15,
        status: 'IN_STOCK' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-09-15T12:00:00.000Z',
      };

      // Run idempotent seed again
      const result = computeIdempotentInventorySeed(invDef, liveExistingInventory, {
        initialStock: 100, // Proposed default initial stock
        lowStockThreshold: 10,
        timestamp: '2026-09-21T14:00:00.000Z',
      });

      // Verification: LIVE STOCK IS 100% PRESERVED!
      expect(result.preservedExistingStock).toBe(true);
      expect(result.record.availableQuantity).toBe(32); // NOT reset to 100!
      expect(result.record.reservedQuantity).toBe(5);
      expect(result.record.soldQuantity).toBe(63);
      expect(result.record.totalQuantity).toBe(100);
      expect(result.record.lowStockThreshold).toBe(15); // Existing threshold preserved
      expect(result.record.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(result.record.updatedAt).toBe('2026-09-21T14:00:00.000Z');
    });

    it('preserves depleted out-of-stock and low-stock statuses upon re-seed', () => {
      const depletedInventory = {
        id: 'inv-zr-1m-30c',
        variantId: 'var-zr-1m-30c',
        productId: 'ziron-1-month',
        sku: 'ZR-1M-30C',
        totalQuantity: 100,
        availableQuantity: 0,
        reservedQuantity: 0,
        soldQuantity: 100,
        lowStockThreshold: 10,
        status: 'OUT_OF_STOCK' as const,
      };

      const result = computeIdempotentInventorySeed(invDef, depletedInventory);
      expect(result.preservedExistingStock).toBe(true);
      expect(result.record.availableQuantity).toBe(0);
      expect(result.record.status).toBe('OUT_OF_STOCK');
    });
  });

  describe('Service & Re-Export Integrity', () => {
    it('exports seedProductionCommerceCatalog from productService', () => {
      expect(typeof seedProductionCommerceCatalog).toBe('function');
    });

    it('has standard defaults for stock and low stock thresholds', () => {
      expect(DEFAULT_CANONICAL_STOCK_QUANTITY).toBe(100);
      expect(DEFAULT_LOW_STOCK_THRESHOLD).toBe(10);
    });
  });
});
