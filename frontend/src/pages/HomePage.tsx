import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  DollarSign, 
  Calendar, 
  MapPin, 
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'Find Wedding Partners',
      description: 'Connect with couples getting married around the same time and location as you'
    },
    {
      icon: <DollarSign className="h-8 w-8 text-primary-600" />,
      title: 'Share Vendor Costs',
      description: 'Split expenses for photographers, venues, catering, and other wedding services'
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary-600" />,
      title: 'Smart Matching',
      description: 'Our algorithm matches you with couples based on date, location, and wedding style'
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary-600" />,
      title: 'Location-Based',
      description: 'Find couples in your area to share local vendors and reduce travel costs'
    }
  ];

  const benefits = [
    'Save 20-50% on wedding costs',
    'Access to premium vendors at group rates',
    'Share transportation and accommodation',
    'Build friendships with other couples',
    'Reduce wedding planning stress',
    'Create memorable joint celebrations'
  ];

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-24 w-full">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              Cut Your Wedding Costs
              <span className="text-primary-600"> in Half</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              Connect with other couples to share vendors, venues, and services. 
              Plan your dream wedding for less while building lasting friendships.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated ? (
                <Link
                  to="/marketplace"
                  className="btn-primary text-lg px-10 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Browse Couples
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="btn-primary text-lg px-10 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Join Now
                  </Link>
                  <button
                    onClick={() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }}
                    className="btn-secondary text-lg px-10 py-5 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Learn More
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-primary-200 opacity-60">
          <Heart className="h-20 w-20" />
        </div>
        <div className="absolute bottom-10 right-10 text-accent-200 opacity-60">
          <Heart className="h-16 w-16" />
        </div>
        <div className="absolute top-1/3 right-1/4 text-primary-100 opacity-40">
          <Heart className="h-8 w-8" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 text-accent-100 opacity-40">
          <Heart className="h-12 w-12" />
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 bg-white w-full">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8">
              How Matchrimoney Works
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our platform makes it easy to find compatible couples and share wedding expenses safely and securely.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-primary-25 w-full">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8">
                Why Choose Matchrimoney?
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Join thousands of couples who have already saved money and made lasting friendships through our platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-lg">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <CheckCircle className="h-7 w-7 text-primary-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-700 w-full">
        <div className="w-full px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
            Ready to Start Saving on Your Wedding?
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-12 leading-relaxed">
            Join Matchrimoney today and connect with couples in your area. It's free to get started!
          </p>
          {!isAuthenticated && (
                          <Link
                to="/signup"
                className="inline-flex items-center bg-white text-primary-600 hover:bg-gray-100 font-semibold py-5 px-12 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl text-xl hover:-translate-y-1"
              >
                Get Started For Free
              </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 