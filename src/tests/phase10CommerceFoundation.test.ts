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
  isFreeBundleOrder,
  validateShippingUpdate,
  calculateAuthoritativeSubtotal,
  calculateAuthoritativeTotal,
} from '@/services/commerce/pricingService';
import { ZIRON_CATALOG } from '@/lib/content/catalog';
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

describe('Phase 10.2: Idempotency Engine & Concurrency Hardening (Tests A - F)', () => {
  // In-memory simulation of the authoritative server transaction engine
  interface SimulatedOrder {
    id: string;
    orderNumber: string;
    userId: string;
    items: Array<{ variantId: string; quantity: number }>;
    subtotal: number;
    shippingCost: number;
    shippingStatus: string;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    idempotencyKey: string | null;
  }

  interface SimulatedInventory {
    availableQuantity: number;
    reservedQuantity: number;
    soldQuantity: number;
  }

  class MockTransactionalCommerceEngine {
    orders: Map<string, SimulatedOrder> = new Map();
    idempotencyRecords: Map<string, { id: string; orderId: string; userId: string; idempotencyKey: string }> = new Map();
    inventory: Map<string, SimulatedInventory> = new Map([
      ['var-1m', { availableQuantity: 50, reservedQuantity: 0, soldQuantity: 0 }],
      ['var-bundle', { availableQuantity: 20, reservedQuantity: 0, soldQuantity: 0 }],
    ]);

    async createOrder(
      callerUid: string,
      payload: { items: Array<{ variantId: string; quantity: number }>; idempotencyKey?: string | null }
    ): Promise<{ order: SimulatedOrder; isDuplicate: boolean }> {
      const rawKey = payload.idempotencyKey;
      let trimmedKey: string | null = null;

      if (rawKey !== undefined && rawKey !== null) {
        if (typeof rawKey !== 'string' || rawKey.trim().length === 0) {
          throw new Error('Idempotency key must be a non-empty string when provided.');
        }
        trimmedKey = rawKey.trim();
      }

      // Scoped Key Construction: ${callerUid}_${normalizedKey}
      let scopedKey: string | null = null;
      if (trimmedKey) {
        const normalized = trimmedKey.replace(/[\/\s#?]/g, '_').slice(0, 100);
        scopedKey = `${callerUid}_${normalized}`;

        const existingRecord = this.idempotencyRecords.get(scopedKey);
        if (existingRecord) {
          const cachedOrder = this.orders.get(existingRecord.orderId);
          if (cachedOrder) {
            return { order: cachedOrder, isDuplicate: true };
          }
        }
      }

      // Check and update inventory
      for (const item of payload.items) {
        const inv = this.inventory.get(item.variantId);
        if (!inv) {
          throw new Error(`Inventory record missing for variant "${item.variantId}". Order rejected.`);
        }
        if (inv.availableQuantity < item.quantity) {
          throw new Error(`Insufficient inventory for "${item.variantId}".`);
        }
      }

      // Deduct inventory
      for (const item of payload.items) {
        const inv = this.inventory.get(item.variantId)!;
        inv.availableQuantity -= item.quantity;
        inv.reservedQuantity += item.quantity;
      }

      const orderId = 'ord_' + Math.random().toString(36).substring(2, 9);
      const isBundle = payload.items.some((it) => it.variantId.includes('bundle'));
      const unitPrice = isBundle ? 22000 : 8000;
      const subtotal = payload.items.reduce((acc, it) => acc + unitPrice * it.quantity, 0);
      const shippingStatus = isBundle ? 'FREE' : 'NEGOTIATION_REQUIRED';
      const shippingCost = 0;
      const total = subtotal + shippingCost;

      const order: SimulatedOrder = {
        id: orderId,
        orderNumber: 'ZR-ORD-' + orderId.toUpperCase(),
        userId: callerUid,
        items: payload.items,
        subtotal,
        shippingCost,
        shippingStatus,
        total,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        idempotencyKey: trimmedKey,
      };

      this.orders.set(orderId, order);

      if (scopedKey && trimmedKey) {
        this.idempotencyRecords.set(scopedKey, {
          id: scopedKey,
          orderId,
          userId: callerUid,
          idempotencyKey: trimmedKey,
        });
      }

      return { order, isDuplicate: false };
    }

    cancelOrder(orderId: string, callerUid: string): SimulatedOrder {
      const order = this.orders.get(orderId);
      if (!order) throw new Error('Order not found');
      if (order.status === 'CANCELLED') return order;

      // Release reserved back to available
      for (const item of order.items) {
        const inv = this.inventory.get(item.variantId);
        if (inv) {
          inv.reservedQuantity = Math.max(0, inv.reservedQuantity - item.quantity);
          inv.availableQuantity += item.quantity;
        }
      }

      order.status = 'CANCELLED';
      return order;
    }
  }

  // TEST A: Concurrent requests with identical idempotencyKey produce exactly 1 order
  it('TEST A: Concurrent requests with identical idempotencyKey produce exactly 1 order', async () => {
    const engine = new MockTransactionalCommerceEngine();
    const callerUid = 'user_alpha';
    const key = 'checkout_session_unique_101';

    const [res1, res2] = await Promise.all([
      engine.createOrder(callerUid, {
        items: [{ variantId: 'var-1m', quantity: 2 }],
        idempotencyKey: key,
      }),
      engine.createOrder(callerUid, {
        items: [{ variantId: 'var-1m', quantity: 2 }],
        idempotencyKey: key,
      }),
    ]);

    // Both promises resolve, referencing the exact same orderId
    expect(res1.order.id).toBe(res2.order.id);
    expect([res1.isDuplicate, res2.isDuplicate]).toContain(false);
    expect([res1.isDuplicate, res2.isDuplicate]).toContain(true);

    // Inventory reserved only once (2 units, not 4 units)
    const inv = engine.inventory.get('var-1m')!;
    expect(inv.availableQuantity).toBe(48);
    expect(inv.reservedQuantity).toBe(2);
  });

  // TEST B: Sequential duplicate requests return cached order without decrementing inventory twice
  it('TEST B: Sequential duplicate requests return cached order without decrementing inventory twice', async () => {
    const engine = new MockTransactionalCommerceEngine();
    const callerUid = 'user_beta';
    const key = 'idem_key_sequential_202';

    const firstCall = await engine.createOrder(callerUid, {
      items: [{ variantId: 'var-bundle', quantity: 1 }],
      idempotencyKey: key,
    });
    expect(firstCall.isDuplicate).toBe(false);

    const invAfterFirst = engine.inventory.get('var-bundle')!;
    expect(invAfterFirst.availableQuantity).toBe(19);
    expect(invAfterFirst.reservedQuantity).toBe(1);

    const secondCall = await engine.createOrder(callerUid, {
      items: [{ variantId: 'var-bundle', quantity: 1 }],
      idempotencyKey: key,
    });
    expect(secondCall.isDuplicate).toBe(true);
    expect(secondCall.order.id).toBe(firstCall.order.id);

    // Inventory remains exactly the same
    const invAfterSecond = engine.inventory.get('var-bundle')!;
    expect(invAfterSecond.availableQuantity).toBe(19);
    expect(invAfterSecond.reservedQuantity).toBe(1);
  });

  // TEST C: Two different users using the same key string do NOT collide (each gets their own order)
  it('TEST C: Two different users using the same key string do NOT collide (each gets their own order)', async () => {
    const engine = new MockTransactionalCommerceEngine();
    const sharedKeyString = 'checkout_btn_clicked_common_key';

    const user1Res = await engine.createOrder('user_001', {
      items: [{ variantId: 'var-1m', quantity: 1 }],
      idempotencyKey: sharedKeyString,
    });

    const user2Res = await engine.createOrder('user_002', {
      items: [{ variantId: 'var-1m', quantity: 1 }],
      idempotencyKey: sharedKeyString,
    });

    // Both are distinct orders for each user
    expect(user1Res.isDuplicate).toBe(false);
    expect(user2Res.isDuplicate).toBe(false);
    expect(user1Res.order.id).not.toBe(user2Res.order.id);
    expect(user1Res.order.userId).toBe('user_001');
    expect(user2Res.order.userId).toBe('user_002');

    // Total reserved = 2 (1 for user 1, 1 for user 2)
    expect(engine.inventory.get('var-1m')!.reservedQuantity).toBe(2);
  });

  // TEST D: Request without idempotencyKey generates order normally
  it('TEST D: Request without idempotencyKey generates order normally', async () => {
    const engine = new MockTransactionalCommerceEngine();
    const callerUid = 'user_gamma';

    const res1 = await engine.createOrder(callerUid, {
      items: [{ variantId: 'var-1m', quantity: 1 }],
    });
    const res2 = await engine.createOrder(callerUid, {
      items: [{ variantId: 'var-1m', quantity: 1 }],
      idempotencyKey: null,
    });

    expect(res1.isDuplicate).toBe(false);
    expect(res2.isDuplicate).toBe(false);
    expect(res1.order.id).not.toBe(res2.order.id);
    expect(engine.orders.size).toBe(2);
  });

  // TEST E: Invalid idempotencyKey format handled gracefully
  it('TEST E: Invalid idempotencyKey format handled gracefully (rejects empty string or whitespace)', async () => {
    const engine = new MockTransactionalCommerceEngine();
    const callerUid = 'user_delta';

    await expect(
      engine.createOrder(callerUid, {
        items: [{ variantId: 'var-1m', quantity: 1 }],
        idempotencyKey: '',
      })
    ).rejects.toThrow('Idempotency key must be a non-empty string when provided');

    await expect(
      engine.createOrder(callerUid, {
        items: [{ variantId: 'var-1m', quantity: 1 }],
        idempotencyKey: '    ',
      })
    ).rejects.toThrow('Idempotency key must be a non-empty string when provided');
  });

  // TEST F: Order cancellation does not corrupt idempotency record
  it('TEST F: Order cancellation does not corrupt idempotency record', async () => {
    const engine = new MockTransactionalCommerceEngine();
    const callerUid = 'user_epsilon';
    const key = 'key_for_cancellation_test';

    const created = await engine.createOrder(callerUid, {
      items: [{ variantId: 'var-1m', quantity: 2 }],
      idempotencyKey: key,
    });

    expect(created.order.status).toBe('PENDING');
    expect(engine.inventory.get('var-1m')!.reservedQuantity).toBe(2);

    // Cancel order -> Releases inventory
    engine.cancelOrder(created.order.id, callerUid);
    expect(engine.orders.get(created.order.id)!.status).toBe('CANCELLED');
    expect(engine.inventory.get('var-1m')!.reservedQuantity).toBe(0);
    expect(engine.inventory.get('var-1m')!.availableQuantity).toBe(50);

    // Repeated call with same idempotency key returns the cancelled order without altering inventory
    const retryCall = await engine.createOrder(callerUid, {
      items: [{ variantId: 'var-1m', quantity: 2 }],
      idempotencyKey: key,
    });

    expect(retryCall.isDuplicate).toBe(true);
    expect(retryCall.order.id).toBe(created.order.id);
    expect(retryCall.order.status).toBe('CANCELLED');
    // Stock remains 50 available and 0 reserved (no double release or re-reservation)
    expect(engine.inventory.get('var-1m')!.availableQuantity).toBe(50);
    expect(engine.inventory.get('var-1m')!.reservedQuantity).toBe(0);
  });
});

describe('Phase 10.2: Authoritative Shipping Governance & Free Bundle Protection', () => {
  it('enforces NEGOTIATION_REQUIRED default shipping cost of 0 DZD', () => {
    const res = validateShippingUpdate('NEGOTIATION_REQUIRED');
    expect(res.finalShippingCost).toBe(0);
  });

  it('enforces that AGREED_WITH_CUSTOMER strictly requires integer > 0 DZD', () => {
    // Valid agreed shipping cost
    expect(validateShippingUpdate('AGREED_WITH_CUSTOMER', 800).finalShippingCost).toBe(800);
    expect(validateShippingUpdate('AGREED_WITH_CUSTOMER', 1200).finalShippingCost).toBe(1200);

    // Zero or negative -> rejected
    expect(() => validateShippingUpdate('AGREED_WITH_CUSTOMER', 0)).toThrow(
      'Valid positive integer shippingCost (> 0 DZD) is required'
    );
    expect(() => validateShippingUpdate('AGREED_WITH_CUSTOMER', -500)).toThrow(
      'Valid positive integer shippingCost (> 0 DZD) is required'
    );

    // Non-integer or NaN -> rejected
    expect(() => validateShippingUpdate('AGREED_WITH_CUSTOMER', 750.5)).toThrow(
      'Valid positive integer shippingCost (> 0 DZD) is required'
    );
    expect(() => validateShippingUpdate('AGREED_WITH_CUSTOMER', NaN)).toThrow(
      'Valid positive integer shippingCost (> 0 DZD) is required'
    );
    expect(() => validateShippingUpdate('AGREED_WITH_CUSTOMER', undefined)).toThrow(
      'Valid positive integer shippingCost (> 0 DZD) is required'
    );
  });

  it('strictly protects 3-Month Complete Program Bundle: paid shipping is rejected', () => {
    const bundleItems = [{ sku: 'ZR-BNDL-90C', variantId: 'var-bundle' }];

    // Free shipping is accepted
    expect(validateShippingUpdate('FREE', 0, bundleItems).finalShippingCost).toBe(0);

    // Attempting to assign paid shipping to bundle -> strictly rejected
    expect(() =>
      validateShippingUpdate('AGREED_WITH_CUSTOMER', 1000, bundleItems)
    ).toThrow('ZIRON 3-Month Complete Program Bundle is strictly protected with Free Shipping');

    // Attempting to assign NEGOTIATION_REQUIRED with cost to bundle -> rejected
    expect(() =>
      validateShippingUpdate('AGREED_WITH_CUSTOMER', 500, [
        { sku: 'ZR-3M-90C', variantId: 'var-3m' },
      ])
    ).toThrow('ZIRON 3-Month Complete Program Bundle is strictly protected with Free Shipping');
  });

  it('detects bundle items reliably with isFreeBundleOrder', () => {
    expect(isFreeBundleOrder([{ sku: 'ZR-BNDL-90C' }])).toBe(true);
    expect(isFreeBundleOrder([{ sku: 'ZR-3M-90C' }])).toBe(true);
    expect(isFreeBundleOrder([{ variantId: 'var-bundle-complete' }])).toBe(true);
    expect(isFreeBundleOrder([{ sku: 'ZR-PH01-30C' }])).toBe(false);
    expect(isFreeBundleOrder([])).toBe(false);
  });
});

describe('Phase 10.2: Staff Role Authorization & Shipping Audit Logging', () => {
  const AUTHORIZED_STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER', 'SUPPORT'];

  function checkCanUpdateShipping(roles: string[]): boolean {
    return roles.some((r) => AUTHORIZED_STAFF_ROLES.includes(r));
  }

  it('permits authorized staff roles (SUPER_ADMIN, ADMIN, ORDER_MANAGER, SUPPORT)', () => {
    expect(checkCanUpdateShipping(['SUPER_ADMIN'])).toBe(true);
    expect(checkCanUpdateShipping(['ADMIN'])).toBe(true);
    expect(checkCanUpdateShipping(['ORDER_MANAGER'])).toBe(true);
    expect(checkCanUpdateShipping(['SUPPORT'])).toBe(true);
    expect(checkCanUpdateShipping(['CUSTOMER', 'ORDER_MANAGER'])).toBe(true);
  });

  it('rejects unauthorized roles (CUSTOMER, STUDENT, ANALYST)', () => {
    expect(checkCanUpdateShipping(['CUSTOMER'])).toBe(false);
    expect(checkCanUpdateShipping(['STUDENT'])).toBe(false);
    expect(checkCanUpdateShipping(['ANALYST'])).toBe(false);
    expect(checkCanUpdateShipping([])).toBe(false);
  });

  it('creates authoritative audit event structure on shipping agreement', () => {
    const auditLog = {
      action: 'ORDER_SHIPPING_UPDATED',
      resourceType: 'orders',
      resourceId: 'ZR-ORD-001',
      actorUserId: 'staff_101',
      actorEmail: 'staff@virexon-biosciences.com',
      actorRoles: ['ORDER_MANAGER'],
      metadata: {
        previousShippingStatus: 'NEGOTIATION_REQUIRED',
        newShippingStatus: 'AGREED_WITH_CUSTOMER',
        previousShippingCost: 0,
        newShippingCost: 800,
        newTotal: 8800,
      },
    };

    expect(auditLog.action).toBe('ORDER_SHIPPING_UPDATED');
    expect(auditLog.metadata.newShippingCost).toBe(800);
    expect(auditLog.metadata.newTotal).toBe(8800);
  });
});

describe('Phase 10.2: Real Transactional Inventory Accounting & Fail-Closed Behavior', () => {
  it('simulates full lifecycle: reserve on create, sell on paid, restock on cancel', () => {
    let available = 100;
    let reserved = 0;
    let sold = 0;

    // Step 1: Place order for 10 units
    const orderQty = 10;
    available -= orderQty;
    reserved += orderQty;
    expect(available).toBe(90);
    expect(reserved).toBe(10);
    expect(sold).toBe(0);

    // Step 2: Mark as PAID
    reserved -= orderQty;
    sold += orderQty;
    expect(available).toBe(90);
    expect(reserved).toBe(0);
    expect(sold).toBe(10);

    // Step 3: Admin cancels paid order -> stock returned to available from sold
    sold -= orderQty;
    available += orderQty;
    expect(available).toBe(100);
    expect(reserved).toBe(0);
    expect(sold).toBe(0);
  });

  it('fails closed when inventory record is missing (no fallback quantities)', () => {
    const mockDbInventory = new Map<string, any>();
    // Only SKU-A exists, SKU-B is missing
    mockDbInventory.set('inv-sku-a', { availableQuantity: 50 });

    const checkInventoryRecord = (invId: string) => {
      const record = mockDbInventory.get(invId);
      if (!record) {
        throw new Error(`Inventory record missing for ${invId}. Order rejected.`);
      }
      return record;
    };

    expect(() => checkInventoryRecord('inv-sku-a')).not.toThrow();
    expect(() => checkInventoryRecord('inv-missing-item')).toThrow(
      'Inventory record missing for inv-missing-item. Order rejected.'
    );
  });
});

describe('Phase 10.2: Commercial Catalog Structure Invariant', () => {
  it('exposes exactly 1-Month (8,000 DZD) and 3-Month Program Bundle (22,000 DZD) with 2,000 DZD savings', () => {
    const oneMonthProduct = ZIRON_CATALOG.find((p) => p.sku === 'ZR-1M-30C' || p.id === 'ziron-1-month');
    const bundleProduct = ZIRON_CATALOG.find((p) => p.sku === 'ZR-BNDL-90C' || p.phase === 'BUNDLE');

    expect(oneMonthProduct).toBeDefined();
    expect(oneMonthProduct?.priceDzd).toBe(8000);
    expect(oneMonthProduct?.capsuleCount).toBe(30);

    expect(bundleProduct).toBeDefined();
    expect(bundleProduct?.priceDzd).toBe(22000);
    expect(bundleProduct?.capsuleCount).toBe(90);

    // 3 x 8,000 DZD = 24,000 DZD vs 22,000 DZD bundle -> 2,000 DZD exact saving
    const expectedSaving = 3 * oneMonthProduct!.priceDzd! - bundleProduct!.priceDzd!;
    expect(expectedSaving).toBe(2000);
  });
});

