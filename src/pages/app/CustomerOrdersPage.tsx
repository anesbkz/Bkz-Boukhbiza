import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getCustomerOrders, getOrderById } from '@/services/commerce/orderService';
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
  ChevronRight,
  ShieldCheck,
  QrCode,
  FileText,
  ArrowLeft,
  Phone,
  Mail,
  User,
  MapPin,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface CustomerOrdersPageProps {
  orderId?: string;
}

export const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({ orderId }) => {
  const { user, profile } = useAuth();
  const { navigate, locale, dir } = useI18n();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [unauthorizedError, setUnauthorizedError] = useState(false);

  const loadCustomerOrders = async (targetOrderId?: string) => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setActionError(null);
    setUnauthorizedError(false);

    try {
      const data = await getCustomerOrders(user.uid);
      setOrders(data);

      const activeId = targetOrderId || orderId;
      if (activeId) {
        // Look up in customer's own order list first
        const found = data.find((o) => o.id === activeId || o.orderNumber === activeId);
        if (found) {
          setSelectedOrder(found);
        } else {
          // If deep-linked and not yet in list, fetch by ID and enforce customer ownership
          const direct = await getOrderById(activeId);
          if (direct) {
            if (direct.userId === user.uid || direct.customerSnapshot?.uid === user.uid) {
              setSelectedOrder(direct);
            } else {
              setUnauthorizedError(true);
              setSelectedOrder(null);
              setActionError(
                locale === 'ar'
                  ? 'غير مصرح لك بعرض تفاصيل هذا الطلب.'
                  : locale === 'fr'
                  ? "Vous n'êtes pas autorisé à consulter cette commande."
                  : 'Access Denied: You do not have permission to view this order.'
              );
            }
          } else {
            setSelectedOrder(null);
            setActionError(
              locale === 'ar'
                ? 'الطلب المطلوب غير موجود.'
                : locale === 'fr'
                ? 'Commande introuvable.'
                : 'The requested order could not be found.'
            );
          }
        }
      } else if (data.length > 0) {
        // Default to first order on desktop
        setSelectedOrder((prev) => (prev ? data.find((o) => o.id === prev.id) || data[0] : data[0]));
      } else {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      console.warn('Error loading customer orders:', err);
      setActionError(err?.message || 'Could not load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerOrders(orderId);
  }, [user?.uid, orderId]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setUnauthorizedError(false);
    setActionError(null);
    navigate(`app/orders/${order.id}`);
  };

  const handleBackToList = () => {
    navigate('app/orders');
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
          label: locale === 'ar' ? 'قيد المراجعة' : locale === 'fr' ? 'En attente' : 'Pending',
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
        return {
          label: locale === 'ar' ? 'فشل الدفع' : locale === 'fr' ? 'Paiement échoué' : 'Payment Failed',
          cls: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'REFUNDED':
        return {
          label: locale === 'ar' ? 'مسترجع' : locale === 'fr' ? 'Remboursée' : 'Refunded',
          cls: 'bg-gray-100 text-gray-700 border-gray-300',
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
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>{locale === 'ar' ? 'مجاني' : locale === 'fr' ? 'Gratuit' : 'FREE'}</span>
          <span className="text-[10px] text-emerald-600 font-mono font-normal">(0 DZD)</span>
        </div>
      );
    }

    if (order.shippingStatus === 'AGREED_WITH_CUSTOMER') {
      return (
        <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs">
          <Truck className="w-3.5 h-3.5 shrink-0" />
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
            ? 'تكلفة الشحن سيتم الاتفاق عليها معك'
            : locale === 'fr'
            ? 'Frais de livraison à convenir par téléphone'
            : 'Shipping cost to be agreed by phone'}
        </span>
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA] min-h-[85vh]" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb / Back Link */}
        {orderId && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B2346] hover:underline cursor-pointer py-1 px-2.5 bg-white border border-[#E2E8F0] shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>
                {locale === 'ar' ? 'العودة إلى جميع الطلبات' : locale === 'fr' ? 'Retour aux commandes' : 'Back to all orders'}
              </span>
            </button>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-mono font-bold text-gray-700">{orderId}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <ShoppingBag className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>
                  {locale === 'ar'
                    ? 'سجل الطلبات الرسمي'
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
                  ? 'تابع شحناتك وتفاصيل منتجات ZIRON، وحالة الاتفاق على التوصيل، وأرقام تشغيلات المستودع الرسمية.'
                  : locale === 'fr'
                  ? 'Suivez vos commandes ZIRON, les frais de livraison convenus et les lots de fabrication.'
                  : 'Track your official ZIRON orders, agreed delivery rates, inventory allocations, and fulfillment timelines.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
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
                className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-2 text-white"
              >
                <QrCode className="w-4 h-4" />
                <span>{locale === 'ar' ? 'تفعيل عبوة' : locale === 'fr' ? 'Activer un Flacon' : 'Activate Container'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Action / Error Notification */}
        {actionError && (
          <div
            className={`p-4 border rounded-lg text-xs flex items-center justify-between ${
              unauthorizedError
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => {
                setActionError(null);
                setUnauthorizedError(false);
              }}
              className="hover:underline text-xs ml-4 cursor-pointer"
            >
              {locale === 'ar' ? 'إغلاق' : locale === 'fr' ? 'Fermer' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B2346]" />
            {locale === 'ar' ? 'جاري تحميل طلباتك...' : locale === 'fr' ? 'Chargement de vos commandes...' : 'Loading your orders...'}
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white border border-[#E2E8F0] p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-2">
              {locale === 'ar' ? 'لا توجد طلبات سابقة' : locale === 'fr' ? 'Aucune commande enregistrée' : 'No Orders Found'}
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
              {locale === 'ar'
                ? 'لم تقم بطلب أي حزمة بعد. يمكنك طلب عبوة شهرية أو البرنامج المتكامل لثلاثة أشهر عبر المتجر الرسمي.'
                : locale === 'fr'
                ? "Vous n'avez pas encore passé de commande. Commandez le protocole mensuel ou le programme 3 mois dans la boutique."
                : 'You have not placed any orders yet. Visit the official store to order your 1-month protocol or the complete 3-month program.'}
            </p>
            <Button
              onClick={() => navigate('shop')}
              variant="primary"
              size="md"
              className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-2 text-white"
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
                <span>
                  {locale === 'ar' ? 'قائمة الطلبات' : locale === 'fr' ? 'Historique' : 'Order History'} ({orders.length})
                </span>
                <button
                  onClick={() => loadCustomerOrders(orderId)}
                  className="text-[11px] text-[#0B2346] hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{locale === 'ar' ? 'تحديث' : locale === 'fr' ? 'Actualiser' : 'Refresh'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  const orderBadge = getOrderStatusBadge(ord.status);
                  const paymentBadge = getPaymentStatusBadge(ord.paymentStatus);
                  const totalItems = ord.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <div
                      key={ord.id}
                      onClick={() => handleSelectOrder(ord)}
                      className={`p-4 bg-white border rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0B2346] ring-2 ring-[#0B2346]/20 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Order Header: ID and Status */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <div className="text-xs font-mono font-bold text-[#0B2346] flex items-center gap-1.5">
                            <span>{ord.orderNumber}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>
                              {new Date(ord.createdAt).toLocaleDateString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${orderBadge.cls}`}>
                            {orderBadge.label}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-medium border rounded-full ${paymentBadge.cls}`}>
                            {paymentBadge.label}
                          </span>
                        </div>
                      </div>

                      {/* Items and Quantities */}
                      <div className="text-xs text-gray-700 font-medium line-clamp-2 mb-2.5">
                        {ord.items.map((it) => `${it.productNameSnapshot} (×${it.quantity})`).join(', ')}
                      </div>

                      {/* Footer: Shipping Status and Total */}
                      <div className="flex justify-between items-end pt-2 border-t border-gray-100 text-xs">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                            {locale === 'ar' ? 'الشحن:' : locale === 'fr' ? 'Livraison:' : 'Shipping:'}
                          </div>
                          <div>{renderShippingDisplay(ord)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                            {locale === 'ar' ? 'الإجمالي:' : locale === 'fr' ? 'Total:' : 'Total:'}
                          </div>
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
                <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-7 shadow-xs space-y-6">
                  {/* Detail Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h2 className="text-xl font-bold text-[#0B2346] font-mono">
                          {selectedOrder.orderNumber}
                        </h2>
                        <span className={`px-2.5 py-0.5 text-xs font-bold border rounded-full ${getOrderStatusBadge(selectedOrder.status).cls}`}>
                          {getOrderStatusBadge(selectedOrder.status).label}
                        </span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold border rounded-full ${getPaymentStatusBadge(selectedOrder.paymentStatus).cls}`}>
                          {getPaymentStatusBadge(selectedOrder.paymentStatus).label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {locale === 'ar' ? 'تاريخ الطلب:' : locale === 'fr' ? 'Passée le:' : 'Placed on:'}{' '}
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] text-gray-400">ID: {selectedOrder.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>VIREXON SECURE LEDGER</span>
                    </div>
                  </div>

                  {/* Prominent Shipping Negotiation Notice */}
                  {selectedOrder.shippingStatus === 'NEGOTIATION_REQUIRED' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {locale === 'ar'
                            ? 'إشعار شحن: جاري الاتفاق على تكلفة التوصيل'
                            : locale === 'fr'
                            ? 'Notification de livraison: Frais à convenir'
                            : 'Shipping Notice: Delivery Fee Negotiation Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {locale === 'ar'
                          ? `سيقوم فريق خدمة عملاء ZIRON بالتواصل معك هاتفيًا على الرقم (${selectedOrder.shippingAddress.phone}) لتأكيد موعد التوصيل وتكلفة الشحن الخاصة بولاية (${selectedOrder.shippingAddress.wilaya}) قبل الشحن. لن يتم تحصيل أي مبالغ حتى الاستلام.`
                          : locale === 'fr'
                          ? `Le service client ZIRON vous contactera par téléphone au (${selectedOrder.shippingAddress.phone}) pour convenir des frais de livraison vers la wilaya de ${selectedOrder.shippingAddress.wilaya} avant l'expédition du colis. Aucun paiement n'est requis avant la livraison.`
                          : `Our ZIRON customer support team will contact you directly by phone (${selectedOrder.shippingAddress.phone}) to confirm delivery scheduling and shipping charges to ${selectedOrder.shippingAddress.wilaya} prior to parcel dispatch. No payment is collected until delivery.`}
                      </p>
                    </div>
                  )}

                  {selectedOrder.shippingStatus === 'FREE' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {locale === 'ar'
                            ? 'توصيل مجاني متكامل لكافة ولايات الجزائر'
                            : locale === 'fr'
                            ? 'Livraison offerte sur l’ensemble des 58 wilayas'
                            : 'Complimentary Nationwide Delivery Included'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        {locale === 'ar'
                          ? 'يتضمن هذا الطلب شحنًا مجانيًا بالكامل (0 د.ج) ضمن بروتوكول ZIRON الشامل.'
                          : locale === 'fr'
                          ? 'Cette commande bénéficie de la gratuité complète des frais de livraison (0 DZD).'
                          : 'This order qualifies for 100% free delivery across all 58 Algerian wilayas (0 DZD).'}
                      </p>
                    </div>
                  )}

                  {selectedOrder.shippingStatus === 'AGREED_WITH_CUSTOMER' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                        <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          {locale === 'ar'
                            ? `تكلفة الشحن المتفق عليها: ${formatDzdPrice(selectedOrder.shippingCost)}`
                            : locale === 'fr'
                            ? `Frais de livraison convenus: ${formatDzdPrice(selectedOrder.shippingCost)}`
                            : `Agreed Delivery Terms: ${formatDzdPrice(selectedOrder.shippingCost)}`}
                        </span>
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        {locale === 'ar'
                          ? `تم تأكيد مصاريف التوصيل لولاية ${selectedOrder.shippingAddress.wilaya} وسيتم تسليم الشحنة عبر الشريك اللوجستي.`
                          : locale === 'fr'
                          ? `Les frais de livraison pour ${selectedOrder.shippingAddress.wilaya} ont été confirmés et convenus.`
                          : `Delivery charges for ${selectedOrder.shippingAddress.wilaya} have been mutually agreed upon and verified.`}
                      </p>
                    </div>
                  )}

                  {/* Customer Information & Shipping Destination Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Customer Info */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#0B2346]" />
                        <span>
                          {locale === 'ar' ? 'معلومات الزبون' : locale === 'fr' ? 'Client' : 'Customer Details'}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedOrder.customerSnapshot?.displayName ||
                          selectedOrder.shippingAddress.recipientName ||
                          profile?.displayName ||
                          'Participant'}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{selectedOrder.customerSnapshot?.email || user?.email}</span>
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>
                          {selectedOrder.customerSnapshot?.phone ||
                            selectedOrder.shippingAddress.phone ||
                            profile?.phone ||
                            'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Destination */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0B2346]" />
                        <span>
                          {locale === 'ar' ? 'عنوان التوصيل' : locale === 'fr' ? 'Destination' : 'Shipping Destination'}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedOrder.shippingAddress.recipientName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {selectedOrder.shippingAddress.address}
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.wilaya}{' '}
                        {selectedOrder.shippingAddress.postalCode && `(${selectedOrder.shippingAddress.postalCode})`}
                      </div>
                      {selectedOrder.shippingAddress.notes && (
                        <div className="text-[11px] text-gray-500 italic bg-white p-1.5 border border-gray-200 rounded">
                          "{selectedOrder.shippingAddress.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Purchased Items List with Line Items & InventoryId */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-bold uppercase text-gray-500 tracking-wider">
                        {locale === 'ar' ? 'المنتجات المطلوبة' : locale === 'fr' ? 'Articles Commandés' : 'Ordered Products'}
                      </h3>
                      <span className="text-xs font-mono text-gray-400">
                        {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-gray-50/40 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {item.productNameSnapshot}
                              </div>
                              {item.variantNameSnapshot && (
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {item.variantNameSnapshot}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 font-mono mt-0.5">
                                SKU: {item.sku}
                              </div>
                            </div>

                            <div className="text-start sm:text-right">
                              <div className="font-bold text-[#0B2346] font-mono text-sm">
                                {formatDzdPrice(item.subtotal)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.quantity} × {formatDzdPrice(item.unitPrice)}
                              </div>
                            </div>
                          </div>

                          {/* Inventory Lot / Inventory ID display */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-500">
                                {locale === 'ar' ? 'معرف المخزون:' : locale === 'fr' ? 'Lot inventaire:' : 'Inventory Lot / ID:'}
                              </span>
                            </div>
                            <div>
                              {item.inventoryId ? (
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#0B2346] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                                  {item.inventoryId}
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono text-gray-400 italic">
                                  {locale === 'ar' ? 'يُعين عند خروج الشحنة' : locale === 'fr' ? 'Attribué à l’expédition' : 'Allocated upon warehouse dispatch'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Breakdown (Read-Only) */}
                  <div className="p-4 sm:p-5 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2.5 text-xs">
                    <div className="text-[11px] font-mono font-bold uppercase text-gray-500 tracking-wider mb-2">
                      {locale === 'ar' ? 'الملخص المالي' : locale === 'fr' ? 'Récapitulatif Financier' : 'Payment & Financial Ledger'}
                    </div>

                    <div className="flex justify-between text-gray-700">
                      <span>{locale === 'ar' ? 'المجموع الفرعي للمنتجات' : locale === 'fr' ? 'Sous-total articles' : 'Subtotal'}</span>
                      <span className="font-mono font-semibold">{formatDzdPrice(selectedOrder.subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-gray-700 items-center">
                      <span>{locale === 'ar' ? 'تكلفة التوصيل' : locale === 'fr' ? 'Frais de livraison' : 'Delivery Fee'}</span>
                      <span>
                        {selectedOrder.shippingStatus === 'FREE' ? (
                          <strong className="text-emerald-700">FREE (0 DZD)</strong>
                        ) : selectedOrder.shippingStatus === 'AGREED_WITH_CUSTOMER' ? (
                          <strong className="font-mono">{formatDzdPrice(selectedOrder.shippingCost)}</strong>
                        ) : (
                          <span className="text-amber-700 font-medium">
                            {locale === 'ar' ? 'سيتم الاتفاق عليها' : locale === 'fr' ? 'À convenir' : 'To be agreed'}
                          </span>
                        )}
                      </span>
                    </div>

                    {selectedOrder.discounts > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>{locale === 'ar' ? 'الخصم المطبق' : locale === 'fr' ? 'Réductions' : 'Discounts'}</span>
                        <span className="font-mono font-semibold">-{formatDzdPrice(selectedOrder.discounts)}</span>
                      </div>
                    )}

                    <div className="pt-2.5 border-t border-blue-200 flex justify-between text-base font-bold text-[#0B2346]">
                      <span>{locale === 'ar' ? 'المبلغ الإجمالي' : locale === 'fr' ? 'Total à régler' : 'Total'}</span>
                      <span className="font-mono text-lg">{formatDzdPrice(selectedOrder.total)}</span>
                    </div>

                    <div className="text-[10px] text-gray-500 italic pt-1">
                      {locale === 'ar'
                        ? '* طريقة الدفع: الدفع عند الاستلام (COD) نقداً لمندوب التوصيل.'
                        : locale === 'fr'
                        ? '* Paiement à la livraison (COD) en espèces au transporteur.'
                        : '* Payment Method: Cash on Delivery (COD) upon physical receipt of package.'}
                    </div>
                  </div>

                  {/* Order History / Audit Timeline */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-mono font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0B2346]" />
                      <span>{locale === 'ar' ? 'سجل وتاريخ معالجة الطلب' : locale === 'fr' ? 'Historique de la commande' : 'Order Timeline & Audit History'}</span>
                    </h3>

                    {selectedOrder.history && selectedOrder.history.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white">
                        {selectedOrder.history.map((h, i) => (
                          <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#0B2346]">{h.status}</span>
                                {h.paymentStatus && (
                                  <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                                    {h.paymentStatus}
                                  </span>
                                )}
                              </div>
                              {h.note && <div className="text-gray-600 text-xs">{h.note}</div>}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono shrink-0">
                              {new Date(h.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 italic">
                        {locale === 'ar' ? 'لا توجد تحديثات سابقة.' : locale === 'fr' ? 'Aucune mise à jour pour le moment.' : 'No timeline entries recorded yet.'}
                      </div>
                    )}
                  </div>

                  {/* Read-Only Customer Support Advisory */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3 text-xs text-gray-600">
                    <HelpCircle className="w-4 h-4 text-[#0B2346] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-[#0B2346]">
                        {locale === 'ar' ? 'هل تحتاج إلى مساعدة أو تعديل على طلبك؟' : locale === 'fr' ? 'Besoin d’aide ou d’une modification ?' : 'Need Assistance With Your Order?'}
                      </div>
                      <p className="leading-relaxed text-[11px]">
                        {locale === 'ar'
                          ? `لحماية سلامة المعاملات، تخضع الأسعار وحالات الطلبات لإدارة مركزية معتمدة. في حال رغبتك في تحديث عنوان التوصيل أو الاستفسار عن الشحنة، يرجى التواصل مع فريق دعم الزبائن مع ذكر رقم الطلب (${selectedOrder.orderNumber}).`
                          : locale === 'fr'
                          ? `Pour des raisons de sécurité et de conformité, les prix et statuts sont certifiés et gérés de façon centralisée. Pour modifier votre adresse ou toute question, contactez le service client en précisant votre numéro de commande (${selectedOrder.orderNumber}).`
                          : `For cryptographic auditability and protocol integrity, order status, pricing, and inventory are authoritatively managed. To request changes or inquiries regarding your delivery, contact ZIRON customer support referencing Order #${selectedOrder.orderNumber}.`}
                      </p>
                    </div>
                  </div>

                  {/* Scratch Code Activation Prompt */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-700" />
                        <span>
                          {locale === 'ar' ? 'تفعيل العبوة فور وصول الشحنة' : locale === 'fr' ? 'Activer le flacon à la réception' : 'Activate Container When Parcel Arrives'}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed max-w-md">
                        {locale === 'ar'
                          ? 'بمجرد استلامك للطلب، قم بخدش الرمز التشفيري الموجود على العبوة وتفعيله لفتح بروتوكول Restart ومميزات المجتمع.'
                          : locale === 'fr'
                          ? 'À la réception de votre colis, grattez le code cryptographique sur votre flacon pour débloquer l’École Restart et la communauté.'
                          : 'Upon receiving your package, scratch the cryptographic code on your container and register it to unlock your Restart School access and community benefits.'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate('app/products/activate')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 text-xs"
                    >
                      {locale === 'ar' ? 'الانتقال للتفعيل' : locale === 'fr' ? 'Vers l’Activation' : 'Go to Activation'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ar' ? 'اختر طلباً من القائمة لعرض تفاصيله الكاملة.' : locale === 'fr' ? 'Sélectionnez une commande pour afficher ses détails.' : 'Select an order from the list to view full details.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
