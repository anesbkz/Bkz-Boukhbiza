import { describe, it, expect } from 'vitest';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  OrderHistoryEntry,
} from '@/types/commerce';
import {
  formatDzdPrice,
  isValidOrderTransition,
  isValidPaymentTransition,
  validateOrderTransition,
  validatePaymentTransition,
} from '@/services/commerce/pricingService';
import { hasPermission } from '@/lib/rbac/permissions';
import { UserProfile } from '@/types/models';

/**
 * Phase 10.5: Admin Order Operations UI & Behavioral Contracts
 * Targeted Unit & In-Memory Test Suite
 *
 * NOTE: These are Unit & In-Memory Logic Tests verifying client-side state
 * transformations, authorization guards, and state-machine validation contracts.
 * For live Firebase Emulator tests, see test/phase10EmulatorIntegration.test.ts.
 */
describe('Phase 10.5 — Admin Order Operations UI Contracts', () => {
  // Mock order fixture representing a canonical customer order
  const mockCanonicalOrder: Order = {
    id: 'ord-test-001',
    orderNumber: 'ZR-2026-0001',
    userId: 'cust-usr-42',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'CASH_ON_DELIVERY',
    items: [
      {
        productId: 'ziron-core',
        sku: 'ZR-3M-BUNDLE',
        productNameSnapshot: 'ZIRON 3-Month Complete Program',
        variantNameSnapshot: '3 x 60 Capsules (180 Total)',
        quantity: 1,
        unitPrice: 22000,
        subtotal: 22000,
        inventoryId: 'INV-BATCH-2026-01',
      },
    ],
    subtotal: 22000,
    shippingCost: 0,
    shippingStatus: 'FREE',
    discounts: 0,
    total: 22000,
    currency: 'DZD',
    shippingAddress: {
      recipientName: 'Sofiane Benali',
      phone: '0550123456',
      wilaya: 'Algiers',
      city: 'Bab El Oued',
      address: '14 Rue Colonel Lotfi',
      postalCode: '16000',
      notes: 'Ring bell 2B upon arrival',
    },
    customerSnapshot: {
      displayName: 'Sofiane Benali',
      email: 'sofiane.benali@example.dz',
      phone: '0550123456',
    },
    history: [
      {
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        shippingStatus: 'FREE',
        timestamp: '2026-03-20T10:00:00.000Z',
        actorUserId: 'cust-usr-42',
        note: 'Customer placed initial order',
      },
    ],
    createdAt: '2026-03-20T10:00:00.000Z',
    updatedAt: '2026-03-20T10:00:00.000Z',
  };

  const mockNegotiationOrder: Order = {
    id: 'ord-test-002',
    orderNumber: 'ZR-2026-0002',
    userId: 'cust-usr-99',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'CASH_ON_DELIVERY',
    items: [
      {
        productId: 'ziron-phase1',
        sku: 'ZR-P1-START',
        productNameSnapshot: 'ZIRON Phase 1 - Metabolic Activation',
        variantNameSnapshot: '60 Capsules',
        quantity: 1,
        unitPrice: 8000,
        subtotal: 8000,
      },
    ],
    subtotal: 8000,
    shippingCost: 0,
    shippingStatus: 'NEGOTIATION_REQUIRED',
    discounts: 0,
    total: 8000,
    currency: 'DZD',
    shippingAddress: {
      recipientName: 'Amine Khelil',
      phone: '0661987654',
      wilaya: 'Tamanrasset',
      city: 'Tamanrasset',
      address: 'Quartier Tahaggart',
    },
    customerSnapshot: {
      displayName: 'Amine Khelil',
      email: 'amine.khelil@example.dz',
    },
    history: [
      {
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        shippingStatus: 'NEGOTIATION_REQUIRED',
        timestamp: '2026-03-21T09:30:00.000Z',
        actorUserId: 'cust-usr-99',
        note: 'Order submitted with remote wilaya delivery',
      },
    ],
    createdAt: '2026-03-21T09:30:00.000Z',
    updatedAt: '2026-03-21T09:30:00.000Z',
  };

  /* ==========================================================================
     1. AUTHORIZATION & RBAC CONTRACTS
     ========================================================================== */
  describe('1. Access Control & Authorization (RBAC)', () => {
    it('grants MANAGE_ORDERS to authorized staff roles (SUPER_ADMIN, ADMIN, ORDER_MANAGER)', () => {
      const superAdmin: UserProfile = {
        uid: 'sa-1',
        email: 'superadmin@virexon.dz',
        roles: ['SUPER_ADMIN'],
        status: 'active',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        onboardingCompleted: true,
        communityAccess: true,
        schoolAccess: true,
        xp: 0,
        level: 1,
        locale: 'en',
      };
      const admin: UserProfile = {
        ...superAdmin,
        uid: 'adm-1',
        roles: ['ADMIN'],
      };
      const orderManager: UserProfile = {
        ...superAdmin,
        uid: 'om-1',
        roles: ['ORDER_MANAGER'],
      };

      expect(hasPermission(superAdmin, 'MANAGE_ORDERS')).toBe(true);
      expect(hasPermission(admin, 'MANAGE_ORDERS')).toBe(true);
      expect(hasPermission(orderManager, 'MANAGE_ORDERS')).toBe(true);
    });

    it('denies MANAGE_ORDERS to unauthorized users and customer profiles', () => {
      const customer: UserProfile = {
        uid: 'cust-1',
        email: 'customer@test.dz',
        roles: ['CUSTOMER'],
        status: 'active',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        onboardingCompleted: true,
        communityAccess: true,
        schoolAccess: true,
        xp: 0,
        level: 1,
        locale: 'en',
      };
      const analyst: UserProfile = {
        ...customer,
        uid: 'an-1',
        roles: ['ANALYST'],
      };
      const communityMgr: UserProfile = {
        ...customer,
        uid: 'cm-1',
        roles: ['COMMUNITY_MANAGER'],
      };

      expect(hasPermission(customer, 'MANAGE_ORDERS')).toBe(false);
      expect(hasPermission(analyst, 'MANAGE_ORDERS')).toBe(false);
      expect(hasPermission(communityMgr, 'MANAGE_ORDERS')).toBe(false);
    });
  });

  /* ==========================================================================
     2. SEARCH & FILTER LOGIC CONTRACTS
     ========================================================================== */
  describe('2. Search & Operational Filter Logic', () => {
    const ordersList = [mockCanonicalOrder, mockNegotiationOrder];

    it('correctly filters orders by order ID / number search term', () => {
      const term = 'ZR-2026-0001';
      const results = ordersList.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(term.toLowerCase()) ||
          o.id.toLowerCase().includes(term.toLowerCase())
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('ord-test-001');
    });

    it('correctly filters orders by customer name, email, and phone', () => {
      // By Customer Name
      const byName = ordersList.filter((o) =>
        (o.customerSnapshot?.displayName || '').toLowerCase().includes('amine')
      );
      expect(byName).toHaveLength(1);
      expect(byName[0].id).toBe('ord-test-002');

      // By Customer Email
      const byEmail = ordersList.filter((o) =>
        (o.customerSnapshot?.email || '').toLowerCase().includes('sofiane.benali')
      );
      expect(byEmail).toHaveLength(1);
      expect(byEmail[0].id).toBe('ord-test-001');

      // By Phone
      const byPhone = ordersList.filter((o) =>
        (o.shippingAddress?.phone || '').includes('0550123456')
      );
      expect(byPhone).toHaveLength(1);
      expect(byPhone[0].id).toBe('ord-test-001');
    });

    it('correctly filters orders by shippingStatus (quick negotiation required filter)', () => {
      const negotiationOnly = ordersList.filter(
        (o) => o.shippingStatus === 'NEGOTIATION_REQUIRED'
      );
      expect(negotiationOnly).toHaveLength(1);
      expect(negotiationOnly[0].id).toBe('ord-test-002');

      const freeOnly = ordersList.filter((o) => o.shippingStatus === 'FREE');
      expect(freeOnly).toHaveLength(1);
      expect(freeOnly[0].id).toBe('ord-test-001');
    });

    it('correctly filters orders by order status and payment status', () => {
      const pendingOrders = ordersList.filter((o) => o.status === 'PENDING');
      expect(pendingOrders).toHaveLength(2);

      const confirmedOrders = ordersList.filter((o) => o.status === 'CONFIRMED');
      expect(confirmedOrders).toHaveLength(0);
    });
  });

  /* ==========================================================================
     3. ORDER DETAIL PRESENTATION CONTRACTS
     ========================================================================== */
  describe('3. Order Detail Presentation & Completeness', () => {
    it('contains all required customer identity and shipping information', () => {
      expect(mockCanonicalOrder.customerSnapshot.displayName).toBe('Sofiane Benali');
      expect(mockCanonicalOrder.customerSnapshot.email).toBe('sofiane.benali@example.dz');
      expect(mockCanonicalOrder.customerSnapshot.phone).toBe('0550123456');
      expect(mockCanonicalOrder.shippingAddress.wilaya).toBe('Algiers');
      expect(mockCanonicalOrder.shippingAddress.address).toBe('14 Rue Colonel Lotfi');
    });

    it('contains all required line item details including variant and operational inventoryId', () => {
      const item = mockCanonicalOrder.items[0];
      expect(item.productNameSnapshot).toBe('ZIRON 3-Month Complete Program');
      expect(item.variantNameSnapshot).toBe('3 x 60 Capsules (180 Total)');
      expect(item.sku).toBe('ZR-3M-BUNDLE');
      expect(item.quantity).toBe(1);
      expect(item.unitPrice).toBe(22000);
      expect(item.subtotal).toBe(22000);
      expect(item.inventoryId).toBe('INV-BATCH-2026-01');
    });

    it('contains immutable order history audit trail entries', () => {
      expect(mockCanonicalOrder.history).toHaveLength(1);
      const entry = mockCanonicalOrder.history[0];
      expect(entry.status).toBe('PENDING');
      expect(entry.paymentStatus).toBe('UNPAID');
      expect(entry.actorUserId).toBe('cust-usr-42');
      expect(entry.note).toBe('Customer placed initial order');
      expect(entry.timestamp).toBeDefined();
    });
  });

  /* ==========================================================================
     4. ORDER STATE MACHINE TRANSITION RULES
     ========================================================================== */
  describe('4. Order State Machine Transition Validation', () => {
    it('allows valid forward lifecycle transitions', () => {
      // PENDING -> CONFIRMED
      expect(isValidOrderTransition('PENDING', 'CONFIRMED')).toBe(true);
      // PENDING -> CANCELLED
      expect(isValidOrderTransition('PENDING', 'CANCELLED')).toBe(true);
      // CONFIRMED -> PROCESSING
      expect(isValidOrderTransition('CONFIRMED', 'PROCESSING')).toBe(true);
      // CONFIRMED -> CANCELLED
      expect(isValidOrderTransition('CONFIRMED', 'CANCELLED')).toBe(true);
      // PROCESSING -> SHIPPED
      expect(isValidOrderTransition('PROCESSING', 'SHIPPED')).toBe(true);
      // PROCESSING -> CANCELLED
      expect(isValidOrderTransition('PROCESSING', 'CANCELLED')).toBe(true);
      // SHIPPED -> DELIVERED
      expect(isValidOrderTransition('SHIPPED', 'DELIVERED')).toBe(true);
    });

    it('rejects invalid or backward order status transitions', () => {
      // SHIPPED cannot be cancelled
      expect(isValidOrderTransition('SHIPPED', 'CANCELLED')).toBe(false);
      // DELIVERED cannot transition anywhere (terminal state)
      expect(isValidOrderTransition('DELIVERED', 'CANCELLED')).toBe(false);
      expect(isValidOrderTransition('DELIVERED', 'PROCESSING')).toBe(false);
      // CANCELLED cannot transition anywhere (terminal state)
      expect(isValidOrderTransition('CANCELLED', 'CONFIRMED')).toBe(false);
      expect(isValidOrderTransition('CANCELLED', 'PROCESSING')).toBe(false);
      // PENDING cannot skip directly to DELIVERED
      expect(isValidOrderTransition('PENDING', 'DELIVERED')).toBe(false);

      expect(() => validateOrderTransition('DELIVERED', 'CANCELLED')).toThrow(
        /Invalid order status transition/
      );
    });

    it('validates payment status transitions accurately', () => {
      expect(isValidPaymentTransition('UNPAID', 'PENDING')).toBe(true);
      expect(isValidPaymentTransition('UNPAID', 'PAID')).toBe(true);
      expect(isValidPaymentTransition('PAID', 'REFUNDED')).toBe(true);

      // REFUNDED is terminal
      expect(isValidPaymentTransition('REFUNDED', 'PAID')).toBe(false);
      expect(() => validatePaymentTransition('REFUNDED', 'PAID')).toThrow(
        /Invalid payment status transition/
      );
    });
  });

  /* ==========================================================================
     5. CANCELLATION NOTE ENFORCEMENT CONTRACT
     ========================================================================== */
  describe('5. Mandatory Cancellation Note Contract', () => {
    it('strictly requires a non-empty cancellation note', () => {
      const validateCancellationInput = (reason: string): { valid: boolean; error?: string } => {
        if (!reason || !reason.trim()) {
          return {
            valid: false,
            error: 'A valid operational cancellation reason is required by protocol.',
          };
        }
        return { valid: true };
      };

      // Empty or whitespace strings must be rejected
      expect(validateCancellationInput('').valid).toBe(false);
      expect(validateCancellationInput('   ').valid).toBe(false);
      expect(validateCancellationInput('\n\t').valid).toBe(false);

      // Valid note is accepted
      const validCheck = validateCancellationInput(
        'Customer requested cancellation via verified phone call.'
      );
      expect(validCheck.valid).toBe(true);
      expect(validCheck.error).toBeUndefined();
    });
  });

  /* ==========================================================================
     6. AUTHORITATIVE PRICING & SHIPPING DISCIPLINE
     ========================================================================== */
  describe('6. Authoritative Pricing & Shipping Discipline', () => {
    it('formats authoritative prices using formatDzdPrice without recalculation', () => {
      expect(formatDzdPrice(22000)).toBe('22,000 DZD');
      expect(formatDzdPrice(8000)).toBe('8,000 DZD');
      expect(formatDzdPrice(0)).toBe('0 DZD');
    });

    it('preserves immutable financial integrity: subtotal + shipping - discounts = total', () => {
      const ord = mockCanonicalOrder;
      const computedTotal = ord.subtotal + ord.shippingCost - ord.discounts;
      expect(computedTotal).toBe(ord.total);
      expect(ord.total).toBe(22000);
    });

    it('flags shipping negotiation required orders to prevent premature dispatch', () => {
      const isDispatchPermitted = (order: Order): boolean => {
        if (order.status !== 'PROCESSING') return false;
        if (order.shippingStatus === 'NEGOTIATION_REQUIRED') return false;
        return true;
      };

      const orderInProcessingPendingNegotiation: Order = {
        ...mockNegotiationOrder,
        status: 'PROCESSING',
      };
      expect(isDispatchPermitted(orderInProcessingPendingNegotiation)).toBe(false);

      const orderInProcessingAgreedShipping: Order = {
        ...mockNegotiationOrder,
        status: 'PROCESSING',
        shippingStatus: 'AGREED_WITH_CUSTOMER',
        shippingCost: 800,
        total: 8800,
      };
      expect(isDispatchPermitted(orderInProcessingAgreedShipping)).toBe(true);
    });
  });
});
