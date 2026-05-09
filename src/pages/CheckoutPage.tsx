import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../services/cartService';
import { createOrder } from '../services/orderService';
import { initiatePayment } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import type { Cart, Address, PaymentMethodType } from '../types';
import { Loader2, CreditCard, Banknote, MapPin, ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD');
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const addresses: Address[] = user?.addresses || [];

  useEffect(() => {
    const init = async () => {
      // Refresh user profile to get latest addresses
      try { await refreshUser(); } catch { /* ignore */ }

      try {
        const data = await getCart();
        setCart(data);
        if (!data?.items?.length) {
          showToast('Your cart is empty', 'warning');
          navigate('/cart');
        }
      } catch { navigate('/cart'); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find((a) => a.isDefault);
      setSelectedAddress(def?._id || addresses[0]._id || '');
    }
  }, [addresses]);

  const handlePlaceOrder = async () => {
    // Validate address selection
    const addr = addresses.find(a => a._id === selectedAddress);
    if (!addr) {
      showToast('Please select a delivery address. Add one in your Profile if none exist.', 'error');
      return;
    }

    setPlacing(true);
    try {
      // Build delivery address from the selected address
      const deliveryAddress = {
        fullName: addr.fullName || user?.name || '',
        phone: addr.phone || user?.phone || '',
        addressLine1: addr.addressLine1 || '',
        addressLine2: addr.addressLine2,
        city: addr.city || '',
        district: addr.district,
        postalCode: addr.postalCode,
      };

      // Create the order with required payload
      const result = await createOrder({
        paymentMethod,
        deliveryAddress,
      });

      const orderId = result.order?._id || result._id;
      showToast('Order placed successfully!', 'success');

      // Initiate payment
      const payRes = await initiatePayment(orderId);

      if (paymentMethod === 'Card' && payRes.stripeCheckoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = payRes.stripeCheckoutUrl;
        return;
      }

      // COD or Card without redirect — go to order detail
      navigate(`/orders/${orderId}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally { setPlacing(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  const items = cart?.items || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 text-gray-500 hover:text-brand mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Cart</span>
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-brand" /> Checkout
      </h1>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-5">
          {items.map((item, i) => {
            const title = typeof item.recipeId === 'object' ? item.recipeId?.title : (typeof item.recipe === 'object' ? item.recipe?.title : 'Recipe');
            const ingredients = item.selectedIngredients || item.ingredients || [];
            return (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Recipe header */}
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                  <span className="font-bold text-gray-900">{title}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{item.servings} serving{item.servings !== 1 ? 's' : ''}</span>
                    <span className="font-bold text-brand-dark">Rs. {(item.itemTotal ?? 0).toFixed(2)}</span>
                  </div>
                </div>
                {/* Ingredients table */}
                {ingredients.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-2 font-semibold">Ingredient</th>
                          <th scope="col" className="px-4 py-2 font-semibold">Qty</th>
                          <th scope="col" className="px-4 py-2 font-semibold">Unit</th>
                          <th scope="col" className="px-4 py-2 font-semibold text-right">Price (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {ingredients.map((ing: any, idx: number) => {
                          const ingName = ing.ingredientId?.name || ing.name || 'Ingredient';
                          const ingPrice = typeof ing.price === 'number' ? ing.price : 0;
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2 font-medium text-gray-800">{ingName}</td>
                              <td className="px-4 py-2">{typeof ing.quantity === 'number' ? ing.quantity.toFixed(1) : ing.quantity}</td>
                              <td className="px-4 py-2">{ing.unit}</td>
                              <td className="px-4 py-2 text-right font-semibold text-gray-800">{ingPrice.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between items-center">
          <span className="font-bold text-gray-900 text-lg">Estimated Total</span>
          <span className="text-2xl font-bold text-brand-dark">Rs. {(cart?.totalPrice ?? 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery Address */}
      {addresses.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" /> Delivery Address
          </h2>
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label key={addr._id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr._id ? 'border-brand bg-brand-light/30' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id || '')}
                  className="mt-1 accent-brand" />
                <div>
                  <p className="font-medium text-gray-900">{addr.label} — {addr.fullName || user?.name}</p>
                  <p className="text-sm text-gray-500">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}</p>
                  <p className="text-sm text-gray-500">{addr.phone}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 mb-6">
          <p className="text-amber-800 font-medium">⚠️ No delivery addresses found. Please add one in your <button onClick={() => navigate('/profile')} className="underline font-bold hover:text-amber-900">Profile</button> before checkout.</p>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-brand bg-brand-light/30' : 'border-gray-100 hover:border-gray-200'}`}>
            <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-brand" />
            <div className="flex items-center gap-3">
              <Banknote className="h-6 w-6 text-brand" />
              <div>
                <p className="font-bold text-gray-900">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when you receive</p>
              </div>
            </div>
          </label>
          <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
            <input type="radio" name="payment" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} className="accent-blue-600" />
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-bold text-gray-900">Card (Stripe)</p>
                <p className="text-xs text-gray-500">Secure online payment</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Place Order */}
      <button onClick={handlePlaceOrder} disabled={placing || addresses.length === 0}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-brand-dark hover:bg-brand-dark text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-brand-dark/20 disabled:opacity-70 disabled:cursor-not-allowed">
        {placing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CheckCircle2 className="h-6 w-6" /> Place Order</>}
      </button>
    </div>
  );
};

export default CheckoutPage;
