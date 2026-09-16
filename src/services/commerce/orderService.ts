import { db, functions } from '@/config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  Order,
  CreateOrderRequest,
  CreateOrderResult,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
  UpdateOrderShippingRequest,
  CancelOrderRequest,
  OrderStatus,
  PaymentStatus,
} from '@/types/commerce';

/**
 * Gets all orders belonging to a specific authenticated customer.
 * Enforces ownership filtering.
 */
export async function getCustomerOrders(userId: string): Promise<Order[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
  } catch (err) {
    console.warn(`Error fetching orders for user ${userId}:`, err);
    return [];
  }
}

/**
 * Gets a single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;
  try {
    const ref = doc(db, 'orders', orderId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };
    }
  } catch (err) {
    console.warn(`Error fetching order ${orderId}:`, err);
  }
  return null;
}

/**
 * Creates an order via the authoritative Cloud Function.
 * CRITICAL SECURITY INVARIANT:
 * Pricing, totals, stock reservations, idempotency, and audit are all handled on the server.
 */
export async function createOrder(request: CreateOrderRequest): Promise<CreateOrderResult> {
  const callFn = httpsCallable<CreateOrderRequest, CreateOrderResult>(
    functions,
    'createCustomerOrder'
  );
  const result = await callFn(request);
  return result.data;
}

/**
 * Cancels a customer order via the authoritative Cloud Function.
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; order: Order }> {
  const callFn = httpsCallable<CancelOrderRequest, { success: boolean; order: Order }>(
    functions,
    'cancelCustomerOrder'
  );
  const result = await callFn({ orderId, reason });
  return result.data;
}

/**
 * Admin: Loads all orders with optional status filters
 */
export async function getAllOrdersAdmin(filters?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: import('@/types/commerce').ShippingStatus;
  limitCount?: number;
}): Promise<Order[]> {
  try {
    let q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(filters?.limitCount || 50)
    );

    if (filters?.status) {
      q = query(
        collection(db, 'orders'),
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc'),
        limit(filters?.limitCount || 50)
      );
    } else if (filters?.paymentStatus) {
      q = query(
        collection(db, 'orders'),
        where('paymentStatus', '==', filters.paymentStatus),
        orderBy('createdAt', 'desc'),
        limit(filters?.limitCount || 50)
      );
    } else if (filters?.shippingStatus) {
      q = query(
        collection(db, 'orders'),
        where('shippingStatus', '==', filters.shippingStatus),
        orderBy('createdAt', 'desc'),
        limit(filters?.limitCount || 50)
      );
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
  } catch (err) {
    console.warn('Error fetching admin orders:', err);
    return [];
  }
}

/**
 * Admin: Transitions order status
 */
export async function updateOrderStatusAdmin(
  payload: UpdateOrderStatusRequest
): Promise<{ success: boolean; order: Order }> {
  const callFn = httpsCallable<UpdateOrderStatusRequest, { success: boolean; order: Order }>(
    functions,
    'updateOrderStatus'
  );
  const result = await callFn(payload);
  return result.data;
}

/**
 * Admin: Transitions payment status
 */
export async function updatePaymentStatusAdmin(
  payload: UpdatePaymentStatusRequest
): Promise<{ success: boolean; order: Order }> {
  const callFn = httpsCallable<UpdatePaymentStatusRequest, { success: boolean; order: Order }>(
    functions,
    'updatePaymentStatus'
  );
  const result = await callFn(payload);
  return result.data;
}

/**
 * Admin: Updates shipping status and cost (finalizes agreed shipping)
 */
export async function updateOrderShippingAdmin(
  payload: UpdateOrderShippingRequest
): Promise<{ success: boolean; order: Order }> {
  const callFn = httpsCallable<UpdateOrderShippingRequest, { success: boolean; order: Order }>(
    functions,
    'updateOrderShipping'
  );
  const result = await callFn(payload);
  return result.data;
}

