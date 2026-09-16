import { MultilingualText } from './models';

/* ==========================================================================
   ZIRON COMMERCE DOMAIN TYPES & INTERFACES (PHASE 10 FOUNDATION)
   ========================================================================== */

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
export type ProductType = 'PHYSICAL' | 'BUNDLE' | 'DIGITAL';
export type VariantStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type FulfillmentStatus =
  | 'UNFULFILLED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ShippingStatus =
  | 'NEGOTIATION_REQUIRED'
  | 'AGREED_WITH_CUSTOMER'
  | 'FREE';

/**
 * Authoritative Product Domain Model
 */
export interface Product {
  id: string;
  sku: string;
  name: MultilingualText;
  slug: string;
  description: MultilingualText;
  shortDescription: MultilingualText;
  brand: string;
  status: ProductStatus;
  productType: ProductType;
  images: string[];
  availableVariants: string[]; // Variant IDs
  pricingReferences?: string[];
  inventoryReferences?: string[];
  phaseNumber?: number | 'BUNDLE';
  capsuleCount?: number;
  badgeText?: MultilingualText;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authoritative Product Variant Model
 */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: MultilingualText | string;
  quantity: number; // e.g. 30, 90
  unit: string; // e.g. 'capsules', 'bottle', 'pack'
  price: number; // Authoritative price in minor or major units (DZD)
  currency: string; // e.g. 'DZD'
  status: VariantStatus;
  inventoryId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authoritative Pricing Abstraction
 */
export interface ProductPricing {
  id: string;
  variantId: string;
  amount: number;
  currency: string;
  isActive: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Authoritative Inventory Model
 */
export interface InventoryRecord {
  id: string;
  variantId: string;
  productId: string;
  sku: string;
  totalQuantity?: number;
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  lowStockThreshold: number;
  status: InventoryStatus;
  updatedAt: string;
}

/**
 * Order Item Snapshot
 * Preserves immutable point-in-time product details and prices
 */
export interface OrderItem {
  productId: string;
  variantId: string;
  sku: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * Customer Shipping Information Snapshot
 */
export interface OrderShippingAddress {
  recipientName: string;
  phone: string;
  wilaya: string;
  city: string;
  address: string;
  postalCode?: string;
  notes?: string;
}

/**
 * Order History Timeline Entry
 */
export interface OrderHistoryEntry {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  shippingStatus?: ShippingStatus;
  timestamp: string;
  actorUserId?: string;
  note?: string;
}

/**
 * Authoritative Order Domain Model
 */
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerSnapshot: {
    uid: string;
    email: string;
    displayName?: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discounts: number;
  shippingCost: number;
  shippingStatus?: ShippingStatus;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingAddress: OrderShippingAddress;
  idempotencyKey?: string;
  history: OrderHistoryEntry[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/* ==========================================================================
   REQUEST / RESPONSE PAYLOADS
   ========================================================================== */

export interface CreateOrderRequestItem {
  variantId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CreateOrderRequestItem[];
  shippingAddress: OrderShippingAddress;
  idempotencyKey?: string;
}

export interface CreateOrderResult {
  success: boolean;
  order: Order;
  isDuplicate?: boolean;
  message?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  note?: string;
}

export interface UpdatePaymentStatusRequest {
  orderId: string;
  paymentStatus: PaymentStatus;
  note?: string;
}

export interface UpdateOrderShippingRequest {
  orderId: string;
  shippingStatus: ShippingStatus;
  shippingCost: number;
  note?: string;
}

export interface CancelOrderRequest {
  orderId: string;
  reason?: string;
}

export interface AdjustInventoryRequest {
  variantId: string;
  adjustment: number; // Positive to add stock, negative to subtract
  reason: string;
  lowStockThreshold?: number;
}

export interface CreateProductPayload {
  sku: string;
  name: MultilingualText;
  slug: string;
  description: MultilingualText;
  shortDescription: MultilingualText;
  brand?: string;
  status?: ProductStatus;
  productType?: ProductType;
  images?: string[];
  phaseNumber?: number | 'BUNDLE';
  capsuleCount?: number;
  badgeText?: MultilingualText;
}

export interface CreateVariantPayload {
  productId: string;
  sku: string;
  name: MultilingualText | string;
  quantity: number;
  unit: string;
  price: number;
  currency?: string;
  status?: VariantStatus;
  initialStock?: number;
  lowStockThreshold?: number;
}
