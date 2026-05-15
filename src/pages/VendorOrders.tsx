import { Fragment, useEffect, useState } from 'react';
import { getVendorOrders } from '../services/vendorService';
import type { VendorOrder } from '../types';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import {
  PackageSearch, Loader2, ArrowLeft, RefreshCw, Clock, CheckCircle2, Package, Truck, XCircle, ChevronDown, ChevronUp
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

const VendorOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getVendorOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load vendor orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          <Link to="/vendor/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Vendor Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
            <PackageSearch className="h-8 w-8 text-brand" /> Order Fulfillment
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
          if (count === 0 && filterStatus !== s) return null; // Hide empty statuses unless selected
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
            <PackageSearch className="h-14 w-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No orders to fulfill</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3.5 font-semibold">Order #</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Items to Fulfill</th>
                  <th className="px-5 py-3.5 font-semibold">Revenue</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.Pending;
                  const StatusIcon = cfg.icon;
                  const isExpanded = expandedId === order._id;

                  return (
                    <Fragment key={order._id}>
                      <tr className={`hover:bg-brand-light/30 transition-colors ${isExpanded ? 'bg-brand-light/20' : ''}`}>
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-bold text-gray-900">
                            {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{order.customer.name}</p>
                            <p className="text-xs text-gray-400">{order.customer.phone}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-700">{order.items.length} Recipe{order.items.length !== 1 ? 's' : ''}</span>
                        </td>
                        <td className="px-5 py-3 font-bold text-gray-900">Rs. {(order.vendorTotal || 0).toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => toggleExpand(order._id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900">
                            {isExpanded ? 'Hide' : 'View'}
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${order._id}-detail`} className="bg-gray-50/50">
                        <td colSpan={7} className="px-5 py-4 border-b border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Delivery Info */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <Truck className="h-3.5 w-3.5" /> Delivery Address
                              </h4>
                              <p className="font-medium text-gray-900 text-sm mb-1">{order.deliveryAddress.fullName}</p>
                              <p className="text-sm text-gray-600">{order.deliveryAddress.addressLine1}</p>
                              {order.deliveryAddress.addressLine2 && <p className="text-sm text-gray-600">{order.deliveryAddress.addressLine2}</p>}
                              <p className="text-sm text-gray-600">{order.deliveryAddress.city}</p>
                              <p className="text-sm font-medium text-gray-900 mt-2">{order.deliveryAddress.phone}</p>
                            </div>

                            {/* Fulfillment Items */}
                            <div className="md:col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <Package className="h-3.5 w-3.5" /> Items to Fulfill
                              </h4>
                              <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="border border-gray-100 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <p className="font-bold text-gray-900 text-sm">{item.recipeTitle} <span className="text-gray-400 font-normal">({item.servings} servings)</span></p>
                                      <p className="font-bold text-emerald-600 text-sm">Rs. {item.vendorItemTotal.toFixed(2)}</p>
                                    </div>
                                    <ul className="space-y-1">
                                      {item.ingredients.map((ing, iIdx) => (
                                        <li key={iIdx} className="flex justify-between text-xs text-gray-600">
                                          <span>• {ing.ingredientName}</span>
                                          <span className="font-medium">{ing.scaledQuantity} {ing.unit}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
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

export default VendorOrders;
