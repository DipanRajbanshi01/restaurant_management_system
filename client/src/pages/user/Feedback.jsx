import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { feedbackService } from '../../services/feedbackService';
import { toast } from 'react-toastify';
import UserNavbar from '../../components/navbars/UserNavbar';

const UserFeedback = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // New feedback form state
  const [showNewFeedbackForm, setShowNewFeedbackForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newHoveredRating, setNewHoveredRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Tab state and public feedbacks
  const [activeTab, setActiveTab] = useState('my');
  const [publicFeedbacks, setPublicFeedbacks] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  useEffect(() => {
    if (activeTab === 'public') {
      fetchPublicFeedbacks();
    }
  }, [activeTab]);

  const fetchMyFeedbacks = async () => {
    try {
      const response = await feedbackService.getMyFeedbacks();
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicFeedbacks = async () => {
    try {
      setPublicLoading(true);
      const response = await feedbackService.getFeedbacks(1, 50);
      setPublicFeedbacks(response.data || []);
    } catch (error) {
      console.error('Error fetching public feedbacks:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setPublicLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback._id);
    setEditRating(feedback.rating);
    setEditComment(feedback.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleUpdateFeedback = async (feedbackId) => {
    if (editRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await feedbackService.updateFeedback(feedbackId, {
        rating: editRating,
        comment: editComment,
      });
      toast.success('Feedback updated successfully!');
      setEditingFeedback(null);
      fetchMyFeedbacks();
    } catch (error) {
      toast.error('Failed to update feedback');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await feedbackService.deleteFeedback(feedbackId);
      toast.success('Feedback deleted successfully!');
      fetchMyFeedbacks();
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  const handleSubmitNewFeedback = async (e) => {
    e.preventDefault();
    
    if (newRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please write your feedback');
      return;
    }

    try {
      setSubmittingFeedback(true);
      await feedbackService.createFeedback({
        rating: newRating,
        comment: newComment.trim(),
      });
      toast.success('Thank you for your feedback!');
      setShowNewFeedbackForm(false);
      setNewRating(0);
      setNewComment('');
      fetchMyFeedbacks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (rating, isEditing = false, feedbackId = null) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-3xl ${isEditing ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        onClick={() => isEditing && setEditRating(star)}
        onMouseEnter={() => isEditing && setHoveredRating(star)}
        onMouseLeave={() => isEditing && setHoveredRating(0)}
      >
        {star <= (isEditing ? (hoveredRating || editRating) : rating) ? (
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
        : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'
    }`}>
      {/* Navbar */}
      <UserNavbar orders={[]} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <span className="text-5xl mr-3">📝</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Feedback & Reviews
            </span>
          </h1>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Share your experience and explore what others are saying</p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex space-x-2 mb-8 rounded-2xl p-2 shadow-lg border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'my'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mr-2">📝</span>
            My Feedback
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'public'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mr-2">🌟</span>
            Browse Reviews
          </button>
        </div>

        {/* My Feedback Tab Content */}
        {activeTab === 'my' && (
          <>
            {/* New General Feedback Button/Form */}
            <div className="mb-8">
          {!showNewFeedbackForm ? (
            <button
              onClick={() => setShowNewFeedbackForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl px-6 py-3 shadow-md hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center space-x-2 font-semibold text-sm"
            >
              <span className="text-lg">💬</span>
              <span>Share Your Experience & Recommendations</span>
            </button>
          ) : (
            <div className={`rounded-3xl p-8 shadow-xl border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  <span className="text-3xl mr-3">💬</span>
                  Share Your Feedback
                </h2>
                <button
                  onClick={() => {
                    setShowNewFeedbackForm(false);
                    setNewRating(0);
                    setNewComment('');
                  }}
                  className={`text-2xl ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitNewFeedback}>
                {/* Rating */}
                <div className="mb-6">
                  <label className={`block text-sm font-semibold mb-3 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setNewHoveredRating(star)}
                        onMouseLeave={() => setNewHoveredRating(0)}
                        className="text-5xl focus:outline-none transition-all duration-150 transform hover:scale-110"
                      >
                        {star <= (newHoveredRating || newRating) ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-300'}>☆</span>
                        )}
                      </button>
                    ))}
                    {newRating > 0 && (
                      <span className={`ml-3 text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {newRating} out of 5
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className={`block text-sm font-semibold mb-3 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience, recommendations, or suggestions about our restaurant..."
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-orange-500 focus:outline-none resize-none ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'border-gray-200'
                    }`}
                    rows="5"
                    maxLength="500"
                  />
                  <p className={`text-xs mt-1 text-right ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {newComment.length}/500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingFeedback ? 'Submitting...' : '✓ Submit Feedback'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewFeedbackForm(false);
                      setNewRating(0);
                      setNewComment('');
                    }}
                    className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'border-gray-600 text-gray-200 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-orange-500 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading feedbacks...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className={`rounded-3xl p-12 text-center shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>No Feedback Yet</h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>You haven't left any feedback yet.</p>
            <Link
              to="/user/dashboard"
              className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
            >
              Browse Menu & Give Feedback
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className={`rounded-3xl p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-1 ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {feedback.menuItem ? (
                        <>🍽️ {feedback.menuItem.name}</>
                      ) : feedback.order ? (
                        <>📦 Order #{feedback.order._id?.slice(-6)}</>
                      ) : (
                        <>💬 General Feedback</>
                      )}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {feedback.menuItem?.image && (
                    <img
                      src={`http://localhost:5000${feedback.menuItem.image}`}
                      alt={feedback.menuItem.name}
                      className="w-16 h-16 rounded-xl object-cover ml-4"
                    />
                  )}
                </div>

                {editingFeedback === feedback._id ? (
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Rating
                      </label>
                      <div className="flex items-center space-x-1">
                        {renderStars(editRating, true, feedback._id)}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Comment
                      </label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'border-gray-200'
                        }`}
                        rows="3"
                        maxLength="500"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateFeedback(feedback._id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(feedback.rating)}
                    </div>

                    {feedback.comment && (
                      <p className={`p-3 rounded-xl ${
                        theme === 'dark' 
                          ? 'text-gray-200 bg-gray-700' 
                          : 'text-gray-700 bg-gray-50'
                      }`}>
                        {feedback.comment}
                      </p>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleEdit(feedback)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFeedback(feedback._id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {/* Browse Reviews Tab Content */}
        {activeTab === 'public' && (
          <>
            {/* Filter Buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
              {['all', 'menuItem', 'order', 'general'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    filterCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : theme === 'dark'
                        ? 'bg-gray-800 text-gray-200 border-2 border-gray-700 hover:border-orange-500'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {category === 'all' && '🌟 All Reviews'}
                  {category === 'menuItem' && '🍽️ Menu Items'}
                  {category === 'order' && '📦 Orders'}
                  {category === 'general' && '💬 General'}
                </button>
              ))}
            </div>

            {publicLoading ? (
              <div className="text-center py-12">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-orange-500 ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}></div>
                <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading reviews...</p>
              </div>
            ) : (
              (() => {
                const filteredFeedbacks = publicFeedbacks.filter((f) => {
                  if (filterCategory === 'all') return true;
                  if (filterCategory === 'menuItem') return f.menuItem;
                  if (filterCategory === 'order') return f.order;
                  if (filterCategory === 'general') return !f.menuItem && !f.order;
                  return true;
                });

                return filteredFeedbacks.length === 0 ? (
                  <div className={`rounded-3xl p-12 text-center shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <span className="text-6xl mb-4 block">🔍</span>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>No Reviews Found</h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No reviews available in this category yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredFeedbacks.map((feedback) => (
                      <div
                        key={feedback._id}
                        className={`rounded-3xl p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-100'
                        }`}
                      >
                        {/* Header with User Info */}
                        <div className={`flex items-center justify-between mb-4 pb-4 border-b-2 ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                              {feedback.user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className={`font-semibold ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                              }`}>{feedback.user?.name || 'Anonymous'}</p>
                              <p className={`text-xs ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {new Date(feedback.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          {feedback.menuItem?.image && (
                            <img
                              src={`http://localhost:5000${feedback.menuItem.image}`}
                              alt={feedback.menuItem.name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-2xl">
                              {star <= feedback.rating ? (
                                <span className="text-yellow-400">★</span>
                              ) : (
                                <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-300'}>☆</span>
                              )}
                            </span>
                          ))}
                          <span className={`ml-2 text-sm font-semibold ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {feedback.rating}/5
                          </span>
                        </div>

                        {/* Feedback Type & Title */}
                        <h3 className={`text-lg font-bold mb-2 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                        }`}>
                          {feedback.menuItem ? (
                            <>🍽️ {feedback.menuItem.name}</>
                          ) : feedback.order ? (
                            <>📦 Order #{feedback.order._id?.slice(-6)}</>
                          ) : (
                            <>💬 General Feedback</>
                          )}
                        </h3>

                        {/* Comment */}
                        {feedback.comment && (
                          <div className={`p-4 rounded-xl border-l-4 ${
                            theme === 'dark'
                              ? 'bg-orange-900/30 border-orange-700'
                              : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-400'
                          }`}>
                            <p className={`text-sm leading-relaxed ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              "{feedback.comment}"
                            </p>
                          </div>
                        )}

                        {/* Helpful Badge for High Ratings */}
                        {feedback.rating >= 4 && (
                          <div className={`mt-4 inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            theme === 'dark'
                              ? 'bg-green-900/30 text-green-300'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            <span>✓</span>
                            <span>Recommended</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserFeedback;

