import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/users/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex w-full font-body overflow-x-hidden">

      {/* ─── Left Column (Form) ─────────────────────────────────── */}
      <div className="w-full lg:w-[50%] flex justify-center items-center lg:items-start flex-col px-4 sm:px-8 lg:px-12 xl:px-24 py-8 sm:py-10 relative z-10">
        <div className="max-w-[500px] w-full">

          <h1 className="text-white text-4xl sm:text-5xl md:text-[64px] font-bold mb-2 sm:mb-4 tracking-tight">
            Forgot
          </h1>
          <h1 className="text-white text-4xl sm:text-5xl md:text-[64px] font-bold mb-6 sm:mb-8 tracking-tight">
            Password?
          </h1>

          <div className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 shadow-2xl relative">

            {/* ── Success State ─────────────────────────────────── */}
            {submitted ? (
              <div
                className="text-center"
                style={{ animation: 'fadeInUp 0.5s ease-out' }}
              >
                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-brand-dark/10 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-brand-dark" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  If an account with <strong className="text-gray-700">{email}</strong> exists,
                  we've sent a password reset link. Please check your inbox and spam folder.
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  The link will expire in <strong>1 hour</strong>.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => { setSubmitted(false); setEmail(''); }}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-brand-dark hover:bg-brand-dark/90 transition-all"
                  >
                    Send Again
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-brand-dark bg-brand-dark/10 hover:bg-brand-dark/20 transition-all"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              /* ── Form State ─────────────────────────────────── */
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-brand-dark/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-brand-dark" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 leading-snug">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Email Field */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-3 py-2.5 text-sm border border-brand-dark/40 rounded-lg focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-colors placeholder:text-gray-400"
                      placeholder="Enter Your Email Address"
                      autoFocus
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-brand-dark hover:bg-brand-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <hr className="flex-1 border-gray-300" />
                  <span className="text-[13px] font-bold text-gray-900">Or</span>
                  <hr className="flex-1 border-gray-300" />
                </div>

                {/* Login link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[10px] text-gray-400 hover:text-brand-dark underline underline-offset-2 transition-colors"
                  >
                    Remember your password? Log in here
                  </button>
                </div>

                {/* Go Back Link */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => navigate(-1)}
                    className="text-[11px] font-bold text-gray-900 hover:text-brand-dark flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" /> Go back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Right Column (Image) ─────────────────────────────────── */}
      <div className="hidden lg:flex w-[50%] relative justify-end pointer-events-none">
        <img
          src="/login.png"
          alt="Decorative mask"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[-10%] h-[90vh] w-auto object-contain drop-shadow-2xl"
        />
      </div>

    </div>
  );
};

export default ForgotPassword;
