import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * AuthSuccess page — handles the redirect callback from the
 * Google OAuth redirect flow (GET /auth/google → callback → here).
 *
 * The backend redirects to:  CLIENT_URL/auth/success?token=<jwt>
 * This component extracts the token, persists it, and redirects home.
 */
const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      setStatus('success');
      setMessage('Signed in successfully! Redirecting…');

      // Hydrate the user in AuthContext now that we have a token
      refreshUser().then(() => {
        showToast('Signed in with Google!', 'success');
      });

      // Brief pause so the user sees the success state
      const timer = setTimeout(() => navigate('/'), 1500);
      return () => clearTimeout(timer);
    } else {
      setStatus('error');
      setMessage('Authentication failed — no token received.');
    }
  }, [searchParams, navigate, refreshUser, showToast]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Animated icon area */}
        <div className="mb-6 flex justify-center">
          {status === 'loading' && (
            <div className="h-16 w-16 rounded-full bg-brand-light flex items-center justify-center animate-pulse">
              <Loader2 className="h-8 w-8 text-brand animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="h-16 w-16 rounded-full bg-brand-light flex items-center justify-center animate-[scaleIn_0.3s_ease]">
              <CheckCircle2 className="h-8 w-8 text-brand" />
            </div>
          )}
          {status === 'error' && (
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'loading' && 'Signing you in…'}
          {status === 'success' && 'Welcome!'}
          {status === 'error' && 'Oops!'}
        </h2>

        <p className="text-gray-500">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/login')}
            className="mt-6 inline-flex items-center px-5 py-2.5 rounded-xl bg-brand-dark text-white font-semibold hover:bg-brand-dark transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthSuccess;
