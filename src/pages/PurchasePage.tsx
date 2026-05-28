import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cancelOrder, deleteOrderFromHistory, getOrderById, getOrders } from '../services/orderService';
import { getRecipes } from '../services/recipeService';
import { useToast } from '../components/Toast';
import { publicAsset } from '../utils/publicAsset';
import type { Order, OrderStatus, Recipe } from '../types';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Hash,
  Home,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';

type PurchaseRecipeSummary =
  | string
  | {
      _id?: string;
      title?: string;
      imageUrl?: string;
    };

type PurchaseOrder = Order & {
  recipes?: PurchaseRecipeSummary[];
  itemCount?: number;
  hasMealKit?: boolean;
};

const fallbackImage = publicAsset('Home_page_slide_img-01.png');

const isVisiblePurchaseOrder = (order: PurchaseOrder) => {
  if (order.paymentMethod !== 'Card') return true;
  if (order.paymentStatus === 'Paid' || order.paymentStatus === 'Refunded') return true;
  return order.status === 'Processing' || order.status === 'OutForDelivery' || order.status === 'Delivered' || order.status === 'Cancelled';
};

const PurchasePage = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get('order');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [cancellingId, setCancellingId] = useState('');
  const [cancelDraft, setCancelDraft] = useState<{ order: PurchaseOrder; reason: string } | null>(null);
  const [addressOrder, setAddressOrder] = useState<PurchaseOrder | null>(null);
  const [addressLoadingId, setAddressLoadingId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [data, recipeData] = await Promise.all([
          getOrders(),
          getRecipes({ limit: 100 }).catch(() => []),
        ]);
        setOrders(Array.isArray(data) ? data.filter(isVisiblePurchaseOrder) : []);
        setRecipes(recipeData);
      } catch {
        showToast('Failed to load past orders', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [showToast]);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const handleDeleteClick = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteOrderFromHistory(id)));
      setOrders((current) => current.filter((order) => !selectedIds.includes(order._id)));
      setSelectedIds([]);
      showToast('Selected order removed from purchase history', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete selected order'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelDraft) return;

    setCancellingId(cancelDraft.order._id);
    try {
      await cancelOrder(cancelDraft.order._id, cancelDraft.reason.trim() || 'Cancelled by user');
      setOrders((current) =>
        current.map((order) =>
          order._id === cancelDraft.order._id
            ? {
                ...order,
                status: 'Cancelled',
                cancelledAt: new Date().toISOString(),
                cancellationReason: cancelDraft.reason.trim() || 'Cancelled by user',
              }
            : order
        )
      );
      setCancelDraft(null);
      showToast('Order cancelled and stock restored', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to cancel order'), 'error');
    } finally {
      setCancellingId('');
    }
  };

  const handleViewAddress = async (order: PurchaseOrder) => {
    setAddressLoadingId(order._id);
    try {
      const fullOrder = await getOrderById(order._id);
      setAddressOrder({ ...order, ...fullOrder });
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to load delivery address'), 'error');
    } finally {
      setAddressLoadingId('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="hela-shell py-6 sm:py-10">
        <p className="mb-2 text-xs font-semibold text-gray-300">Purchase - Past Orders</p>

        <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-center gap-3 font-heading text-2xl font-black leading-tight text-black sm:text-3xl">
            <ClipboardList className="h-7 w-7 shrink-0 text-brand-dark" />
            Past Orders
          </h1>
          <button
            onClick={handleDeleteClick}
            disabled={selectedIds.length === 0 || deleting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-dark px-6 py-2 text-xs font-bold text-brand-dark transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {deleting ? 'Deleting' : 'Delete'}
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-xl border border-brand-dark/40 bg-white p-10 text-center shadow-[0_8px_22px_rgba(5,72,2,0.08)]">
            <Package className="mx-auto mb-4 h-14 w-14 text-brand-light" />
            <h2 className="text-2xl font-black text-black">No past orders yet</h2>
            <p className="mt-2 text-sm font-semibold text-gray-400">Browse recipes and place your first purchase.</p>
            <Link to="/recipes" className="hela-action mt-6 inline-flex px-7 py-3">
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
            {orders.map((order) => (
              <PurchaseRow
                key={order._id}
                order={order}
                recipes={recipes}
                selected={selectedIds.includes(order._id)}
                highlighted={highlightedOrderId === order._id}
                cancelling={cancellingId === order._id}
                addressLoading={addressLoadingId === order._id}
                onSelect={() => toggleSelected(order._id)}
                onCancel={() => setCancelDraft({ order, reason: '' })}
                onViewAddress={() => handleViewAddress(order)}
              />
            ))}
          </div>
        )}
      </div>

      {cancelDraft && (
        <CancelOrderDialog
          order={cancelDraft.order}
          reason={cancelDraft.reason}
          cancelling={cancellingId === cancelDraft.order._id}
          onReasonChange={(reason) => setCancelDraft((current) => current ? { ...current, reason } : current)}
          onClose={() => setCancelDraft(null)}
          onConfirm={handleCancelConfirm}
        />
      )}

      {addressOrder && (
        <DeliveryAddressDialog order={addressOrder} onClose={() => setAddressOrder(null)} />
      )}
    </div>
  );
};

const PurchaseRow = ({
  order,
  recipes,
  selected,
  highlighted,
  cancelling,
  addressLoading,
  onSelect,
  onCancel,
  onViewAddress,
}: {
  order: PurchaseOrder;
  recipes: Recipe[];
  selected: boolean;
  highlighted: boolean;
  cancelling: boolean;
  addressLoading: boolean;
  onSelect: () => void;
  onCancel: () => void;
  onViewAddress: () => void;
}) => {
  const title = getOrderTitle(order);
  const createdAt = new Date(order.createdAt);
  const statusLabel = getStatusLabel(order.status);
  const hasMealKit = order.hasMealKit || order.items?.some((item) => item.isMealKit);
  const matchedRecipe = getMatchedRecipe(order, recipes);
  const recipeImage = getRecipeImage(order, matchedRecipe);
  const recipeHref = getRecipeHref(order, matchedRecipe);
  const canCancel = order.status === 'Pending' || order.status === 'Confirmed';

  return (
    <div className={`relative grid gap-3 rounded-xl border bg-white p-3 shadow-[0_8px_22px_rgba(5,72,2,0.08)] transition sm:grid-cols-[9rem_1fr] sm:items-stretch lg:grid-cols-[1.25rem_10.5rem_minmax(0,1fr)_6.5rem_6.5rem_13rem_8.5rem] lg:items-center lg:rounded-none lg:p-0 lg:shadow-none ${
      highlighted
        ? 'border-brand-dark bg-brand-light/20 ring-2 ring-brand-dark/20 lg:border lg:p-3'
        : 'border-brand-dark/20 lg:border-0'
    }`}>
      <button
        onClick={onSelect}
        className={`absolute right-5 top-5 z-10 h-6 w-6 rounded border border-brand-dark shadow-sm lg:static lg:mx-auto lg:h-5 lg:w-5 lg:shadow-none ${selected ? 'bg-brand-light' : 'bg-white'}`}
        aria-label={`Select order ${order.orderNumber || order._id}`}
      >
        {selected && <span className="mx-auto mt-1 block h-2 w-2 rounded-full bg-brand-dark" />}
      </button>

      <img
        src={recipeImage}
        alt={title}
        className="h-36 w-full rounded-md border border-brand-dark object-cover sm:col-start-1 sm:row-start-1 sm:h-full sm:min-h-32 lg:col-auto lg:row-auto lg:h-20 lg:min-h-0"
      />

      <div className="min-w-0 rounded-md border border-brand-dark bg-white px-4 py-3 text-xs font-bold text-brand-dark sm:col-start-2 sm:row-start-1 lg:col-auto lg:row-auto">
        <p className="mb-1 break-words font-heading text-sm font-black">{title}</p>
        <p className="flex min-w-0 items-start gap-2 text-gray-500">
          <Hash className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
          <span className="min-w-0 break-words">Order Id: {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}</span>
        </p>
        <p className="mt-1 flex min-w-0 items-start gap-2 text-gray-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
          <span className="min-w-0 break-words">Date & Time: {formatDateTime(createdAt)}</span>
        </p>
        <p className="mt-1 flex min-w-0 items-start gap-2 text-gray-500">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
          <span className="min-w-0 break-words">Status: {statusLabel}</span>
        </p>
        <OrderStateRail status={order.status} />
      </div>

      <div className={`flex min-h-14 items-center justify-center gap-2 rounded-md border px-3 py-3 text-xs font-black sm:min-h-16 lg:min-h-20 lg:flex-col ${
        hasMealKit
          ? 'border-brand-dark bg-white text-black'
          : 'border-brand bg-brand-light text-brand-dark'
      }`}>
        <span>Add to Cart</span>
        <ShoppingCart className="h-4 w-4" />
      </div>

      <div className={`flex min-h-14 items-center justify-center gap-2 rounded-md border px-3 py-3 text-xs font-black sm:min-h-16 lg:min-h-20 lg:flex-col ${
        hasMealKit
          ? 'border-brand bg-brand-light text-brand-dark'
          : 'border-brand-dark bg-white text-black'
      }`}>
        <span>Meal-kit</span>
        <UtensilsCrossed className="h-4 w-4" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:block lg:space-y-2">
        <PaymentPill active={order.paymentMethod === 'COD'} label="Cash on Delivery" />
        <PaymentPill active={order.paymentMethod === 'Card'} label="Card(Stripe)" />
      </div>

      <div className="grid gap-2 sm:col-span-2 sm:grid-cols-3 lg:col-span-1 lg:grid-cols-1">
        {canCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelling}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
          >
            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Cancel
          </button>
        ) : (
          <div className="flex h-11 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-center text-[11px] font-black text-gray-400">
            {order.status === 'Cancelled' ? 'Cancelled' : 'Locked'}
          </div>
        )}
        <button
          type="button"
          onClick={onViewAddress}
          disabled={addressLoading}
          className="flex h-11 items-center justify-center gap-2 rounded-md border border-brand-dark/30 bg-brand-light/40 text-sm font-black text-brand-dark transition hover:border-brand-dark hover:bg-brand-light"
        >
          {addressLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          Address
        </button>
        <Link
          to={recipeHref}
          className="flex h-11 items-center justify-center gap-2 rounded-md border border-brand-dark text-sm font-black text-brand-dark transition hover:bg-brand-light"
          aria-label={`View ${title}`}
        >
          <span>Item</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

const DeliveryAddressDialog = ({ order, onClose }: { order: PurchaseOrder; onClose: () => void }) => {
  const address = order.deliveryAddress;
  const addressLines = [
    address?.addressLine1,
    address?.addressLine2,
    address?.city,
    address?.district,
    address?.postalCode,
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-brand-dark/15 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <div className="relative bg-brand-dark px-5 py-6 text-white sm:px-6">
          <div className="absolute right-16 top-5 h-16 w-16 rounded-full border border-white/10" />
          <div className="absolute right-5 top-16 h-9 w-9 rounded-full bg-brand-light/20" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-brand-dark">
                <MapPin className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-light">Delivery address</p>
                <h2 className="mt-1 font-heading text-2xl font-black leading-tight">
                  {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10"
              aria-label="Close delivery address dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {address ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-brand-dark/15 bg-brand-light/25 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <AddressInfoItem icon={<UserRound className="h-4 w-4" />} label="Receiver" value={address.fullName} />
                <AddressInfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={address.phone} />
              </div>

              <div className="mt-4 rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(5,72,2,0.06)]">
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-brand-dark">
                  <Home className="h-4 w-4" />
                  Drop-off point
                </div>
                <p className="text-sm font-bold leading-relaxed text-black">
                  {addressLines.length > 0 ? addressLines.join(', ') : 'No address lines were saved for this order.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-gray-400">
                This is the delivery address saved when the order was placed.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-brand-dark px-6 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(5,72,2,0.18)] transition hover:bg-brand-dark/90"
              >
                Got it
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-brand-light" />
            <h3 className="text-lg font-black text-black">Address unavailable</h3>
            <p className="mt-2 text-sm font-semibold text-gray-400">
              This order was loaded, but no delivery address details were returned for it.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="hela-action mt-5 px-6 py-3"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AddressInfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(5,72,2,0.06)]">
    <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-brand-dark">
      {icon}
      {label}
    </div>
    <p className="break-words text-sm font-bold text-black">{value || '-'}</p>
  </div>
);

const CancelOrderDialog = ({
  order,
  reason,
  cancelling,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  order: PurchaseOrder;
  reason: string;
  cancelling: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const quickReasons = ['Ordered by mistake', 'Need to change items', 'Delivery plans changed'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-red-500">Cancel order</p>
              <h2 className="mt-1 font-heading text-2xl font-black text-black">{getOrderTitle(order)}</h2>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50"
            aria-label="Close cancel order dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 rounded-xl bg-brand-light/40 p-3 text-sm font-semibold leading-relaxed text-brand-dark">
          Cancelling is available while your order is still Pending or Confirmed. Stock will be restored after the cancellation is accepted.
        </p>

        <div className="mt-5">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-gray-400">Reason</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {quickReasons.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onReasonChange(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  reason === item
                    ? 'border-brand-dark bg-brand-light text-brand-dark'
                    : 'border-gray-200 text-gray-500 hover:border-brand-dark/40'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={3}
            maxLength={160}
            placeholder="Add a short reason for cancelling"
            className="w-full resize-none rounded-xl border border-brand-dark/20 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-gray-300 focus:border-brand-dark focus:ring-2 focus:ring-brand-light"
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.2fr]">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-50"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={cancelling}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(220,38,38,0.25)] transition hover:bg-red-700 disabled:opacity-60"
          >
            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentPill = ({ active, label }: { active: boolean; label: string }) => (
  <div
    className={`flex min-h-12 items-center justify-center rounded-md border px-3 py-2 text-center text-[11px] font-black leading-tight sm:text-xs lg:rounded-xl lg:px-4 lg:py-3 ${
      active ? 'border-brand bg-brand-light text-brand-dark' : 'border-brand-dark bg-white text-black'
    }`}
  >
    {label}
  </div>
);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;

  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string' ? response.data.message : fallback;
};

const getOrderTitle = (order: PurchaseOrder) => {
  const recipe = order.recipes?.[0];
  if (recipe) return typeof recipe === 'string' ? recipe : recipe.title || order.orderNumber || 'Purchase';
  const firstItem = order.items?.[0];
  if (!firstItem) return order.orderNumber || 'Purchase';
  if (typeof firstItem.recipeId === 'object' && firstItem.recipeId?.title) return firstItem.recipeId.title;
  if (firstItem.recipeTitle) return firstItem.recipeTitle;
  return order.orderNumber || 'Purchase';
};

const getRecipeImage = (order: PurchaseOrder, matchedRecipe?: Recipe) => {
  const recipe = order.recipes?.[0];
  if (recipe && typeof recipe !== 'string' && recipe.imageUrl) return recipe.imageUrl;
  const firstItem = order.items?.[0];
  if (typeof firstItem?.recipeId === 'object' && firstItem.recipeId?.imageUrl) return firstItem.recipeId.imageUrl;
  if (matchedRecipe?.imageUrl || matchedRecipe?.image) return matchedRecipe.imageUrl || matchedRecipe.image || fallbackImage;
  return fallbackImage;
};

const getRecipeHref = (order: PurchaseOrder, matchedRecipe?: Recipe) => {
  const recipe = order.recipes?.[0];
  if (recipe && typeof recipe !== 'string' && recipe._id) return `/recipes/${recipe._id}`;
  const firstItem = order.items?.[0];
  if (typeof firstItem?.recipeId === 'string') return `/recipes/${firstItem.recipeId}`;
  if (typeof firstItem?.recipeId === 'object' && firstItem.recipeId?._id) return `/recipes/${firstItem.recipeId._id}`;
  if (matchedRecipe?._id) return `/recipes/${matchedRecipe._id}`;
  return `/recipes?search=${encodeURIComponent(getOrderTitle(order))}`;
};

const getMatchedRecipe = (order: PurchaseOrder, recipes: Recipe[]) => {
  const title = getOrderTitle(order).trim().toLowerCase();
  if (!title) return undefined;
  return recipes.find((recipe) => recipe.title.trim().toLowerCase() === title)
    || recipes.find((recipe) => title.includes(recipe.title.trim().toLowerCase()) || recipe.title.trim().toLowerCase().includes(title));
};

const orderSteps: Array<{ status: OrderStatus; label: string }> = [
  { status: 'Pending', label: 'Pending' },
  { status: 'Confirmed', label: 'Confirmed' },
  { status: 'Processing', label: 'Preparing' },
  { status: 'OutForDelivery', label: 'On way' },
  { status: 'Delivered', label: 'Done' },
];

const OrderStateRail = ({ status }: { status: OrderStatus }) => {
  if (status === 'Cancelled') {
    return (
      <div className="mt-3 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-black text-red-600">
        Order cancelled
      </div>
    );
  }

  const activeIndex = Math.max(0, orderSteps.findIndex((step) => step.status === status));

  return (
    <div className="mt-3 rounded-xl border border-brand-dark/10 bg-brand-light/25 px-2.5 py-2">
      <div className="grid grid-cols-5 items-start gap-1">
        {orderSteps.map((step, index) => {
          const completed = index < activeIndex;
          const current = index === activeIndex;
          const upcoming = index > activeIndex;

          return (
            <div key={step.status} className="relative flex min-w-0 flex-col items-center gap-1">
              {index > 0 && (
                <span
                  className={`absolute right-1/2 top-2.5 h-0.5 w-full -translate-y-1/2 ${
                    index <= activeIndex ? 'bg-brand' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 grid h-5 w-5 place-items-center rounded-full border-2 bg-white transition ${
                  completed
                    ? 'border-brand bg-brand text-white'
                    : current
                      ? 'animate-pulse border-yellow-400 bg-yellow-50 text-yellow-700 shadow-[0_0_0_5px_rgba(250,204,21,0.35)]'
                      : 'border-gray-200 text-gray-300'
                }`}
                title={step.label}
              >
                {completed ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <span className={`h-1.5 w-1.5 rounded-full ${upcoming ? 'bg-gray-300' : 'bg-brand-dark'}`} />
                )}
              </span>
              <span
                className={`w-full truncate text-center text-[8px] font-black uppercase tracking-[0.04em] ${
                  current ? 'text-brand-dark' : completed ? 'text-brand' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-1 break-words text-[9px] font-black uppercase tracking-[0.08em] text-brand-dark sm:text-[10px] sm:tracking-[0.12em]">
        Order state: {status === 'OutForDelivery' ? 'On the way' : statusLabelForRail(status)}
      </p>
    </div>
  );
};

const statusLabelForRail = (status: OrderStatus) => {
  if (status === 'Processing') return 'Preparing';
  if (status === 'Delivered') return 'Completed';
  return getStatusLabel(status);
};

const getStatusLabel = (status: OrderStatus) => {
  if (status === 'Delivered') return 'Success';
  if (status === 'Cancelled') return 'Cancelled';
  if (status === 'OutForDelivery') return 'Out for Delivery';
  return status;
};

const formatDateTime = (date: Date) =>
  date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default PurchasePage;
