import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import {
  clearCart,
  getCart,
  removeCartItem,
  removeIngredientFromCartItem,
  updateCartItem,
} from '../services/cartService';
import { useToast } from '../components/Toast';
import type { Cart, CartItem, PaymentMethodType, SelectedIngredient } from '../types';

const CartPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD');

  const fetchCart = async (withSpinner = true) => {
    try {
      if (withSpinner) setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      if (withSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const items = cart?.items || [];
  const isEmpty = items.length === 0;
  const totalIngredients = useMemo(
    () => items.reduce((sum, item) => sum + (item.selectedIngredients || item.ingredients || []).length, 0),
    [items]
  );

  const handleUpdateServings = async (itemId: string, nextServings: number) => {
    if (nextServings < 1) return;
    setActionLoading(itemId);
    try {
      const updatedCart = await updateCartItem(itemId, nextServings);
      setCart(updatedCart);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update servings', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      await removeCartItem(itemId);
      await fetchCart(false);
      showToast('Item removed from cart', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove item', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveIngredient = async (itemId: string, ingredientId: string) => {
    setActionLoading(`${itemId}-${ingredientId}`);
    try {
      const updatedCart = await removeIngredientFromCartItem(itemId, ingredientId);
      setCart(updatedCart);
      showToast('Ingredient removed from meal kit', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove ingredient', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearCart = async () => {
    setActionLoading('clear');
    try {
      await clearCart();
      setCart((current) => (current ? { ...current, items: [], totalPrice: 0 } : current));
      showToast('Cart cleared', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to clear cart', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmPurchase = () => {
    sessionStorage.setItem('helaPreferredPaymentMethod', paymentMethod);
    navigate('/checkout', { state: { paymentMethod } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-brand-dark" />
          <p className="text-sm font-semibold text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hela-shell py-7 sm:py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-black hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="hela-display mb-8 text-center text-5xl font-black sm:text-7xl">Your Cart</h1>

      {isEmpty ? (
        <div className="mx-auto max-w-2xl rounded-xl border border-brand-dark/30 bg-white px-6 py-16 text-center shadow-[0_8px_22px_rgba(5,72,2,0.08)]">
          <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-brand-dark" />
          <h2 className="text-2xl font-black text-brand-dark">Your cart is empty</h2>
          <p className="mt-2 text-sm font-semibold text-gray-500">Add a recipe or meal kit before confirming your purchase.</p>
          <Link to="/recipes" className="hela-action mt-6 inline-flex items-center gap-2 px-6 py-3">
            Browse Recipes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl font-black text-black">
                {items.length} recipe{items.length !== 1 ? 's' : ''} in your cart
              </p>
              <p className="text-sm font-semibold text-gray-500">{totalIngredients} selected ingredient lines</p>
            </div>
            <button
              onClick={handleClearCart}
              disabled={actionLoading === 'clear'}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {actionLoading === 'clear' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <CartRecipeTable
              key={item._id}
              item={item}
              actionLoading={actionLoading}
              onUpdateServings={handleUpdateServings}
              onRemove={handleRemove}
              onRemoveIngredient={handleRemoveIngredient}
            />
          ))}

          <section className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <PurchaseProgress />

            <div className="rounded-xl border border-brand-dark/30 bg-white p-5 shadow-[0_8px_22px_rgba(5,72,2,0.08)]">
              <div className="flex items-center justify-between border-b border-brand-light pb-4">
                <span className="text-sm font-black text-black">Total</span>
                <span className="text-2xl font-black text-brand-dark">Rs {(cart?.totalPrice ?? 0).toFixed(2)}/=</span>
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-sm font-black text-black">Purchase Type</p>
                <PaymentChoice
                  selected={paymentMethod === 'COD'}
                  icon={<Banknote className="h-5 w-5" />}
                  title="Cash on Delivery"
                  subtitle="Payment stays pending until delivery collection"
                  onClick={() => setPaymentMethod('COD')}
                />
                <PaymentChoice
                  selected={paymentMethod === 'Card'}
                  icon={<CreditCard className="h-5 w-5" />}
                  title="Online Card Payment"
                  subtitle="Stripe checkout opens after review"
                  onClick={() => setPaymentMethod('Card')}
                />
              </div>

              <button onClick={handleConfirmPurchase} className="hela-action mt-6 w-full px-5 py-4">
                Confirm your Purchase
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const CartRecipeTable = ({
  item,
  actionLoading,
  onUpdateServings,
  onRemove,
  onRemoveIngredient,
}: {
  item: CartItem;
  actionLoading: string | null;
  onUpdateServings: (itemId: string, servings: number) => void;
  onRemove: (itemId: string) => void;
  onRemoveIngredient: (itemId: string, ingredientId: string) => void;
}) => {
  const title = getRecipeTitle(item);
  const recipeId = getRecipeId(item);
  const ingredients = (item.selectedIngredients || item.ingredients || []) as SelectedIngredient[];

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <Link to={recipeId ? `/recipes/${recipeId}` : '/recipes'} className="text-lg font-black text-black hover:text-brand-dark">
          {title}
        </Link>
        <span className="rounded-full bg-brand-light px-6 py-1 text-xs font-black text-brand-dark">
          {item.servings.toString().padStart(2, '0')} Serving{item.servings !== 1 ? 's' : ''}
        </span>
        {item.isMealKit && <span className="rounded-full bg-brand-dark px-4 py-1 text-xs font-black text-white">Meal Kit</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="hela-table w-full min-w-[760px] text-center text-sm">
          <thead>
            <tr>
              <th className="w-32 px-4 py-4"></th>
              <th className="px-4 py-4">Ingredients</th>
              <th className="px-4 py-4">Measurements</th>
              <th className="px-4 py-4 muted">Meal Kit</th>
              <th className="px-4 py-4">Price</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient: any, index) => {
              const ingredientId = ingredient.ingredientId?._id || ingredient.ingredientId || `${index}`;
              const loadingKey = `${item._id}-${ingredientId}`;
              return (
                <tr key={ingredientId}>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onRemoveIngredient(item._id, ingredientId)}
                      disabled={actionLoading === loadingKey}
                      className="rounded-full border border-brand-light px-5 py-1 text-xs font-bold text-brand-dark hover:bg-brand-light disabled:opacity-60"
                    >
                      {actionLoading === loadingKey ? '...' : 'Delete'}
                    </button>
                  </td>
                  <td className="px-4 py-4 font-black text-black">{ingredient.ingredientId?.name || ingredient.name || 'Ingredient'}</td>
                  <td className="px-4 py-4 font-bold text-black">
                    {formatQuantity(ingredient.quantity)} {ingredient.unit}
                  </td>
                  <td className="px-4 py-4 font-bold text-black">{ingredient.isReadyToCook ? 'Ready-to-cook' : ''}</td>
                  <td className="px-4 py-4 font-black text-black">Rs {Number(ingredient.price || 0).toFixed(2)}/=</td>
                </tr>
              );
            })}
            <tr>
              <td className="px-4 py-4" colSpan={3}></td>
              <td className="px-4 py-4 font-black text-black">Delivery Charges</td>
              <td className="px-4 py-4 font-black text-black">Included</td>
            </tr>
            <tr>
              <td className="px-4 py-4" colSpan={3}></td>
              <td className="px-4 py-4 font-black text-black">Total</td>
              <td className="px-4 py-4 font-black text-black">Rs {(item.itemTotal || 0).toFixed(2)}/=</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-full bg-brand-light">
          <button
            onClick={() => onUpdateServings(item._id, item.servings - 1)}
            disabled={item.servings <= 1 || actionLoading === item._id}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-brand disabled:opacity-40"
            aria-label="Decrease servings"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center text-sm font-black">
            {actionLoading === item._id ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : item.servings}
          </span>
          <button
            onClick={() => onUpdateServings(item._id, item.servings + 1)}
            disabled={actionLoading === item._id}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-brand disabled:opacity-40"
            aria-label="Increase servings"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => onRemove(item._id)}
          disabled={actionLoading === item._id}
          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {actionLoading === item._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Remove recipe
        </button>
      </div>
    </section>
  );
};

const PaymentChoice = ({
  selected,
  icon,
  title,
  subtitle,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
      selected ? 'border-brand-dark bg-brand-light/60' : 'border-brand-light hover:border-brand-dark/50'
    }`}
  >
    <span className={`grid h-4 w-4 place-items-center rounded-full border ${selected ? 'border-brand-dark bg-brand-dark' : 'border-brand-dark'}`}>
      {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
    </span>
    <span className="text-brand-dark">{icon}</span>
    <span>
      <span className="block text-sm font-black text-black">{title}</span>
      <span className="block text-xs font-semibold text-gray-500">{subtitle}</span>
    </span>
  </button>
);

const PurchaseProgress = () => {
  const steps = ['Purchase Confirmation', 'Vendor Stock Reduced', 'Payment Handling', 'Admin Processing', 'Delivered by HelaEats'];

  return (
    <div className="hidden lg:block pt-10">
      <div className="relative grid grid-cols-5 gap-4">
        <div className="absolute left-8 right-8 top-2 h-1 bg-yellow-400" />
        {steps.map((step) => (
          <div key={step} className="relative text-center">
            <span className="relative z-10 mx-auto block h-5 w-5 rounded-full bg-yellow-400 ring-4 ring-white" />
            <p className="mt-3 text-[10px] font-bold text-gray-600">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const getRecipeTitle = (item: CartItem) => {
  if (typeof item.recipeId === 'object' && item.recipeId?.title) return item.recipeId.title;
  if (item.recipe?.title) return item.recipe.title;
  return 'Recipe';
};

const getRecipeId = (item: CartItem) => {
  if (typeof item.recipeId === 'string') return item.recipeId;
  if (typeof item.recipeId === 'object' && item.recipeId?._id) return item.recipeId._id;
  return item.recipe?._id || '';
};

const formatQuantity = (value: number | string) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value || '0';
  return Number.isInteger(numeric) ? `${numeric}` : numeric.toFixed(numeric < 10 ? 1 : 0);
};

export default CartPage;
