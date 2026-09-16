import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getCustomerOrders, cancelOrder } from '@/services/commerce/orderService';
import { formatDzdPrice } from '@/services/commerce/pricingService';
import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '@/types/commerce';
import {
  Package,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  RefreshCw,
  X,
  ChevronRight,
  ShieldCheck,
  QrCode,
  FileText,
} from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate, locale, dir } = useI18n();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadCustomerOrders = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setActionError(null);
    try {
      const data = await getCustomerOrders(user.uid);
      setOrders(data);
      if (selectedOrder) {
        const fresh = data.find((o) => o.id === selectedOrder.id);
        if (fresh) setSelectedOrder(fresh);
      }
    } catch (err: any) {
      console.warn('Error loading customer orders:', err);
      setActionError(err?.message || 'Could not load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerOrders();
  }, [user?.uid]);

  const handleCancelOrder = async (orderId: string) => {
    setCancelLoading(true);
    setActionError(null);
    try {
      const res = await cancelOrder(orderId, cancelReason.trim() || undefined);
      setCancellingId(null);
      setCancelReason('');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
      await loadCustomerOrders();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          label: locale === 'ar' ? 'مؤكد' : locale === 'fr' ? 'Confirmée' : 'Confirmed',
          cls: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'PROCESSING':
        return {
          label: locale === 'ar' ? 'قيد التحضير' : locale === 'fr' ? 'En préparation' : 'Processing',
          cls: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'SHIPPED':
        return {
          label: locale === 'ar' ? 'تم الشحن' : locale === 'fr' ? 'Expédiée' : 'Shipped',
          cls: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'DELIVERED':
        return {
          label: locale === 'ar' ? 'تم التوصيل' : locale === 'fr' ? 'Livrée' : 'Delivered',
          cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'CANCELLED':
        return {
          label: locale === 'ar' ? 'ملغى' : locale === 'fr' ? 'Annulée' : 'Cancelled',
          cls: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'PENDING':
      default:
        return {
          label: locale === 'ar' ? 'قيد الانتظار' : locale === 'fr' ? 'En attente' : 'Pending',
          cls: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        };
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return {
          label: locale === 'ar' ? 'تم الدفع' : locale === 'fr' ? 'Payée' : 'Paid',
          cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'FAILED':
      case 'REFUNDED':
        return {
          label: status,
          cls: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'PENDING':
        return {
          label: locale === 'ar' ? 'قيد المعالجة' : locale === 'fr' ? 'En cours' : 'Pending',
          cls: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'UNPAID':
      default:
        return {
          label: locale === 'ar' ? 'عند الاستلام (COD)' : locale === 'fr' ? 'À la livraison (COD)' : 'Cash on Delivery (Unpaid)',
          cls: 'bg-zinc-100 text-zinc-600 border-zinc-200',
        };
    }
  };

  const renderShippingDisplay = (order: Order) => {
    const is3MonthBundle = order.items.some((it) => {
      const sku = (it.sku || '').toUpperCase();
      return (
        sku.includes('BNDL') ||
        sku.includes('3M') ||
        sku === 'ZR-BNDL-90C' ||
        sku === 'ZR-3M-90C'
      );
    });

    if (order.shippingStatus === 'FREE' || is3MonthBundle) {
      return (
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
          <Truck className="w-3.5 h-3.5" />
          <span>FREE</span>
          <span className="text-[10px] text-emerald-600 font-mono font-normal">(0 DZD)</span>
        </div>
      );
    }

    if (order.shippingStatus === 'AGREED_WITH_CUSTOMER') {
      return (
        <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs">
          <Truck className="w-3.5 h-3.5" />
          <span>{formatDzdPrice(order.shippingCost)}</span>
          <span className="text-[10px] text-blue-600 font-normal">
            ({locale === 'ar' ? 'متفق عليها' : locale === 'fr' ? 'Convenue' : 'Agreed'})
          </span>
        </div>
      );
    }

    // Single month pending negotiation:
    return (
      <div className="text-amber-700 text-xs font-medium flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>
          {locale === 'ar'
            ? 'تكلفة الشحن سيتم الاتفاق عليها معك.'
            : locale === 'fr'
            ? 'Les frais de livraison seront convenus avec vous.'
            : 'Shipping cost will be agreed with you.'}
        </span>
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA] min-h-[85vh]" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <ShoppingBag className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>
                  {locale === 'ar'
                    ? 'سجل الطلبات'
                    : locale === 'fr'
                    ? 'Commandes Officielles'
                    : 'Customer Orders Ledger'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {locale === 'ar' ? 'طلباتي ومتابعة التوصيل' : locale === 'fr' ? 'Mes Commandes & Suivi' : 'My Orders & Fulfillment'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                {locale === 'ar'
                  ? 'تابع حالة شحناتك وتكاليف التوصيل المتفق عليها، وتفاصيل الحزم الصيدلانية لبروتوكول ZIRON.'
                  : locale === 'fr'
                  ? 'Suivez vos commandes, les frais de livraison convenus et les détails de vos produits ZIRON.'
                  : 'Track your ZIRON orders, agreed shipping details, delivery progress, and payment status.'}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                onClick={() => navigate('shop')}
                variant="outline"
                size="md"
                className="cursor-pointer inline-flex items-center gap-2 border-[#0B2346] text-[#0B2346]"
              >
                <Package className="w-4 h-4" />
                <span>{locale === 'ar' ? 'المتجر' : locale === 'fr' ? 'Boutique' : 'Browse Shop'}</span>
              </Button>
              <Button
                onClick={() => navigate('app/products/activate')}
                variant="primary"
                size="md"
                className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>{locale === 'ar' ? 'تفعيل عبوة' : locale === 'fr' ? 'Activer un Flacon' : 'Activate Container'}</span>
              </Button>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B2346]" />
            Loading your orders...
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white border border-[#E2E8F0] p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-2">
              {locale === 'ar' ? 'لا توجد طلبات سابقة' : locale === 'fr' ? 'Aucune commande' : 'No Orders Found'}
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
              {locale === 'ar'
                ? 'لم تقم بطلب أي حزمة بعد. يمكنك طلب عبوة شهرية أو البرنامج المتكامل لثلاثة أشهر عبر المتجر.'
                : locale === 'fr'
                ? "Vous n'avez pas encore passé de commande. Commandez le protocole mensuel ou le programme 3 mois dans la boutique."
                : 'You have not placed any orders yet. Visit the official store to order your 1-month protocol or the complete 3-month program.'}
            </p>
            <Button
              onClick={() => navigate('shop')}
              variant="primary"
              size="md"
              className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>{locale === 'ar' ? 'زيارة المتجر' : locale === 'fr' ? 'Visiter la Boutique' : 'Visit Shop'}</span>
            </Button>
          </div>
        )}

        {/* Orders Listing & Detail View */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List Column */}
            <div className="lg:col-span-1 space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-gray-500 tracking-wider flex justify-between items-center px-1">
                <span>{locale === 'ar' ? 'قائمة الطلبات' : locale === 'fr' ? 'Historique' : 'Order History'} ({orders.length})</span>
                <button
                  onClick={loadCustomerOrders}
                  className="text-[11px] text-[#0B2346] hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  const orderBadge = getOrderStatusBadge(ord.status);
                  const isCanCancel = ord.status === 'PENDING' && ord.paymentStatus === 'UNPAID';

                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-4 bg-white border rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0B2346] ring-1 ring-[#0B2346] shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <div className="text-xs font-mono font-bold text-[#0B2346]">{ord.orderNumber}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(ord.createdAt).toLocaleDateString([], {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${orderBadge.cls}`}>
                          {orderBadge.label}
                        </span>
                      </div>

                      <div className="text-xs text-gray-700 font-medium line-clamp-1 mb-2">
                        {ord.items.map((it) => `${it.productNameSnapshot} (×${it.quantity})`).join(', ')}
                      </div>

                      <div className="flex justify-between items-end pt-2 border-t border-gray-100 text-xs">
                        <div>
                          <div className="text-[10px] text-gray-500">Shipping:</div>
                          <div>{renderShippingDisplay(ord)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-gray-500">Total:</div>
                          <div className="font-bold text-[#0B2346] font-mono">
                            {formatDzdPrice(ord.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Order Detailed Inspector */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
                  {/* Detail Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-[#0B2346] font-mono">
                          {selectedOrder.orderNumber}
                        </h2>
                        <span className={`px-2.5 py-0.5 text-xs font-bold border rounded-full ${getOrderStatusBadge(selectedOrder.status).cls}`}>
                          {getOrderStatusBadge(selectedOrder.status).label}
                        </span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold border rounded-full ${getPaymentStatusBadge(selectedOrder.paymentStatus).cls}`}>
                          {getPaymentStatusBadge(selectedOrder.paymentStatus).label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedOrder.status === 'PENDING' && selectedOrder.paymentStatus === 'UNPAID' && (
                      <div>
                        {cancellingId === selectedOrder.id ? (
                          <div className="space-y-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <input
                              type="text"
                              placeholder="Reason for cancellation..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-full px-2.5 py-1 text-xs bg-white border border-gray-300 rounded text-gray-900"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCancellingId(null);
                                  setCancelReason('');
                                }}
                                className="text-xs py-1"
                              >
                                Keep Order
                              </Button>
                              <Button
                                size="sm"
                                disabled={cancelLoading}
                                onClick={() => handleCancelOrder(selectedOrder.id)}
                                className="text-xs py-1 bg-red-600 hover:bg-red-700 text-white"
                              >
                                {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCancellingId(selectedOrder.id)}
                            className="text-xs text-red-600 hover:bg-red-50 border-red-200"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Purchased Items List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase text-gray-500 tracking-wider">
                      Ordered Products
                    </h3>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between text-sm bg-gray-50/50">
                          <div>
                            <div className="font-semibold text-gray-900">{item.productNameSnapshot}</div>
                            <div className="text-xs text-gray-500 font-mono">SKU: {item.sku}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#0B2346]">{formatDzdPrice(item.subtotal)}</div>
                            <div className="text-xs text-gray-500">
                              {item.quantity} × {formatDzdPrice(item.unitPrice)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address & Delivery Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5">
                      <div className="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#0B2346]" />
                        <span>Delivery Destination</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedOrder.shippingAddress.recipientName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {selectedOrder.shippingAddress.address}
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        Wilaya: {selectedOrder.shippingAddress.wilaya}
                      </div>
                      <div className="text-xs text-gray-600">
                        Phone: {selectedOrder.shippingAddress.phone}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#0B2346]" />
                        <span>Payment & Delivery Terms</span>
                      </div>
                      <div className="text-xs text-gray-700">
                        <strong>Payment Method:</strong> Cash on Delivery (COD)
                      </div>
                      <div className="text-xs text-gray-700">
                        <strong>Shipping Status:</strong>
                        <div className="mt-1">{renderShippingDisplay(selectedOrder)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatDzdPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 items-center">
                      <span>Delivery Fee</span>
                      <span>
                        {selectedOrder.shippingStatus === 'FREE' ? (
                          <strong className="text-emerald-700">FREE (0 DZD)</strong>
                        ) : selectedOrder.shippingStatus === 'AGREED_WITH_CUSTOMER' ? (
                          <strong className="font-mono">{formatDzdPrice(selectedOrder.shippingCost)}</strong>
                        ) : (
                          <span className="text-amber-700 font-medium">To be agreed</span>
                        )}
                      </span>
                    </div>
                    {selectedOrder.discounts > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discounts</span>
                        <span>-{formatDzdPrice(selectedOrder.discounts)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-blue-200 flex justify-between text-base font-bold text-[#0B2346]">
                      <span>Total</span>
                      <span className="font-mono">{formatDzdPrice(selectedOrder.total)}</span>
                    </div>
                  </div>

                  {/* Fulfillment / Status Timeline */}
                  {selectedOrder.history && selectedOrder.history.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <h3 className="text-xs font-mono font-bold uppercase text-gray-500 tracking-wider">
                        Order Timeline & Updates
                      </h3>
                      <div className="space-y-2">
                        {selectedOrder.history.map((h, i) => (
                          <div key={i} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-[#0B2346]">{h.status}</span>
                              {h.note && <span className="text-gray-600 ml-2">— {h.note}</span>}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              {new Date(h.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scratch Code Activation Prompt */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-700" />
                        <span>Activate Container When Parcel Arrives</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed max-w-md">
                        Upon receiving your order, scratch the cryptographic code on your container and register it to unlock your Restart School protocol and community features.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate('app/products/activate')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 text-xs"
                    >
                      Go to Activation
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">Select an order from the list to view full details.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
