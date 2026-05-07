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
  const { user } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD');
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const addresses: Address[] = user?.addresses || [];

  useEffect(() => {
    const fetchCart = async () => {
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
    fetchCart();
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
      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
    </div>
  );

  const items = cart?.items || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Cart</span>
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-orange-500" /> Checkout
      </h1>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-2">
          {items.map((item, i) => {
            const title = typeof item.recipeId === 'object' ? item.recipeId?.title : (typeof item.recipe === 'object' ? item.recipe?.title : 'Recipe');
            return (
              <div key={i} className="flex justify-between items-center py-2 text-sm">
                <span className="text-gray-700 font-medium">{title}</span>
                <span className="text-gray-400">{item.servings} serving{item.servings !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
        {cart?.totalPrice != null && (
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
            <span className="font-bold text-gray-900">Estimated Total</span>
            <span className="text-xl font-bold text-orange-600">Rs. {cart.totalPrice.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      {addresses.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" /> Delivery Address
          </h2>
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label key={addr._id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr._id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id || '')}
                  className="mt-1 accent-orange-600" />
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
          <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
            <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-green-600" />
            <div className="flex items-center gap-3">
              <Banknote className="h-6 w-6 text-green-600" />
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
        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-not-allowed">
        {placing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CheckCircle2 className="h-6 w-6" /> Place Order</>}
      </button>
    </div>
  );
};

export default CheckoutPage;
