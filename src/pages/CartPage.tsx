import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, clearCart, removeIngredientFromCartItem } from '../services/cartService';
import { useToast } from '../components/Toast';
import type { Cart, CartItem } from '../types';
import { ShoppingCart, Trash2, Minus, Plus, Loader2, ArrowRight, ShoppingBag, X } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch { setCart(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleUpdateServings = async (itemId: string, servings: number) => {
    if (servings < 1) return;
    setActionLoading(itemId);
    try {
      await updateCartItem(itemId, servings);
      await fetchCart();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally { setActionLoading(null); }
  };

  const handleRemove = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      await removeCartItem(itemId);
      showToast('Item removed from cart', 'info');
      await fetchCart();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove', 'error');
    } finally { setActionLoading(null); }
  };

  const handleRemoveIngredient = async (itemId: string, ingredientId: string) => {
    setActionLoading(`${itemId}-${ingredientId}`);
    try {
      await removeIngredientFromCartItem(itemId, ingredientId);
      showToast('Ingredient removed', 'info');
      await fetchCart();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove ingredient', 'error');
    } finally { setActionLoading(null); }
  };

  const handleClearCart = async () => {
    setActionLoading('clear');
    try {
      await clearCart();
      showToast('Cart cleared', 'info');
      setCart(null);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to clear cart', 'error');
    } finally { setActionLoading(null); }
  };

  // Helper to extract recipe info from a cart item
  const getRecipeTitle = (item: CartItem): string => {
    if (typeof item.recipeId === 'object' && item.recipeId?.title) return item.recipeId.title;
    if (item.recipe && typeof item.recipe === 'object' && item.recipe?.title) return item.recipe.title;
    return 'Recipe';
  };

  const getRecipeLink = (item: CartItem): string => {
    if (typeof item.recipeId === 'string') return item.recipeId;
    if (typeof item.recipeId === 'object' && item.recipeId?._id) return item.recipeId._id;
    if (item.recipe && typeof item.recipe === 'object' && item.recipe?._id) return item.recipe._id;
    return '';
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-brand-light flex items-center justify-center animate-pulse">
          <Loader2 className="h-7 w-7 text-brand animate-spin" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading your cart…</p>
      </div>
    </div>
  );

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-brand" />
            Your Cart
          </h1>
          <p className="text-gray-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {!isEmpty && (
          <button onClick={handleClearCart} disabled={actionLoading === 'clear'}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50">
            {actionLoading === 'clear' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Clear All
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-400 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Discover delicious recipes and add ingredients to your cart!</p>
          <Link to="/recipes" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-lg shadow-brand-dark/20">
            Browse Recipes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item: CartItem) => {
            const ingredients = item.selectedIngredients || item.ingredients || [];
            const ingPrice = (ing: any) => typeof ing.price === 'number' ? ing.price : 0;

            return (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Recipe info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/recipes/${getRecipeLink(item)}`}
                    className="text-lg font-bold text-gray-900 hover:text-brand transition-colors truncate block">
                    {getRecipeTitle(item)}
                  </Link>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <p>{ingredients.length} ingredients</p>
                    <span className="ml-2 font-semibold text-brand-dark">• Rs. {(item.itemTotal ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Servings control */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button onClick={() => handleUpdateServings(item._id, item.servings - 1)}
                      disabled={item.servings <= 1 || actionLoading === item._id}
                      className="p-2.5 hover:bg-gray-200 transition-colors disabled:opacity-30">
                      <Minus className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                    <span className="px-3 font-bold text-gray-900 text-sm min-w-[2rem] text-center">
                      {actionLoading === item._id ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : item.servings}
                    </span>
                    <button onClick={() => handleUpdateServings(item._id, item.servings + 1)}
                      disabled={actionLoading === item._id}
                      className="p-2.5 hover:bg-gray-200 transition-colors disabled:opacity-30">
                      <Plus className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">servings</span>
                </div>

                {/* Remove */}
                <button onClick={() => handleRemove(item._id)}
                  disabled={actionLoading === item._id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                  title="Remove recipe from cart">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Ingredients Table */}
              {ingredients.length > 0 && (
                <div className="px-5 pb-5 pt-3 border-t border-gray-50 bg-gray-50/50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Ingredients:</h4>
                  <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-semibold">Ingredient</th>
                          <th scope="col" className="px-4 py-3 font-semibold">Quantity</th>
                          <th scope="col" className="px-4 py-3 font-semibold">Unit</th>
                          <th scope="col" className="px-4 py-3 font-semibold text-right">Price (Rs.)</th>
                          <th scope="col" className="px-4 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ingredients.map((ing: any, idx: number) => {
                          const ingId = ing.ingredientId?._id || ing.ingredientId || idx.toString();
                          const ingName = ing.ingredientId?.name || ing.name || 'Unknown ingredient';
                          const isLoadingIng = actionLoading === `${item._id}-${ingId}`;

                          return (
                            <tr key={ingId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900">{ingName}</td>
                              <td className="px-4 py-3">{typeof ing.quantity === 'number' ? ing.quantity.toFixed(1) : ing.quantity}</td>
                              <td className="px-4 py-3">{ing.unit}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800">{ingPrice(ing).toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => handleRemoveIngredient(item._id, ingId)}
                                  disabled={isLoadingIng}
                                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center"
                                  title="Remove ingredient"
                                >
                                  {isLoadingIng ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )})}

          {/* Checkout */}
          <div className="bg-gradient-to-r from-brand-light/30 to-red-50 rounded-2xl p-6 border border-brand-light mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Ready to order?</p>
                <p className="text-lg font-bold text-gray-900">{items.length} recipe{items.length !== 1 ? 's' : ''} in your cart</p>
                <p className="text-lg text-brand-dark font-bold mt-1">Estimated Total: Rs. {(cart?.totalPrice ?? 0).toFixed(2)}</p>
              </div>
              <button onClick={() => navigate('/checkout')}
                className="flex items-center gap-2 px-8 py-3 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-dark/20">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
