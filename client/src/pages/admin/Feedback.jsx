import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { feedbackService } from '../../services/feedbackService';
import { notificationService } from '../../services/notificationService';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/navbars/AdminNavbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminFeedback = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [ratingStats, setRatingStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const limit = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch feedbacks with pagination
      const feedbackResponse = await feedbackService.getFeedbacks(currentPage, limit);
      setFeedbacks(feedbackResponse.data || []);
      setPagination(feedbackResponse.pagination || {});

      // Fetch rating statistics
      const statsResponse = await feedbackService.getRatingStats();
      setRatingStats(statsResponse.data || []);

      // Fetch notifications (feedback type)
      const notifResponse = await notificationService.getNotifications();
      const feedbackNotifs = notifResponse.data?.filter(n => n.type === 'feedback') || [];
      setNotifications(feedbackNotifs);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await feedbackService.deleteFeedback(feedbackId);
      toast.success('Feedback deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      fetchData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className="text-xl">
        {star <= rating ? (
          <span className="text-yellow-400">★</span>
        ) : (
          <span className="text-gray-300">☆</span>
        )}
      </span>
    ));
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Navbar */}
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <span className="text-5xl mr-3">📊</span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Feedback Management
            </span>
          </h1>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Monitor customer feedback and ratings</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-purple-500 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
            <p className={`mt-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Loading feedback data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Low Rating Notifications */}
            {notifications.length > 0 && (
              <div className={`rounded-3xl p-6 shadow-lg border-2 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-red-800' 
                  : 'bg-white border-red-200'
              }`}>
                <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                  <span className="mr-2">⚠️</span> Low Rating Alerts ({notifications.filter(n => !n.read).length})
                </h2>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                        notif.read 
                          ? theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          : theme === 'dark' ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-300'
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}>{notif.message}</p>
                        <p className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkNotificationRead(notif._id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Statistics Chart */}
            {ratingStats.length > 0 && (
              <div className={`rounded-3xl p-6 shadow-lg border-2 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 flex items-center ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  <span className="text-3xl mr-3">📈</span>
                  <span>Average Ratings by Menu Item</span>
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={ratingStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="menuItemName" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageRating" fill="#f59e0b" name="Average Rating (out of 5)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* All Feedbacks List */}
            <div className={`rounded-3xl p-6 shadow-lg border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 flex items-center ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                <span className="text-3xl mr-3">📝</span>
                <span>All Feedbacks ({pagination.total || 0})</span>
              </h2>

              {feedbacks.length === 0 ? (
                <div className={`text-center py-12 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span className="text-6xl mb-4 block">📝</span>
                  <p>No feedbacks yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback._id}
                        className={`border-2 rounded-2xl p-4 hover:border-purple-300 transition-all duration-300 ${
                          theme === 'dark' 
                            ? 'border-gray-700' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-bold ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                              }`}>
                                {feedback.menuItem ? (
                                  <>🍽️ {feedback.menuItem.name}</>
                                ) : feedback.order ? (
                                  <>📦 Order #{feedback.order._id.slice(-6)}</>
                                ) : (
                                  <>💬 General Feedback</>
                                )}
                              </h3>
                              {feedback.menuItem?.image && (
                                <img
                                  src={`http://localhost:5000${feedback.menuItem.image}`}
                                  alt={feedback.menuItem.name}
                                  className="w-12 h-12 rounded-xl object-cover"
                                />
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              By: <span className="font-semibold">{feedback.user?.name || 'Anonymous'}</span>
                              {' | '}
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-1 mb-2">
                              {renderStars(feedback.rating)}
                              <span className={`ml-2 text-sm font-semibold ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                ({feedback.rating}/5)
                              </span>
                            </div>
                            {feedback.comment && (
                              <p className={`p-3 rounded-xl mt-2 ${
                                theme === 'dark' 
                                  ? 'text-gray-200 bg-gray-700' 
                                  : 'text-gray-700 bg-gray-50'
                              }`}>
                                "{feedback.comment}"
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteFeedback(feedback._id)}
                            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        ← Previous
                      </button>
                      <span className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Page {currentPage} of {pagination.pages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                        className={`px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;

