import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../services/paymentService';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    if (!sessionId) { setStatus('failed'); return; }
    const verify = async () => {
      try {
        const res = await verifyPayment(sessionId);
        setOrderId(res.orderId || res.order || '');
        setStatus('success');
      } catch { setStatus('failed'); }
    };
    verify();
  }, [sessionId]);

  if (status === 'loading') return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-brand animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Verifying your payment…</p>
      </div>
    </div>
  );

  if (status === 'failed') return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">Something went wrong with your payment. Please try again.</p>
        <Link to="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-dark transition-colors">
          View Orders <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-[scaleIn_0.3s_ease]">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">Your order has been confirmed and is being prepared.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link to={`/orders/${orderId}`} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-dark transition-colors">
              View Order <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link to="/recipes" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
