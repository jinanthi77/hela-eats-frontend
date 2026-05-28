import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellDot, CheckCircle2, Clock3, PackageCheck, Truck, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { adminGetAllOrders } from '../services/adminService';
import { getOrders } from '../services/orderService';
import { getVendorOrders } from '../services/vendorService';
import type { OrderStatus, PaymentMethodType, PaymentStatusType, User, VendorOrder } from '../types';

type Role = User['role'];

type NoticeTone = 'new' | 'progress' | 'done' | 'cancelled';

interface NoticeSource {
  _id: string;
  orderNumber?: string;
  status?: OrderStatus | string;
  paymentMethod?: PaymentMethodType | string;
  paymentStatus?: PaymentStatusType | string;
  createdAt?: string;
  updatedAt?: string;
  cancelledAt?: string;
  deliveredAt?: string;
  recipes?: Array<string | { title?: string }>;
  items?: Array<{
    recipeTitle?: string;
    recipeId?: string | { title?: string };
  }>;
}

interface NotificationItem {
  id: string;
  orderId: string;
  title: string;
  status: string;
  detail: string;
  timestamp: string;
  tone: NoticeTone;
  href: string;
}

const POLL_INTERVAL_MS = 45000;
const MAX_NOTIFICATIONS = 8;

const statusLabels: Record<string, string> = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Processing: 'Preparing',
  OutForDelivery: 'Delivering',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

const getTone = (status?: string): NoticeTone => {
  if (status === 'Cancelled') return 'cancelled';
  if (status === 'Delivered') return 'done';
  if (status === 'Pending') return 'new';
  return 'progress';
};

const getNoticeIcon = (tone: NoticeTone) => {
  if (tone === 'cancelled') return XCircle;
  if (tone === 'done') return CheckCircle2;
  if (tone === 'progress') return Truck;
  return PackageCheck;
};

const getDotClass = (tone: NoticeTone) => {
  if (tone === 'cancelled') return 'bg-red-400';
  if (tone === 'done') return 'bg-brand';
  if (tone === 'progress') return 'bg-yellow-300';
  return 'bg-brand-light border border-brand';
};

const formatStatus = (status?: string) => statusLabels[status || ''] || status || 'Updated';

const formatTime = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return { time: 'Just now', date: '' };

  return {
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    date: date.toLocaleDateString('en-CA').replaceAll('-', '/'),
  };
};

const getOrderTitle = (order: NoticeSource) => {
  const firstItem = order.items?.[0];
  if (firstItem?.recipeTitle) return firstItem.recipeTitle;
  if (typeof firstItem?.recipeId === 'object' && firstItem.recipeId?.title) return firstItem.recipeId.title;

  const firstRecipe = order.recipes?.[0];
  if (typeof firstRecipe === 'string') return firstRecipe;
  if (firstRecipe?.title) return firstRecipe.title;

  return order.orderNumber ? `Order ${order.orderNumber}` : 'Order update';
};

const getRoleDetail = (role: Role, status: string) => {
  const label = formatStatus(status);
  if (role === 'admin') {
    if (status === 'Pending') return 'New order placed';
    if (status === 'Cancelled') return 'Order cancellation';
    return `Order status: ${label}`;
  }
  if (role === 'vendor') {
    if (status === 'Cancelled') return 'Order cancelled';
    if (status === 'Confirmed') return 'Order confirmed';
    return `Vendor order: ${label}`;
  }
  return `Status: ${label}`;
};

const getHref = (role: Role, orderId: string) => {
  if (role === 'admin') return '/admin/orders';
  if (role === 'vendor') return '/vendor/orders';
  return `/purchase?order=${encodeURIComponent(orderId)}`;
};

const toNotification = (order: NoticeSource, role: Role): NotificationItem => {
  const status = order.status || 'Pending';
  const timestamp = order.updatedAt || order.cancelledAt || order.deliveredAt || order.createdAt || new Date().toISOString();

  return {
    id: `${role}:${order._id}:${status}:${timestamp}`,
    orderId: order._id,
    title: getOrderTitle(order),
    status: formatStatus(status),
    detail: getRoleDetail(role, status),
    timestamp,
    tone: getTone(status),
    href: getHref(role, order._id),
  };
};

const isUserVisibleOrderNotification = (order: NoticeSource) => {
  if (order.status === 'Cancelled' || order.status === 'Delivered') return true;
  if (order.status === 'Processing' || order.status === 'OutForDelivery') return true;
  if (order.paymentMethod !== 'Card') return true;
  return order.paymentStatus === 'Paid';
};

const isString = (value: unknown): value is string => typeof value === 'string';

const readStoredIds = (key: string) => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter(isString) : []);
  } catch {
    return new Set<string>();
  }
};

const writeStoredIds = (key: string, ids: string[]) => {
  localStorage.setItem(key, JSON.stringify(ids.slice(0, 60)));
};

const fetchRoleNotifications = async (role: Role): Promise<NotificationItem[]> => {
  if (role === 'admin') {
    const orders = await adminGetAllOrders();
    return orders.map((order) => toNotification(order, role));
  }

  if (role === 'vendor') {
    const orders = await getVendorOrders();
    return orders.map((order: VendorOrder) => toNotification(order, role));
  }

  const orders = await getOrders();
  return orders.filter(isUserVisibleOrderNotification).map((order) => toNotification(order, role));
};

const NotificationsMenu = () => {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(() => {
    if (!user?._id || !user.role) return 'hela-eats:notifications:guest';
    return `hela-eats:notifications:${user.role}:${user._id}`;
  }, [user?._id, user?.role]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!isAuthenticated || !user?.role) {
        if (!ignore) setItems([]);
        return;
      }

      try {
        const nextItems = await fetchRoleNotifications(user.role);
        const sortedItems = nextItems
          .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
          .slice(0, MAX_NOTIFICATIONS);
        if (!ignore) setItems(sortedItems);
      } catch {
        if (!ignore) setItems([]);
      }
    };

    window.setTimeout(() => {
      if (!ignore) setReadIds(readStoredIds(storageKey));
    }, 0);
    load();
    const interval = window.setInterval(load, POLL_INTERVAL_MS);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, [isAuthenticated, storageKey, user?.role]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || items.length === 0) return;

    const timeout = window.setTimeout(() => {
      setReadIds((current) => {
        const merged = Array.from(new Set([...Array.from(current), ...items.map((item) => item.id)]));
        writeStoredIds(storageKey, merged);
        return new Set(merged);
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [items, open, storageKey]);

  if (!isAuthenticated || !user?.role) return null;

  const unreadCount = items.filter((item) => !readIds.has(item.id)).length;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative h-10 w-10 rounded-full border-2 border-brand-dark bg-white text-brand-dark flex items-center justify-center hover:bg-brand-light transition-all duration-200 hover:scale-105"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        {unreadCount > 0 ? <BellDot className="h-[18px] w-[18px]" /> : <Bell className="h-[18px] w-[18px]" />}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-h-5 min-w-5 rounded-full bg-yellow-300 px-1 text-[10px] font-black leading-5 text-brand-dark shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.85rem)] z-[70] w-[min(92vw,430px)] origin-top-right overflow-hidden rounded-2xl border border-brand/30 bg-white shadow-[0_24px_70px_rgba(5,72,2,0.22)] animate-[slideDown_0.18s_ease]">
          <div className="px-7 py-6">
            <h2 className="text-center font-heading text-2xl font-black text-brand-dark">Notifications</h2>
            <div className="mx-auto mt-3 h-1 w-full rounded-full bg-brand-dark" />
          </div>

          <div className="max-h-[420px] overflow-y-auto px-7 pb-5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-gray-500">
                <Clock3 className="h-10 w-10 text-gray-300" />
                <p className="font-semibold">No notifications yet</p>
                <p className="text-sm">Order updates will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-dark/80">
                {items.map((item) => {
                  const { time, date } = formatTime(item.timestamp);
                  const NoticeIcon = getNoticeIcon(item.tone);
                  const unread = !readIds.has(item.id);

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-5 transition-colors hover:bg-brand-light/40"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                        <NoticeIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-base font-black text-black">{item.title}</span>
                        <span className="mt-1 block text-sm font-semibold text-gray-600">{item.detail}</span>
                      </span>
                      <span className="flex min-w-[118px] items-center justify-end gap-3 text-right">
                        <span className="text-sm font-semibold text-gray-600">
                          {time}
                          {date && <span className="block">{date}</span>}
                        </span>
                        <span
                          className={`h-3.5 w-3.5 rounded-full ${unread ? getDotClass(item.tone) : 'bg-gray-300'}`}
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
