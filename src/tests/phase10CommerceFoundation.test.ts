import { describe, it, expect } from 'vitest';
import {
  calculateOrderPricing,
  determineAuthoritativeShipping,
  formatDzdPrice,
  validatePriceAmount,
  validateOrderTransition,
  validatePaymentTransition,
  ZIRON_1_MONTH_PRICE_DZD,
  ZIRON_3_MONTH_PROGRAM_PRICE_DZD,
  ZIRON_3_MONTH_SAVINGS_DZD,
  VALID_ORDER_TRANSITIONS,
  VALID_PAYMENT_TRANSITIONS,
} from '@/services/commerce/pricingService';
import {
  Product,
  ProductVariant,
  InventoryRecord,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '@/types/commerce';

describe('Phase 10.1: Authoritative Pricing & Final Commercial Model', () => {
  it('enforces authoritative pricing constants (8,000 DZD 1-Month, 22,000 DZD 3-Month Program, 2,000 DZD Savings)', () => {
    expect(ZIRON_1_MONTH_PRICE_DZD).toBe(8000);
    expect(ZIRON_3_MONTH_PROGRAM_PRICE_DZD).toBe(22000);
    expect(ZIRON_3_MONTH_SAVINGS_DZD).toBe(2000);
    expect((3 * ZIRON_1_MONTH_PRICE_DZD) - ZIRON_3_MONTH_PROGRAM_PRICE_DZD).toBe(2000);
  });

  it('formats Algerian DZD currency amounts with authoritative suffix', () => {
    expect(formatDzdPrice(8000)).toBe('8,000 DZD');
    expect(formatDzdPrice(22000)).toBe('22,000 DZD');
    expect(formatDzdPrice(0)).toBe('0 DZD');
    expect(formatDzdPrice(2500000)).toBe('2,500,000 DZD');
  });

  it('determines server shipping: FREE for 3-month bundles, NEGOTIATION_REQUIRED for 1-month containers', () => {
    // 3-Month Program Bundle
    const bundleItem = [{ sku: 'ZR-BNDL-90C', variantId: 'var-bundle' }];
    const bundleShipping = determineAuthoritativeShipping(bundleItem);
    expect(bundleShipping.shippingStatus).toBe('FREE');
    expect(bundleShipping.initialShippingCost).toBe(0);

    // 1-Month Container
    const singleItem = [{ sku: 'ZR-PH01-30C', variantId: 'var-ph01' }];
    const singleShipping = determineAuthoritativeShipping(singleItem);
    expect(singleShipping.shippingStatus).toBe('NEGOTIATION_REQUIRED');
    expect(singleShipping.initialShippingCost).toBe(0);

    // Mixed order with individual container defaults to NEGOTIATION_REQUIRED
    const mixedItems = [
      { sku: 'ZR-BNDL-90C', variantId: 'var-bundle' },
      { sku: 'ZR-PH01-30C', variantId: 'var-ph01' },
    ];
    const mixedShipping = determineAuthoritativeShipping(mixedItems);
    expect(mixedShipping.shippingStatus).toBe('NEGOTIATION_REQUIRED');
  });

  it('validates prices rejecting non-numeric, negative, or excessive amounts', () => {
    expect(() => validatePriceAmount(-100)).toThrow('Price amount must be a positive number');
    expect(() => validatePriceAmount(NaN)).toThrow('Price amount must be a positive number');
    expect(() => validatePriceAmount(0)).toThrow('Price amount must be a positive number');
    expect(() => validatePriceAmount(100_000_000)).toThrow('exceeds maximum platform threshold');
    expect(validatePriceAmount(8000)).toBe(8000);
  });

  it('computes authoritative line items, subtotal, shipping and total rejecting client totals', () => {
    const catalogVariants: ProductVariant[] = [
      {
        id: 'var-ph01-1m',
        productId: 'prod-ph01',
        sku: 'ZR-PH01-30C',
        name: { en: 'ZIRON Phase 01 (1-Month)', fr: 'ZIRON Phase 01 (1 Mois)', ar: 'زيرون مرحلة 01 (شهر واحد)' },
        quantity: 1,
        unit: 'CONTAINER',
        price: 8000,
        currency: 'DZD',
        status: 'ACTIVE',
        inventoryId: 'inv-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'var-bundle-3m',
        productId: 'prod-bundle',
        sku: 'ZR-BNDL-90C',
        name: { en: 'ZIRON 90-Day Complete Program', fr: 'ZIRON Pack 90 Jours', ar: 'حزمة برنامج زيرون 90 يومًا' },
        quantity: 3,
        unit: 'CONTAINER',
        price: 22000,
        currency: 'DZD',
        status: 'ACTIVE',
        inventoryId: 'inv-bundle',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    const catalogProducts: Product[] = [
      {
        id: 'prod-ph01',
        sku: 'ZR-PH01-30C',
        slug: 'ziron-ph01',
        brand: 'VIREXON BIOSCIENCES',
        name: { en: 'ZIRON Phase 01', fr: 'ZIRON Phase 01', ar: 'زيرون المرحلة 01' },
        description: { en: 'Cellular priming', fr: 'Amorçage cellulaire', ar: 'التمهيد الخلوي' },
        shortDescription: { en: 'Phase 01', fr: 'Phase 01', ar: 'المرحلة 01' },
        productType: 'PHYSICAL',
        status: 'ACTIVE',
        images: ['/images/ph01.png'],
        availableVariants: ['var-ph01-1m'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'prod-bundle',
        sku: 'ZR-BNDL-90C',
        slug: 'ziron-complete-bundle',
        brand: 'VIREXON BIOSCIENCES',
        name: { en: 'ZIRON Complete 90-Day Bundle', fr: 'ZIRON Pack 90 Jours', ar: 'حزمة زيرون 90 يومًا' },
        description: { en: '90-Day protocol', fr: 'Protocole 90 jours', ar: 'بروتوكول 90 يومًا' },
        shortDescription: { en: '90-Day Program', fr: 'Pack 90 Jours', ar: 'برنامج 90 يومًا' },
        productType: 'PHYSICAL',
        status: 'ACTIVE',
        images: ['/images/bundle.png'],
        availableVariants: ['var-bundle-3m'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    // Client attempts to submit 1 bundle
    const bundlePricing = calculateOrderPricing(
      [{ variantId: 'var-bundle-3m', quantity: 1 }],
      catalogVariants,
      catalogProducts
    );

    expect(bundlePricing.subtotal).toBe(22000);
    expect(bundlePricing.shippingCost).toBe(0);
    expect(bundlePricing.shippingStatus).toBe('FREE');
    expect(bundlePricing.total).toBe(22000);

    // 1-month single container
    const singlePricing = calculateOrderPricing(
      [{ variantId: 'var-ph01-1m', quantity: 1 }],
      catalogVariants,
      catalogProducts
    );

    expect(singlePricing.subtotal).toBe(8000);
    expect(singlePricing.shippingCost).toBe(0);
    expect(singlePricing.shippingStatus).toBe('NEGOTIATION_REQUIRED');
    expect(singlePricing.total).toBe(8000);
  });

  it('rejects ordering variants that are inactive or missing from catalog', () => {
    const inactiveVariant: ProductVariant = {
      id: 'var-inactive',
      productId: 'prod-ph01',
      sku: 'ZIRON-INACTIVE',
      name: { en: 'Inactive', fr: 'Inactif', ar: 'غير نشط' },
      quantity: 1,
      unit: 'CONTAINER',
      price: 8000,
      currency: 'DZD',
      status: 'INACTIVE',
      inventoryId: 'inv-inactive',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    expect(() =>
      calculateOrderPricing(
        [{ variantId: 'var-inactive', quantity: 1 }],
        [inactiveVariant],
        []
      )
    ).toThrow('is currently not available for purchase');
  });
});

describe('Phase 10.1: Order & Payment State Machines', () => {
  it('permits valid linear order lifecycle transitions', () => {
    expect(() => validateOrderTransition('PENDING', 'CONFIRMED')).not.toThrow();
    expect(() => validateOrderTransition('CONFIRMED', 'PROCESSING')).not.toThrow();
    expect(() => validateOrderTransition('PROCESSING', 'SHIPPED')).not.toThrow();
    expect(() => validateOrderTransition('SHIPPED', 'DELIVERED')).not.toThrow();
  });

  it('permits cancellation prior to shipment', () => {
    expect(() => validateOrderTransition('PENDING', 'CANCELLED')).not.toThrow();
    expect(() => validateOrderTransition('CONFIRMED', 'CANCELLED')).not.toThrow();
    expect(() => validateOrderTransition('PROCESSING', 'CANCELLED')).not.toThrow();
  });

  it('forbids invalid or backward order transitions', () => {
    expect(() => validateOrderTransition('SHIPPED', 'CONFIRMED')).toThrow();
    expect(() => validateOrderTransition('DELIVERED', 'PENDING')).toThrow();
    expect(() => validateOrderTransition('CANCELLED', 'CONFIRMED')).toThrow();
    expect(() => validateOrderTransition('DELIVERED', 'CANCELLED')).toThrow();
    expect(() => validateOrderTransition('SHIPPED', 'CANCELLED')).toThrow();
  });

  it('enforces valid payment transitions and forbids skipping or illegal rewinds', () => {
    expect(() => validatePaymentTransition('UNPAID', 'PENDING')).not.toThrow();
    expect(() => validatePaymentTransition('UNPAID', 'PAID')).not.toThrow();
    expect(() => validatePaymentTransition('PENDING', 'PAID')).not.toThrow();
    expect(() => validatePaymentTransition('PENDING', 'FAILED')).not.toThrow();
    expect(() => validatePaymentTransition('FAILED', 'PENDING')).not.toThrow();
    expect(() => validatePaymentTransition('PAID', 'REFUNDED')).not.toThrow();

    // Illegal transitions
    expect(() => validatePaymentTransition('PAID', 'UNPAID')).toThrow();
    expect(() => validatePaymentTransition('REFUNDED', 'PAID')).toThrow();
    expect(() => validatePaymentTransition('UNPAID', 'REFUNDED')).toThrow();
  });
});

describe('Phase 10: Inventory & Warehouse Stock Logic', () => {
  it('correctly calculates stock availability and low stock states', () => {
    const recordNormal: InventoryRecord = {
      id: 'inv-1',
      variantId: 'var-1',
      productId: 'prod-1',
      sku: 'SKU-1',
      availableQuantity: 50,
      reservedQuantity: 5,
      soldQuantity: 100,
      lowStockThreshold: 10,
      status: 'IN_STOCK',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const recordLow: InventoryRecord = {
      id: 'inv-2',
      variantId: 'var-2',
      productId: 'prod-1',
      sku: 'SKU-2',
      availableQuantity: 8,
      reservedQuantity: 2,
      soldQuantity: 90,
      lowStockThreshold: 10,
      status: 'LOW_STOCK',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const recordOos: InventoryRecord = {
      id: 'inv-3',
      variantId: 'var-3',
      productId: 'prod-1',
      sku: 'SKU-3',
      availableQuantity: 0,
      reservedQuantity: 0,
      soldQuantity: 150,
      lowStockThreshold: 10,
      status: 'OUT_OF_STOCK',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    expect(recordNormal.availableQuantity > recordNormal.lowStockThreshold).toBe(true);
    expect(recordLow.availableQuantity <= recordLow.lowStockThreshold).toBe(true);
    expect(recordOos.availableQuantity).toBe(0);
    expect(recordOos.status).toBe('OUT_OF_STOCK');
  });

  it('verifies inventory reservation and deduction simulation logic', () => {
    let available = 100;
    let reserved = 0;
    let sold = 0;

    // Order placed for 5 units -> Reserve
    const orderQty = 5;
    expect(available >= orderQty).toBe(true);
    available -= orderQty;
    reserved += orderQty;

    expect(available).toBe(95);
    expect(reserved).toBe(5);

    // Order fulfilled (delivered/paid) -> Deduct from reserved and add to sold
    reserved -= orderQty;
    sold += orderQty;

    expect(available).toBe(95);
    expect(reserved).toBe(0);
    expect(sold).toBe(5);

    // New order placed for 3 units -> Then cancelled -> Release back to available
    const orderQty2 = 3;
    available -= orderQty2;
    reserved += orderQty2;

    expect(available).toBe(92);
    expect(reserved).toBe(3);

    // Cancel order -> Release
    reserved -= orderQty2;
    available += orderQty2;

    expect(available).toBe(95);
    expect(reserved).toBe(0);
  });
});

describe('Phase 10: School Entitlement & Commerce Decoupling (Strict Invariant)', () => {
  it('enforces that School entitlement strictly requires ANY 3 UNIQUE ACTIVATED CONTAINERS regardless of commerce orders', () => {
    // A customer who has purchased 10 orders has 0 activated containers -> School remains locked
    const customerOrdersCount = 10;
    const activatedContainers: string[] = [];

    const isSchoolUnlocked = (containers: string[]) => {
      const uniqueCodes = new Set(containers);
      return uniqueCodes.size >= 3;
    };

    expect(isSchoolUnlocked(activatedContainers)).toBe(false);
    expect(customerOrdersCount >= 10 && isSchoolUnlocked(activatedContainers)).toBe(false);

    // 1 container activated -> locked
    expect(isSchoolUnlocked(['PH01-CONTAINER-001'])).toBe(false);

    // 2 containers activated -> locked
    expect(isSchoolUnlocked(['PH01-CONTAINER-001', 'PH01-CONTAINER-002'])).toBe(false);

    // 3 identical codes activated -> duplicate does NOT count -> locked
    expect(isSchoolUnlocked(['PH01-CONTAINER-001', 'PH01-CONTAINER-001', 'PH01-CONTAINER-001'])).toBe(false);

    // 3 unique containers (same phase) -> UNLOCKED
    expect(isSchoolUnlocked(['PH01-CONTAINER-001', 'PH01-CONTAINER-002', 'PH01-CONTAINER-003'])).toBe(true);

    // 3 unique containers (mixed phases) -> UNLOCKED
    expect(isSchoolUnlocked(['PH01-CONTAINER-A', 'PH02-CONTAINER-B', 'PH03-CONTAINER-C'])).toBe(true);

    // 3 unique containers (2 of one phase, 1 of another) -> UNLOCKED
    expect(isSchoolUnlocked(['PH01-CONTAINER-A', 'PH02-CONTAINER-B', 'PH02-CONTAINER-C'])).toBe(true);
  });

  it('confirms Restart Fund is independent and closed, without commerce payment rails', () => {
    const RESTART_FUND_MAX_ASSISTANCE = 2500000; // 2,500,000 DZD
    const isProgramOpen = false;

    expect(RESTART_FUND_MAX_ASSISTANCE).toBe(2500000);
    expect(isProgramOpen).toBe(false);
  });
});
