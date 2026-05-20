import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../services/orderService';
import { getPaymentForOrder } from '../services/paymentService';
import { useToast } from '../components/Toast';
import type { Order, Payment } from '../types';
import { ArrowLeft, Loader2, Package, Clock, CheckCircle2, XCircle, Truck, CreditCard, Banknote, AlertTriangle } from 'lucide-react';

const statusConfig: Record<string, { color: string; bg: string; icon: any; }> = {
  Pending:        { color: 'text-amber-600',   bg: 'bg-amber-50',   icon: Clock },
  Confirmed:      { color: 'text-blue-600',    bg: 'bg-blue-50',    icon: CheckCircle2 },
  Processing:     { color: 'text-violet-600',   bg: 'bg-violet-50',  icon: Package },
  OutForDelivery: { color: 'text-indigo-600',   bg: 'bg-indigo-50',  icon: Truck },
  Delivered:      { color: 'text-emerald-600',  bg: 'bg-emerald-50', icon: Truck },
  Cancelled:      { color: 'text-red-600',      bg: 'bg-red-50',     icon: XCircle },
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [ord, pay] = await Promise.allSettled([getOrderById(id), getPaymentForOrder(id)]);
        if (ord.status === 'fulfilled') setOrder(ord.value);
        if (pay.status === 'fulfilled') setPayment(pay.value);
      } catch { showToast('Failed to load order', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleCancel = async () => {
    if (!id || !confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await cancelOrder(id);
      showToast('Order cancelled', 'info');
      setOrder((prev) => prev ? { ...prev, status: 'Cancelled' } : prev);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-[60vh] flex items-center justify-center flex-col space-y-4">
      <p className="text-red-500 font-medium text-lg">Order not found</p>
      <button onClick={() => navigate('/orders')} className="px-6 py-2 bg-brand-light text-brand-dark rounded-lg hover:bg-brand-light transition-colors">Back to Orders</button>
    </div>
  );

  const cfg = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/orders')} className="inline-flex items-center gap-2 text-gray-500 hover:text-brand mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">All Orders</span>
      </button>

      {/* Header */}
      <div className="hela-card p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 font-mono">Order {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${cfg.color} ${cfg.bg}`}>
            <StatusIcon className="h-4 w-4" />
            {order.status}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="hela-card p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => {
            const title = (item as any).recipeTitle || (typeof (item as any).recipeId === 'object' ? (item as any).recipeId?.title : 'Recipe');
            return (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-400">{item.servings} serving{item.servings !== 1 ? 's' : ''}</p>
              </div>
              {item.itemTotal != null && (
                <p className="text-sm font-bold text-gray-700">Rs. {item.itemTotal.toFixed(2)}</p>
              )}
            </div>
            );
          })}
        </div>
        {order.totalPrice != null && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="font-medium text-gray-500">Total</span>
            <span className="text-2xl font-extrabold text-gray-900">Rs. {order.totalPrice.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className="hela-card p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>
        <div className="flex items-center gap-3">
          {order.paymentMethod === 'Card' ? (
            <div className="flex items-center gap-2 text-blue-600">
              <CreditCard className="h-5 w-5" /><span className="font-medium">Card (Stripe)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-brand">
              <Banknote className="h-5 w-5" /><span className="font-medium">Cash on Delivery</span>
            </div>
          )}
        {order.paymentStatus && (
            <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : order.paymentStatus === 'Failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              {order.paymentStatus}
            </span>
          )}
        </div>
        {payment?.transactionId && (
          <p className="mt-3 text-xs font-medium text-gray-400">Transaction: {payment.transactionId}</p>
        )}
      </div>

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <div className="hela-card p-5 sm:p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Delivery Address</h2>
          <p className="text-gray-700">{order.deliveryAddress.fullName}</p>
          <p className="text-sm text-gray-500">{order.deliveryAddress.addressLine1}</p>
          {order.deliveryAddress.addressLine2 && <p className="text-sm text-gray-500">{order.deliveryAddress.addressLine2}</p>}
          <p className="text-sm text-gray-500">{order.deliveryAddress.city}</p>
          <p className="text-sm text-gray-500">{order.deliveryAddress.phone}</p>
        </div>
      )}

      {/* Cancel Button */}
      {(order.status === 'Pending' || order.status === 'Confirmed') && (
        <button onClick={handleCancel} disabled={cancelling}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors disabled:opacity-50">
          {cancelling ? <Loader2 className="h-5 w-5 animate-spin" /> : <><AlertTriangle className="h-5 w-5" /> Cancel Order</>}
        </button>
      )}
    </div>
  );
};

export default OrderDetail;
