import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPayment } from '../services/paymentService';
import { getOrderById } from '../services/orderService';
import { createRating } from '../services/ratingService';
import { useToast } from '../components/Toast';
import {
  CheckCircle2, XCircle, Loader2, ArrowRight, Receipt, CreditCard,
  Star, Send, Heart, ArrowLeft
} from 'lucide-react';

interface PaymentInfo {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  order?: {
    _id: string;
    orderNumber: string;
    totalPrice: number;
    status: string;
    paymentStatus: string;
  };
}

interface OrderRecipe {
  recipeId: string;
  recipeTitle: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { showToast } = useToast();

  const [pageStatus, setPageStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  // Rating/Feedback popup state
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [orderRecipes, setOrderRecipes] = useState<OrderRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (!sessionId) { setPageStatus('failed'); return; }
    const verify = async () => {
      try {
        const res = await verifyPayment(sessionId);
        const orderId = res.orderId || (typeof res.order === 'object' ? res.order?._id : res.order) || '';
        setPaymentInfo({
          orderId,
          transactionId: res.transactionId || '',
          amount: res.amount || 0,
          currency: res.currency || 'LKR',
          status: res.status || '',
          order: res.order || undefined,
        });
        setPageStatus(res.status === 'Completed' ? 'success' : res.status === 'Failed' ? 'failed' : 'success');

        // Fetch order details to get the recipes for rating
        if (orderId) {
          try {
            const orderData = await getOrderById(orderId);
            const recipes = (orderData.items || []).map((item: any) => ({
              recipeId: typeof item.recipeId === 'object' ? item.recipeId._id : item.recipeId,
              recipeTitle: item.recipeTitle || (typeof item.recipeId === 'object' ? item.recipeId.title : 'Recipe'),
            }));
            setOrderRecipes(recipes);
            if (recipes.length > 0) setSelectedRecipe(recipes[0].recipeId);
          } catch { /* ignore - rating is optional */ }
        }
      } catch { setPageStatus('failed'); }
    };
    verify();
  }, [sessionId]);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;
    if (!selectedRecipe || !selectedRating) {
      showToast('Please select a recipe and rating first', 'warning');
      return;
    }
    setSubmittingFeedback(true);
    try {
      await createRating({
        recipeId: selectedRecipe,
        rating: selectedRating,
        review: feedback.trim(),
      });
      setFeedbackSent(true);
      showToast('Thank you for your feedback!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit feedback';
      showToast(msg, 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedRecipe || !selectedRating) {
      showToast('Please select a star rating', 'warning');
      return;
    }
    setSubmittingFeedback(true);
    try {
      await createRating({
        recipeId: selectedRecipe,
        rating: selectedRating,
        review: feedback.trim() || undefined,
      });
      setRatingSubmitted(true);
      showToast('Thank you for rating us!', 'success');
      setShowRatingPopup(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit rating';
      showToast(msg, 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (pageStatus === 'loading') return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-brand animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Verifying your payment…</p>
      </div>
    </div>
  );

  if (pageStatus === 'failed') return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">Something went wrong with your payment. Please try again or check your orders.</p>
        <Link to="/orders" className="inline-flex items-center gap-2 px-5 py-2.5 hela-action hover:opacity-90 transition-colors">
          View Orders <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  const activeRating = hoverRating || selectedRating;

  return (
    <>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* ── Main Card ────────────────────────────────────────── */}
          <div className="hela-card p-5 sm:p-7 relative overflow-hidden">
            {/* Decorative corner dots */}
            <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-brand-dark/20" />
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-dark/20" />
            <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-brand-dark/20" />
            <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-brand-dark/20" />

            {/* ── Thank You Header ────────────────────────────── */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Heart className="h-8 w-8 text-brand-dark fill-brand-dark" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
                  Thank You for Choosing Us!
                </h1>
              </div>
              <p className="text-gray-500">Your order has been confirmed and is being prepared.</p>
            </div>

            {/* ── Payment Details (collapsed) ────────────────── */}
            {paymentInfo && (
              <div className="bg-brand-light/20 rounded-2xl p-4 sm:p-5 mb-7 text-left">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> Payment Details
                </h2>
                <div className="space-y-2 text-sm">
                  {paymentInfo.order?.orderNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order</span>
                      <span className="font-bold text-gray-900 font-mono">{paymentInfo.order.orderNumber}</span>
                    </div>
                  )}
                  {paymentInfo.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction</span>
                      <span className="font-bold text-gray-900 font-mono text-xs">{paymentInfo.transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium text-blue-600 flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" /> Card (Stripe)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{paymentInfo.status}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Paid</span>
                    <span className="text-lg font-extrabold text-gray-900">Rs. {paymentInfo.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Feedback Section ───────────────────────────── */}
            {!feedbackSent && !ratingSubmitted && (
              <div className="mb-8">
                <h2 className="text-center text-lg font-bold text-gray-900 mb-4">Send Your Feedback</h2>

                {/* Recipe selector if multiple items */}
                {orderRecipes.length > 1 && (
                  <div className="mb-4">
                    <select
                      value={selectedRecipe}
                      onChange={(e) => setSelectedRecipe(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
                    >
                      {orderRecipes.map((r) => (
                        <option key={r.recipeId} value={r.recipeId}>{r.recipeTitle}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                  <input
                    type="text"
                    placeholder="Type Your Feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="flex-1 px-5 py-4 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                    maxLength={500}
                  />
                  <button
                    onClick={handleSendFeedback}
                    disabled={submittingFeedback || !feedback.trim() || !selectedRating}
                    className="px-8 py-4 bg-brand-dark text-white font-bold text-sm hover:bg-brand-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submittingFeedback ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send
                  </button>
                </div>
                {!selectedRating && feedback.trim() && (
                  <p className="text-xs text-amber-600 mt-2 text-center">Please select a star rating below before sending</p>
                )}
              </div>
            )}

            {/* ── Feedback Sent Success ──────────────────────── */}
            {(feedbackSent || ratingSubmitted) && (
              <div className="mb-8 text-center py-6 bg-emerald-50 rounded-2xl">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-emerald-700 text-lg">Thank you for your feedback!</p>
                <p className="text-emerald-600 text-sm mt-1">Your review helps us improve and helps others discover great recipes.</p>
              </div>
            )}

            {/* ── Rate Us Section ────────────────────────────── */}
            {!feedbackSent && !ratingSubmitted && (
              <div className="text-center mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Rate Us</h2>
                <div className="flex items-center justify-center gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelectedRating(star)}
                      className="focus:outline-none transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors duration-150 ${
                          star <= activeRating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmitRating}
                  disabled={submittingFeedback || !selectedRating}
                  className="px-10 py-3 bg-brand-dark text-white font-bold rounded-full hover:bg-brand-dark/90 transition-all shadow-lg shadow-brand-dark/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingFeedback ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            )}

            {/* ── Back / Actions ─────────────────────────────── */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                {paymentInfo?.orderId && (
                  <Link
                    to={`/purchase?order=${encodeURIComponent(paymentInfo.orderId)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 hela-action text-sm hover:opacity-90 transition-all"
                  >
                    View Order <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <Link to="/recipes" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                  Continue Browsing
                </Link>
              </div>
              <Link to="/" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-dark transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rating Popup Modal (triggered from somewhere else if needed) ── */}
      {showRatingPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRatingPopup(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Rate Your Experience</h2>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setSelectedRating(star)}
                  className="focus:outline-none transition-transform hover:scale-125"
                >
                  <Star className={`h-10 w-10 ${star <= activeRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmitRating}
              disabled={submittingFeedback || !selectedRating}
              className="w-full py-3 bg-brand-dark text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentSuccess;
