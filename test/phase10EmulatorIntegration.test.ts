import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fft from 'firebase-functions-test';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'ziron-commerce-emulator-audit';
const DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  'ai-studio-zironvirexonbios-f7d3e78d-aa70-4ff3-ae14-d8f7ce2b420b';

process.env.GCLOUD_PROJECT = PROJECT_ID;
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8085';

describe('PHASE 10.4.1 — REAL FIREBASE EMULATOR INTEGRATION LAYER', () => {
  let adminDb: FirebaseFirestore.Firestore;
  let testEnv: any;
  let rulesTestEnv: RulesTestEnvironment;
  let funcs: any;

  let wrapCreateCustomerOrder: any;
  let wrapUpdateOrderStatus: any;
  let wrapUpdatePaymentStatus: any;
  let wrapCancelCustomerOrder: any;
  let wrapUpdateCommerceInventory: any;
  let wrapCreateCommerceVariant: any;
  let wrapCreateCommerceProduct: any;

  const adminAuth = {
    uid: 'admin-emulator-user',
    token: { email: 'admin@virexon-biosciences.com', email_verified: true },
  };

  const customerAuth = {
    uid: 'cust-emulator-user',
    token: { email: 'customer@virexon-biosciences.com', email_verified: true },
  };

  const otherCustomerAuth = {
    uid: 'cust-other-user',
    token: { email: 'other@virexon-biosciences.com', email_verified: true },
  };

  const validShippingAddress = {
    recipientName: 'Amina Mansouri',
    phone: '0555010203',
    wilaya: 'Algiers',
    city: 'Algiers Central',
    address: '14 Boulevard Zighout Youcef',
    notes: 'Please call before delivery',
  };

  beforeAll(async () => {
    // 1. Initialize Admin SDK pointing to real Firestore Emulator
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: PROJECT_ID });
    }
    adminDb = getFirestore(DATABASE_ID);

    // 2. Initialize firebase-functions-test wrapping real Cloud Functions
    testEnv = fft({ projectId: PROJECT_ID });
    funcs = await import('../functions/lib/index.js');

    wrapCreateCustomerOrder = testEnv.wrap(funcs.createCustomerOrder);
    wrapUpdateOrderStatus = testEnv.wrap(funcs.updateOrderStatus);
    wrapUpdatePaymentStatus = testEnv.wrap(funcs.updatePaymentStatus);
    wrapCancelCustomerOrder = testEnv.wrap(funcs.cancelCustomerOrder);
    wrapUpdateCommerceInventory = testEnv.wrap(funcs.updateCommerceInventory);
    wrapCreateCommerceVariant = testEnv.wrap(funcs.createCommerceVariant);
    wrapCreateCommerceProduct = testEnv.wrap(funcs.createCommerceProduct);

    // 3. Initialize Rules Testing Environment with production firestore.rules
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    rulesTestEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: '127.0.0.1',
        port: 8085,
        rules: rulesContent,
      },
    });

    // Seed test users in real Firestore emulator (both named DB and default DB for rules)
    const seedUserData = async (uid: string, email: string, roles: string[]) => {
      const uData = {
        uid,
        email,
        displayName: `Test ${uid}`,
        roles,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await adminDb.collection('users').doc(uid).set(uData);
      await rulesTestEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'users', uid), uData);
      });
    };

    await seedUserData(adminAuth.uid, adminAuth.token.email, ['SUPER_ADMIN', 'ADMIN']);
    await seedUserData(customerAuth.uid, customerAuth.token.email, ['CUSTOMER']);
    await seedUserData(otherCustomerAuth.uid, otherCustomerAuth.token.email, ['CUSTOMER']);
  });

  afterAll(async () => {
    if (testEnv) {
      testEnv.cleanup();
    }
    if (rulesTestEnv) {
      await rulesTestEnv.cleanup();
    }
  });

  /**
   * Helper to seed standard product, variant, and inventory in the real emulator
   */
  async function seedTestProductAndVariant(options: {
    sku: string;
    price: number;
    initialStock: number;
    productStatus?: string;
    variantStatus?: string;
    capsuleCount?: number;
    customInventoryId?: string;
  }) {
    const {
      sku,
      price,
      initialStock,
      productStatus = 'ACTIVE',
      variantStatus = 'ACTIVE',
      capsuleCount = 30,
      customInventoryId,
    } = options;

    const productId = `prod-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const variantId = `var-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const invId = customInventoryId || `inv-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const now = new Date().toISOString();

    await adminDb.collection('products').doc(productId).set({
      id: productId,
      sku: sku.toUpperCase(),
      name: { en: `Product ${sku}`, fr: `Produit ${sku}`, ar: `منتج ${sku}` },
      slug: productId,
      description: { en: 'Clinical grade test product', fr: '', ar: '' },
      shortDescription: { en: 'Short test description', fr: '', ar: '' },
      brand: 'ZIRON / VIREXON BIOSCIENCES',
      status: productStatus,
      productType: 'PHYSICAL',
      images: ['https://example.com/capsule.jpg'],
      phaseNumber: 1,
      capsuleCount,
      createdAt: now,
      updatedAt: now,
    });

    await adminDb.collection('productVariants').doc(variantId).set({
      id: variantId,
      productId,
      sku: sku.toUpperCase(),
      name: `Variant ${sku}`,
      quantity: capsuleCount,
      unit: 'capsules',
      price,
      currency: 'DZD',
      status: variantStatus,
      inventoryId: invId,
      createdAt: now,
      updatedAt: now,
    });

    await adminDb.collection('inventory').doc(invId).set({
      id: invId,
      variantId,
      productId,
      sku: sku.toUpperCase(),
      availableQuantity: initialStock,
      reservedQuantity: 0,
      soldQuantity: 0,
      totalQuantity: initialStock,
      lowStockThreshold: 5,
      status: initialStock <= 0 ? 'OUT_OF_STOCK' : initialStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
      updatedAt: now,
    });

    return { productId, variantId, invId };
  }

  // =========================================================================
  // SUITE 1: FLOW A — createCustomerOrder Server-Authoritative Logic & Concurrency
  // =========================================================================
  describe('SUITE 1: FLOW A — createCustomerOrder', () => {
    it('enforces server-authoritative pricing and calculates accurate totals in real emulator', async () => {
      const { variantId, invId } = await seedTestProductAndVariant({
        sku: 'FLOWA-PRICE-01',
        price: 8500,
        initialStock: 20,
      });

      const orderPayload = {
        items: [
          {
            variantId,
            quantity: 2,
          },
        ],
        shippingAddress: validShippingAddress,
      };

      const result = await wrapCreateCustomerOrder(orderPayload, { auth: customerAuth });
      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();

      const createdOrder = result.order;
      // Server authoritatively computed 8500 * 2 = 17000 DZD
      expect(createdOrder.items[0].unitPrice).toBe(8500);
      expect(createdOrder.items[0].subtotal).toBe(17000);
      expect(createdOrder.subtotal).toBe(17000);
      expect(createdOrder.total).toBe(17000);

      // Verify real Firestore inventory document reservation
      const invSnap = await adminDb.collection('inventory').doc(invId).get();
      const invData = invSnap.data()!;
      expect(invData.availableQuantity).toBe(18);
      expect(invData.reservedQuantity).toBe(2);
      expect(invData.soldQuantity).toBe(0);
    });

    it('strictly rejects client price/subtotal/total tampering in real emulator', async () => {
      const { variantId } = await seedTestProductAndVariant({
        sku: 'FLOWA-TAMPER-01',
        price: 9000,
        initialStock: 10,
      });

      const tamperedPayload = {
        items: [
          {
            variantId,
            quantity: 1,
            unitPrice: 100, // Tampered client price
          },
        ],
        shippingAddress: validShippingAddress,
      };

      await expect(
        wrapCreateCustomerOrder(tamperedPayload, { auth: customerAuth })
      ).rejects.toThrow(/tampering detected/i);
    });

    it('strictly rejects insufficient inventory with failed-precondition in real emulator', async () => {
      const { variantId } = await seedTestProductAndVariant({
        sku: 'FLOWA-STOCK-01',
        price: 5000,
        initialStock: 3,
      });

      const orderPayload = {
        items: [{ variantId, quantity: 4 }], // Requesting 4 when only 3 available
        shippingAddress: validShippingAddress,
      };

      await expect(
        wrapCreateCustomerOrder(orderPayload, { auth: customerAuth })
      ).rejects.toThrow(/Insufficient inventory/i);
    });

    it('strictly rejects missing or malformed inventory records', async () => {
      const { variantId, invId } = await seedTestProductAndVariant({
        sku: 'FLOWA-MISSING-INV-01',
        price: 4000,
        initialStock: 10,
      });

      // Delete the inventory document to simulate missing record
      await adminDb.collection('inventory').doc(invId).delete();

      const orderPayload = {
        items: [{ variantId, quantity: 1 }],
        shippingAddress: validShippingAddress,
      };

      await expect(
        wrapCreateCustomerOrder(orderPayload, { auth: customerAuth })
      ).rejects.toThrow(/missing/i);
    });

    it('enforces atomic inventory reservation and updates stock status in real emulator', async () => {
      const { variantId, invId } = await seedTestProductAndVariant({
        sku: 'FLOWA-STATUS-TRANS-01',
        price: 6000,
        initialStock: 6, // threshold is 5
      });

      // Reserve 2 -> leaves 4 available (<= 5, so status should become LOW_STOCK)
      const res1 = await wrapCreateCustomerOrder(
        {
          items: [{ variantId, quantity: 2 }],
          shippingAddress: validShippingAddress,
        },
        { auth: customerAuth }
      );
      expect(res1.success).toBe(true);

      const invSnap1 = await adminDb.collection('inventory').doc(invId).get();
      expect(invSnap1.data()?.availableQuantity).toBe(4);
      expect(invSnap1.data()?.reservedQuantity).toBe(2);
      expect(invSnap1.data()?.status).toBe('LOW_STOCK');

      // Reserve remaining 4 -> leaves 0 available (status becomes OUT_OF_STOCK)
      const res2 = await wrapCreateCustomerOrder(
        {
          items: [{ variantId, quantity: 4 }],
          shippingAddress: validShippingAddress,
        },
        { auth: customerAuth }
      );
      expect(res2.success).toBe(true);

      const invSnap2 = await adminDb.collection('inventory').doc(invId).get();
      expect(invSnap2.data()?.availableQuantity).toBe(0);
      expect(invSnap2.data()?.reservedQuantity).toBe(6);
      expect(invSnap2.data()?.status).toBe('OUT_OF_STOCK');
    });

    it('enforces atomic idempotency key preventing duplicate orders and double reservation', async () => {
      const { variantId, invId } = await seedTestProductAndVariant({
        sku: 'FLOWA-IDEMP-01',
        price: 7000,
        initialStock: 10,
      });

      const idempotencyKey = `idemp-${Date.now()}-test-key`;
      const orderPayload = {
        idempotencyKey,
        items: [{ variantId, quantity: 3 }],
        shippingAddress: validShippingAddress,
      };

      // Call 1
      const res1 = await wrapCreateCustomerOrder(orderPayload, { auth: customerAuth });
      expect(res1.success).toBe(true);
      const firstOrderId = res1.order.id;

      // Call 2 with identical idempotencyKey
      const res2 = await wrapCreateCustomerOrder(orderPayload, { auth: customerAuth });
      expect(res2.success).toBe(true);
      expect(res2.order.id).toBe(firstOrderId);

      // Verify stock was deducted exactly ONCE in real Firestore
      const invSnap = await adminDb.collection('inventory').doc(invId).get();
      expect(invSnap.data()?.availableQuantity).toBe(7); // 10 - 3 = 7, NOT 4
      expect(invSnap.data()?.reservedQuantity).toBe(3);
    });

    it('rejects order when product is non-active or variant is inactive', async () => {
      const { variantId } = await seedTestProductAndVariant({
        sku: 'FLOWA-INACTIVE-01',
        price: 5000,
        initialStock: 10,
        productStatus: 'DRAFT',
      });

      const orderPayload = {
        items: [{ variantId, quantity: 1 }],
        shippingAddress: validShippingAddress,
      };

      await expect(
        wrapCreateCustomerOrder(orderPayload, { auth: customerAuth })
      ).rejects.toThrow(/not currently active for purchase/i);
    });

    it('verifies transactional rollback when multi-item order encounters insufficient stock midway', async () => {
      const item1 = await seedTestProductAndVariant({
        sku: 'FLOWA-ROLLBACK-A',
        price: 3000,
        initialStock: 10,
      });

      const item2 = await seedTestProductAndVariant({
        sku: 'FLOWA-ROLLBACK-B',
        price: 4000,
        initialStock: 1, // Only 1 in stock
      });

      const orderPayload = {
        items: [
          { variantId: item1.variantId, quantity: 2 }, // Feasible
          { variantId: item2.variantId, quantity: 5 }, // Infeasible (only 1 available)
        ],
        shippingAddress: validShippingAddress,
      };

      await expect(
        wrapCreateCustomerOrder(orderPayload, { auth: customerAuth })
      ).rejects.toThrow(/Insufficient inventory/i);

      // Verify item1 inventory was rolled back completely in Firestore emulator
      const snap1 = await adminDb.collection('inventory').doc(item1.invId).get();
      expect(snap1.data()?.availableQuantity).toBe(10);
      expect(snap1.data()?.reservedQuantity).toBe(0);

      const snap2 = await adminDb.collection('inventory').doc(item2.invId).get();
      expect(snap2.data()?.availableQuantity).toBe(1);
      expect(snap2.data()?.reservedQuantity).toBe(0);
    });
  });

  // =========================================================================
  // SUITE 2: FLOW B — updateOrderStatus & Order State Machine
  // =========================================================================
  describe('SUITE 2: FLOW B — updateOrderStatus & State Machine', () => {
    let baseOrder: any;
    let baseInvId: string;
    let baseVariantId: string;

    beforeEach(async () => {
      const seeded = await seedTestProductAndVariant({
        sku: `FLOWB-BASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        price: 9000,
        initialStock: 15,
      });
      baseInvId = seeded.invId;
      baseVariantId = seeded.variantId;

      const orderRes = await wrapCreateCustomerOrder(
        {
          items: [{ variantId: baseVariantId, quantity: 3 }],
          shippingAddress: validShippingAddress,
        },
        { auth: customerAuth }
      );
      baseOrder = orderRes.order;
    });

    it('enforces sequential progression and rejects invalid state jumps', async () => {
      // PENDING -> DELIVERED is strictly illegal
      await expect(
        wrapUpdateOrderStatus(
          { orderId: baseOrder.id, status: 'DELIVERED', note: 'Skipping steps' },
          { auth: adminAuth }
        )
      ).rejects.toThrow(/Invalid order status transition from PENDING to DELIVERED/i);

      // PENDING -> SHIPPED is illegal
      await expect(
        wrapUpdateOrderStatus(
          { orderId: baseOrder.id, status: 'SHIPPED', note: 'Skipping steps' },
          { auth: adminAuth }
        )
      ).rejects.toThrow(/Invalid order status transition from PENDING to SHIPPED/i);

      // PENDING -> CONFIRMED is valid
      const confirmedRes = await wrapUpdateOrderStatus(
        { orderId: baseOrder.id, status: 'CONFIRMED', note: 'Order confirmed by staff' },
        { auth: adminAuth }
      );
      expect(confirmedRes.success).toBe(true);
      expect(confirmedRes.order.status).toBe('CONFIRMED');

      // CONFIRMED -> PROCESSING is valid
      const procRes = await wrapUpdateOrderStatus(
        { orderId: baseOrder.id, status: 'PROCESSING', note: 'Packaging underway' },
        { auth: adminAuth }
      );
      expect(procRes.success).toBe(true);
      expect(procRes.order.status).toBe('PROCESSING');
    });

    it('strictly prevents SHIPPED transition when shippingStatus is NEGOTIATION_REQUIRED', async () => {
      // Advance to CONFIRMED -> PROCESSING
      await wrapUpdateOrderStatus(
        { orderId: baseOrder.id, status: 'CONFIRMED' },
        { auth: adminAuth }
      );
      await wrapUpdateOrderStatus(
        { orderId: baseOrder.id, status: 'PROCESSING' },
        { auth: adminAuth }
      );

      // Mark order shippingStatus as NEGOTIATION_REQUIRED in Firestore
      await adminDb.collection('orders').doc(baseOrder.id).update({
        shippingStatus: 'NEGOTIATION_REQUIRED',
      });

      // Attempting SHIPPED must fail
      await expect(
        wrapUpdateOrderStatus(
          { orderId: baseOrder.id, status: 'SHIPPED', note: 'Dispatch' },
          { auth: adminAuth }
        )
      ).rejects.toThrow(/pending negotiation/i);
    });

    it('strictly requires a mandatory cancellation reason (note)', async () => {
      await expect(
        wrapUpdateOrderStatus(
          { orderId: baseOrder.id, status: 'CANCELLED' }, // Missing note
          { auth: adminAuth }
        )
      ).rejects.toThrow(/A mandatory cancellation reason \(note\) is required/i);

      await expect(
        wrapUpdateOrderStatus(
          { orderId: baseOrder.id, status: 'CANCELLED', note: '   ' }, // Whitespace note
          { auth: adminAuth }
        )
      ).rejects.toThrow(/A mandatory cancellation reason \(note\) is required/i);
    });

    it('restores reserved inventory back to available on cancellation of unpaid order', async () => {
      // Current inventory state: available 12, reserved 3
      const invBefore = (await adminDb.collection('inventory').doc(baseInvId).get()).data()!;
      expect(invBefore.availableQuantity).toBe(12);
      expect(invBefore.reservedQuantity).toBe(3);

      const cancelRes = await wrapUpdateOrderStatus(
        { orderId: baseOrder.id, status: 'CANCELLED', note: 'Customer requested cancellation' },
        { auth: adminAuth }
      );
      expect(cancelRes.success).toBe(true);
      expect(cancelRes.order.status).toBe('CANCELLED');

      // Inventory restored in real Firestore
      const invAfter = (await adminDb.collection('inventory').doc(baseInvId).get()).data()!;
      expect(invAfter.availableQuantity).toBe(15);
      expect(invAfter.reservedQuantity).toBe(0);
      expect(invAfter.soldQuantity).toBe(0);
    });

    it('handles paid cancelled orders: updates paymentStatus to REFUNDED and restores from soldQuantity', async () => {
      // Mark order as PAID first via updatePaymentStatus
      await wrapUpdatePaymentStatus(
        { orderId: baseOrder.id, paymentStatus: 'PAID', note: 'Wire transfer confirmed' },
        { auth: adminAuth }
      );

      // Verify stock transitioned to soldQuantity
      const invPaid = (await adminDb.collection('inventory').doc(baseInvId).get()).data()!;
      expect(invPaid.reservedQuantity).toBe(0);
      expect(invPaid.soldQuantity).toBe(3);
      expect(invPaid.availableQuantity).toBe(12);

      // Cancel paid order
      const cancelRes = await wrapUpdateOrderStatus(
        { orderId: baseOrder.id, status: 'CANCELLED', note: 'Doctor recommendation change' },
        { auth: adminAuth }
      );
      expect(cancelRes.success).toBe(true);
      expect(cancelRes.order.status).toBe('CANCELLED');
      expect(cancelRes.order.paymentStatus).toBe('REFUNDED');

      // Verify soldQuantity returned to availableQuantity
      const invRefunded = (await adminDb.collection('inventory').doc(baseInvId).get()).data()!;
      expect(invRefunded.availableQuantity).toBe(15);
      expect(invRefunded.soldQuantity).toBe(0);
      expect(invRefunded.reservedQuantity).toBe(0);
    });

    it('prevents double inventory restoration when cancelling an already cancelled order', async () => {
      await wrapUpdateOrderStatus(
        { orderId: baseOrder.id, status: 'CANCELLED', note: 'First cancel' },
        { auth: adminAuth }
      );

      const invAfterFirst = (await adminDb.collection('inventory').doc(baseInvId).get()).data()!;
      expect(invAfterFirst.availableQuantity).toBe(15);

      // Re-cancelling must be a safe idempotent no-op and NOT increase available stock past 15
      const cancel2 = await wrapUpdateOrderStatus(
        { orderId: baseOrder.id, status: 'CANCELLED', note: 'Duplicate cancel' },
        { auth: adminAuth }
      );
      expect(cancel2.success).toBe(true);

      const invAfterSecond = (await adminDb.collection('inventory').doc(baseInvId).get()).data()!;
      expect(invAfterSecond.availableQuantity).toBe(15); // Still 15, not 18
      expect(invAfterSecond.reservedQuantity).toBe(0);
    });
  });

  // =========================================================================
  // SUITE 3: FLOW C — updatePaymentStatus & Stock Transitions
  // =========================================================================
  describe('SUITE 3: FLOW C — updatePaymentStatus & Stock Transitions', () => {
    let payOrder: any;
    let payInvId: string;
    let payVariantId: string;

    beforeEach(async () => {
      const seeded = await seedTestProductAndVariant({
        sku: `FLOWC-PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        price: 11000,
        initialStock: 20,
      });
      payInvId = seeded.invId;
      payVariantId = seeded.variantId;

      const orderRes = await wrapCreateCustomerOrder(
        {
          items: [{ variantId: payVariantId, quantity: 4 }],
          shippingAddress: validShippingAddress,
        },
        { auth: customerAuth }
      );
      payOrder = orderRes.order;
    });

    it('transitions items from reservedQuantity to soldQuantity atomically when paymentStatus becomes PAID', async () => {
      const invBefore = (await adminDb.collection('inventory').doc(payInvId).get()).data()!;
      expect(invBefore.availableQuantity).toBe(16);
      expect(invBefore.reservedQuantity).toBe(4);
      expect(invBefore.soldQuantity).toBe(0);

      const result = await wrapUpdatePaymentStatus(
        { orderId: payOrder.id, paymentStatus: 'PAID', note: 'Bank transfer received' },
        { auth: adminAuth }
      );
      expect(result.success).toBe(true);
      expect(result.order.paymentStatus).toBe('PAID');

      const invAfter = (await adminDb.collection('inventory').doc(payInvId).get()).data()!;
      expect(invAfter.availableQuantity).toBe(16);
      expect(invAfter.reservedQuantity).toBe(0);
      expect(invAfter.soldQuantity).toBe(4);
    });

    it('enforces Payment State Machine and rejects invalid payment transitions', async () => {
      // First move to PAID then REFUNDED
      await wrapUpdatePaymentStatus(
        { orderId: payOrder.id, paymentStatus: 'PAID' },
        { auth: adminAuth }
      );
      await wrapUpdatePaymentStatus(
        { orderId: payOrder.id, paymentStatus: 'REFUNDED' },
        { auth: adminAuth }
      );

      // REFUNDED -> PAID is strictly illegal
      await expect(
        wrapUpdatePaymentStatus(
          { orderId: payOrder.id, paymentStatus: 'PAID' },
          { auth: adminAuth }
        )
      ).rejects.toThrow(/Invalid payment status transition from REFUNDED to PAID/i);
    });

    it('strictly forbids marking a CANCELLED order as PAID', async () => {
      await wrapUpdateOrderStatus(
        { orderId: payOrder.id, status: 'CANCELLED', note: 'Cancelled before payment' },
        { auth: adminAuth }
      );

      await expect(
        wrapUpdatePaymentStatus(
          { orderId: payOrder.id, paymentStatus: 'PAID' },
          { auth: adminAuth }
        )
      ).rejects.toThrow(/Cannot mark a cancelled order as PAID/i);
    });

    it('is idempotent: repeating PAID payment does not increment soldQuantity twice', async () => {
      await wrapUpdatePaymentStatus(
        { orderId: payOrder.id, paymentStatus: 'PAID', note: 'First payment confirmation' },
        { auth: adminAuth }
      );

      const invSnap1 = (await adminDb.collection('inventory').doc(payInvId).get()).data()!;
      expect(invSnap1.soldQuantity).toBe(4);

      // Repeat PAID
      await wrapUpdatePaymentStatus(
        { orderId: payOrder.id, paymentStatus: 'PAID', note: 'Duplicate webhook event' },
        { auth: adminAuth }
      );

      const invSnap2 = (await adminDb.collection('inventory').doc(payInvId).get()).data()!;
      expect(invSnap2.soldQuantity).toBe(4); // Remains exactly 4
    });
  });

  // =========================================================================
  // SUITE 4: FLOW D — DELIVERED & restartFundContribution
  // =========================================================================
  describe('SUITE 4: FLOW D — DELIVERED & Restart Fund Contribution', () => {
    it('creates restartFundContribution and updates pool totals when order reaches DELIVERED', async () => {
      const { variantId } = await seedTestProductAndVariant({
        sku: 'FLOWD-RESTART-01',
        price: 15000,
        initialStock: 10,
        capsuleCount: 30, // 1 physical container per item
      });

      const orderRes = await wrapCreateCustomerOrder(
        {
          items: [{ variantId, quantity: 3 }], // 3 physical containers
          shippingAddress: validShippingAddress,
        },
        { auth: customerAuth }
      );
      const orderId = orderRes.order.id;

      // Advance through order lifecycle to SHIPPED
      await wrapUpdateOrderStatus({ orderId, status: 'CONFIRMED' }, { auth: adminAuth });
      await wrapUpdateOrderStatus({ orderId, status: 'PROCESSING' }, { auth: adminAuth });
      await adminDb.collection('orders').doc(orderId).update({ shippingStatus: 'PAID' });
      await wrapUpdateOrderStatus({ orderId, status: 'SHIPPED' }, { auth: adminAuth });

      // Move to DELIVERED
      const deliveredRes = await wrapUpdateOrderStatus(
        { orderId, status: 'DELIVERED', note: 'Package delivered to recipient' },
        { auth: adminAuth }
      );
      expect(deliveredRes.success).toBe(true);

      const updatedOrder = deliveredRes.order;
      expect(updatedOrder.status).toBe('DELIVERED');

      // Verify authoritative restartFundContributions document in real Firestore
      const contribSnap = await adminDb.collection('restartFundContributions').doc(orderId).get();
      expect(contribSnap.exists).toBe(true);
      const contribData = contribSnap.data()!;
      expect(contribData.orderId).toBe(orderId);
      expect(contribData.userId).toBe(customerAuth.uid);
      expect(contribData.totalContributionDzd).toBe(1500);
      expect(contribData.containersCount).toBe(3);
      expect(contribData.status).toBe('COMMITTED');
    });

    it('ensures restartFundContribution is idempotent when order status update is repeated', async () => {
      const { variantId } = await seedTestProductAndVariant({
        sku: 'FLOWD-RESTART-IDEMP',
        price: 12000,
        initialStock: 5,
        capsuleCount: 30,
      });

      const orderRes = await wrapCreateCustomerOrder(
        {
          items: [{ variantId, quantity: 1 }],
          shippingAddress: validShippingAddress,
        },
        { auth: customerAuth }
      );
      const orderId = orderRes.order.id;

      await wrapUpdateOrderStatus({ orderId, status: 'CONFIRMED' }, { auth: adminAuth });
      await wrapUpdateOrderStatus({ orderId, status: 'PROCESSING' }, { auth: adminAuth });
      await adminDb.collection('orders').doc(orderId).update({ shippingStatus: 'PAID' });
      await wrapUpdateOrderStatus({ orderId, status: 'SHIPPED' }, { auth: adminAuth });
      await wrapUpdateOrderStatus({ orderId, status: 'DELIVERED' }, { auth: adminAuth });

      const contribSnap1 = await adminDb.collection('restartFundContributions').doc(orderId).get();
      expect(contribSnap1.exists).toBe(true);
      const data1 = contribSnap1.data()!;
      expect(data1.totalContributionDzd).toBe(500);

      // Re-deliver
      await wrapUpdateOrderStatus(
        { orderId, status: 'DELIVERED', note: 'Customer confirmation call' },
        { auth: adminAuth }
      );

      const contribSnap2 = await adminDb.collection('restartFundContributions').doc(orderId).get();
      const data2 = contribSnap2.data()!;
      expect(data2.totalContributionDzd).toBe(500); // No double allocation
      expect(data2.createdAt).toBe(data1.createdAt);
    });
  });

  // =========================================================================
  // SUITE 5: FLOW E — Firestore Security Rules Real Evaluation
  // =========================================================================
  describe('SUITE 5: FLOW E — Security Rules Evaluation', () => {
    it('strictly forbids client direct writes to orders collection', async () => {
      const clientDb = rulesTestEnv.authenticatedContext(customerAuth.uid).firestore();
      const fakeOrderRef = doc(clientDb, 'orders', 'fake-client-order-01');

      await assertFails(
        setDoc(fakeOrderRef, {
          id: 'fake-client-order-01',
          userId: customerAuth.uid,
          totalAmount: 10,
          status: 'DELIVERED',
        })
      );
    });

    it('strictly forbids client direct writes to inventory collection', async () => {
      const clientDb = rulesTestEnv.authenticatedContext(customerAuth.uid).firestore();
      const fakeInvRef = doc(clientDb, 'inventory', 'inv-hack');

      await assertFails(
        setDoc(fakeInvRef, {
          availableQuantity: 999999,
          status: 'IN_STOCK',
        })
      );

      // Even admin direct write via client SDK is denied by rules (mutations must go through functions)
      const adminClientDb = rulesTestEnv
        .authenticatedContext(adminAuth.uid, { roles: ['ADMIN'] })
        .firestore();
      await assertFails(
        updateDoc(doc(adminClientDb, 'inventory', 'inv-hack'), {
          availableQuantity: 50,
        })
      );
    });

    it('strictly forbids client direct writes to restartFundContributions', async () => {
      const clientDb = rulesTestEnv.authenticatedContext(customerAuth.uid).firestore();
      const fakeContribRef = doc(clientDb, 'restartFundContributions', 'fake-contrib-01');

      await assertFails(
        setDoc(fakeContribRef, {
          amount: 500000,
          userId: customerAuth.uid,
        })
      );
    });

    it('allows customers to read ONLY their own orders and forbids cross-customer reads', async () => {
      const custOrderId = 'ord-rule-test-cust1';
      const orderData = {
        id: custOrderId,
        userId: customerAuth.uid,
        totalAmount: 15000,
        status: 'CONFIRMED',
      };

      // Seed order via security rules bypass in the rules test environment database
      await rulesTestEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'orders', custOrderId), orderData);
      });

      // Customer 1 reading their own order -> SUCCEEDS
      const cust1Db = rulesTestEnv.authenticatedContext(customerAuth.uid).firestore();
      await assertSucceeds(getDoc(doc(cust1Db, 'orders', custOrderId)));

      // Customer 2 reading Customer 1's order -> FAILS
      const cust2Db = rulesTestEnv.authenticatedContext(otherCustomerAuth.uid).firestore();
      await assertFails(getDoc(doc(cust2Db, 'orders', custOrderId)));
    });
  });

  // =========================================================================
  // SUITE 6: Concurrency, Transactional Rollback & Conservation
  // =========================================================================
  describe('SUITE 6: Optimistic Concurrency & Stock Conservation', () => {
    it('conserves inventory and avoids negative stock under concurrent competing orders in real emulator', async () => {
      const { variantId, invId } = await seedTestProductAndVariant({
        sku: 'CONCUR-RACE-01',
        price: 8000,
        initialStock: 2, // Exactly 2 in stock
      });

      // 5 concurrent shoppers all trying to buy 1 item at the exact same millisecond
      const concurrentRequests = [1, 2, 3, 4, 5].map((idx) =>
        wrapCreateCustomerOrder(
          {
            items: [{ variantId, quantity: 1 }],
            shippingAddress: {
              ...validShippingAddress,
              recipientName: `Shopper ${idx}`,
            },
          },
          { auth: customerAuth }
        )
      );

      const results = await Promise.allSettled(concurrentRequests);

      const successes = results.filter((r) => r.status === 'fulfilled');
      const failures = results.filter((r) => r.status === 'rejected');

      // Exactly 2 succeeded, 3 failed with insufficient inventory
      expect(successes.length).toBe(2);
      expect(failures.length).toBe(3);

      // Verify Firestore inventory state in real emulator
      const finalInv = (await adminDb.collection('inventory').doc(invId).get()).data()!;
      expect(finalInv.availableQuantity).toBe(0);
      expect(finalInv.reservedQuantity).toBe(2);
      expect(finalInv.soldQuantity).toBe(0);
      // Invariant: total quantity conserved, never negative
      expect(finalInv.availableQuantity + finalInv.reservedQuantity).toBe(2);
      expect(finalInv.availableQuantity).toBeGreaterThanOrEqual(0);
    });

    it('handles manual inventory adjustment and enforces non-negative constraint in real emulator', async () => {
      const { variantId, invId } = await seedTestProductAndVariant({
        sku: 'MANUAL-ADJ-CONCUR',
        price: 5000,
        initialStock: 10,
      });

      // Admin adjusts +5
      const adj1 = await wrapUpdateCommerceInventory(
        { variantId, adjustment: 5, reason: 'Restock shipment received' },
        { auth: adminAuth }
      );
      expect(adj1.success).toBe(true);

      const snap1 = (await adminDb.collection('inventory').doc(invId).get()).data()!;
      expect(snap1.availableQuantity).toBe(15);

      // Admin tries to deduct -20 (exceeds available 15) -> must fail
      await expect(
        wrapUpdateCommerceInventory(
          { variantId, adjustment: -20, reason: 'Damaged stock deduction' },
          { auth: adminAuth }
        )
      ).rejects.toThrow(/Negative stock is strictly prohibited/i);

      // Final stock still exactly 15
      const snap2 = (await adminDb.collection('inventory').doc(invId).get()).data()!;
      expect(snap2.availableQuantity).toBe(15);
    });
  });

  // =========================================================================
  // SUITE 7: Requirement 9 — Inventory Identity Governance
  // =========================================================================
  describe('SUITE 7: Requirement 9 — Authoritative inventoryId Resolution', () => {
    it('authoritatively uses variant inventoryId without reconstructing from SKU', async () => {
      // Create a variant where inventoryId does NOT follow the inv-${sku} pattern
      const customInventoryDocId = 'inv-clinical-secure-vault-99';
      const { variantId, invId } = await seedTestProductAndVariant({
        sku: 'AUTH-INVID-01',
        price: 9500,
        initialStock: 10,
        customInventoryId: customInventoryDocId,
      });

      expect(invId).toBe(customInventoryDocId);

      // Verify variant references custom inventory ID
      const varSnap = await adminDb.collection('productVariants').doc(variantId).get();
      expect(varSnap.data()?.inventoryId).toBe(customInventoryDocId);

      // Order 2 items
      const orderRes = await wrapCreateCustomerOrder(
        {
          items: [{ variantId, quantity: 2 }],
          shippingAddress: validShippingAddress,
        },
        { auth: customerAuth }
      );
      expect(orderRes.success).toBe(true);

      // Order item snapshot must store authoritative inventoryId
      const orderItem = orderRes.order.items[0];
      expect(orderItem.inventoryId).toBe(customInventoryDocId);

      // Authoritative inventory document must be updated in Firestore
      const customInvSnap = await adminDb.collection('inventory').doc(customInventoryDocId).get();
      expect(customInvSnap.exists).toBe(true);
      expect(customInvSnap.data()?.availableQuantity).toBe(8);
      expect(customInvSnap.data()?.reservedQuantity).toBe(2);

      // Cancel order and verify restoration targets the authoritative inventoryId
      const cancelRes = await wrapUpdateOrderStatus(
        { orderId: orderRes.order.id, status: 'CANCELLED', note: 'Authoritative cancellation' },
        { auth: adminAuth }
      );
      expect(cancelRes.success).toBe(true);

      const restoredInv = (await adminDb.collection('inventory').doc(customInventoryDocId).get()).data()!;
      expect(restoredInv.availableQuantity).toBe(10);
      expect(restoredInv.reservedQuantity).toBe(0);
    });

    it('maintains backward compatibility fallback for legacy records missing explicit inventoryId', async () => {
      // Simulate legacy variant missing inventoryId field
      const legacySku = 'LEGACY-SKU-99';
      const legacyVariantId = 'var-legacy-sku-99';
      const fallbackInvId = 'inv-legacy-sku-99';

      await adminDb.collection('products').doc('prod-legacy-99').set({
        id: 'prod-legacy-99',
        sku: legacySku,
        name: { en: 'Legacy Product' },
        status: 'ACTIVE',
        productType: 'PHYSICAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await adminDb.collection('productVariants').doc(legacyVariantId).set({
        id: legacyVariantId,
        productId: 'prod-legacy-99',
        sku: legacySku,
        name: 'Legacy Variant',
        price: 4500,
        status: 'ACTIVE',
        // Note: inventoryId intentionally omitted to test fallback
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await adminDb.collection('inventory').doc(fallbackInvId).set({
        id: fallbackInvId,
        variantId: legacyVariantId,
        productId: 'prod-legacy-99',
        sku: legacySku,
        availableQuantity: 8,
        reservedQuantity: 0,
        soldQuantity: 0,
        status: 'IN_STOCK',
        lowStockThreshold: 2,
        updatedAt: new Date().toISOString(),
      });

      // Placing order should smoothly fallback to inv-legacy-sku-99
      const res = await wrapCreateCustomerOrder(
        {
          items: [{ variantId: legacyVariantId, quantity: 2 }],
          shippingAddress: validShippingAddress,
        },
        { auth: customerAuth }
      );
      expect(res.success).toBe(true);

      const invSnap = await adminDb.collection('inventory').doc(fallbackInvId).get();
      expect(invSnap.data()?.availableQuantity).toBe(6);
      expect(invSnap.data()?.reservedQuantity).toBe(2);
    });
  });
});
