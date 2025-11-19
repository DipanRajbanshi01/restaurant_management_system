import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { feedbackService } from '../../services/feedbackService';
import { toast } from 'react-toastify';
import UserNavbar from '../../components/navbars/UserNavbar';

const UserOrders = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'history'
  const [countdowns, setCountdowns] = useState({}); // Store countdown timers for each order
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [orderFeedbacks, setOrderFeedbacks] = useState({}); // Track which orders have feedback

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'completed');
      toast.success('Order completed and moved to history!');
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const handlePayment = async (orderId) => {
    try {
      await orderService.updatePaymentStatus(orderId, 'paid');
      toast.success('Payment successful!');
      fetchOrders();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      await orderService.updateOrderStatus(orderId, 'cancelled');
      toast.success('Order cancelled successfully!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const openFeedbackModal = (order) => {
    setSelectedOrder(order);
    setFeedbackRating(0);
    setFeedbackComment('');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await feedbackService.createFeedback({
        order: selectedOrder._id,
        rating: feedbackRating,
        comment: feedbackComment,
      });
      toast.success('Thank you for your feedback!');
      setShowFeedbackModal(false);
      setSelectedOrder(null);
      setFeedbackRating(0);
      setFeedbackComment('');
      // Mark this order as having feedback
      setOrderFeedbacks(prev => ({ ...prev, [selectedOrder._id]: true }));
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit feedback');
      }
    }
  };

  // Check which orders have feedback
  useEffect(() => {
    const checkOrderFeedbacks = async () => {
      try {
        const response = await feedbackService.getMyFeedbacks();
        const feedbacks = response.data || [];
        const feedbackMap = {};
        feedbacks.forEach(feedback => {
          if (feedback.order) {
            feedbackMap[feedback.order] = true;
          }
        });
        setOrderFeedbacks(feedbackMap);
      } catch (error) {
        console.error('Error checking order feedbacks:', error);
      }
    };

    if (orders.length > 0) {
      checkOrderFeedbacks();
    }
  }, [orders]);

  // Separate ongoing and history orders
  const ongoingOrders = orders.filter(
    (order) => ['pending', 'cooking', 'ready'].includes(order.status)
  );
  const historyOrders = orders.filter(
    (order) => ['completed', 'cancelled'].includes(order.status)
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-complete ready orders after 3 minutes
  useEffect(() => {
    if (orders.length === 0) return;

    const timers = [];
    const countdownIntervals = [];
    
    ongoingOrders.forEach((order) => {
      if (order.status === 'ready') {
        const orderTime = new Date(order.updatedAt || order.createdAt).getTime();
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - orderTime;
        const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds
        
        // If already past 3 minutes, complete immediately
        if (elapsedTime >= threeMinutes) {
          completeOrder(order._id);
        } else {
          // Set timer for remaining time
          const remainingTime = threeMinutes - elapsedTime;
          const timer = setTimeout(() => {
            completeOrder(order._id);
          }, remainingTime);
          timers.push(timer);

          // Update countdown every second
          const updateCountdown = () => {
            const now = new Date().getTime();
            const elapsed = now - orderTime;
            const remaining = threeMinutes - elapsed;
            
            if (remaining <= 0) {
              setCountdowns((prev) => ({ ...prev, [order._id]: 0 }));
            } else {
              setCountdowns((prev) => ({ ...prev, [order._id]: Math.ceil(remaining / 1000) }));
            }
          };

          // Initial update
          updateCountdown();

          // Update every second
          const interval = setInterval(updateCountdown, 1000);
          countdownIntervals.push(interval);
        }
      }
    });

    // Cleanup timers on unmount or when orders change
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      countdownIntervals.forEach((interval) => clearInterval(interval));
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Feedback Modal */}
      {showFeedbackModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              ⭐ Rate Your Order Experience
            </h3>
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-800">Order #{selectedOrder._id.slice(-6)}</p>
              <p className="text-sm text-gray-600">Total: Rs. {selectedOrder.totalPrice}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-5xl focus:outline-none transition-all duration-150 transform hover:scale-110"
                  >
                    {star <= (hoveredRating || feedbackRating) ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-300">☆</span>
                    )}
                  </button>
                ))}
                {feedbackRating > 0 && (
                  <span className="ml-3 text-sm font-semibold text-gray-600">
                    {feedbackRating} out of 5
                  </span>
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Tell us about your order experience..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all duration-300 outline-none resize-none"
                rows="4"
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedbackComment.length}/500 characters
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedOrder(null);
                  setFeedbackRating(0);
                  setFeedbackComment('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg"
              >
                ⭐ Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <UserNavbar orders={orders} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <span className="text-5xl mr-3">📋</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              My Orders
            </span>
          </h1>
          <p className="text-gray-600">Track your orders and view order history</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'ongoing'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            🔥 Ongoing Orders
            {ongoingOrders.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                {ongoingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            📜 Order History
            {historyOrders.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                {historyOrders.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <div>
            {/* Ongoing Orders */}
            {activeTab === 'ongoing' && (
              <div className="space-y-4">
                {ongoingOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                    <span className="text-6xl mb-4 block">🍽️</span>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Ongoing Orders</h3>
                    <p className="text-gray-500">You don't have any active orders right now.</p>
                    <Link
                      to="/user/dashboard"
                      className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                    >
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  ongoingOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-800">
                              Order #{order._id.slice(-6)}
                            </h3>
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                order.status === 'ready'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'cooking'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.status === 'ready' ? '✓ Ready' : order.status === 'cooking' ? '🍳 Cooking' : '⏳ Pending'}
                            </span>
                            {order.status === 'ready' && countdowns[order._id] > 0 && (
                              <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 animate-pulse">
                                ⏱️ Auto-complete in {Math.floor(countdowns[order._id] / 60)}:{String(countdowns[order._id] % 60).padStart(2, '0')}
                              </span>
                            )}
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'cancelled'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.paymentStatus === 'paid' ? '💳 Paid' : order.paymentStatus === 'cancelled' ? '✕ Cancelled' : '💰 Unpaid'}
                            </span>
                          </div>
                          
                          <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                              <span className="mr-2">🍽️</span> Items:
                            </h4>
                            <div className="space-y-1">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="text-gray-600 flex items-start">
                                  <span className="mr-2">•</span>
                                  <div className="flex-1">
                                    <span className="font-medium">{item.item?.name || 'N/A'}</span>
                                    <span className="text-gray-500"> x {item.quantity}</span>
                                    {item.specialInstructions && (
                                      <div className="mt-1 ml-4 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded text-xs">
                                        <span className="font-semibold text-yellow-800">📝 Note:</span>
                                        <span className="text-yellow-700"> {item.specialInstructions}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="lg:text-right space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                              Rs. {order.totalPrice}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => handlePayment(order._id)}
                                className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                              >
                                💳 Pay Now
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                              >
                                ✕ Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Order History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {historyOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                    <span className="text-6xl mb-4 block">📜</span>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Order History</h3>
                    <p className="text-gray-500">You haven't completed any orders yet.</p>
                  </div>
                ) : (
                  historyOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300 opacity-90"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-800">
                              Order #{order._id.slice(-6)}
                            </h3>
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                order.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status === 'completed' ? '✓ Completed' : '✗ Cancelled'}
                            </span>
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'cancelled'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.paymentStatus === 'paid' ? '💳 Paid' : order.paymentStatus === 'cancelled' ? '✕ Cancelled' : '💰 Unpaid'}
                            </span>
                          </div>
                          
                          <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                              <span className="mr-2">🍽️</span> Items:
                            </h4>
                            <div className="space-y-1">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="text-gray-600">
                                  <span className="mr-2">•</span>
                                  <span className="font-medium">{item.item?.name || 'N/A'}</span>
                                  <span className="text-gray-500"> x {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="lg:text-right space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-3xl font-bold text-gray-700">
                              Rs. {order.totalPrice}
                            </p>
                          </div>
                          {order.status === 'completed' && (
                            orderFeedbacks[order._id] ? (
                              <div className="w-full lg:w-auto px-6 py-3 bg-green-100 text-green-700 rounded-2xl font-semibold border-2 border-green-300 text-center">
                                ✓ Feedback Submitted
                              </div>
                            ) : (
                              <button
                                onClick={() => openFeedbackModal(order)}
                                className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg"
                              >
                                ⭐ Leave Feedback
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
