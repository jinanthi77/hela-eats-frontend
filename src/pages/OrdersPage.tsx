import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/orderService';
import { useToast } from '../components/Toast';
import type { Order } from '../types';
import { ClipboardList, Loader2, Package, Eye, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  Pending:        { color: 'text-amber-600',   bg: 'bg-amber-50',   icon: Clock },
  Confirmed:      { color: 'text-blue-600',    bg: 'bg-blue-50',    icon: CheckCircle2 },
  Processing:     { color: 'text-violet-600',   bg: 'bg-violet-50',  icon: Package },
  OutForDelivery: { color: 'text-indigo-600',   bg: 'bg-indigo-50',  icon: Truck },
  Delivered:      { color: 'text-emerald-600',  bg: 'bg-emerald-50', icon: Truck },
  Cancelled:      { color: 'text-red-600',      bg: 'bg-red-50',     icon: XCircle },
};

const OrdersPage = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch { showToast('Failed to load orders', 'error'); }
      finally { setLoading(false); }
    };
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-brand" /> My Orders
        </h1>
        <p className="text-gray-500 mt-1">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-400 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Browse recipes and place your first order!</p>
          <Link to="/recipes" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-dark transition-colors">Browse Recipes</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.Pending;
            const StatusIcon = cfg.icon;
            return (
              <Link key={order._id} to={`/orders/${order._id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 font-mono">{order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color} ${cfg.bg}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {order.status}
                    </span>
                    {order.totalPrice != null && (
                      <span className="text-lg font-extrabold text-gray-900">Rs. {order.totalPrice.toFixed(2)}</span>
                    )}
                    <Eye className="h-5 w-5 text-gray-300 group-hover:text-brand transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
