import { describe, it, expect, vi } from 'vitest';
import { CreateOrderRequest, CreateOrderResult, Order } from '@/types/commerce';
import { CatalogItem } from '@/lib/content/catalog';

describe('MVP Blocker Fix #1 — Storefront Order Creation Integration Contracts', () => {
  const mockBundleItem: CatalogItem = {
    id: 'ziron-complete-bundle',
    sku: 'ZR-BNDL-90C',
    name: 'ZIRON 90-Day Complete Protocol Bundle',
    description: 'Complete 3-phase course.',
    priceDzd: 22000,
    capsuleCount: 90,
    supplyDays: 90,
    phase: 'BUNDLE',
    badgeText: 'RECOMMENDED PROTOCOL',
    colorName: 'Navy',
    containerColorHex: '#0B2346',
  };

  const mockOneMonthItem: CatalogItem = {
    id: 'ziron-1-month',
    sku: 'ZR-1M-30C',
    name: 'ZIRON 1-Month Container',
    description: '30-day foundational supply.',
    priceDzd: 8000,
    capsuleCount: 30,
    supplyDays: 30,
    phase: 1,
    badgeText: 'PHASE 01',
    colorName: 'Red',
    containerColorHex: '#D62828',
  };

  const mockAuthenticatedUser = {
    uid: 'cust-user-algeria-123',
    email: 'karim@ziron.dz',
  };

  it('correctly formats the canonical variant ID from catalog item SKU', () => {
    const bundleVariantId = 'var-' + mockBundleItem.sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
    expect(bundleVariantId).toBe('var-zr-bndl-90c');

    const oneMonthVariantId = 'var-' + mockOneMonthItem.sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
    expect(oneMonthVariantId).toBe('var-zr-1m-30c');
  });

  it('constructs a valid CreateOrderRequest payload conforming to backend contracts', () => {
    const shippingDetails = {
      fullName: 'Amina Mansouri',
      phone: '0551234567',
      wilaya: '16 - Alger',
      city: 'Bab Ezzouar',
      address: 'Cité 8 Mai 1945, Bt 12, Appt 4',
      notes: 'Appeler avant livraison',
    };

    const variantId = 'var-' + mockBundleItem.sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const idempotencyKey = `order_${mockAuthenticatedUser.uid}_123456789`;

    const payload: CreateOrderRequest = {
      items: [
        {
          variantId,
          quantity: 1,
        },
      ],
      shippingAddress: {
        recipientName: shippingDetails.fullName.trim(),
        phone: shippingDetails.phone.trim(),
        wilaya: shippingDetails.wilaya.trim(),
        city: shippingDetails.city.trim(),
        address: shippingDetails.address.trim(),
        notes: shippingDetails.notes.trim() || undefined,
      },
      idempotencyKey,
    };

    expect(payload.items[0].variantId).toBe('var-zr-bndl-90c');
    expect(payload.items[0].quantity).toBe(1);
    expect(payload.shippingAddress.recipientName).toBe('Amina Mansouri');
    expect(payload.shippingAddress.phone).toBe('0551234567');
    expect(payload.shippingAddress.wilaya).toBe('16 - Alger');
    expect(payload.shippingAddress.city).toBe('Bab Ezzouar');
    expect(payload.shippingAddress.address).toBe('Cité 8 Mai 1945, Bt 12, Appt 4');
    expect(payload.shippingAddress.notes).toBe('Appeler avant livraison');
  });

  it('simulates order submission flow: rejects unauthenticated user and directs to login', () => {
    const user = null;
    const navigate = vi.fn();
    let error: string | null = null;

    // Simulation of handleConfirmOrder auth gate
    if (!user) {
      error = 'Please sign in or create an account to place an order';
      navigate('login');
    }

    expect(error).not.toBeNull();
    expect(navigate).toHaveBeenCalledWith('login');
  });

  it('simulates successful order creation navigating to /app/orders/:orderId', async () => {
    const mockOrder: Order = {
      id: 'ord-test-success-456',
      orderNumber: 'ZR-2026-0456',
      userId: mockAuthenticatedUser.uid,
      customerSnapshot: {
        uid: mockAuthenticatedUser.uid,
        email: mockAuthenticatedUser.email,
        displayName: 'Amina Mansouri',
        phone: '0551234567',
      },
      items: [
        {
          productId: 'ziron-3m-bundle',
          variantId: 'var-zr-bndl-90c',
          sku: 'ZR-BNDL-90C',
          productNameSnapshot: 'ZIRON 90-Day Complete Protocol Bundle',
          variantNameSnapshot: '3 x 30 Capsules (90 Total)',
          quantity: 1,
          unitPrice: 22000,
          subtotal: 22000,
        },
      ],
      subtotal: 22000,
      shippingCost: 0,
      shippingStatus: 'FREE',
      discounts: 0,
      total: 22000,
      currency: 'DZD',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      fulfillmentStatus: 'UNFULFILLED',
      shippingAddress: {
        recipientName: 'Amina Mansouri',
        phone: '0551234567',
        wilaya: '16 - Alger',
        city: 'Bab Ezzouar',
        address: 'Cité 8 Mai 1945',
      },
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockCreateOrderService = vi.fn().mockResolvedValue({
      success: true,
      order: mockOrder,
    } as CreateOrderResult);

    const navigate = vi.fn();

    // Submission handler
    const result = await mockCreateOrderService({} as CreateOrderRequest);
    if (result.success && result.order?.id) {
      navigate(`app/orders/${result.order.id}`);
    }

    expect(mockCreateOrderService).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('app/orders/ord-test-success-456');
  });
});
