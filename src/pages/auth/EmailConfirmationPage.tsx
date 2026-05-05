import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth.api';
import toast from 'react-hot-toast';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const emailConfirmationSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(6, 'OTP must be 6 characters').max(6, 'OTP must be 6 characters'),
});

type EmailConfirmationForm = z.infer<typeof emailConfirmationSchema>;

const INITIAL_COOLDOWN_SECONDS = 125;

export const EmailConfirmationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const emailFromParams = searchParams.get('email');

  const STORAGE_KEY = `email-confirmation-expiry-${emailFromParams || 'guest'}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<EmailConfirmationForm>({
    resolver: zodResolver(emailConfirmationSchema),
    defaultValues: {
      email: emailFromParams || '',
      otp: '',
    },
  });

  // ✅ set email from query
  useEffect(() => {
    if (emailFromParams) {
      setValue('email', emailFromParams);
    }
  }, [emailFromParams, setValue]);

  // ✅ init cooldown (persist after reload)
  useEffect(() => {
    const savedExpiry = localStorage.getItem(STORAGE_KEY);

    if (savedExpiry) {
      const remaining = Math.floor((+savedExpiry - Date.now()) / 1000);

      if (remaining > 0) {
        setCooldown(remaining);
        return;
      }
    }

    // 🆕 first visit
    const newExpiry = Date.now() + INITIAL_COOLDOWN_SECONDS * 1000;
    localStorage.setItem(STORAGE_KEY, newExpiry.toString());
    setCooldown(INITIAL_COOLDOWN_SECONDS);
  }, [STORAGE_KEY]);

  // ✅ countdown
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      const expiry = localStorage.getItem(STORAGE_KEY);

      if (!expiry) return;

      const remaining = Math.floor((+expiry - Date.now()) / 1000);

      if (remaining <= 0) {
        setCooldown(0);
        localStorage.removeItem(STORAGE_KEY);
        clearInterval(timer);
      } else {
        setCooldown(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown, STORAGE_KEY]);

  const onSubmit = async (data: EmailConfirmationForm) => {
    setIsLoading(true);
    try {
      await authApi.confirmEmail(data.email, data.otp);
      setIsConfirmed(true);
      toast.success('Email confirmed successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const email = emailFromParams || getValues('email');

    if (!email) {
      toast.error('Email address is required');
      return;
    }

    if (cooldown > 0) return;

    setIsResending(true);
    try {
      await authApi.resendEmailOtp(email);

      // 🔁 reset timer
      const newExpiry = Date.now() + INITIAL_COOLDOWN_SECONDS * 1000;
      localStorage.setItem(STORAGE_KEY, newExpiry.toString());
      setCooldown(INITIAL_COOLDOWN_SECONDS);

      toast.success('OTP resent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  // ✅ success screen
  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Email Confirmed!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been successfully verified. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 px-4">
      <div className="w-full max-w-md">

        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100">

          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Mail className="h-10 w-10 text-primary-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Verify Your Email
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                {...register('email')}
                type="email"
                disabled={!!emailFromParams}
                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition ${
                  emailFromParams ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="you@example.com"
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Verification Code
              </label>

              <input
                {...register('otp')}
                type="text"
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                placeholder="000000"
              />

              {errors.otp && (
                <p className="mt-1 text-xs text-red-500 flex items-center justify-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.otp.message}
                </p>
              )}
            </div>

            {/* 🔁 RESEND */}
            <div className="flex flex-col items-center gap-2 text-sm">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || cooldown > 0}
                className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
              >
                {isResending
                  ? 'Resending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend code'}
              </button>

              {cooldown > 0 && (
                <p className="text-xs text-gray-500">
                  You can request a new code after the timer ends.
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 shadow-sm"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

          </form>

          <div className="text-center text-sm text-gray-500">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};