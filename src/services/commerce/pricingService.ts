import { OrderItem, Product, ProductVariant } from '@/types/commerce';
import { Locale } from '@/types';

export const STANDARD_SHIPPING_COST_DZD = 600;
export const FREE_SHIPPING_THRESHOLD_DZD = 9000;

export const WILAYA_SHIPPING_TIERS: Record<string, number> = {
  // Algiers (Wilaya 16)
  'alger': 600,
  'algiers': 600,
  '16': 600,

  // Coastal / Central proximity
  'oran': 800,
  '31': 800,
  'blida': 800,
  '09': 800,
  '9': 800,
  'tipaza': 800,
  '42': 800,
  'boumerdes': 800,
  '35': 800,
  'annaba': 800,
  '23': 800,
  'tizi ouzou': 800,
  '15': 800,
  'bejaia': 800,
  '06': 800,
  '6': 800,
  'mostaganem': 800,
  '27': 800,
  'chlef': 800,
  '02': 800,
  '2': 800,

  // Inland / Highlands
  'setif': 1000,
  '19': 1000,
  'constantine': 1000,
  '25': 1000,
  'batna': 1000,
  '05': 1000,
  '5': 1000,
  'medea': 1000,
  '26': 1000,
  'tlemcen': 1000,
  '13': 1000,
  'sidi bel abbes': 1000,
  '22': 1000,
  'djelfa': 1000,
  '17': 1000,
  'msila': 1000,
  '28': 1000,

  // Southern / Sahara wilayas
  'adrar': 1400,
  '01': 1400,
  '1': 1400,
  'tamanrasset': 1400,
  '11': 1400,
  'ghardaia': 1400,
  '47': 1400,
  'ouargla': 1400,
  '30': 1400,
  'bechar': 1400,
  '08': 1400,
  '8': 1400,
  'biskra': 1400,
  '07': 1400,
  '7': 1400,
  'el oued': 1400,
  '39': 1400,
  'tindouf': 1400,
  '37': 1400,
  'illizi': 1400,
  '33': 1400,
};

/**
 * Returns shipping fee in DZD for a destination wilaya.
 */
export function getWilayaShippingCost(wilaya?: string): number {
  if (!wilaya) return 1000;
  const key = wilaya.trim().toLowerCase();
  if (WILAYA_SHIPPING_TIERS[key]) {
    return WILAYA_SHIPPING_TIERS[key];
  }
  return 1000;
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

  // Standard comma-separated representation for en / fr
  if (locale === 'ar') {
    const formatted = new Intl.NumberFormat('ar-DZ').format(amount);
    return `${formatted} د.ج`;
  }
  const formatted = amount.toLocaleString('en-US');
  return `${formatted} DZD`;
}

/**
 * Computes authoritative pricing for an order request.
 */
export function calculateOrderPricing(
  items: Array<{ variantId: string; quantity: number }>,
  variants: ProductVariant[],
  products: Product[],
  wilaya?: string
): {
  subtotal: number;
  shippingCost: number;
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
    const productName = typeof product?.name === 'string'
      ? product.name
      : (product?.name?.en || variant.sku);
    const variantName = typeof variant.name === 'string'
      ? variant.name
      : (variant.name?.en || variant.sku);
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

  const shippingCost = getWilayaShippingCost(wilaya);
  const total = subtotal + shippingCost;

  return {
    subtotal,
    shippingCost,
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

    const variantName = typeof variant.name === 'string'
      ? variant.name
      : (variant.name?.en || variant.sku);

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
 * Computes authoritative shipping cost based on subtotal and destination.
 */
export function calculateAuthoritativeShippingCost(subtotal: number, wilaya?: string): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD_DZD) {
    return 0; // Free shipping for high value orders / full bundles
  }
  return getWilayaShippingCost(wilaya);
}

/**
 * Computes authoritative total.
 */
export function calculateAuthoritativeTotal(
  subtotal: number,
  shippingCost: number,
  discounts: number = 0
): number {
  const cleanSubtotal = Math.max(0, subtotal);
  const cleanShipping = Math.max(0, shippingCost);
  const cleanDiscounts = Math.max(0, discounts);
  return Math.max(0, cleanSubtotal + cleanShipping - cleanDiscounts);
}
