import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { SignupDto } from '@/types';

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    userName: z.string().min(2, 'Username must be at least 2 characters'),
    phone: z.string().optional(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

  export const SignupPage = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
  
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SignupDto>({
      resolver: zodResolver(signupSchema),
    });
  
    const onSubmit = async (data: SignupDto) => {
      setIsLoading(true);
      try {
        if (data.phone == '' || data.phone == null) {
          delete data.phone;
        }
  
        await signup(data);
        navigate(`/confirm-email?email=${encodeURIComponent(data.email)}`);
      } catch (error) {
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
                Create Account
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Join us and get started
              </p>
            </div>
  
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    {...register('userName')}
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    placeholder="Enter your username"
                  />
                  {errors.userName && (
                    <p className="mt-1 text-xs text-red-500">{errors.userName.message}</p>
                  )}
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
  
              </div>
  
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
  
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </div>
  
          </div>
        </div>
      </div>
    );
  };
