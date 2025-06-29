import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Heart } from 'lucide-react';
import { authApi } from '../services/api.js';
import type { ApiError } from '../types/index.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.js';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check the URL or request a new verification email.');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now sign in to your account.');
      } catch (error) {
        const apiError = error as ApiError;
        setStatus('error');
        setMessage(apiError.error || 'Failed to verify email. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-6" />
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="block btn-primary"
              >
                Sign In to Your Account
              </Link>
              <Link
                to="/"
                className="block btn-secondary"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="space-y-4">
              <Link
                to="/signup"
                className="block btn-primary"
              >
                Create New Account
              </Link>
              <Link
                to="/login"
                className="block btn-secondary"
              >
                Try to Sign In
              </Link>
              <Link
                to="/"
                className="block text-gray-600 hover:text-primary-600"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Heart className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="mt-6 text-3xl font-serif font-bold text-gray-900">
            Matchrimoney
          </h1>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderContent()}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a
              href="mailto:support@matchrimoney.com"
              className="text-primary-600 hover:text-primary-700"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 