import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Heart, DollarSign, Users, MessageCircle } from 'lucide-react';
import { userApi, matchApi } from '../services/api.js';
import type { PublicUser, SearchFilters, ApiError } from '../types/index.js';
import { WEDDING_THEMES, VENDOR_CATEGORIES } from '../types/index.js';
import { formatDate, formatCurrency, formatVendorCategory, getCompatibilityColor, formatCompatibilityScore } from '../utils/format.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.js';

const MarketplacePage: React.FC = () => {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userApi.getMarketplace(filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleFilterChange('location', searchQuery.trim());
    } else {
      handleFilterChange('location', undefined);
    }
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setSearchQuery('');
  };

  const handleMessage = async (user: PublicUser) => {
    try {
      // This would typically open a modal or navigate to a messaging page
      // For now, we'll create a match which includes the initial message
      const message = `Hi ${user.person1FirstName}! I saw your wedding details and think we might be a great match for sharing wedding costs. Would you like to explore some vendor partnerships together?`;
      
      await matchApi.createMatch({
        receiverId: user.id,
        message,
      });
      
      alert('Message sent! You can view the conversation in your Messages page.');
    } catch (err) {
      const apiError = err as ApiError;
      alert(`Error: ${apiError.error}`);
    }
  };

  const toggleBioExpansion = (userId: string) => {
    setExpandedBios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Wedding Marketplace
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with couples getting married near you and save money by sharing wedding costs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location (e.g., San Francisco, CA)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="btn-primary px-6"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary px-6 flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-6 space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wedding Date Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) => handleFilterChange('dateRange', {
                        start: e.target.value || undefined,
                        end: filters.dateRange?.end
                      })}
                      className="w-full input-field"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) => handleFilterChange('dateRange', {
                        start: filters.dateRange?.start,
                        end: e.target.value || undefined
                      })}
                      className="w-full input-field"
                      placeholder="End date"
                    />
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wedding Theme
                  </label>
                  <select
                    value={filters.theme || ''}
                    onChange={(e) => handleFilterChange('theme', e.target.value || undefined)}
                    className="w-full input-field"
                  >
                    <option value="">All themes</option>
                    {WEDDING_THEMES.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min budget"
                      value={filters.budgetRange?.min || ''}
                      onChange={(e) => handleFilterChange('budgetRange', {
                        min: e.target.value ? parseInt(e.target.value) : undefined,
                        max: filters.budgetRange?.max
                      })}
                      className="w-full input-field"
                    />
                    <input
                      type="number"
                      placeholder="Max budget"
                      value={filters.budgetRange?.max || ''}
                      onChange={(e) => handleFilterChange('budgetRange', {
                        min: filters.budgetRange?.min,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="w-full input-field"
                    />
                  </div>
                </div>

                {/* Vendor Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shared Interests
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {VENDOR_CATEGORIES.map((category) => (
                      <label
                        key={category}
                        className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={(filters.vendorCategories || []).includes(category)}
                          onChange={(e) => {
                            const currentCategories = filters.vendorCategories || [];
                            let newCategories: string[];
                            
                            if (e.target.checked) {
                              newCategories = [...currentCategories, category];
                            } else {
                              newCategories = currentCategories.filter(c => c !== category);
                            }
                            
                            handleFilterChange('vendorCategories', newCategories.length > 0 ? newCategories : undefined);
                          }}
                          className="mr-3 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-700">
                          {formatVendorCategory(category)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {filters.vendorCategories && filters.vendorCategories.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {filters.vendorCategories.length} category{filters.vendorCategories.length !== 1 ? 'ies' : 'y'} selected
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn-secondary px-6"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Finding couples near you...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No couples found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or check back later for new couples.
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {users.length} of {pagination.totalCount} couples
              </p>
              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
            </div>

            {/* Couples Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {users.map((user) => (
                <div key={user.id} className="card hover:shadow-xl transition-shadow flex flex-col h-full">
                  {/* Content - fills available space */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 break-words">
                          {user.person1FirstName} & {user.person2FirstName}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{user.weddingLocation}</span>
                        </p>
                      </div>
                      {user.compatibilityScore && (
                        <div className="text-right flex-shrink-0 min-w-[80px]">
                          <div className={`text-sm font-medium whitespace-nowrap ${getCompatibilityColor(user.compatibilityScore)}`}>
                            {user.compatibilityScore}% Match
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {formatCompatibilityScore(user.compatibilityScore)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Wedding Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                        <span>{formatDate(user.weddingDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Heart className="h-4 w-4 mr-2 text-primary-600" />
                        <span>{user.weddingTheme}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
                        <span>{formatCurrency(user.estimatedBudget)} budget</span>
                      </div>
                    </div>

                    {/* Vendor Categories */}
                    {user.vendorCategories.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Interested in sharing:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {user.vendorCategories.slice(0, 3).map((category) => (
                            <span
                              key={category}
                              className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                            >
                              {formatVendorCategory(category)}
                            </span>
                          ))}
                          {user.vendorCategories.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{user.vendorCategories.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    <div className="mb-6">
                      {user.bio && (
                        <>
                          <p className={`text-sm text-gray-600 ${expandedBios.has(user.id) ? '' : 'line-clamp-3'}`}>
                            {user.bio}
                          </p>
                          {user.bio.length > 150 && (
                            <button
                              onClick={() => toggleBioExpansion(user.id)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 transition-colors"
                            >
                              {expandedBios.has(user.id) ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions - always at bottom */}
                  <div className="flex space-x-3 mt-auto">
                    <button
                      onClick={() => handleMessage(user)}
                      disabled={!user.allowMessages}
                      className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-colors ${
                        user.allowMessages
                          ? 'bg-primary-600 hover:bg-primary-700 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {user.allowMessages ? 'Send Message' : 'Coming Soon!'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.hasPrev
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.hasNext
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage; 
