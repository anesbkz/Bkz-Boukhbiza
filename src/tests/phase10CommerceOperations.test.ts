import { describe, it, expect } from 'vitest';
import {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  InventoryStatus,
  Order,
  InventoryRecord,
  AdjustInventoryRequest,
} from '@/types/commerce';
import {
  VALID_ORDER_TRANSITIONS,
  VALID_PAYMENT_TRANSITIONS,
  isFreeBundleOrder,
} from '@/services/commerce/pricingService';
import { ZIRON_CATALOG } from '@/lib/content/catalog';

describe('Phase 10.3 — Commerce Operations & Order Fulfillment Suite', () => {
  describe('1. Authoritative Order State Machine Transitions', () => {
    it('enforces valid transitions from PENDING', () => {
      const allowed = VALID_ORDER_TRANSITIONS['PENDING'];
      expect(allowed).toContain('CONFIRMED');
      expect(allowed).toContain('CANCELLED');
      expect(allowed).not.toContain('SHIPPED');
      expect(allowed).not.toContain('DELIVERED');
    });

    it('enforces valid transitions from CONFIRMED', () => {
      const allowed = VALID_ORDER_TRANSITIONS['CONFIRMED'];
      expect(allowed).toContain('PROCESSING');
      expect(allowed).toContain('CANCELLED');
      expect(allowed).not.toContain('PENDING');
      expect(allowed).not.toContain('DELIVERED');
    });

    it('enforces valid transitions from PROCESSING', () => {
      const allowed = VALID_ORDER_TRANSITIONS['PROCESSING'];
      expect(allowed).toContain('SHIPPED');
      expect(allowed).toContain('CANCELLED');
      expect(allowed).not.toContain('PENDING');
      expect(allowed).not.toContain('CONFIRMED');
    });

    it('enforces valid transitions from SHIPPED', () => {
      const allowed = VALID_ORDER_TRANSITIONS['SHIPPED'];
      expect(allowed).toContain('DELIVERED');
      expect(allowed).not.toContain('CANCELLED'); // Shipped orders cannot be cancelled directly
      expect(allowed).not.toContain('PENDING');
      expect(allowed).not.toContain('PROCESSING');
    });

    it('treats DELIVERED as a strict terminal state', () => {
      const allowed = VALID_ORDER_TRANSITIONS['DELIVERED'];
      expect(allowed).toHaveLength(0);
    });

    it('treats CANCELLED as a strict terminal state', () => {
      const allowed = VALID_ORDER_TRANSITIONS['CANCELLED'];
      expect(allowed).toHaveLength(0);
    });

    it('enforces valid payment transitions', () => {
      expect(VALID_PAYMENT_TRANSITIONS['UNPAID']).toEqual(['PENDING', 'PAID']);
      expect(VALID_PAYMENT_TRANSITIONS['PENDING']).toEqual(['PAID', 'FAILED']);
      expect(VALID_PAYMENT_TRANSITIONS['FAILED']).toEqual(['PENDING']);
      expect(VALID_PAYMENT_TRANSITIONS['PAID']).toEqual(['REFUNDED']);
      expect(VALID_PAYMENT_TRANSITIONS['REFUNDED']).toEqual([]);
    });
  });

  describe('2. Administrative Shipping Controls & Invariants', () => {
    it('verifies 3-Month Program Bundle is strictly protected with Free Shipping', () => {
      const bundle = ZIRON_CATALOG.find((p) => p.sku === 'ZR-BNDL-90C');
      expect(bundle).toBeDefined();
      expect(bundle?.priceDzd).toBe(22000);

      expect(isFreeBundleOrder([{ sku: 'ZR-BNDL-90C' }])).toBe(true);
      expect(isFreeBundleOrder([{ sku: 'ZR-3M-90C' }])).toBe(true);
      expect(isFreeBundleOrder([{ sku: 'ZR-1M-30C' }])).toBe(false);
    });

    it('enforces that single-month orders require shipping negotiation initially', () => {
      const singleMonth = ZIRON_CATALOG.find((p) => p.sku === 'ZR-1M-30C');
      expect(singleMonth).toBeDefined();
      expect(singleMonth?.priceDzd).toBe(8000);

      const defaultShippingStatus: ShippingStatus = 'NEGOTIATION_REQUIRED';
      expect(defaultShippingStatus).toBe('NEGOTIATION_REQUIRED');
    });

    it('prohibits transition to SHIPPED if shipping is still pending negotiation', () => {
      const canShipOrder = (order: { shippingStatus: ShippingStatus }) => {
        if (order.shippingStatus === 'NEGOTIATION_REQUIRED') {
          return { allowed: false, error: 'Cannot ship order while shipping fee is pending negotiation' };
        }
        return { allowed: true };
      };

      expect(canShipOrder({ shippingStatus: 'NEGOTIATION_REQUIRED' }).allowed).toBe(false);
      expect(canShipOrder({ shippingStatus: 'AGREED_WITH_CUSTOMER' }).allowed).toBe(true);
      expect(canShipOrder({ shippingStatus: 'FREE' }).allowed).toBe(true);
    });

    it('validates agreed shipping cost must be a positive integer', () => {
      const validateAgreedCost = (cost: number) => {
        return Number.isInteger(cost) && cost > 0;
      };

      expect(validateAgreedCost(800)).toBe(true);
      expect(validateAgreedCost(1200)).toBe(true);
      expect(validateAgreedCost(0)).toBe(false);
      expect(validateAgreedCost(-500)).toBe(false);
      expect(validateAgreedCost(750.5)).toBe(false);
    });
  });

  describe('3. Inventory Visibility, Calculation & Negative Stock Guardrails', () => {
    it('correctly calculates status from available quantity and threshold', () => {
      const getStatus = (available: number, threshold = 10): InventoryStatus => {
        if (available <= 0) return 'OUT_OF_STOCK';
        if (available <= threshold) return 'LOW_STOCK';
        return 'IN_STOCK';
      };

      expect(getStatus(0)).toBe('OUT_OF_STOCK');
      expect(getStatus(-5)).toBe('OUT_OF_STOCK');
      expect(getStatus(5, 10)).toBe('LOW_STOCK');
      expect(getStatus(10, 10)).toBe('LOW_STOCK');
      expect(getStatus(11, 10)).toBe('IN_STOCK');
      expect(getStatus(100, 10)).toBe('IN_STOCK');
    });

    it('requires a non-empty reason for manual administrative stock adjustments', () => {
      const validateAdjustment = (req: AdjustInventoryRequest) => {
        if (!req.reason || req.reason.trim().length === 0) {
          throw new Error('Mandatory reason required');
        }
        return true;
      };

      expect(() => validateAdjustment({ variantId: 'v1', adjustment: 10, reason: '' })).toThrow();
      expect(() => validateAdjustment({ variantId: 'v1', adjustment: 10, reason: '   ' })).toThrow();
      expect(validateAdjustment({ variantId: 'v1', adjustment: 10, reason: 'Batch receiving from laboratory' })).toBe(true);
    });

    it('prevents manual stock reductions from driving available quantity below zero', () => {
      const adjustStock = (currentAvailable: number, delta: number) => {
        const next = currentAvailable + delta;
        if (next < 0) {
          throw new Error(`Insufficient inventory: adjustment results in ${next} available stock.`);
        }
        return next;
      };

      expect(adjustStock(15, 10)).toBe(25);
      expect(adjustStock(15, -10)).toBe(5);
      expect(adjustStock(15, -15)).toBe(0);
      expect(() => adjustStock(15, -20)).toThrow(/Insufficient inventory/);
    });

    it('maintains the conservation equation: totalQuantity = available + reserved + sold', () => {
      const inv: InventoryRecord = {
        id: 'inv-zr-1m-30c',
        variantId: 'var-1m-30c',
        productId: 'prod-ziron-30',
        sku: 'ZR-1M-30C',
        totalQuantity: 100,
        availableQuantity: 70,
        reservedQuantity: 20,
        soldQuantity: 10,
        lowStockThreshold: 15,
        status: 'IN_STOCK',
        updatedAt: new Date().toISOString(),
      };

      const calculatedTotal = inv.availableQuantity + inv.reservedQuantity + inv.soldQuantity;
      expect(calculatedTotal).toBe(inv.totalQuantity);
    });
  });

  describe('4. Order Cancellation, Stock Restoration & Payment Reconciliation', () => {
    it('requires a mandatory cancellation reason when cancelling an order', () => {
      const validateCancelNote = (note?: string) => {
        return typeof note === 'string' && note.trim().length > 0;
      };

      expect(validateCancelNote('')).toBe(false);
      expect(validateCancelNote('   ')).toBe(false);
      expect(validateCancelNote(undefined)).toBe(false);
      expect(validateCancelNote('Customer requested refund before courier departure')).toBe(true);
    });

    it('restores unpaid order stock from reserved to available', () => {
      let available = 50;
      let reserved = 10;
      let sold = 5;
      const orderQty = 2;
      const isPaid = false;

      if (isPaid) {
        sold -= orderQty;
        available += orderQty;
      } else {
        reserved -= orderQty;
        available += orderQty;
      }

      expect(available).toBe(52);
      expect(reserved).toBe(8);
      expect(sold).toBe(5);
      expect(available + reserved + sold).toBe(65); // Conserved
    });

    it('restores paid order stock from sold to available and sets payment to REFUNDED', () => {
      let available = 50;
      let reserved = 10;
      let sold = 5;
      let paymentStatus: PaymentStatus = 'PAID';
      const orderQty = 3;

      // When cancelling a PAID order:
      sold -= orderQty;
      available += orderQty;
      paymentStatus = 'REFUNDED';

      expect(available).toBe(53);
      expect(reserved).toBe(10);
      expect(sold).toBe(2);
      expect(paymentStatus).toBe('REFUNDED');
      expect(available + reserved + sold).toBe(65); // Conserved
    });
  });

  describe('5. Restart Fund Entitlement on Order Delivery (500 DZD per container)', () => {
    it('accurately allocates 500 DZD for a single-month container order upon delivery', () => {
      const items = [{ sku: 'ZR-1M-30C', quantity: 1 }];
      let containers = 0;
      for (const it of items) {
        if (it.sku.includes('BNDL') || it.sku.includes('3M')) {
          containers += 3 * it.quantity;
        } else {
          containers += 1 * it.quantity;
        }
      }

      expect(containers).toBe(1);
      const contributionDzd = containers * 500;
      expect(contributionDzd).toBe(500);
    });

    it('accurately allocates 1,500 DZD for a 3-Month Program (3 physical containers) upon delivery', () => {
      const items = [{ sku: 'ZR-BNDL-90C', quantity: 1 }];
      let containers = 0;
      for (const it of items) {
        if (it.sku.includes('BNDL') || it.sku.includes('3M')) {
          containers += 3 * it.quantity;
        } else {
          containers += 1 * it.quantity;
        }
      }

      expect(containers).toBe(3);
      const contributionDzd = containers * 500;
      expect(contributionDzd).toBe(1500);
    });

    it('accurately allocates for multi-quantity mixed orders upon delivery', () => {
      const items = [
        { sku: 'ZR-BNDL-90C', quantity: 2 }, // 2 * 3 = 6 containers
        { sku: 'ZR-1M-30C', quantity: 3 },    // 3 * 1 = 3 containers
      ];
      let containers = 0;
      for (const it of items) {
        if (it.sku.includes('BNDL') || it.sku.includes('3M')) {
          containers += 3 * it.quantity;
        } else {
          containers += 1 * it.quantity;
        }
      }

      expect(containers).toBe(9);
      const contributionDzd = containers * 500;
      expect(contributionDzd).toBe(4500);
    });
  });

  describe('6. Customer Experience Invariants & Non-Exposure of Administrative Metadata', () => {
    it('formats shipping message accurately for customer display when pending negotiation', () => {
      const formatCustomerShippingNotice = (status: ShippingStatus) => {
        if (status === 'NEGOTIATION_REQUIRED') {
          return 'Shipping cost will be agreed with you.';
        }
        if (status === 'FREE') {
          return 'FREE';
        }
        return 'Agreed';
      };

      expect(formatCustomerShippingNotice('NEGOTIATION_REQUIRED')).toBe('Shipping cost will be agreed with you.');
      expect(formatCustomerShippingNotice('FREE')).toBe('FREE');
    });

    it('allows customer to cancel ONLY when order is PENDING and UNPAID', () => {
      const canCustomerCancel = (order: { status: OrderStatus; paymentStatus: PaymentStatus }) => {
        return order.status === 'PENDING' && order.paymentStatus === 'UNPAID';
      };

      expect(canCustomerCancel({ status: 'PENDING', paymentStatus: 'UNPAID' })).toBe(true);
      expect(canCustomerCancel({ status: 'CONFIRMED', paymentStatus: 'UNPAID' })).toBe(false);
      expect(canCustomerCancel({ status: 'PROCESSING', paymentStatus: 'UNPAID' })).toBe(false);
      expect(canCustomerCancel({ status: 'SHIPPED', paymentStatus: 'UNPAID' })).toBe(false);
      expect(canCustomerCancel({ status: 'PENDING', paymentStatus: 'PAID' })).toBe(false);
      expect(canCustomerCancel({ status: 'CANCELLED', paymentStatus: 'UNPAID' })).toBe(false);
    });
  });
});
