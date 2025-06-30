import React from 'react';
import { Store, Heart } from 'lucide-react';

const VendorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 w-full">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <Store className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
            Vendors
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Coming soon! 🚀
          </p>
          <p className="text-sm text-gray-500 mb-8">
            We're building partnerships with amazing vendors to bring you the best wedding services and exclusive deals.
          </p>
          <div className="flex justify-center">
            <Heart className="h-8 w-8 text-primary-600 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPage; 