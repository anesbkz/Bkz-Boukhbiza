import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getAllOrdersAdmin,
  getOrderById,
  updateOrderStatusAdmin,
  updatePaymentStatusAdmin,
} from '@/services/commerce/orderService';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  OrderItem,
  OrderHistoryEntry,
} from '@/types/commerce';
import {
  formatDzdPrice,
  isValidOrderTransition,
  isValidPaymentTransition,
} from '@/services/commerce/pricingService';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Modal } from '@/components/design-system/Modal';
import { Alert } from '@/components/design-system/Alert';
import { EmptyState } from '@/components/design-system/EmptyState';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  MapPin,
  User,
  AlertCircle,
  X,
  Calendar,
  ArrowLeft,
  Check,
  Ban,
  AlertTriangle,
  Layers,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  Hash,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { PublicRoute } from '@/types';

interface AdminOrdersPageProps {
  orderId?: string;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ orderId: propOrderId }) => {
  const { route, navigate, dir } = useI18n();

  // Determine active orderId from prop or route
  const activeOrderId = useMemo(() => {
    if (propOrderId) return propOrderId;
    if (route.startsWith('admin/orders/')) {
      return route.substring('admin/orders/'.length);
    }
    return null;
  }, [propOrderId, route]);

  // List view state
  const [orders, setOrders] = useState<Order[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [shippingFilter, setShippingFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Single order detail view state
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Operational mutation feedback
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Cancellation Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState<string | null>(null);

  // General transition confirmation state
  const [pendingStatusTransition, setPendingStatusTransition] = useState<OrderStatus | null>(null);
  const [statusTransitionNote, setStatusTransitionNote] = useState('');

  // Load orders list
  const loadOrders = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const filters: any = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (paymentFilter !== 'ALL') filters.paymentStatus = paymentFilter;
      if (shippingFilter !== 'ALL') filters.shippingStatus = shippingFilter;

      const data = await getAllOrdersAdmin(filters);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load admin orders:', err);
      setListError(err?.message || 'Failed to communicate with commerce backend.');
    } finally {
      setListLoading(false);
    }
  }, [statusFilter, paymentFilter, shippingFilter]);

  // Load single order detail
  const loadOrderDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailError(null);
    setActionError(null);
    setActionSuccess(null);
    try {
      const ord = await getOrderById(id);
      if (!ord) {
        setDetailError(`Order with identifier "${id}" was not found in the registry.`);
      } else {
        setCurrentOrder(ord);
      }
    } catch (err: any) {
      console.error(`Failed to load order ${id}:`, err);
      setDetailError(err?.message || 'Error retrieving authoritative order record.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (!activeOrderId) {
      loadOrders();
    } else {
      loadOrderDetail(activeOrderId);
    }
  }, [activeOrderId, loadOrders, loadOrderDetail]);

  // Filtered orders for client-side search & date matching
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((ord) => {
        const orderNum = (ord.orderNumber || '').toLowerCase();
        const docId = (ord.id || '').toLowerCase();
        const email = (ord.customerSnapshot?.email || '').toLowerCase();
        const name = (ord.customerSnapshot?.displayName || '').toLowerCase();
        const recipient = (ord.shippingAddress?.recipientName || '').toLowerCase();
        const phone = (ord.shippingAddress?.phone || ord.customerSnapshot?.phone || '').toLowerCase();
        const wilaya = (ord.shippingAddress?.wilaya || '').toLowerCase();
        const city = (ord.shippingAddress?.city || '').toLowerCase();

        return (
          orderNum.includes(term) ||
          docId.includes(term) ||
          email.includes(term) ||
          name.includes(term) ||
          recipient.includes(term) ||
          phone.includes(term) ||
          wilaya.includes(term) ||
          city.includes(term)
        );
      });
    }

    if (dateFilter !== 'ALL') {
      const now = new Date();
      result = result.filter((ord) => {
        if (!ord.createdAt) return false;
        const ordDate = new Date(ord.createdAt);
        if (isNaN(ordDate.getTime())) return true;

        if (dateFilter === 'TODAY') {
          return ordDate.toDateString() === now.toDateString();
        }
        if (dateFilter === 'THIS_WEEK') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return ordDate >= sevenDaysAgo;
        }
        if (dateFilter === 'THIS_MONTH') {
          return (
            ordDate.getFullYear() === now.getFullYear() &&
            ordDate.getMonth() === now.getMonth()
          );
        }
        return true;
      });
    }

    return result;
  }, [orders, searchTerm, dateFilter]);

  // Quick counts
  const negotiationRequiredCount = useMemo(() => {
    return orders.filter((o) => o.shippingStatus === 'NEGOTIATION_REQUIRED').length;
  }, [orders]);

  const pendingReviewCount = useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING').length;
  }, [orders]);

  const activeProcessingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
  }, [orders]);

  // Execute Order Status Transition
  const handleExecuteStatusTransition = async (targetStatus: OrderStatus, note?: string) => {
    if (!currentOrder) return;
    setUpdating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await updateOrderStatusAdmin({
        orderId: currentOrder.id,
        status: targetStatus,
        note: note && note.trim() ? note.trim() : undefined,
      });

      if (!res.success) {
        setActionError(res.message || `Failed to transition order to ${targetStatus}`);
      } else {
        setActionSuccess(`Order successfully transitioned to ${targetStatus}.`);
        // Refresh authoritative order record
        await loadOrderDetail(currentOrder.id);
      }
    } catch (err: any) {
      console.error('Status transition error:', err);
      setActionError(err?.message || 'Server rejected order transition.');
    } finally {
      setUpdating(false);
      setPendingStatusTransition(null);
      setStatusTransitionNote('');
    }
  };

  // Execute Cancellation
  const handleExecuteCancellation = async () => {
    if (!currentOrder) return;
    if (!cancelReason.trim()) {
      setCancelReasonError('A valid operational cancellation reason is required by protocol.');
      return;
    }

    setUpdating(true);
    setCancelReasonError(null);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await updateOrderStatusAdmin({
        orderId: currentOrder.id,
        status: 'CANCELLED',
        note: cancelReason.trim(),
      });

      if (!res.success) {
        setActionError(res.message || 'Cancellation operation rejected by server.');
      } else {
        setActionSuccess('Order successfully cancelled with authoritative inventory restoration.');
        setShowCancelModal(false);
        setCancelReason('');
        await loadOrderDetail(currentOrder.id);
      }
    } catch (err: any) {
      console.error('Cancellation error:', err);
      setActionError(err?.message || 'Authoritative backend rejected cancellation.');
    } finally {
      setUpdating(false);
    }
  };

  // Execute Payment Status Transition
  const handleExecutePaymentTransition = async (targetPayment: PaymentStatus) => {
    if (!currentOrder) return;
    setUpdating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await updatePaymentStatusAdmin({
        orderId: currentOrder.id,
        paymentStatus: targetPayment,
        note: `Administrative payment mutation to ${targetPayment}`,
      });

      if (!res.success) {
        setActionError(res.message || `Failed to update payment status to ${targetPayment}`);
      } else {
        setActionSuccess(`Payment status updated to ${targetPayment}.`);
        await loadOrderDetail(currentOrder.id);
      }
    } catch (err: any) {
      console.error('Payment transition error:', err);
      setActionError(err?.message || 'Backend rejected payment status change.');
    } finally {
      setUpdating(false);
    }
  };

  // Badges & styling helpers
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/60';
      case 'CONFIRMED':
        return 'bg-blue-950/40 text-blue-300 border-blue-800/60';
      case 'PROCESSING':
        return 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60';
      case 'SHIPPED':
        return 'bg-purple-950/40 text-purple-300 border-purple-800/60';
      case 'DELIVERED':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60';
      case 'CANCELLED':
        return 'bg-red-950/40 text-red-300 border-red-800/60';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60';
      case 'PENDING':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/60';
      case 'UNPAID':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'REFUNDED':
        return 'bg-sky-950/40 text-sky-300 border-sky-800/60';
      case 'FAILED':
        return 'bg-red-950/40 text-red-300 border-red-800/60';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getShippingStatusBadge = (status: ShippingStatus) => {
    switch (status) {
      case 'FREE':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60';
      case 'AGREED_WITH_CUSTOMER':
        return 'bg-blue-950/40 text-blue-300 border-blue-800/60';
      case 'NEGOTIATION_REQUIRED':
        return 'bg-amber-950/50 text-amber-300 border-amber-600/80 font-bold';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  // Render Order Detail View
  if (activeOrderId) {
    if (detailLoading) {
      return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('admin/orders')}
              className="text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Orders
            </Button>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-xs">
            <RefreshCw className="w-8 h-8 text-[#0B2346] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-900 font-mono">
              RETRIEVING ORDER RECORD: {activeOrderId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Synchronizing authoritative pricing, shipping status, and historical timeline...
            </p>
          </div>
        </div>
      );
    }

    if (detailError || !currentOrder) {
      return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('admin/orders')}
              className="text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Orders
            </Button>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-900">Order Record Inaccessible</h3>
                <p className="text-sm text-gray-600">
                  {detailError || 'The requested order could not be located in the commerce registry.'}
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('admin/orders')}
                    className="text-xs"
                  >
                    Return to Orders Ledger
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Main Order Detail Display
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('admin/orders')}
              className="text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Orders
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0B2346]" />
                <h1 className="text-xl font-bold text-gray-900 font-mono tracking-tight">
                  {currentOrder.orderNumber || currentOrder.id}
                </h1>
                <span className="text-xs font-mono text-gray-400">({currentOrder.id})</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Created on {new Date(currentOrder.createdAt).toLocaleString()}
                {currentOrder.updatedAt && (
                  <span className="ml-2">
                    • Updated on {new Date(currentOrder.updatedAt).toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadOrderDetail(currentOrder.id)}
              disabled={detailLoading}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${detailLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Operational Status Notifications */}
        {actionError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Operational Alert: Shipping Negotiation Required */}
        {currentOrder.shippingStatus === 'NEGOTIATION_REQUIRED' && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 tracking-wide uppercase">
                Shipping Negotiation Required
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                The shipping terms for this order are currently pending negotiation with the customer.
                In accordance with pharmaceutical distribution protocol, dispatch marking (SHIPPED) is locked
                until agreed shipping terms are established.
              </p>
            </div>
          </div>
        )}

        {/* Grid: Customer & Order Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Ownership & Destination */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <User className="w-4 h-4 text-[#0B2346]" />
                Customer Identity & Shipping
              </div>
              <span className="text-[11px] font-mono text-gray-400">UID: {currentOrder.userId}</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Recipient Name</div>
                <div className="text-sm font-bold text-gray-900">
                  {currentOrder.customerSnapshot.displayName || currentOrder.shippingAddress.recipientName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Email Address</span>
                  <span className="font-mono text-gray-900 break-all">
                    {currentOrder.customerSnapshot.email || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone Contact</span>
                  <span className="font-mono text-gray-900">
                    {currentOrder.shippingAddress.phone || currentOrder.customerSnapshot.phone || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-xs text-gray-800">
                  {currentOrder.shippingAddress.address}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.wilaya}{' '}
                  {currentOrder.shippingAddress.postalCode && `(${currentOrder.shippingAddress.postalCode})`}
                </div>
                {currentOrder.shippingAddress.notes && (
                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded mt-2">
                    <strong>Delivery Note:</strong> {currentOrder.shippingAddress.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary & Financials */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <CreditCard className="w-4 h-4 text-[#0B2346]" />
                Financial & Operational Status
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getOrderStatusBadge(
                    currentOrder.status
                  )}`}
                >
                  {currentOrder.status}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getPaymentStatusBadge(
                    currentOrder.paymentStatus
                  )}`}
                >
                  {currentOrder.paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Authoritative Subtotal</span>
                <span className="font-mono font-medium text-gray-900">
                  {formatDzdPrice(currentOrder.subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span>Delivery Fee</span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getShippingStatusBadge(
                      currentOrder.shippingStatus
                    )}`}
                  >
                    {currentOrder.shippingStatus === 'FREE'
                      ? 'FREE'
                      : currentOrder.shippingStatus === 'AGREED_WITH_CUSTOMER'
                      ? 'AGREED'
                      : 'NEGOTIATION REQ.'}
                  </span>
                </div>
                <span className="font-mono font-medium text-gray-900">
                  {formatDzdPrice(currentOrder.shippingCost)}
                </span>
              </div>

              {currentOrder.discounts > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Authoritative Discounts</span>
                  <span className="font-mono">-{formatDzdPrice(currentOrder.discounts)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Total Due
                </span>
                <span className="text-lg font-bold font-mono text-[#0B2346]">
                  {formatDzdPrice(currentOrder.total)}
                </span>
              </div>

              {currentOrder.restartFundContribution && currentOrder.restartFundContribution > 0 && (
                <div className="pt-2 text-[11px] text-gray-400 text-right">
                  Includes Restart Fund Contribution ({formatDzdPrice(currentOrder.restartFundContribution)})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Purchased Items (Server-Authoritative Line Items) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Layers className="w-4 h-4 text-[#0B2346]" />
              Purchased Line Items ({currentOrder.items.length})
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Total Units:{' '}
              <strong>{currentOrder.items.reduce((acc, it) => acc + it.quantity, 0)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Variant</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Authoritative Unit Price</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
                  <th className="py-3 px-4">Operational Inventory ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentOrder.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {item.productNameSnapshot}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.variantNameSnapshot || 'Standard'}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">{item.sku}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      {formatDzdPrice(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      {formatDzdPrice(item.subtotal)}
                    </td>
                    <td className="py-3 px-4">
                      {item.inventoryId ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[10px] border border-zinc-200">
                          {item.inventoryId}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Auto-allocated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Administrative Operations Control Box */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-800">
              <ShieldCheck className="w-4 h-4 text-[#0B2346]" />
              Staff Order Operations (Authoritative Backend State Machine)
            </div>
            <span className="text-xs text-gray-400">
              Validated server-side against immutable contracts
            </span>
          </div>

          {/* Transition Status Options */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-700">Order Status Mutation:</div>
            <div className="flex flex-wrap items-center gap-2">
              {(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((st) => {
                const isCurrent = currentOrder.status === st;
                const isAllowed = isValidOrderTransition(currentOrder.status, st);
                const isBlockedByShipping =
                  st === 'SHIPPED' && currentOrder.shippingStatus === 'NEGOTIATION_REQUIRED';

                return (
                  <Button
                    key={st}
                    size="sm"
                    variant={isCurrent ? 'primary' : 'outline'}
                    disabled={updating || isCurrent || !isAllowed || isBlockedByShipping}
                    onClick={() => {
                      setPendingStatusTransition(st);
                    }}
                    className="text-xs"
                    title={
                      isBlockedByShipping
                        ? 'Shipping negotiation required before marking SHIPPED.'
                        : !isAllowed
                        ? `Transition from ${currentOrder.status} to ${st} not permitted.`
                        : undefined
                    }
                  >
                    {st === 'CONFIRMED' && 'Confirm Order'}
                    {st === 'PROCESSING' && 'Move to Processing'}
                    {st === 'SHIPPED' && 'Mark as Shipped'}
                    {st === 'DELIVERED' && 'Mark as Delivered'}
                  </Button>
                );
              })}

              {/* Cancellation Button */}
              {currentOrder.status !== 'CANCELLED' && currentOrder.status !== 'DELIVERED' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() => {
                    setCancelReason('');
                    setCancelReasonError(null);
                    setShowCancelModal(true);
                  }}
                  className="text-xs border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 ml-auto"
                >
                  <Ban className="w-3.5 h-3.5 mr-1" />
                  Cancel Order
                </Button>
              )}
            </div>

            {currentOrder.status === 'CANCELLED' && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                This order is in terminal state <strong>CANCELLED</strong>. No further status
                transitions are allowed.
              </div>
            )}
            {currentOrder.status === 'DELIVERED' && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                This order is in terminal state <strong>DELIVERED</strong>. The fulfillment lifecycle
                is complete.
              </div>
            )}
          </div>

          {/* Payment Status Mutation */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="text-xs font-semibold text-gray-700">Payment Status Mutation:</div>
            <div className="flex flex-wrap items-center gap-2">
              {(['UNPAID', 'PENDING', 'PAID', 'REFUNDED'] as PaymentStatus[]).map((pst) => {
                const isCurrent = currentOrder.paymentStatus === pst;
                const isAllowed = isValidPaymentTransition(currentOrder.paymentStatus, pst);

                return (
                  <Button
                    key={pst}
                    size="sm"
                    variant={isCurrent ? 'primary' : 'outline'}
                    disabled={updating || isCurrent || !isAllowed}
                    onClick={() => handleExecutePaymentTransition(pst)}
                    className="text-xs"
                    title={
                      !isAllowed
                        ? `Payment transition from ${currentOrder.paymentStatus} to ${pst} not permitted.`
                        : undefined
                    }
                  >
                    Mark {pst}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order History Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-3">
            <Clock className="w-4 h-4 text-[#0B2346]" />
            Authoritative Order Timeline & History
          </div>

          {currentOrder.history && currentOrder.history.length > 0 ? (
            <div className="space-y-3 pt-2">
              {currentOrder.history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200/80 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{h.status}</span>
                      {h.paymentStatus && (
                        <span className="text-gray-500 font-mono">
                          (Payment: {h.paymentStatus})
                        </span>
                      )}
                      {h.shippingStatus && (
                        <span className="text-gray-500 font-mono">
                          (Shipping: {h.shippingStatus})
                        </span>
                      )}
                    </div>
                    {h.note && <p className="text-gray-600 italic">"{h.note}"</p>}
                    <div className="text-[11px] text-gray-400">
                      Actor: <span className="font-mono text-gray-600">{h.actorUserId || 'Staff / System'}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-gray-400 shrink-0 ml-4">
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-2">
              No detailed transition log entries recorded on this order yet.
            </p>
          )}
        </div>

        {/* Cancellation Modal (Enforcing Mandatory Reason) */}
        {showCancelModal && (
          <Modal
            isOpen={showCancelModal}
            onClose={() => {
              if (!updating) setShowCancelModal(false);
            }}
            title="Cancel Customer Order"
            subtitle={`Order ${currentOrder.orderNumber || currentOrder.id}`}
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                Cancelling this order will release all reserved product inventory back to available stock
                and trigger an authoritative audit event.
              </div>

              <div>
                <label className="block font-semibold text-gray-800 mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (e.target.value.trim()) setCancelReasonError(null);
                  }}
                  placeholder="e.g. Customer requested cancellation via phone verification; stock allocation expired..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
                />
                {cancelReasonError && (
                  <p className="text-red-600 text-[11px] mt-1 font-medium">{cancelReasonError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => setShowCancelModal(false)}
                  className="text-xs"
                >
                  Dismiss
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={updating || !cancelReason.trim()}
                  onClick={handleExecuteCancellation}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  {updating ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Status Transition Confirmation Modal */}
        {pendingStatusTransition && (
          <Modal
            isOpen={!!pendingStatusTransition}
            onClose={() => {
              if (!updating) setPendingStatusTransition(null);
            }}
            title={`Transition Order to ${pendingStatusTransition}`}
            subtitle={`Order ${currentOrder.orderNumber || currentOrder.id}`}
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <p className="text-gray-600">
                Confirm order status mutation from <strong>{currentOrder.status}</strong> to{' '}
                <strong>{pendingStatusTransition}</strong>.
              </p>

              <div>
                <label className="block font-semibold text-gray-800 mb-1">
                  Operational Transition Note (Optional)
                </label>
                <input
                  type="text"
                  value={statusTransitionNote}
                  onChange={(e) => setStatusTransitionNote(e.target.value)}
                  placeholder="e.g. Carrier tracking assigned; QC inspection approved..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => setPendingStatusTransition(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={updating}
                  onClick={() =>
                    handleExecuteStatusTransition(pendingStatusTransition, statusTransitionNote)
                  }
                  className="text-xs"
                >
                  {updating ? 'Executing...' : 'Apply Transition'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // Render Orders List View
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#0B2346]" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Order Operations</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Authoritative commerce ledger. Verify allocations, monitor delivery terms, and execute order state mutations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={listLoading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${listLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Operational KPI Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Total Orders
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono mt-1">{orders.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Commercial registry</div>
        </div>

        <div
          onClick={() => {
            setShippingFilter((prev) =>
              prev === 'NEGOTIATION_REQUIRED' ? 'ALL' : 'NEGOTIATION_REQUIRED'
            );
          }}
          className={`cursor-pointer rounded-lg p-4 border transition-all ${
            shippingFilter === 'NEGOTIATION_REQUIRED'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/50'
              : 'bg-white border-gray-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Negotiation Required
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono mt-1">
            {negotiationRequiredCount}
          </div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Click to toggle filter</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Pending Confirmation
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono mt-1">
            {pendingReviewCount}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Awaiting staff confirmation</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Active Processing
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono mt-1">
            {activeProcessingCount}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Confirmed or in fulfillment</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, email, phone, wilaya..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0B2346] bg-white"
            >
              <option value="ALL">Order Status: All</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0B2346] bg-white"
            >
              <option value="ALL">Payment Status: All</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0B2346] bg-white"
            >
              <option value="ALL">Date: All Time</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">Past 7 Days</option>
              <option value="THIS_MONTH">This Month</option>
            </select>
          </div>
        </div>

        {/* Quick Operational Toggle for Shipping Negotiation */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Quick Filter:</span>
            <button
              onClick={() => {
                setShippingFilter(shippingFilter === 'NEGOTIATION_REQUIRED' ? 'ALL' : 'NEGOTIATION_REQUIRED');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                shippingFilter === 'NEGOTIATION_REQUIRED'
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Shipping negotiation required</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                {negotiationRequiredCount}
              </span>
            </button>

            {shippingFilter !== 'ALL' && shippingFilter !== 'NEGOTIATION_REQUIRED' && (
              <span className="text-gray-500 text-xs">
                Shipping Status: <strong>{shippingFilter}</strong>
              </span>
            )}
          </div>

          <div className="text-gray-400 text-[11px] font-mono">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
        {listLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#0B2346] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-900">Loading orders ledger...</p>
            <p className="text-xs text-gray-500 mt-1">
              Synchronizing with authoritative Firestore database
            </p>
          </div>
        ) : listError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-900">Failed to Load Orders</p>
            <p className="text-xs text-red-600 mt-1">{listError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadOrders}
              className="mt-4 text-xs"
            >
              Retry
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-900">No Orders Located</p>
            <p className="text-xs text-gray-500 mt-1">
              No orders matched the current search criteria or status filters.
            </p>
            {(statusFilter !== 'ALL' ||
              paymentFilter !== 'ALL' ||
              shippingFilter !== 'ALL' ||
              dateFilter !== 'ALL' ||
              searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('ALL');
                  setPaymentFilter('ALL');
                  setShippingFilter('ALL');
                  setDateFilter('ALL');
                  setSearchTerm('');
                }}
                className="mt-4 text-xs"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wider text-gray-600 font-semibold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Items / Qty</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-center">Shipping Status</th>
                  <th className="py-3 px-4 text-right">Shipping Cost</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center">Order Status</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord) => {
                  const totalUnits = ord.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => navigate(`admin/orders/${ord.id}` as PublicRoute)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                    >
                      {/* Order ID */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-gray-900">
                          {ord.orderNumber || ord.id}
                        </div>
                        <div className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]">
                          {ord.id}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">
                          {ord.customerSnapshot?.displayName || ord.shippingAddress?.recipientName}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[160px]">
                          {ord.customerSnapshot?.email}
                        </div>
                        {ord.shippingAddress?.phone && (
                          <div className="text-[10px] text-gray-400 font-mono">
                            {ord.shippingAddress.phone}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        <div>{new Date(ord.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {new Date(ord.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Items / Quantity */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-gray-900">{totalUnits}</span>
                        <span className="text-[10px] text-gray-400 block">
                          ({ord.items.length} {ord.items.length === 1 ? 'sku' : 'skus'})
                        </span>
                      </td>

                      {/* Subtotal */}
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        {formatDzdPrice(ord.subtotal)}
                      </td>

                      {/* Shipping Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getShippingStatusBadge(
                            ord.shippingStatus
                          )}`}
                        >
                          {ord.shippingStatus === 'FREE'
                            ? 'FREE'
                            : ord.shippingStatus === 'AGREED_WITH_CUSTOMER'
                            ? 'AGREED'
                            : 'NEGOTIATION REQ.'}
                        </span>
                      </td>

                      {/* Shipping Cost */}
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        {formatDzdPrice(ord.shippingCost)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getPaymentStatusBadge(
                            ord.paymentStatus
                          )}`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getOrderStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0B2346] whitespace-nowrap">
                        {formatDzdPrice(ord.total)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`admin/orders/${ord.id}` as PublicRoute)}
                          className="inline-flex items-center gap-1 text-xs text-[#0B2346] hover:bg-gray-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Order
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
