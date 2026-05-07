import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardAnalytics, type DashboardAnalytics } from '../services/analyticsService';
import { useToast } from '../components/Toast';
import {
  BarChart3, Users, ShoppingBag, DollarSign, UtensilsCrossed, Loader2,
  Clock, CheckCircle2, Package, Truck, XCircle, FolderOpen, ClipboardList,
  ArrowRight, Store
} from 'lucide-react';

const statusIcons: Record<string, any> = {
  Pending: Clock, Confirmed: CheckCircle2, Processing: Package,
  OutForDelivery: Truck, Delivered: CheckCircle2, Cancelled: XCircle,
  // lowercase fallbacks
  pending: Clock, confirmed: CheckCircle2, preparing: Package, delivered: Truck, cancelled: XCircle,
};
const statusColors: Record<string, string> = {
  Pending: 'text-amber-600 bg-amber-50', Confirmed: 'text-blue-600 bg-blue-50',
  Processing: 'text-violet-600 bg-violet-50', OutForDelivery: 'text-indigo-600 bg-indigo-50',
  Delivered: 'text-emerald-600 bg-emerald-50', Cancelled: 'text-red-600 bg-red-50',
  // lowercase fallbacks
  pending: 'text-amber-600 bg-amber-50', confirmed: 'text-blue-600 bg-blue-50',
  preparing: 'text-violet-600 bg-violet-50', delivered: 'text-emerald-600 bg-emerald-50',
  cancelled: 'text-red-600 bg-red-50',
};

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getDashboardAnalytics();
        setData(result);
      } catch { showToast('Failed to load analytics', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-red-500 font-medium">Failed to load dashboard</p>
    </div>
  );

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Revenue', value: `Rs. ${(data.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Recipes', value: data.totalRecipes, icon: UtensilsCrossed, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  const adminLinks = [
    {
      title: 'Manage Categories',
      description: 'Create, edit, and delete recipe categories',
      to: '/admin/categories',
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      hoverBg: 'hover:border-blue-200',
    },
    {
      title: 'Manage Recipes',
      description: 'Create, edit, and delete recipes',
      to: '/admin/recipes',
      icon: UtensilsCrossed,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      hoverBg: 'hover:border-violet-200',
    },
    {
      title: 'Manage Orders',
      description: 'View all orders and update their status',
      to: '/admin/orders',
      icon: ClipboardList,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      hoverBg: 'hover:border-orange-200',
    },
    {
      title: 'Vendor Requests',
      description: 'Manage ingredient restock requests',
      to: '/admin/vendor-requests',
      icon: Store,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      hoverBg: 'hover:border-emerald-200',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
        <BarChart3 className="h-8 w-8 text-orange-500" /> Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Quick-Access Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.to} to={link.to}
              className={`group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all ${link.hoverBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${link.bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{link.title}</h3>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Orders by Status */}
      {data.ordersByStatus && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Orders by Status</h2>
            <Link to="/admin/orders" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(data.ordersByStatus).map(([status, count]) => {
              const Icon = statusIcons[status] || Package;
              const colorClass = statusColors[status] || 'text-gray-600 bg-gray-50';
              return (
                <div key={status} className={`rounded-xl p-4 text-center ${colorClass}`}>
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-2xl font-extrabold">{count}</p>
                  <p className="text-xs font-medium capitalize mt-1">{status}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Recipes (if analytics returns them) */}
      {(data as any).popularRecipes && (data as any).popularRecipes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Recipes</h2>
          <div className="space-y-3">
            {(data as any).popularRecipes.map((recipe: any, idx: number) => (
              <div key={recipe._id || idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-orange-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 flex items-center justify-center rounded-lg bg-orange-100 text-orange-700 font-extrabold text-sm">{idx + 1}</span>
                  {recipe.imageUrl && (
                    <img src={recipe.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  )}
                  <span className="font-medium text-gray-900">{recipe.title || 'Untitled'}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{recipe.timesOrdered} orders</p>
                  {recipe.totalRevenue != null && (
                    <p className="text-xs text-gray-400">Rs. {recipe.totalRevenue.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
