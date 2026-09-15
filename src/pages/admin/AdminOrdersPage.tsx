import React, { useState, useEffect } from 'react';
import {
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  updatePaymentStatusAdmin,
  updateOrderShippingAdmin,
} from '@/services/commerce/orderService';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '@/types/commerce';
import { formatDzdPrice } from '@/services/commerce/pricingService';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
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
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { dir } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status transition state
  const [updating, setUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [agreedShippingCost, setAgreedShippingCost] = useState<number>(800);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const filters: { status?: OrderStatus; paymentStatus?: PaymentStatus } = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter as OrderStatus;
      if (paymentFilter !== 'ALL') filters.paymentStatus = paymentFilter as PaymentStatus;
      const data = await getAllOrdersAdmin(filters);
      setOrders(data);
    } catch (err) {
      console.warn('Error loading admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  const filteredOrders = orders.filter((ord) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      ord.orderNumber.toLowerCase().includes(term) ||
      ord.customerSnapshot.email.toLowerCase().includes(term) ||
      (ord.customerSnapshot.displayName || '').toLowerCase().includes(term) ||
      ord.shippingAddress.recipientName.toLowerCase().includes(term) ||
      ord.shippingAddress.wilaya.toLowerCase().includes(term)
    );
  });

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    setActionError(null);
    try {
      const res = await updateOrderStatusAdmin({
        orderId: selectedOrder.id,
        status: newStatus,
        note: statusNote.trim() || undefined,
      });
      setSelectedOrder(res.order);
      setStatusNote('');
      await loadOrders();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePayment = async (newPayment: PaymentStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    setActionError(null);
    try {
      const res = await updatePaymentStatusAdmin({
        orderId: selectedOrder.id,
        paymentStatus: newPayment,
        note: statusNote.trim() || undefined,
      });
      setSelectedOrder(res.order);
      setStatusNote('');
      await loadOrders();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateShipping = async (newShippingStatus: ShippingStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    setActionError(null);
    try {
      const cost =
        newShippingStatus === 'FREE'
          ? 0
          : newShippingStatus === 'AGREED_WITH_CUSTOMER'
          ? Math.max(0, agreedShippingCost)
          : 0;

      const res = await updateOrderShippingAdmin({
        orderId: selectedOrder.id,
        shippingStatus: newShippingStatus,
        shippingCost: cost,
        note: statusNote.trim() || undefined,
      });
      setSelectedOrder(res.order);
      setStatusNote('');
      await loadOrders();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update shipping status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
      case 'PROCESSING':
        return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
      case 'SHIPPED':
        return 'bg-purple-900/30 text-purple-400 border-purple-800/50';
      case 'DELIVERED':
        return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50';
      case 'CANCELLED':
        return 'bg-red-900/30 text-red-400 border-red-800/50';
      case 'PENDING':
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50';
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-900/30 text-red-400 border-red-800/50';
      case 'PENDING':
        return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
      case 'UNPAID':
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getShippingBadge = (status?: ShippingStatus) => {
    switch (status) {
      case 'FREE':
        return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50';
      case 'AGREED_WITH_CUSTOMER':
        return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
      case 'NEGOTIATION_REQUIRED':
      default:
        return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-white tracking-wide">Commerce Orders & Fulfillment</h1>
          </div>
          <p className="text-sm text-zinc-400">
            Authoritative order ledger, customer ownership audit, and Algerian DZD payment reconciliation.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order #, email, customer, or wilaya..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by order status"
            className="w-full py-2 px-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-zinc-400" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Filter by payment status"
            className="w-full py-2 px-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-zinc-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-zinc-500" />
            Loading commerce orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            <Package className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-300">No commerce orders match the current criteria.</p>
            <p className="text-xs text-zinc-500 mt-1">Orders created by customers will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Shipping</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{ord.customerSnapshot.displayName || ord.shippingAddress.recipientName}</div>
                      <div className="text-xs text-zinc-500">{ord.customerSnapshot.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-zinc-300">{ord.shippingAddress.wilaya}</div>
                      <div className="text-xs text-zinc-500">{ord.shippingAddress.city}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300">
                        {ord.items.reduce((acc, it) => acc + it.quantity, 0)} units ({ord.items.length} skus)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {formatDzdPrice(ord.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentBadge(ord.paymentStatus)}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getShippingBadge(ord.shippingStatus)}`}>
                        {ord.shippingStatus === 'FREE' ? 'FREE' : ord.shippingStatus === 'AGREED_WITH_CUSTOMER' ? 'AGREED' : 'NEEDS NEGO'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-bold text-white font-mono">{selectedOrder.orderNumber}</h2>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-400 hover:text-white p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {actionError}
              </div>
            )}

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  Customer Ownership
                </div>
                <div className="text-sm font-medium text-white">
                  {selectedOrder.customerSnapshot.displayName || selectedOrder.shippingAddress.recipientName}
                </div>
                <div className="text-xs text-zinc-400">{selectedOrder.customerSnapshot.email}</div>
                <div className="text-xs font-mono text-zinc-500">UID: {selectedOrder.userId}</div>
              </div>

              <div className="p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  Shipping Destination
                </div>
                <div className="text-sm text-zinc-200">
                  {selectedOrder.shippingAddress.recipientName} ({selectedOrder.shippingAddress.phone})
                </div>
                <div className="text-xs text-zinc-400">
                  {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city},{' '}
                  {selectedOrder.shippingAddress.wilaya}
                </div>
                {selectedOrder.shippingAddress.notes && (
                  <div className="text-xs text-amber-400/80 italic">
                    Note: "{selectedOrder.shippingAddress.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Snapshot */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Purchased Item Snapshots (Server-Authoritative)
              </h3>
              <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl divide-y divide-zinc-800/60 overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-white">{item.productNameSnapshot}</div>
                      <div className="text-xs font-mono text-zinc-500">SKU: {item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{formatDzdPrice(item.subtotal)}</div>
                      <div className="text-xs text-zinc-400">
                        {item.quantity} × {formatDzdPrice(item.unitPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authoritative Financial Breakdown */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Authoritative Subtotal</span>
                <span>{formatDzdPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 items-center">
                <div className="flex items-center gap-2">
                  <span>Authoritative Delivery</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getShippingBadge(selectedOrder.shippingStatus)}`}>
                    {selectedOrder.shippingStatus === 'FREE' ? 'FREE' : selectedOrder.shippingStatus === 'AGREED_WITH_CUSTOMER' ? 'AGREED WITH CUSTOMER' : 'NEGOTIATION REQUIRED'}
                  </span>
                </div>
                <span>{formatDzdPrice(selectedOrder.shippingCost)}</span>
              </div>
              {selectedOrder.discounts > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Discounts</span>
                  <span>-{formatDzdPrice(selectedOrder.discounts)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-base font-bold text-white">
                <span>Total Due</span>
                <span className="text-emerald-400">{formatDzdPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Administrative State Controls */}
            <div className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Order State Governance (Staff Mutation)
              </h3>

              <div>
                <input
                  type="text"
                  placeholder="Optional transition note or tracking number..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-zinc-400 self-center mr-2">Transition Order:</span>
                {(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
                  (st) => (
                    <Button
                      key={st}
                      size="sm"
                      variant={selectedOrder.status === st ? 'primary' : 'outline'}
                      disabled={updating || selectedOrder.status === st}
                      onClick={() => handleUpdateStatus(st)}
                      className="text-xs"
                    >
                      {st}
                    </Button>
                  )
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                <span className="text-xs text-zinc-400 self-center mr-2">Payment Status:</span>
                {(['UNPAID', 'PENDING', 'PAID', 'REFUNDED'] as PaymentStatus[]).map((pst) => (
                  <Button
                    key={pst}
                    size="sm"
                    variant={selectedOrder.paymentStatus === pst ? 'primary' : 'outline'}
                    disabled={updating || selectedOrder.paymentStatus === pst}
                    onClick={() => handleUpdatePayment(pst)}
                    className="text-xs"
                  >
                    {pst}
                  </Button>
                ))}
              </div>

              {/* Shipping Status & Fee Governance */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-zinc-400 mr-2">Shipping Governance:</span>
                  <Button
                    size="sm"
                    variant={selectedOrder.shippingStatus === 'NEGOTIATION_REQUIRED' ? 'primary' : 'outline'}
                    disabled={updating || selectedOrder.shippingStatus === 'NEGOTIATION_REQUIRED'}
                    onClick={() => handleUpdateShipping('NEGOTIATION_REQUIRED')}
                    className="text-xs"
                  >
                    Negotiation Required (0 DZD)
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.shippingStatus === 'FREE' ? 'primary' : 'outline'}
                    disabled={updating || selectedOrder.shippingStatus === 'FREE'}
                    onClick={() => handleUpdateShipping('FREE')}
                    className="text-xs"
                  >
                    Free Delivery (0 DZD)
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-400">Agreed Shipping Fee:</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={agreedShippingCost}
                    onChange={(e) => setAgreedShippingCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-28 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                  />
                  <span className="text-xs text-zinc-500">DZD</span>
                  <Button
                    size="sm"
                    variant={selectedOrder.shippingStatus === 'AGREED_WITH_CUSTOMER' ? 'primary' : 'outline'}
                    disabled={updating}
                    onClick={() => handleUpdateShipping('AGREED_WITH_CUSTOMER')}
                    className="text-xs"
                  >
                    Set Agreed Shipping
                  </Button>
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Immutable Order History
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOrder.history.map((h, i) => (
                  <div key={i} className="text-xs p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800/50 flex justify-between">
                    <div>
                      <span className="font-semibold text-zinc-200">{h.status}</span>
                      {h.paymentStatus && (
                        <span className="ml-2 text-zinc-400">({h.paymentStatus})</span>
                      )}
                      {h.note && <div className="text-zinc-400 mt-0.5">{h.note}</div>}
                    </div>
                    <div className="text-zinc-500 font-mono text-[11px]">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
