import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Heart,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Star,
} from 'lucide-react';
import { getCart } from '../services/cartService';
import { createOrder } from '../services/orderService';
import { initiatePayment } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import type { Address, Cart, PaymentMethodType } from '../types';

type FlowPanel = 'review' | 'success' | 'feedback' | 'trouble';

type DeliveryForm = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  postalCode: string;
};

const emptyAddress: DeliveryForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: '',
  postalCode: '',
};

// Keep a small buffer above Stripe's converted 50-cent minimum.
const CARD_PAYMENT_MINIMUM_LKR = 200;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const initialPayment = (location.state as { paymentMethod?: PaymentMethodType } | null)?.paymentMethod
    || (sessionStorage.getItem('helaPreferredPaymentMethod') as PaymentMethodType | null)
    || 'COD';

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(initialPayment === 'Card' ? 'Card' : 'COD');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [manualAddress, setManualAddress] = useState<DeliveryForm>(emptyAddress);
  const [panel, setPanel] = useState<FlowPanel>('review');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [trouble, setTrouble] = useState('');
  const [rating, setRating] = useState(0);

  const addresses: Address[] = user?.addresses || [];
  const validDeliveryAddresses = useMemo(
    () => addresses.filter((address) => Boolean(address.fullName && address.phone && address.addressLine1 && address.city)),
    [addresses]
  );
  const hasSavedDeliveryAddress = validDeliveryAddresses.length > 0;
  const isCardPaymentBelowMinimum = paymentMethod === 'Card' && (cart?.totalPrice || 0) < CARD_PAYMENT_MINIMUM_LKR;

  useEffect(() => {
    const init = async () => {
      try {
        await refreshUser();
      } catch {
        /* keep checkout usable with cached profile */
      }

      try {
        const data = await getCart();
        if (!data?.items?.length) {
          showToast('Your cart is empty', 'warning');
          navigate('/cart');
          return;
        }
        setCart(data);
      } catch {
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (validDeliveryAddresses.length > 0 && !validDeliveryAddresses.some((address) => address._id === selectedAddress)) {
      const defaultAddress = validDeliveryAddresses.find((address) => address.isDefault);
      setSelectedAddress(defaultAddress?._id || validDeliveryAddresses[0]._id || '');
    }
  }, [validDeliveryAddresses, selectedAddress]);

  useEffect(() => {
    setManualAddress((current) => ({
      ...current,
      fullName: current.fullName || user?.name || '',
      phone: current.phone || user?.phone || '',
    }));
  }, [user?.name, user?.phone]);

  const selectedDeliveryAddress = useMemo(() => {
    const existing = validDeliveryAddresses.find((address) => address._id === selectedAddress);
    if (existing) {
      return {
        fullName: existing.fullName || user?.name || '',
        phone: existing.phone || user?.phone || '',
        addressLine1: existing.addressLine1 || '',
        addressLine2: existing.addressLine2,
        city: existing.city || '',
        district: existing.district,
        postalCode: existing.postalCode,
      };
    }

    return {
      fullName: manualAddress.fullName,
      phone: manualAddress.phone,
      addressLine1: manualAddress.addressLine1,
      addressLine2: manualAddress.addressLine2 || undefined,
      city: manualAddress.city,
      district: manualAddress.district || undefined,
      postalCode: manualAddress.postalCode || undefined,
    };
  }, [validDeliveryAddresses, selectedAddress, manualAddress, user?.name, user?.phone]);

  const handlePlaceOrder = async () => {
    if (isCardPaymentBelowMinimum) {
      showToast(`Online card payments require a total of at least Rs. ${CARD_PAYMENT_MINIMUM_LKR}. Please add more items or use Cash on Delivery.`, 'error');
      return;
    }

    if (!hasSavedDeliveryAddress) {
      showToast('Please add a saved delivery address with a phone number before checkout', 'error');
      navigate('/profile');
      return;
    }

    if (!selectedDeliveryAddress.fullName || !selectedDeliveryAddress.phone || !selectedDeliveryAddress.addressLine1 || !selectedDeliveryAddress.city) {
      showToast('Please complete the delivery address before confirming purchase', 'error');
      return;
    }

    setPlacing(true);
    try {
      const result = await createOrder({
        paymentMethod,
        deliveryAddress: selectedDeliveryAddress,
      });
      const order = result.order || result;
      const orderId = order._id;

      const payment = await initiatePayment(orderId);

      if (paymentMethod === 'Card') {
        if (payment.stripeCheckoutUrl) {
          window.location.href = payment.stripeCheckoutUrl;
          return;
        }
        throw new Error('Card checkout URL was not returned by the payment gateway.');
      }

      setOrderInfo({ ...order, payment });
      setPanel('success');
      showToast('Cash on Delivery order confirmed', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to confirm purchase', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const handleSendFeedback = () => {
    showToast('Thank you for your feedback', 'success');
    setFeedback('');
    setRating(0);
    setPanel('success');
  };

  const handleSendTrouble = () => {
    showToast('We received your message. Our team will contact you soon.', 'success');
    setTrouble('');
    setPanel('success');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-dark" />
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="hela-shell py-7 sm:py-10">
      <button
        onClick={() => (panel === 'review' ? navigate('/cart') : setPanel('review'))}
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-black hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="hela-display mb-7 text-center text-5xl font-black sm:text-6xl">
        {panel === 'review' ? 'Purchase - Review' : panel === 'success' ? 'Purchase - Confirmed' : panel === 'feedback' ? 'Purchase - Feedback' : 'Purchase - Trouble'}
      </h1>

      {panel === 'review' && (
        <div className="space-y-8">
          <ReviewTable items={items} total={cart?.totalPrice || 0} />

          <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-xl border border-brand-dark/40 bg-white p-5 shadow-[0_8px_22px_rgba(5,72,2,0.08)]">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-brand-dark">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>
              {hasSavedDeliveryAddress ? (
                <div className="grid gap-3">
                  {validDeliveryAddresses.map((address) => (
                    <label
                      key={address._id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                        selectedAddress === address._id ? 'border-brand-dark bg-brand-light/50' : 'border-brand-light'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === address._id}
                        onChange={() => setSelectedAddress(address._id || '')}
                        className="mt-1 accent-brand-dark"
                      />
                      <span>
                        <span className="block text-sm font-black text-black">{address.label || 'Delivery'} - {address.fullName || user?.name}</span>
                        <span className="block text-sm font-semibold text-gray-600">
                          {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}
                        </span>
                        <span className="block text-sm font-semibold text-gray-600">{address.phone}</span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                  <Home className="mx-auto mb-3 h-8 w-8 text-amber-600" />
                  <h3 className="font-heading text-2xl font-black text-black">Add delivery details first</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-amber-700">
                    Purchases need a saved delivery address and phone number. Please update your profile before placing this order.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="hela-action mt-5 inline-flex px-7 py-3"
                  >
                    Update Profile
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-brand-dark/40 bg-white p-5 shadow-[0_8px_22px_rgba(5,72,2,0.08)]">
              <div className="rounded-xl bg-brand-dark p-5 text-white">
                <p className="text-sm font-black">Total Pay</p>
                <p className="mt-1 text-3xl font-black">Rs {(cart?.totalPrice || 0).toFixed(2)}/=</p>
                <div className="mt-6 space-y-3">
                  <PaymentRadio
                    selected={paymentMethod === 'Card'}
                    label="Online Card"
                    icon={<CreditCard className="h-4 w-4" />}
                    onClick={() => setPaymentMethod('Card')}
                  />
                  <PaymentRadio
                    selected={paymentMethod === 'COD'}
                    label="Cash on Delivery"
                    icon={<Banknote className="h-4 w-4" />}
                    onClick={() => setPaymentMethod('COD')}
                  />
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !hasSavedDeliveryAddress || isCardPaymentBelowMinimum}
                className="hela-action mt-5 flex w-full items-center justify-center gap-2 px-5 py-4 disabled:opacity-60"
              >
                {placing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                {paymentMethod === 'COD' ? 'Confirm COD Purchase' : 'Proceed to Stripe'}
              </button>
              {isCardPaymentBelowMinimum && (
                <p className="mt-3 text-center text-xs font-bold leading-relaxed text-red-600">
                  Card payments need at least Rs. {CARD_PAYMENT_MINIMUM_LKR}. Add more items or choose Cash on Delivery.
                </p>
              )}
            </div>
          </section>

          <PurchaseProgress active={1} />
        </div>
      )}

      {panel === 'success' && (
        <SuccessPanel
          orderInfo={orderInfo}
          onViewOrder={() => orderInfo?._id && navigate(`/orders/${orderInfo._id}`)}
          onFeedback={() => setPanel('feedback')}
          onTrouble={() => setPanel('trouble')}
        />
      )}

      {panel === 'feedback' && (
        <FeedbackPanel
          value={feedback}
          rating={rating}
          onChange={setFeedback}
          onRating={setRating}
          onSubmit={handleSendFeedback}
        />
      )}

      {panel === 'trouble' && (
        <TroublePanel value={trouble} onChange={setTrouble} onSubmit={handleSendTrouble} />
      )}
    </div>
  );
};

const ReviewTable = ({ items, total }: { items: Cart['items']; total: number }) => (
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
        {items.map((item) =>
          (item.selectedIngredients || item.ingredients || []).map((ingredient: any, index: number) => (
            <tr key={`${item._id}-${index}`}>
              <td className="px-4 py-4 text-xs font-bold text-gray-500">{index === 0 ? getRecipeTitle(item) : ''}</td>
              <td className="px-4 py-4 font-black text-black">{ingredient.ingredientId?.name || ingredient.name || 'Ingredient'}</td>
              <td className="px-4 py-4 font-bold">{formatQuantity(ingredient.quantity)} {ingredient.unit}</td>
              <td className="px-4 py-4 font-bold">{ingredient.isReadyToCook ? 'Ready-to-cook' : ''}</td>
              <td className="px-4 py-4 font-black">Rs {Number(ingredient.price || 0).toFixed(2)}/=</td>
            </tr>
          ))
        )}
        <tr>
          <td className="px-4 py-4" colSpan={3}></td>
          <td className="px-4 py-4 font-black">Total</td>
          <td className="px-4 py-4 font-black">Rs {total.toFixed(2)}/=</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const PaymentRadio = ({ selected, label, icon, onClick }: { selected: boolean; label: string; icon: ReactNode; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-2 text-left text-sm font-bold text-white">
    <span className={`grid h-4 w-4 place-items-center rounded-full border border-white ${selected ? 'bg-brand-light' : 'bg-transparent'}`} />
    {icon}
    {label}
  </button>
);

const SuccessPanel = ({
  orderInfo,
  onViewOrder,
  onFeedback,
  onTrouble,
}: {
  orderInfo: any;
  onViewOrder: () => void;
  onFeedback: () => void;
  onTrouble: () => void;
}) => (
  <div className="mx-auto max-w-3xl rounded-xl border border-brand-dark/50 bg-white p-8 text-center shadow-[0_8px_24px_rgba(5,72,2,0.08)]">
    <CheckCircle2 className="mx-auto mb-3 h-10 w-10 fill-brand-light text-brand-dark" />
    <h2 className="text-2xl font-black text-black">Your Order Is Successfully Confirmed!!</h2>
    <p className="mt-1 text-sm font-semibold text-gray-500">
      {orderInfo?.orderNumber ? `Order ${orderInfo.orderNumber}` : 'Continue to your order details for status updates.'}
    </p>
    <button onClick={onViewOrder} className="hela-action mt-5 px-8 py-3">Confirm</button>
    <p className="mt-6 text-sm font-black text-black">Had a trouble? We are here to help You!</p>
    <button onClick={onTrouble} className="hela-action-soft mt-3 px-8 py-2">Click Here</button>
    <button onClick={onFeedback} className="mx-auto mt-8 flex items-center justify-center gap-2 text-xl font-black text-black">
      <Heart className="h-5 w-5 fill-brand-dark text-brand-dark" />
      Thank You for Choosing Us!
    </button>
    <PurchaseProgress active={4} />
  </div>
);

const FeedbackPanel = ({
  value,
  rating,
  onChange,
  onRating,
  onSubmit,
}: {
  value: string;
  rating: number;
  onChange: (value: string) => void;
  onRating: (value: number) => void;
  onSubmit: () => void;
}) => (
  <div className="mx-auto max-w-2xl rounded-xl border border-brand-dark/50 bg-white p-8 text-center shadow-[0_8px_24px_rgba(5,72,2,0.08)]">
    <Heart className="mx-auto mb-3 h-6 w-6 fill-brand-dark text-brand-dark" />
    <h2 className="text-xl font-black text-black">Thank You for Choosing Us!</h2>
    <p className="text-xs font-semibold text-gray-500">Send Your Feedback</p>
    <div className="mt-6 flex gap-2">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Type Your Feedback" className="flex-1 rounded-none border px-4 py-3 text-sm" />
      <button onClick={onSubmit} className="hela-action px-7 py-3"><Send className="h-4 w-4" /></button>
    </div>
    <p className="mt-6 text-sm font-black text-black">Rate Us</p>
    <div className="mt-2 flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onRating(star)} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          <Star className="h-7 w-7 fill-current" />
        </button>
      ))}
    </div>
    <button onClick={onSubmit} className="hela-action mt-4 px-8 py-2">Submit</button>
  </div>
);

const TroublePanel = ({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) => (
  <div className="mx-auto max-w-2xl rounded-xl border border-brand-dark/50 bg-white p-8 text-center shadow-[0_8px_24px_rgba(5,72,2,0.08)]">
    <MessageSquare className="mx-auto mb-3 h-7 w-7 text-brand-dark" />
    <h2 className="text-xl font-black text-black">Had a trouble? We are here to help You!</h2>
    <p className="text-xs font-semibold text-gray-500">Send Your Problem or Concern</p>
    <div className="mt-6 flex gap-2">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Type Your Trouble" className="flex-1 rounded-none border px-4 py-3 text-sm" />
      <button onClick={onSubmit} className="hela-action px-7 py-3"><Send className="h-4 w-4" /></button>
    </div>
    <p className="mx-auto mt-7 flex items-center justify-center gap-2 text-xl font-black text-black">
      <Heart className="h-5 w-5 fill-brand-dark text-brand-dark" />
      Thank You for Choosing Us!
    </p>
  </div>
);

const PurchaseProgress = ({ active }: { active: number }) => {
  const steps = ['Purchase Confirmation', 'Vendor Stock Reduced', 'Payment Handling', 'Admin Processing', 'Successfully Delivered'];
  return (
    <div className="mt-9">
      <div className="relative grid grid-cols-5 gap-2">
        <div className="absolute left-8 right-8 top-2 h-1 bg-yellow-400" />
        {steps.map((step, index) => (
          <div key={step} className="relative text-center">
            <span className={`relative z-10 mx-auto block h-5 w-5 rounded-full ring-4 ring-white ${index <= active ? 'bg-yellow-400' : 'bg-gray-200'}`} />
            <p className="mt-3 text-[9px] font-bold text-gray-600">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const getRecipeTitle = (item: Cart['items'][number]) => {
  if (typeof item.recipeId === 'object' && item.recipeId?.title) return item.recipeId.title;
  if (item.recipe?.title) return item.recipe.title;
  return 'Recipe';
};

const formatQuantity = (value: number | string) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value || '0';
  return Number.isInteger(numeric) ? `${numeric}` : numeric.toFixed(numeric < 10 ? 1 : 0);
};

export default CheckoutPage;
