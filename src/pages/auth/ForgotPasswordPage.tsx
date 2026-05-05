import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth.api';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 characters').max(6, 'OTP must be 6 characters'),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ cooldown state
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();

  const emailForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // ✅ countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmitEmail = async (data: ForgotPasswordForm) => {
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setStep('otp');
      setCooldown(60); // ⏱️ start cooldown
      toast.success('OTP sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setCooldown(60);
      toast.success('OTP resent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOtp = async (data: OtpForm) => {
    setIsLoading(true);
    try {
      await authApi.verifyPassword(email, data.otp);
      setOtp(data.otp);
      setStep('reset');
      toast.success('OTP verified');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, otp, data.password, data.confirmPassword);
      toast.success('Password reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100">

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Follow the steps to recover your account
            </p>
            <Link
              to="/login"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium block mt-2"
            >
              Back to login
            </Link>
          </div>

          {/* STEP 1 */}
          {step === 'email' && (
            <form className="space-y-5" onSubmit={emailForm.handleSubmit(onSubmitEmail)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...emailForm.register('email')}
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="you@example.com"
                />
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || cooldown > 0}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 shadow-sm"
              >
                {isLoading
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Send OTP'}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 'otp' && (
            <form className="space-y-5" onSubmit={otpForm.handleSubmit(onSubmitOtp)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                  Enter OTP
                </label>

                <input
                  {...otpForm.register('otp')}
                  type="text"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="000000"
                />

                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-xs text-red-500 text-center">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500 text-center">
                  Code sent to {email}
                </p>
              </div>

              {/* ✅ resend button */}
              <div className="text-center">
                <button
                  type="button"
                  disabled={cooldown > 0 || isLoading}
                  onClick={handleResend}
                  className="text-sm text-gray-500 hover:text-primary-600 disabled:opacity-50"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 shadow-sm"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {/* STEP 3 */}
          {step === 'reset' && (
            <form className="space-y-5" onSubmit={resetForm.handleSubmit(onSubmitReset)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  {...resetForm.register('password')}
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="••••••••"
                />
                {resetForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {resetForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  {...resetForm.register('confirmPassword')}
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="••••••••"
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 shadow-sm"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};