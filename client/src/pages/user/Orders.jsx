import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { orderService } from '../../services/orderService';
import { feedbackService } from '../../services/feedbackService';
import { esewaService, submitEsewaPayment } from '../../services/esewaService';
import { khaltiService } from '../../services/khaltiService';
import { toast } from 'react-toastify';
import UserNavbar from '../../components/navbars/UserNavbar';
import PrintReceipt from '../../components/common/PrintReceipt';

const UserOrders = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [printOrder, setPrintOrder] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

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
      // Find the order to check payment status
      const order = orders.find(o => o._id === orderId);
      if (order && order.paymentStatus === 'paid') {
        toast.success('Order completed and moved to history!');
      } else {
        toast.success('Order completed! Please complete payment to move it to history.');
      }
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const openPaymentModal = (order) => {
    setSelectedOrderForPayment(order);
    setPaymentMethod('card');
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedOrderForPayment) return;

    const orderId = selectedOrderForPayment._id;

    try {
      // If payment method is eSewa, initiate eSewa payment
      if (paymentMethod === 'esewa') {
        try {
          const esewaResponse = await esewaService.initiatePayment(orderId);
          if (esewaResponse.success) {
            // Submit form to eSewa
            submitEsewaPayment(esewaResponse.data.paymentUrl, esewaResponse.data.paymentData);
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
            return;
          } else {
            toast.error('Failed to initiate eSewa payment');
            return;
          }
        } catch (error) {
          console.error('eSewa payment initiation error:', error);
          toast.error('Failed to initiate eSewa payment');
          return;
        }
      }

      // If payment method is Khalti, initiate Khalti payment
      if (paymentMethod === 'khalti') {
        try {
          const khaltiResponse = await khaltiService.initiatePayment(orderId);
          if (khaltiResponse.success) {
            // Redirect to Khalti payment page
            window.location.href = khaltiResponse.data.paymentUrl;
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
            return;
          } else {
            toast.error('Failed to initiate Khalti payment');
            return;
          }
        } catch (error) {
          console.error('Khalti payment initiation error:', error);
          toast.error('Failed to initiate Khalti payment');
          return;
        }
      }

      // For other payment methods (cash, card), proceed normally
      await orderService.updatePaymentStatus(orderId, 'paid');
      toast.success('Payment successful!');
      setShowPaymentModal(false);
      setSelectedOrderForPayment(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
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
  // Ongoing: orders that are pending/cooking/ready OR completed but unpaid
  const ongoingOrders = orders.filter(
    (order) => {
      const isActiveStatus = ['pending', 'cooking', 'ready'].includes(order.status);
      const isCompletedButUnpaid = order.status === 'completed' && order.paymentStatus !== 'paid' && order.paymentStatus !== 'cancelled';
      return isActiveStatus || isCompletedButUnpaid;
    }
  );
  // History: orders that are completed AND paid, or cancelled
  const historyOrders = orders.filter(
    (order) => {
      const isCompletedAndPaid = order.status === 'completed' && order.paymentStatus === 'paid';
      const isCancelled = order.status === 'cancelled';
      return isCompletedAndPaid || isCancelled;
    }
  );

  // Filter orders based on search and status
  const filterOrders = (orderList) => {
    return orderList.filter((order) => {
      const matchesSearch = searchQuery === '' || 
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items?.some(item => item.item?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredOngoingOrders = filterOrders(ongoingOrders);
  const filteredHistoryOrders = filterOrders(historyOrders);

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
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'
    }`}>
      {/* Feedback Modal */}
      {showFeedbackModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              ⭐ Rate Your Order Experience
            </h3>
            <div className="mb-4">
              <p className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>Order #{selectedOrder._id.slice(-6)}</p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Total: Rs. {selectedOrder.totalPrice}</p>
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
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
                  <span className={`ml-3 text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feedbackRating} out of 5
                  </span>
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Comment (Optional)
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Tell us about your order experience..."
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all duration-300 outline-none resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'border-gray-200'
                }`}
                rows="4"
                maxLength="500"
              />
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
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
                className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
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

      {/* Print Receipt Modal */}
      {printOrder && (
        <PrintReceipt order={printOrder} onClose={() => setPrintOrder(null)} />
      )}

      {/* Payment Method Selection Modal */}
      {showPaymentModal && selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all ${
            theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white'
          }`}>
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-3">💳</span>
              <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Select Payment Method
              </span>
            </h3>
            <div className="mb-4">
              <p className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                Order #{selectedOrderForPayment._id.slice(-6)}
              </p>
              <p className={`text-2xl font-bold mt-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent`}>
                Rs. {selectedOrderForPayment.totalPrice}
              </p>
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-3 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Choose Payment Method
              </label>
              <div className="space-y-2">
                {[
                  { value: 'card', label: '💳 Card Payment', description: 'Pay with credit/debit card' },
                  { value: 'cash', label: '💵 Cash on Delivery', description: 'Pay when you receive your order' },
                  { value: 'esewa', label: '📱 eSewa', description: 'Pay using eSewa wallet' },
                  { value: 'khalti', label: '💳 Khalti', description: 'Pay using Khalti wallet' },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === method.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                        }`}>
                          {method.label}
                        </p>
                        <p className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {method.description}
                        </p>
                      </div>
                      {paymentMethod === method.value && (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedOrderForPayment(null);
                }}
                className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
              >
                💳 Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {editingNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-md w-full ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-gray-100' : ''
            }`}>📝 Order Notes</h3>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add any notes or comments about this order..."
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none mb-4 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-200'
              }`}
              rows="4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingNotes(null);
                  setOrderNotes('');
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await orderService.updateOrderNotes(editingNotes, orderNotes);
                    toast.success('Order notes updated!');
                    setEditingNotes(null);
                    setOrderNotes('');
                    fetchOrders();
                  } catch (error) {
                    toast.error('Failed to update notes');
                  }
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <span className="text-5xl mr-3">📋</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              My Orders
            </span>
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Track your orders and view order history</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'ongoing'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border-2 border-gray-700'
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
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border-2 border-gray-700'
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
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-orange-500 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading orders...</p>
          </div>
        ) : (
          <div>
            {/* Ongoing Orders */}
            {activeTab === 'ongoing' && (
              <div className="space-y-4">
                {filteredOngoingOrders.length === 0 ? (
                  <div className={`rounded-3xl p-12 text-center shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <span className="text-6xl mb-4 block">🍽️</span>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>No Ongoing Orders</h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>You don't have any active orders right now.</p>
                    <Link
                      to="/user/dashboard"
                      className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                    >
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  filteredOngoingOrders.map((order) => (
                    <div
                      key={order._id}
                      className={`rounded-3xl p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-3 mb-3">
                            <h3 className={`text-xl font-bold ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                            }`}>
                              Order #{order._id.slice(-6)}
                            </h3>
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                order.status === 'ready'
                                  ? theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                                  : order.status === 'cooking'
                                  ? theme === 'dark' ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                                  : theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
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
                                  ? theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'cancelled'
                                  ? theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                                  : theme === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.paymentStatus === 'paid' ? '💳 Paid' : order.paymentStatus === 'cancelled' ? '✕ Cancelled' : '💰 Unpaid'}
                            </span>
                          </div>
                          
                          <div className={`rounded-2xl p-4 mb-3 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <h4 className={`font-semibold mb-2 flex items-center ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              <span className="mr-2">🍽️</span> Items:
                            </h4>
                            <div className="space-y-1">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className={`flex items-start ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  <span className="mr-2">•</span>
                                  <div className="flex-1">
                                    <span className="font-medium">{item.item?.name || 'N/A'}</span>
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}> x {item.quantity}</span>
                                    {item.specialInstructions && (
                                      <div className={`mt-1 ml-4 p-2 border-l-4 rounded text-xs ${
                                        theme === 'dark'
                                          ? 'bg-yellow-900/30 border-yellow-700'
                                          : 'bg-yellow-50 border-yellow-400'
                                      }`}>
                                        <span className={`font-semibold ${
                                          theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                                        }`}>📝 Note:</span>
                                        <span className={theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'}> {item.specialInstructions}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`flex items-center justify-between text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <span>📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="lg:text-right space-y-3">
                          <div>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>Total Amount</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                              Rs. {order.totalPrice}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => openPaymentModal(order)}
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
                {filteredHistoryOrders.length === 0 ? (
                  <div className={`rounded-3xl p-12 text-center shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <span className="text-6xl mb-4 block">📜</span>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {historyOrders.length === 0 ? 'No Order History' : 'No Orders Match Your Search'}
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      {historyOrders.length === 0 
                        ? "You haven't completed any orders yet."
                        : 'Try adjusting your search or filter criteria.'}
                    </p>
                  </div>
                ) : (
                  filteredHistoryOrders.map((order) => (
                    <div
                      key={order._id}
                      className={`rounded-3xl p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 opacity-90 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      {/* Print and Notes buttons for history orders */}
                      <div className="flex justify-end gap-2 mb-3">
                        <button
                          onClick={() => setPrintOrder(order)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          🖨️ Print
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(order._id);
                            setOrderNotes(order.notes || '');
                          }}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                        >
                          📝 Notes
                        </button>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-3 mb-3">
                            <h3 className={`text-xl font-bold ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                            }`}>
                              Order #{order._id.slice(-6)}
                            </h3>
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                order.status === 'completed'
                                  ? theme === 'dark' ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'
                                  : theme === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status === 'completed' ? '✓ Completed' : '✗ Cancelled'}
                            </span>
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                order.paymentStatus === 'paid'
                                  ? theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'cancelled'
                                  ? theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                                  : theme === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.paymentStatus === 'paid' ? '💳 Paid' : order.paymentStatus === 'cancelled' ? '✕ Cancelled' : '💰 Unpaid'}
                            </span>
                          </div>
                          
                          <div className={`rounded-2xl p-4 mb-3 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <h4 className={`font-semibold mb-2 flex items-center ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              <span className="mr-2">🍽️</span> Items:
                            </h4>
                            <div className="space-y-1">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                  <span className="mr-2">•</span>
                                  <span className="font-medium">{item.item?.name || 'N/A'}</span>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}> x {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`flex items-center justify-between text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <span>📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="lg:text-right space-y-3">
                          <div>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>Total Amount</p>
                            <p className={`text-3xl font-bold ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                            }`}>
                              Rs. {order.totalPrice}
                            </p>
                          </div>
                          {order.status === 'completed' && (
                              orderFeedbacks[order._id] ? (
                              <div className={`w-full lg:w-auto px-6 py-3 rounded-2xl font-semibold border-2 text-center ${
                                theme === 'dark'
                                  ? 'bg-green-900/30 text-green-300 border-green-700'
                                  : 'bg-green-100 text-green-700 border-green-300'
                              }`}>
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
