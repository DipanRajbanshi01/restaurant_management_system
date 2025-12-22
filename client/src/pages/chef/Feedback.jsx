import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { feedbackService } from '../../services/feedbackService';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import ChefNavbar from '../../components/navbars/ChefNavbar';
import { toast } from 'react-toastify';

const ChefFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [menuFeedbacks, setMenuFeedbacks] = useState([]);
  const [orderFeedbacks, setOrderFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'order'

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getChefFeedbacks();
      if (response.success) {
        setMenuFeedbacks(response.data.menuFeedbacks);
        setOrderFeedbacks(response.data.orderFeedbacks);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className="text-2xl">
        {star <= rating ? (
          <span className="text-yellow-400">★</span>
        ) : (
          <span className="text-gray-300">☆</span>
        )}
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
    }`}>
      {/* Navbar */}
      <ChefNavbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-2 flex items-center justify-center">
            <span className="text-6xl mr-3">⭐</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600">
              Customer Feedbacks
            </span>
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            See what customers think about our menu and your orders
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'menu'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            🍽️ Menu Items ({menuFeedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'order'
                ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-lg scale-105'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            📦 My Orders ({orderFeedbacks.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Menu Feedbacks Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                {menuFeedbacks.length === 0 ? (
                  <div className={`rounded-2xl shadow-xl p-12 text-center ${
                    theme === 'dark' 
                      ? 'bg-gray-800/80 backdrop-blur-lg' 
                      : 'bg-white/80 backdrop-blur-lg'
                  }`}>
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      No Menu Feedbacks Yet
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Menu item feedbacks will appear here when customers rate them.
                    </p>
                  </div>
                ) : (
                  menuFeedbacks.map((feedback) => (
                    <div
                      key={feedback._id}
                      className={`rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border ${
                        theme === 'dark' 
                          ? 'bg-gray-800/80 backdrop-blur-lg border-gray-700' 
                          : 'bg-white/80 backdrop-blur-lg border-purple-100'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Menu Item Image */}
                        {feedback.menuItem?.image && (
                          <img
                            src={`http://localhost:5000${feedback.menuItem.image}`}
                            alt={feedback.menuItem.name}
                            className="w-24 h-24 object-cover rounded-xl shadow-md"
                          />
                        )}

                        <div className="flex-1">
                          {/* Item Name */}
                          <h3 className={`text-xl font-bold mb-1 ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>
                            {feedback.menuItem?.name || 'Unknown Item'}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center mb-2">
                            {renderStars(feedback.rating)}
                            <span className={`ml-2 text-sm font-semibold ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {feedback.rating}/5
                            </span>
                          </div>

                          {/* Comment */}
                          {feedback.comment && (
                            <p className={`mb-3 italic ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              "{feedback.comment}"
                            </p>
                          )}

                          {/* Footer */}
                          <div className={`flex items-center justify-between text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <span>
                              👤 <span className="font-semibold">{feedback.user?.name}</span>
                            </span>
                            <span>📅 {formatDate(feedback.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Order Feedbacks Tab */}
            {activeTab === 'order' && (
              <div className="space-y-6">
                {orderFeedbacks.length === 0 ? (
                  <div className={`rounded-2xl shadow-xl p-12 text-center ${
                    theme === 'dark' 
                      ? 'bg-gray-800/80 backdrop-blur-lg' 
                      : 'bg-white/80 backdrop-blur-lg'
                  }`}>
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      No Order Feedbacks Yet
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Feedbacks for orders you've handled will appear here.
                    </p>
                  </div>
                ) : (
                  orderFeedbacks.map((feedback) => (
                    <div
                      key={feedback._id}
                      className={`rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border ${
                        theme === 'dark' 
                          ? 'bg-gray-800/80 backdrop-blur-lg border-gray-700' 
                          : 'bg-white/80 backdrop-blur-lg border-orange-100'
                      }`}
                    >
                      <div className="flex-1">
                        {/* Order Info */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>
                            📦 Order #{feedback.order?._id?.slice(-6) || 'N/A'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            theme === 'dark'
                              ? 'bg-green-900/30 text-green-300'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            ✓ You handled this
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          {renderStars(feedback.rating)}
                          <span className={`ml-2 text-sm font-semibold ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {feedback.rating}/5
                          </span>
                        </div>

                        {/* Comment */}
                        {feedback.comment && (
                          <p className={`mb-3 italic p-3 rounded-lg ${
                            theme === 'dark'
                              ? 'text-gray-200 bg-orange-900/30'
                              : 'text-gray-700 bg-orange-50'
                          }`}>
                            "{feedback.comment}"
                          </p>
                        )}

                        {/* Order Details */}
                        {feedback.order && (
                          <div className={`rounded-lg p-3 mb-3 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <span className="font-semibold">Total Amount:</span> Rs.{' '}
                              {feedback.order.totalPrice}
                            </p>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <span className="font-semibold">Status:</span>{' '}
                              <span className="capitalize">{feedback.order.status}</span>
                            </p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className={`flex items-center justify-between text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span>
                            👤 <span className="font-semibold">{feedback.user?.name}</span>
                          </span>
                          <span>📅 {formatDate(feedback.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChefFeedback;

