import {
  OrderItem,
  Product,
  ProductVariant,
  ShippingStatus,
  OrderStatus,
  PaymentStatus,
} from '@/types/commerce';
import { Locale } from '@/types';

/* ==========================================================================
   PHASE 10.1: FINAL ZIRON COMMERCIAL PRICING CONSTANTS
   ========================================================================== */

export const ZIRON_1_MONTH_PRICE_DZD = 8000;
export const ZIRON_3_MONTH_PROGRAM_PRICE_DZD = 22000;
export const ZIRON_3_MONTH_SAVINGS_DZD = 2000; // 3 * 8000 = 24000 vs 22000

/* ==========================================================================
   STATE MACHINE TRANSITION RULES (PHASE 10.1 HARDENED)
   ========================================================================== */

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [], // Terminal
  CANCELLED: [], // Terminal
};

export const VALID_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ['PENDING', 'PAID'],
  PENDING: ['PAID', 'FAILED'],
  FAILED: ['PENDING'],
  PAID: ['REFUNDED'],
  REFUNDED: [], // Terminal
};

export function validateOrderTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): void {
  if (currentStatus === targetStatus) return;
  const allowed = VALID_ORDER_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(
      `Invalid order status transition from ${currentStatus} to ${targetStatus}. Allowed: ${
        allowed.length > 0 ? allowed.join(', ') : 'None (terminal state)'
      }.`
    );
  }
}

export function validatePaymentTransition(currentStatus: PaymentStatus, targetStatus: PaymentStatus): void {
  if (currentStatus === targetStatus) return;
  const allowed = VALID_PAYMENT_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(
      `Invalid payment status transition from ${currentStatus} to ${targetStatus}. Allowed: ${
        allowed.length > 0 ? allowed.join(', ') : 'None (terminal state)'
      }.`
    );
  }
}

/**
 * Authoritative shipping status determination:
 * - If order consists solely of 3-Month Program / bundle items: FREE shipping (cost = 0).
 * - If order contains any 1-Month container or individual phase containers: NEGOTIATION_REQUIRED (initial cost = 0).
 * - Customer cannot manipulate or set shippingCost.
 */
export function determineAuthoritativeShipping(
  items: Array<{ sku?: string; variantId?: string }>
): { shippingStatus: ShippingStatus; initialShippingCost: number } {
  if (!items || items.length === 0) {
    return { shippingStatus: 'NEGOTIATION_REQUIRED', initialShippingCost: 0 };
  }

  const isAllFreeBundle = items.every((it) => {
    const sku = (it.sku || '').toUpperCase();
    const id = (it.variantId || '').toUpperCase();
    return (
      sku === 'ZR-BNDL-90C' ||
      sku === 'ZR-3M-90C' ||
      sku.includes('BNDL') ||
      sku.includes('3M') ||
      id.includes('bundle') ||
      id.includes('3m')
    );
  });

  if (isAllFreeBundle) {
    return { shippingStatus: 'FREE', initialShippingCost: 0 };
  }

  return { shippingStatus: 'NEGOTIATION_REQUIRED', initialShippingCost: 0 };
}

/**
 * Validates that an amount is a positive, realistic DZD figure.
 */
export function validatePriceAmount(amount: number): number {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new Error('Price amount must be a positive number');
  }
  if (amount > 10_000_000) {
    throw new Error('Price amount exceeds maximum platform threshold');
  }
  return amount;
}

/**
 * Formats a DZD price with appropriate locale symbols
 */
export function formatDzdPrice(amount: number | null | undefined, locale: Locale = 'en'): string {
  if (amount === null || amount === undefined) {
    if (locale === 'ar') return 'السعر قيد التحديد';
    if (locale === 'fr') return 'Prix à configurer';
    return 'Price to be configured';
  }

  if (locale === 'ar') {
    const formatted = new Intl.NumberFormat('ar-DZ').format(amount);
    return `${formatted} د.ج`;
  }
  const formatted = amount.toLocaleString('en-US');
  return `${formatted} DZD`;
}

/**
 * Computes authoritative pricing for an order request.
 * Ignores any client-supplied totals or shipping fees.
 */
export function calculateOrderPricing(
  items: Array<{ variantId: string; quantity: number }>,
  variants: ProductVariant[],
  products: Product[]
): {
  subtotal: number;
  shippingCost: number;
  shippingStatus: ShippingStatus;
  total: number;
  currency: string;
  items: OrderItem[];
} {
  const variantMap = new Map<string, ProductVariant>(variants.map((v) => [v.id, v]));
  const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant || variant.status !== 'ACTIVE') {
      throw new Error(`Variant "${item.variantId}" is currently not available for purchase`);
    }

    const product = productMap.get(variant.productId);
    const productName =
      typeof product?.name === 'string'
        ? product.name
        : product?.name?.en || variant.sku;
    const variantName =
      typeof variant.name === 'string'
        ? variant.name
        : variant.name?.en || variant.sku;
    const itemSubtotal = variant.price * item.quantity;

    subtotal += itemSubtotal;
    orderItems.push({
      productId: variant.productId,
      variantId: variant.id,
      sku: variant.sku,
      productNameSnapshot: productName,
      variantNameSnapshot: variantName,
      quantity: item.quantity,
      unitPrice: variant.price,
      subtotal: itemSubtotal,
    });
  }

  const { shippingStatus, initialShippingCost } = determineAuthoritativeShipping(orderItems);
  const total = subtotal + initialShippingCost;

  return {
    subtotal,
    shippingCost: initialShippingCost,
    shippingStatus,
    total,
    currency: 'DZD',
    items: orderItems,
  };
}

/**
 * Computes authoritative subtotal for line items.
 * STRICT SECURITY PRINCIPLE:
 * Prices are ALWAYS drawn from the authoritative variant record, NEVER from client input.
 */
export function calculateAuthoritativeSubtotal(
  items: Array<{ variantId: string; quantity: number }>,
  variantMap: Map<string, ProductVariant>
): {
  subtotal: number;
  orderItems: OrderItem[];
  errors: string[];
} {
  let subtotal = 0;
  const orderItems: OrderItem[] = [];
  const errors: string[] = [];

  for (const item of items) {
    if (!item.variantId || typeof item.variantId !== 'string') {
      errors.push('Missing or invalid variantId.');
      continue;
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      errors.push(`Invalid quantity for variant ${item.variantId}: must be positive integer.`);
      continue;
    }

    const variant = variantMap.get(item.variantId);
    if (!variant) {
      errors.push(`Product variant "${item.variantId}" does not exist in authoritative catalog.`);
      continue;
    }

    if (variant.status !== 'ACTIVE') {
      errors.push(`Variant "${variant.sku}" is currently not active (status: ${variant.status}).`);
      continue;
    }

    const unitPrice = variant.price;
    if (typeof unitPrice !== 'number' || unitPrice < 0) {
      errors.push(`Authoritative price for variant "${variant.sku}" is invalid.`);
      continue;
    }

    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    const variantName =
      typeof variant.name === 'string'
        ? variant.name
        : variant.name?.en || variant.sku;

    orderItems.push({
      productId: variant.productId,
      variantId: variant.id,
      sku: variant.sku,
      productNameSnapshot: variantName,
      variantNameSnapshot: variantName,
      quantity: item.quantity,
      unitPrice,
      subtotal: itemSubtotal,
    });
  }

  return { subtotal, orderItems, errors };
}

/**
 * Computes authoritative total.
 */
export function calculateAuthoritativeTotal(
  subtotal: number,
  shippingCost: number = 0,
  discounts: number = 0
): number {
  const cleanSubtotal = Math.max(0, subtotal);
  const cleanShipping = Math.max(0, shippingCost);
  const cleanDiscounts = Math.max(0, discounts);
  return Math.max(0, cleanSubtotal + cleanShipping - cleanDiscounts);
}
