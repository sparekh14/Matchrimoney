import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Calendar, 
  MapPin, 
  Palette, 
  DollarSign, 
  Edit, 
  Save, 
  X, 
  Settings,
  Heart,
  Eye,
  EyeOff,
  Trash2,
  Camera,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { userApi } from '../services/api.js';
import type { User as UserType, ApiError } from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { WEDDING_THEMES, VENDOR_CATEGORIES } from '../types/index.js';
import { formatDate, formatCurrency, formatVendorCategory } from '../utils/format.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.js';

const profileSchema = z.object({
  person1FirstName: z.string().min(1, 'First person\'s first name is required').max(50),
  person1LastName: z.string().min(1, 'First person\'s last name is required').max(50),
  person2FirstName: z.string().min(1, 'Second person\'s first name is required').max(50),
  person2LastName: z.string().min(1, 'Second person\'s last name is required').max(50),
  weddingDate: z.string().min(1, 'Wedding date is required'),
  weddingLocation: z.string().min(3, 'Wedding location must be at least 3 characters').max(100),
  weddingTheme: z.string().min(1, 'Please select a wedding theme'),
  estimatedBudget: z.number().min(1000, 'Budget must be at least $1,000').max(1000000, 'Budget cannot exceed $1,000,000'),
  vendorCategories: z.array(z.string()).min(1, 'Please select at least one vendor category'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  allowMessages: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user: currentUser, updateUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      vendorCategories: [],
      allowMessages: true,
    },
  });

  const watchedVendorCategories = watch('vendorCategories') || [];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userApi.getProfile();
      
      // Extract user from response object
      const userData = response.user;
      setUser(userData);
      
      // Populate form with user data
      // Convert date to YYYY-MM-DD format for the input field
      const formattedDate = new Date(userData.weddingDate).toISOString().split('T')[0];
      
      const formData = {
        person1FirstName: userData.person1FirstName,
        person1LastName: userData.person1LastName,
        person2FirstName: userData.person2FirstName,
        person2LastName: userData.person2LastName,
        weddingDate: formattedDate,
        weddingLocation: userData.weddingLocation,
        weddingTheme: userData.weddingTheme,
        estimatedBudget: userData.estimatedBudget,
        vendorCategories: userData.vendorCategories || [],
        bio: userData.bio || '',
        allowMessages: userData.allowMessages,
      };
      
      reset(formData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      setError('');
      
      // Validate wedding date is in the future
      const weddingDate = new Date(data.weddingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare dates only
      if (weddingDate < today) {
        setError('Wedding date must be in the future.');
        setSaving(false);
        return;
      }

      const response = await userApi.updateProfile(data);
      const updatedUser = response.user;
      setUser(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      
      alert('Profile updated successfully!');
      
      // Reset form with new data to clear isDirty state
      const formattedDate = new Date(updatedUser.weddingDate).toISOString().split('T')[0];
      const newFormData = {
        person1FirstName: updatedUser.person1FirstName,
        person1LastName: updatedUser.person1LastName,
        person2FirstName: updatedUser.person2FirstName,
        person2LastName: updatedUser.person2LastName,
        weddingDate: formattedDate,
        weddingLocation: updatedUser.weddingLocation,
        weddingTheme: updatedUser.weddingTheme,
        estimatedBudget: updatedUser.estimatedBudget,
        vendorCategories: updatedUser.vendorCategories || [],
        bio: updatedUser.bio || '',
        allowMessages: updatedUser.allowMessages,
      };
      reset(newFormData);

    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      const formattedDate = new Date(user.weddingDate).toISOString().split('T')[0];
      reset({
        person1FirstName: user.person1FirstName,
        person1LastName: user.person1LastName,
        person2FirstName: user.person2FirstName,
        person2LastName: user.person2LastName,
        weddingDate: formattedDate,
        weddingLocation: user.weddingLocation,
        weddingTheme: user.weddingTheme,
        estimatedBudget: user.estimatedBudget,
        vendorCategories: user.vendorCategories || [],
        bio: user.bio || '',
        allowMessages: user.allowMessages,
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleVendorCategoryToggle = (category: string) => {
    const currentCategories = getValues('vendorCategories') || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    setValue('vendorCategories', updatedCategories, { shouldDirty: true });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      return;
    }

    try {
      // For now, just show a message that this feature is not yet implemented
      alert('Account deletion feature will be available soon. Please contact support if you need immediate assistance.');
    } catch (err) {
      const apiError = err as ApiError;
      alert(`Error deleting account: ${apiError.error}`);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPhotoUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await userApi.uploadProfilePicture(formData);
      setUser(response.user);
      updateUser(response.user);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoRemove = async () => {
    try {
      setPhotoUploading(true);
      setError('');

      const response = await userApi.removeProfilePicture();
      setUser(response.user);
      updateUser(response.user);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to remove photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
      alert('Password changed successfully!');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
          <button
            onClick={fetchUserProfile}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture.startsWith('http') 
                        ? user.profilePicture 
                        : `${API_BASE_URL.replace('/api', '')}${user.profilePicture}`}
                      alt={`${user.person1FirstName} & ${user.person2FirstName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary-600" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="absolute -bottom-2 -right-2 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                  title="Upload profile picture"
                >
                  {photoUploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                {user.profilePicture && (
                  <button
                    onClick={handlePhotoRemove}
                    disabled={photoUploading}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-lg transition-colors disabled:opacity-50"
                    title="Remove profile picture"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">
                  {user.person1FirstName} {user.person1LastName} & {user.person2FirstName} {user.person2LastName}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(user.weddingDate)}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {user.weddingLocation}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={saving || !isDirty}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      saving || !isDirty
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {saving ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Personal Information
              </h2>
              
              <div className="space-y-6">
                {/* Couple Names */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Couple Names</h4>
                  
                  {/* Person 1 */}
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-600 mb-2">First Person</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            {...register('person1FirstName')}
                            className={`input-field ${errors.person1FirstName ? 'border-red-300' : ''}`}
                          />
                        ) : (
                          <p className="text-gray-900">{user.person1FirstName}</p>
                        )}
                        {errors.person1FirstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.person1FirstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            {...register('person1LastName')}
                            className={`input-field ${errors.person1LastName ? 'border-red-300' : ''}`}
                          />
                        ) : (
                          <p className="text-gray-900">{user.person1LastName}</p>
                        )}
                        {errors.person1LastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.person1LastName.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Person 2 */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-2">Second Person</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            {...register('person2FirstName')}
                            className={`input-field ${errors.person2FirstName ? 'border-red-300' : ''}`}
                          />
                        ) : (
                          <p className="text-gray-900">{user.person2FirstName}</p>
                        )}
                        {errors.person2FirstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.person2FirstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            {...register('person2LastName')}
                            className={`input-field ${errors.person2LastName ? 'border-red-300' : ''}`}
                          />
                        ) : (
                          <p className="text-gray-900">{user.person2LastName}</p>
                        )}
                        {errors.person2LastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.person2LastName.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Password
                  </label>
                  {changingPassword ? (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="input-field"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="input-field"
                          placeholder="Enter new password (min 8 characters)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmNewPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                          className="input-field"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handlePasswordChange}
                          disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword}
                          className="btn-primary flex items-center"
                        >
                          {saving ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {saving ? 'Changing...' : 'Change Password'}
                        </button>
                        <button
                          onClick={() => {
                            setChangingPassword(false);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          value="••••••••••••"
                          readOnly
                          className="input-field pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => setChangingPassword(true)}
                        className="btn-secondary whitespace-nowrap"
                      >
                        Change Password
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className={`input-field ${errors.bio ? 'border-red-300' : ''}`}
                      placeholder="Tell other couples about yourselves and what you're looking for..."
                    />
                  ) : (
                    <p className="text-gray-900">{user.bio || 'No bio provided'}</p>
                  )}
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Wedding Details */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-primary-600" />
                Wedding Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Wedding Date
                  </label>
                  {isEditing ? (
                    <input
                      {...register('weddingDate')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className={`input-field ${errors.weddingDate ? 'border-red-300' : ''}`}
                    />
                  ) : (
                    <p className="text-gray-900">{formatDate(user.weddingDate)}</p>
                  )}
                  {errors.weddingDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.weddingDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Wedding Location
                  </label>
                  {isEditing ? (
                    <input
                      {...register('weddingLocation')}
                      className={`input-field ${errors.weddingLocation ? 'border-red-300' : ''}`}
                      placeholder="City, State"
                    />
                  ) : (
                    <p className="text-gray-900">{user.weddingLocation}</p>
                  )}
                  {errors.weddingLocation && (
                    <p className="mt-1 text-sm text-red-600">{errors.weddingLocation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Wedding Theme
                  </label>
                  {isEditing ? (
                    <select
                      {...register('weddingTheme')}
                      className={`input-field ${errors.weddingTheme ? 'border-red-300' : ''}`}
                    >
                      <option value="">Select a theme</option>
                      {WEDDING_THEMES.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{user.weddingTheme}</p>
                  )}
                  {errors.weddingTheme && (
                    <p className="mt-1 text-sm text-red-600">{errors.weddingTheme.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Estimated Budget
                  </label>
                  {isEditing ? (
                    <input
                      {...register('estimatedBudget', { valueAsNumber: true })}
                      type="number"
                      min="1000"
                      max="1000000"
                      step="500"
                      className={`input-field ${errors.estimatedBudget ? 'border-red-300' : ''}`}
                    />
                  ) : (
                    <p className="text-gray-900">{formatCurrency(user.estimatedBudget)}</p>
                  )}
                  {errors.estimatedBudget && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimatedBudget.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vendor Categories */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Wedding Services of Interest
              </h2>
              
              {isEditing ? (
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
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.vendorCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      {formatVendorCategory(category)}
                    </span>
                  ))}
                </div>
              )}
              {errors.vendorCategories && (
                <p className="mt-2 text-sm text-red-600">{errors.vendorCategories.message}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Settings */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-600" />
                Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Allow Messages</p>
                    <p className="text-sm text-gray-600">
                      Let other couples send you messages
                    </p>
                  </div>
                  {isEditing ? (
                    <input
                      {...register('allowMessages')}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  ) : (
                    <div className={`w-4 h-4 rounded ${user.allowMessages ? 'bg-primary-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Account Info
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-red-200">
              <h2 className="text-xl font-semibold text-red-900 mb-6 flex items-center">
                <Trash2 className="h-5 w-5 mr-2 text-red-600" />
                Danger Zone
              </h2>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Account
              </h3>
              <p className="text-gray-600 mb-6">
                Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 