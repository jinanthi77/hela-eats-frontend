import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import apiClient from '../api/client';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ─── Password strength indicators ──────────────────────────────
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordStrength = [hasMinLength, hasLetter, hasNumber].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength === 1) return 'bg-red-400';
    if (passwordStrength === 2) return 'bg-yellow-400';
    return 'bg-brand-dark';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setError('Password must be at least 6 characters with at least one letter and one number.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.put(`/users/reset-password/${token}`, { password });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to reset password. The link may have expired.'
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
            Reset
          </h1>
          <h1 className="text-white text-4xl sm:text-5xl md:text-[64px] font-bold mb-6 sm:mb-8 tracking-tight">
            Password
          </h1>

          <div className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 shadow-2xl relative">

            {/* ── Success State ─────────────────────────────────── */}
            {success ? (
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
                  Password Reset Successful!
                </h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                  Your password has been updated. You can now log in with your new password.
                </p>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-brand-dark hover:bg-brand-dark/90 transition-all"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              /* ── Form State ─────────────────────────────────── */
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-brand-dark/10 flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5 text-brand-dark" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 leading-snug">
                      Create a new password for your account. Make sure it's strong and memorable.
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

                  {/* New Password Field */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2.5 text-sm border border-brand-dark/40 rounded-lg focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-colors placeholder:text-gray-400"
                        placeholder="Enter Your New Password"
                        autoFocus
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

                    {/* Password Strength Bar */}
                    {password.length > 0 && (
                      <div className="mt-2" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 3) * 100}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold ${passwordStrength === 3 ? 'text-brand-dark' :
                              passwordStrength === 2 ? 'text-yellow-600' : 'text-red-500'
                            }`}>
                            {getStrengthLabel()}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          <li className={`text-[10px] flex items-center gap-1.5 ${hasMinLength ? 'text-brand-dark' : 'text-gray-400'}`}>
                            <ShieldCheck className="h-3 w-3" />
                            At least 6 characters
                          </li>
                          <li className={`text-[10px] flex items-center gap-1.5 ${hasLetter ? 'text-brand-dark' : 'text-gray-400'}`}>
                            <ShieldCheck className="h-3 w-3" />
                            Contains a letter
                          </li>
                          <li className={`text-[10px] flex items-center gap-1.5 ${hasNumber ? 'text-brand-dark' : 'text-gray-400'}`}>
                            <ShieldCheck className="h-3 w-3" />
                            Contains a number
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`block w-full pl-3 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-colors placeholder:text-gray-400 ${confirmPassword.length > 0 && confirmPassword !== password
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                            : 'border-brand-dark/40 focus:border-brand-dark focus:ring-brand-dark'
                          }`}
                        placeholder="Confirm Your New Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-dark transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && confirmPassword !== password && (
                      <p className="mt-1 text-[10px] text-red-500 font-medium">
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword.length > 0 && confirmPassword === password && password.length > 0 && (
                      <p className="mt-1 text-[10px] text-brand-dark font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || passwordStrength < 3 || password !== confirmPassword}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-brand-dark hover:bg-brand-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>

                {/* Login link */}
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[10px] text-gray-400 hover:text-brand-dark underline underline-offset-2 transition-colors"
                  >
                    Remember your password? Log in here
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

export default ResetPassword;
