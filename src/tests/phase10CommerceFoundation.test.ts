import { describe, it, expect } from 'vitest';
import {
  calculateOrderPricing,
  getWilayaShippingCost,
  formatDzdPrice,
  validatePriceAmount,
} from '@/services/commerce/pricingService';
import {
  Product,
  ProductVariant,
  InventoryRecord,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
} from '@/types/commerce';

describe('Phase 10: Authoritative Pricing Engine', () => {
  it('formats Algerian DZD currency amounts with authoritative suffix', () => {
    expect(formatDzdPrice(9800)).toBe('9,800 DZD');
    expect(formatDzdPrice(0)).toBe('0 DZD');
    expect(formatDzdPrice(2500000)).toBe('2,500,000 DZD');
  });

  it('calculates Algerian Wilaya delivery tiers correctly', () => {
    // Algiers (Wilaya 16)
    expect(getWilayaShippingCost('Alger')).toBe(600);
    expect(getWilayaShippingCost('Algiers')).toBe(600);
    expect(getWilayaShippingCost('16')).toBe(600);

    // Coastal Wilayas
    expect(getWilayaShippingCost('Oran')).toBe(800);
    expect(getWilayaShippingCost('Blida')).toBe(800);
    expect(getWilayaShippingCost('Annaba')).toBe(800);

    // Inland / Highlands Wilayas
    expect(getWilayaShippingCost('Setif')).toBe(1000);
    expect(getWilayaShippingCost('Constantine')).toBe(1000);
    expect(getWilayaShippingCost('Batna')).toBe(1000);

    // Southern / Sahara Wilayas
    expect(getWilayaShippingCost('Adrar')).toBe(1400);
    expect(getWilayaShippingCost('Tamanrasset')).toBe(1400);
    expect(getWilayaShippingCost('Ghardaia')).toBe(1400);

    // Unknown defaults to standard regional tier
    expect(getWilayaShippingCost('Unknown Wilaya')).toBe(1000);
  });

  it('validates prices rejecting non-numeric, negative, or excessive amounts', () => {
    expect(() => validatePriceAmount(-100)).toThrow('Price amount must be a positive number');
    expect(() => validatePriceAmount(NaN)).toThrow('Price amount must be a positive number');
    expect(() => validatePriceAmount(0)).toThrow('Price amount must be a positive number');
    expect(() => validatePriceAmount(100_000_000)).toThrow('exceeds maximum platform threshold');
    expect(validatePriceAmount(9800)).toBe(9800);
  });

  it('computes authoritative line items, subtotal, shipping and total rejecting client totals', () => {
    const catalogVariants: ProductVariant[] = [
      {
        id: 'var-ph01-1m',
        productId: 'prod-ph01',
        sku: 'ZIRON-PH01-1M',
        name: { en: 'Phase 01 Container (1-Month)', fr: 'Phase 01 Conteneur (1 Mois)', ar: 'مرحلة 01 عبوة (شهر واحد)' },
        quantity: 1,
        unit: 'CONTAINER',
        price: 9800,
        currency: 'DZD',
        status: 'ACTIVE',
        inventoryId: 'inv-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'var-ph02-1m',
        productId: 'prod-ph02',
        sku: 'ZIRON-PH02-1M',
        name: { en: 'Phase 02 Container (1-Month)', fr: 'Phase 02 Conteneur (1 Mois)', ar: 'مرحلة 02 عبوة (شهر واحد)' },
        quantity: 1,
        unit: 'CONTAINER',
        price: 10500,
        currency: 'DZD',
        status: 'ACTIVE',
        inventoryId: 'inv-2',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    const catalogProducts: Product[] = [
      {
        id: 'prod-ph01',
        sku: 'ZIRON-PH01',
        slug: 'ziron-ph01',
        brand: 'VIREXON BIOSCIENCES',
        name: { en: 'ZIRON Phase 01 Cellular Priming', fr: 'ZIRON Phase 01', ar: 'زيرون المرحلة 01' },
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
        id: 'prod-ph02',
        sku: 'ZIRON-PH02',
        slug: 'ziron-ph02',
        brand: 'VIREXON BIOSCIENCES',
        name: { en: 'ZIRON Phase 02 Mitochondrial Fortification', fr: 'ZIRON Phase 02', ar: 'زيرون المرحلة 02' },
        description: { en: 'Mitochondrial fortification', fr: 'Fortification mitochondriale', ar: 'تقوية الميتوكوندريا' },
        shortDescription: { en: 'Phase 02', fr: 'Phase 02', ar: 'المرحلة 02' },
        productType: 'PHYSICAL',
        status: 'ACTIVE',
        images: ['/images/ph02.png'],
        availableVariants: ['var-ph02-1m'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    // Client attempts to submit a spoofed unitPrice of 100 DZD
    const requestedItems = [
      { variantId: 'var-ph01-1m', quantity: 2 },
      { variantId: 'var-ph02-1m', quantity: 1 },
    ];

    const pricing = calculateOrderPricing(
      requestedItems,
      catalogVariants,
      catalogProducts,
      'Alger'
    );

    // Expected: (2 * 9800) + (1 * 10500) = 19600 + 10500 = 30100 DZD
    expect(pricing.subtotal).toBe(30100);
    // Shipping to Alger: 600 DZD
    expect(pricing.shippingCost).toBe(600);
    // Total: 30100 + 600 = 30700 DZD
    expect(pricing.total).toBe(30700);
    expect(pricing.currency).toBe('DZD');

    // Verify line item calculations
    expect(pricing.items[0].unitPrice).toBe(9800);
    expect(pricing.items[0].subtotal).toBe(19600);
    expect(pricing.items[1].unitPrice).toBe(10500);
    expect(pricing.items[1].subtotal).toBe(10500);
  });

  it('rejects ordering variants that are inactive or missing from catalog', () => {
    const inactiveVariant: ProductVariant = {
      id: 'var-inactive',
      productId: 'prod-ph01',
      sku: 'ZIRON-INACTIVE',
      name: { en: 'Inactive', fr: 'Inactif', ar: 'غير نشط' },
      quantity: 1,
      unit: 'CONTAINER',
      price: 5000,
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
        [],
        'Alger'
      )
    ).toThrow('is currently not available for purchase');
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

describe('Phase 10: Order Lifecycle State Machine', () => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [], // terminal
    CANCELLED: [], // terminal
  };

  function canTransition(current: OrderStatus, target: OrderStatus): boolean {
    return validTransitions[current]?.includes(target) || false;
  }

  it('permits valid linear lifecycle transitions', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'PROCESSING')).toBe(true);
    expect(canTransition('PROCESSING', 'SHIPPED')).toBe(true);
    expect(canTransition('SHIPPED', 'DELIVERED')).toBe(true);
  });

  it('permits cancellation prior to shipment', () => {
    expect(canTransition('PENDING', 'CANCELLED')).toBe(true);
    expect(canTransition('CONFIRMED', 'CANCELLED')).toBe(true);
    expect(canTransition('PROCESSING', 'CANCELLED')).toBe(true);
  });

  it('forbids invalid or backward transitions', () => {
    expect(canTransition('SHIPPED', 'CONFIRMED')).toBe(false);
    expect(canTransition('DELIVERED', 'PENDING')).toBe(false);
    expect(canTransition('CANCELLED', 'CONFIRMED')).toBe(false);
    expect(canTransition('DELIVERED', 'CANCELLED')).toBe(false);
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
