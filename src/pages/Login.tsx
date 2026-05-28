import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { publicAsset } from '../utils/publicAsset';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();

  // Redirect to the page the user was trying to visit, or home
  const from = (location.state as any)?.from || '/';

  // ─── Email / Password Login ───────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      showToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to login. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Google One-Tap / Button (ID-token flow) ─────────────────
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setGoogleLoading(true);

    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error('No credential received from Google');

      // Decode the JWT to extract profile info
      const payload = JSON.parse(atob(idToken.split('.')[1]));

      await googleLogin({
        idToken,
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        picture: payload.picture
      });

      showToast('Signed in with Google!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-black flex w-full font-body overflow-x-hidden">

      {/* ─── Left Column (Form) ─────────────────────────────────── */}
      <div className="w-full lg:w-[50%] flex justify-center items-center lg:items-start flex-col px-4 sm:px-8 lg:px-12 xl:px-24 py-8 sm:py-10 relative z-10">
        <div className="max-w-[500px] w-full">

          <h1 className="text-white text-4xl sm:text-5xl md:text-[64px] font-bold mb-6 sm:mb-8 tracking-tight">
            Log In
          </h1>

          <div className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 shadow-2xl relative">

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Field */}
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-brand-dark/40 rounded-lg focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-colors placeholder:text-gray-400"
                  placeholder="Enter Your Email Address"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2.5 text-sm border border-brand-dark/40 rounded-lg focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-colors placeholder:text-gray-400"
                    placeholder="Enter Your Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-dark transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end mt-1.5">
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-brand-dark hover:underline"
                  >
                    Forgot Your Password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-brand-dark hover:bg-brand-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-6"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log In'}
              </button>
            </form>

            {/* ── Google Sign-In Section ─────────────────────────── */}
            <div className="mt-8 text-center">
              <div className="flex items-center gap-3 mb-4">
                <hr className="flex-1 border-gray-300" />
                <span className="text-[13px] font-bold text-gray-900">Or</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <div className="flex justify-center mb-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                  shape="pill"
                  width="260"
                  logo_alignment="left"
                />
              </div>

              {googleLoading && (
                <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Signing in with Google…
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-[12px] text-gray-900 hover:text-brand-dark underline underline-offset-2 transition-colors mt-2"
              >
                Don't have an account? Register here
              </button>
            </div>

            {/* Go Back Link */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => navigate('/')}
                className="text-[11px] font-bold text-gray-900 hover:text-brand-dark flex items-center gap-1 transition-colors"
              >
                &lt; Go back
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Right Column (Image) ─────────────────────────────────── */}
      <div className="hidden lg:flex w-[50%] relative justify-end pointer-events-none">
        <img
          src={publicAsset('login.png')}
          alt="Decorative mask"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[-10%] h-[90vh] w-auto object-contain drop-shadow-2xl"
        />
      </div>

    </div>
  );
};

export default Login;
