import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import type { ApiError } from '../types/index.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get success message from signup redirect
  const successMessage = (location.state as any)?.message;
  const prefillEmail = (location.state as any)?.email;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefillEmail || '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError('');
      setRequiresVerification(false);
      await login(data);
      navigate('/marketplace');
    } catch (error) {
      const apiError = error as ApiError;
      setApiError(apiError.error || 'An unexpected error occurred');
      if (apiError.requiresVerification) {
        setRequiresVerification(true);
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const email = getValues('email');
      if (!email) {
        setApiError('Please enter your email address first');
        return;
      }
      
      // Import authApi here to avoid circular dependencies
      const { authApi } = await import('../services/api');
      await authApi.resendVerification(email);
      setApiError('');
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      const apiError = error as ApiError;
      setApiError(apiError.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 w-full">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Heart className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Welcome Back
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Sign in to your Matchrimoney account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Success Message Display */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
                {requiresVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 underline"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`input-field ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full btn-primary flex items-center justify-center text-lg py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting || loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Join Matchrimoney
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 