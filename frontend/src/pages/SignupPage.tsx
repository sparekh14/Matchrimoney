import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Eye, EyeOff, AlertCircle, CheckCircle, Calendar, MapPin, Palette, DollarSign } from 'lucide-react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete'
import '@geoapify/geocoder-autocomplete/styles/minimal.css'
import { useAuth } from '../context/AuthContext.js';
import type { ApiError, GeocodeResult } from '../types/index.js';
import { WEDDING_THEMES, VENDOR_CATEGORIES } from '../types/index.js';
import { formatVendorCategory } from '../utils/format.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.js';

const signupSchema = z.object({
  person1FirstName: z.string().min(1, 'First person\'s first name is required').max(50),
  person1LastName: z.string().min(1, 'First person\'s last name is required').max(50),
  person2FirstName: z.string().min(1, 'Second person\'s first name is required').max(50),
  person2LastName: z.string().min(1, 'Second person\'s last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  weddingDate: z.string().min(1, 'Wedding date is required'),
  weddingLocation: z.string().min(3, 'Wedding location must be at least 3 characters').max(100),
  weddingTheme: z.string().min(1, 'Please select a wedding theme'),
  estimatedBudget: z.number().min(1000, 'Budget must be at least $1,000').max(1000000, 'Budget cannot exceed $1,000,000'),
  vendorCategories: z.array(z.string()).min(1, 'Please select at least one vendor category'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      vendorCategories: [],
    },
  });

  const watchedVendorCategories = watch('vendorCategories') || [];
  const passwordValue = watch('password');

  React.useEffect(() => {
    if (getValues('confirmPassword')) {
      trigger('confirmPassword');
    }
  }, [passwordValue, trigger, getValues]);

  const handleLocationSelect = (location: GeocodeResult | null) => {
    if (location) {
      setValue('weddingLocation', location.properties.formatted, { shouldValidate: true });
    } else {
      setValue('weddingLocation', '', { shouldValidate: true });
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      console.log('Form submitted with data:', data);
      setApiError('');
      
      // Validate wedding date is in the future
      const weddingDate = new Date(data.weddingDate);
      const today = new Date();
      console.log('Wedding date:', weddingDate, 'Today:', today);
      if (weddingDate <= today) {
        setApiError('Wedding date must be in the future');
        return;
      }

      const signupData = {
        person1FirstName: data.person1FirstName,
        person1LastName: data.person1LastName,
        person2FirstName: data.person2FirstName,
        person2LastName: data.person2LastName,
        email: data.email,
        password: data.password,
        weddingDate: data.weddingDate,
        weddingLocation: data.weddingLocation,
        weddingTheme: data.weddingTheme,
        estimatedBudget: data.estimatedBudget,
        vendorCategories: data.vendorCategories,
      };

      console.log('Calling signup API...');
      await signup(signupData);
      console.log('Signup successful!');
      setIsSuccess(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! You can now log in.',
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      const apiError = error as ApiError;
      setApiError(apiError.error);
    }
  };

  const handleVendorCategoryToggle = (category: string) => {
    const currentCategories = getValues('vendorCategories') || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    setValue('vendorCategories', updatedCategories);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 w-full">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
              Welcome to Matchrimoney! 🎉
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Account created successfully! You'll be redirected to the login page shortly.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-6 sm:px-8 lg:px-12 w-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Heart className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Join Matchrimoney
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create your account and start saving on your dream wedding
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-6">
              {/* Couple Names Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 text-primary-600 mr-2" />
                  Couple Information
                </h3>
                
                {/* Person 1 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">First Person</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="person1FirstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        {...register('person1FirstName')}
                        type="text"
                        className={`input-field ${errors.person1FirstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="First name"
                      />
                      {errors.person1FirstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.person1FirstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="person1LastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        {...register('person1LastName')}
                        type="text"
                        className={`input-field ${errors.person1LastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Last name"
                      />
                      {errors.person1LastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.person1LastName.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Person 2 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Second Person</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="person2FirstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        {...register('person2FirstName')}
                        type="text"
                        className={`input-field ${errors.person2FirstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="First name"
                      />
                      {errors.person2FirstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.person2FirstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="person2LastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        {...register('person2LastName')}
                        type="text"
                        className={`input-field ${errors.person2LastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Last name"
                      />
                      {errors.person2LastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.person2LastName.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={`input-field ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      onChange: () => {
                        const confirmPasswordValue = getValues('confirmPassword');
                        if (confirmPasswordValue) {
                          trigger('confirmPassword');
                        }
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Create a password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      onChange: () => {
                        trigger('confirmPassword');
                      }
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Wedding Information Header */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 text-primary-600 mr-2" />
                Wedding Details
              </h3>
            </div>

            {/* Wedding Date and Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Wedding Date
                </label>
                <input
                  {...register('weddingDate')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={`input-field ${errors.weddingDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.weddingDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.weddingDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="weddingLocation" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Wedding Location
                </label>
                <div className="input-field-container">
                  <GeoapifyContext apiKey={import.meta.env.VITE_GEOAPIFY_API_KEY}>
                    <GeoapifyGeocoderAutocomplete
                      placeholder="Start typing a city or address"
                      placeSelect={handleLocationSelect}
                    />
                  </GeoapifyContext>
                </div>
                <input
                  {...register('weddingLocation')}
                  type="hidden"
                />
                {errors.weddingLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.weddingLocation.message}</p>
                )}
              </div>
            </div>

            {/* Wedding Theme and Budget */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weddingTheme" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Wedding Theme
                </label>
                <select
                  {...register('weddingTheme')}
                  className={`input-field ${errors.weddingTheme ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Select a theme</option>
                  {WEDDING_THEMES.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
                {errors.weddingTheme && (
                  <p className="mt-1 text-sm text-red-600">{errors.weddingTheme.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Estimated Budget
                </label>
                <input
                  {...register('estimatedBudget', { valueAsNumber: true })}
                  type="number"
                  min="1000"
                  max="1000000"
                  step="500"
                  className={`input-field ${errors.estimatedBudget ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="25000"
                />
                {errors.estimatedBudget && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedBudget.message}</p>
                )}
              </div>
            </div>

            {/* Vendor Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What wedding services are you interested in sharing costs for?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {VENDOR_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedVendorCategories.includes(category)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={watchedVendorCategories.includes(category)}
                      onChange={() => handleVendorCategoryToggle(category)}
                    />
                    <div className="text-sm font-medium text-gray-900">
                      {formatVendorCategory(category)}
                    </div>
                  </label>
                ))}
              </div>
              {errors.vendorCategories && (
                <p className="mt-1 text-sm text-red-600">{errors.vendorCategories.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isSubmitting || loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
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

export default SignupPage; 