import { useEffect, useState } from 'react';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../services/adminService';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Loader2, ArrowLeft, ChevronDown, Truck, Package, CheckCircle2, Clock, XCircle, RefreshCw,
} from 'lucide-react';

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'OutForDelivery', 'Delivered', 'Cancelled'] as const;

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Pending:        { icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50' },
  Confirmed:      { icon: CheckCircle2,  color: 'text-blue-600',    bg: 'bg-blue-50' },
  Processing:     { icon: Package,       color: 'text-violet-600',  bg: 'bg-violet-50' },
  OutForDelivery: { icon: Truck,         color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  Delivered:      { icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  Cancelled:      { icon: XCircle,       color: 'text-red-600',     bg: 'bg-red-50' },
};

interface OrderSummary {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string } | string;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  itemCount: number;
  recipes: string[];
  createdAt: string;
}

const AdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminGetAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrderStatus(orderId, newStatus, `Status changed to ${newStatus} by admin`);
      showToast(`Order updated to ${newStatus}`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-brand" /> Manage Orders
          </h1>
        </div>
        <button onClick={fetchOrders} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filterStatus === 'all' ? 'bg-brand-dark text-white shadow' : 'bg-white text-gray-500 border border-gray-200 hover:border-brand-light'}`}>
          All ({orders.length})
        </button>
        {STATUSES.map((s) => {
          const cfg = statusConfig[s];
          const count = statusCounts[s] || 0;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filterStatus === s ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-current` : 'bg-white text-gray-500 border border-gray-200 hover:border-brand-light'}`}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="h-14 w-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3.5 font-semibold">Order #</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Items</th>
                  <th className="px-5 py-3.5 font-semibold">Total</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.Pending;
                  const StatusIcon = cfg.icon;
                  const userName = typeof order.user === 'string' ? order.user : order.user?.name || 'N/A';
                  const userEmail = typeof order.user === 'string' ? '' : order.user?.email || '';

                  return (
                    <tr key={order._id} className="hover:bg-brand-light/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{userName}</p>
                          {userEmail && <p className="text-xs text-gray-400">{userEmail}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-700">{order.itemCount}</span>
                        {order.recipes && order.recipes.length > 0 && (
                          <p className="text-xs text-gray-400 truncate max-w-[150px]" title={order.recipes.join(', ')}>
                            {order.recipes.join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 font-bold text-gray-900">Rs. {(order.totalPrice || 0).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <div>
                          <span className="text-xs font-medium text-gray-600">{order.paymentMethod}</span>
                          <span className={`block text-xs font-bold mt-0.5 ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : order.paymentStatus === 'Failed' ? 'text-red-500' : 'text-amber-600'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right">
                        {updatingId === order._id ? (
                          <Loader2 className="h-5 w-5 text-brand animate-spin ml-auto" />
                        ) : (
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="appearance-none pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-brand focus:border-brand cursor-pointer transition-colors hover:bg-gray-100"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-400 mt-4 text-right">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>
    </div>
  );
};

export default AdminOrders;
