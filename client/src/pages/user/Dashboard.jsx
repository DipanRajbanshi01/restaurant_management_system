import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { menuService } from '../../services/menuService';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import { feedbackService } from '../../services/feedbackService';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import { ThemeContext } from '../../context/ThemeContext';
import UserNavbar from '../../components/navbars/UserNavbar';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const socket = useSocket();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem('restaurantCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [hoveredFeedbackRating, setHoveredFeedbackRating] = useState(0);
  const [ratingStats, setRatingStats] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
    fetchNotifications();
    fetchRatingStats();
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await userService.getFavorites();
      if (response.success) {
        setFavorites(response.data.map(item => item._id || item));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (itemId) => {
    try {
      const response = await userService.toggleFavorite(itemId);
      if (response.success) {
        setFavorites(response.data.favorites);
        toast.success(response.data.isFavorite ? 'Added to favorites!' : 'Removed from favorites!');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('order-ready', (data) => {
        toast.success(data.message);
        fetchOrders();
        fetchNotifications();
      });
    }
  }, [socket]);

  const fetchMenuItems = async () => {
    try {
      const response = await menuService.getMenuItems();
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const response = await feedbackService.getRatingStats();
      if (response.success) {
        setRatingStats(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    }
  };

  const openInstructionsModal = (item) => {
    setSelectedItem(item);
    setSpecialInstructions('');
    setShowInstructionsModal(true);
  };

  const addToCart = (item, instructions = '') => {
    const existingItem = cart.find((cartItem) => cartItem.item._id === item._id && cartItem.specialInstructions === instructions);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.item._id === item._id && cartItem.specialInstructions === instructions
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { item, quantity: 1, price: item.price, specialInstructions: instructions }]);
    }
    toast.success('Item added to cart');
    setShowInstructionsModal(false);
    setSelectedItem(null);
    setSpecialInstructions('');
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((cartItem) => cartItem.item._id !== itemId));
  };

  const updateQuantity = (idx, quantity) => {
    if (quantity <= 0) {
      const updatedCart = [...cart];
      updatedCart.splice(idx, 1);
      setCart(updatedCart);
      return;
    }
    setCart(
      cart.map((cartItem, index) =>
        index === idx ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const openFeedbackModal = (item) => {
    setFeedbackItem(item);
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
        menuItem: feedbackItem._id,
        rating: feedbackRating,
        comment: feedbackComment,
      });
      toast.success('Thank you for your feedback!');
      setShowFeedbackModal(false);
      setFeedbackItem(null);
      setFeedbackRating(0);
      setFeedbackComment('');
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit feedback');
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const orderData = {
        items: cart.map((cartItem) => ({
          item: cartItem.item._id,
          quantity: cartItem.quantity,
          price: cartItem.price,
          specialInstructions: cartItem.specialInstructions || '',
        })),
        totalPrice: getTotalPrice(),
        paymentMethod,
      };

      const response = await orderService.createOrder(orderData);
      if (response.success) {
        toast.success('Order placed successfully!');
        setCart([]);
        localStorage.removeItem('restaurantCart'); // Clear cart from localStorage
        setShowCart(false);
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getItemRating = (itemId) => {
    const stat = ratingStats.find(s => s.menuItemId === itemId);
    return stat ? {
      average: stat.averageRating,
      count: stat.totalFeedbacks
    } : null;
  };

  const { theme } = useContext(ThemeContext);

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'
    }`}>
      {/* Special Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all ${
            theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white'
          }`}>
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-3">🍽️</span>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Special Instructions
              </span>
            </h3>
            {selectedItem && (
              <div className="mb-4">
                <p className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>{selectedItem.name}</p>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Rs. {selectedItem.price}</p>
              </div>
            )}
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                💬 Any special requests? (optional)
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="E.g., No onions, Extra spicy, Allergic to nuts, etc."
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none resize-none ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-200'
                }`}
                rows="4"
              />
              <p className={`text-xs mt-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                ⚠️ Chef will see these instructions
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowInstructionsModal(false);
                  setSelectedItem(null);
                  setSpecialInstructions('');
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
                onClick={() => addToCart(selectedItem, specialInstructions)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg"
              >
                ✓ Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all ${
            theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white'
          }`}>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              ⭐ Rate This Item
            </h3>
            {feedbackItem && (
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-800">{feedbackItem.name}</p>
                <p className="text-sm text-gray-600">Rs. {feedbackItem.price}</p>
              </div>
            )}
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
                    onMouseEnter={() => setHoveredFeedbackRating(star)}
                    onMouseLeave={() => setHoveredFeedbackRating(0)}
                    className="text-5xl focus:outline-none transition-all duration-150 transform hover:scale-110"
                  >
                    {star <= (hoveredFeedbackRating || feedbackRating) ? (
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
                placeholder="Share your experience with this item..."
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
                  setFeedbackItem(null);
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
      <UserNavbar orders={orders} cart={cart} showCart={showCart} setShowCart={setShowCart} />

      <div className="container mx-auto px-4 py-8">
        <div className={`grid gap-8 ${showCart ? 'md:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Menu Items */}
          <div className={showCart ? 'md:col-span-2' : 'col-span-1'}>
            <div className="flex justify-center items-center mb-6">
              <h2 className="text-3xl text-center font-bold flex items-center gap-3">
                <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>────୨ৎ────</span>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Our Menu</span>
                <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>────୨ৎ────</span>
              </h2>
            </div>
            
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search for delicious food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl shadow-lg border-2 border-transparent focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-100 placeholder-gray-400' 
                      : 'bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { name: 'All', icon: '🍽️' },
                { name: 'Favorites', icon: '❤️', special: true, isFavorites: true },
                { name: 'Top Rated', icon: '⭐', special: true },
                { name: 'Food', icon: '🍜' },
                { name: 'Drinks', icon: '🥤' },
                { name: 'Desserts', icon: '🍰' },
                { name: 'Appetizers', icon: '🥟' },
                { name: 'Others', icon: '🍴' }
              ].map(({ name, icon, special, isFavorites }) => (
                <button
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-md ${
                    selectedCategory === name
                      ? special 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                      : theme === 'dark'
                        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
                        : 'bg-white text-gray-700 hover:shadow-lg border border-gray-200'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
            
            {loading ? (
              <div className="text-center py-8">Loading menu...</div>
            ) : (
              <div className={`grid gap-6 ${showCart ? 'md:grid-cols-2' : 'md:grid-cols-3 lg:grid-cols-4'}`}>
                {menuItems
                  .filter((item) => {
                    // Filter by search query
                    const query = searchQuery.toLowerCase();
                    const matchesSearch = 
                      item.name.toLowerCase().includes(query) ||
                      item.description.toLowerCase().includes(query) ||
                      (item.category && item.category.toLowerCase().includes(query));
                    
                    // Filter by category
                    let matchesCategory;
                    if (selectedCategory === 'Top Rated') {
                      const rating = getItemRating(item._id);
                      matchesCategory = rating && rating.average >= 4.0;
                    } else {
                      matchesCategory = 
                        selectedCategory === 'All' || 
                        (item.category || 'Others') === selectedCategory;
                    }
                    
                    return matchesSearch && matchesCategory;
                  })
                  .map((item) => (
                  <div
                    key={item._id}
                    className={`group relative rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-100'
                    }`}
                  >
                    {/* Category Badge - Floating */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                        {item.category || 'Others'}
                      </span>
                    </div>

                    {/* Image Section with Overlay */}
                    <div className="relative h-64 overflow-hidden">
                      {item.image ? (
                        <>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                          <span className="text-6xl">🍽️</span>
                        </div>
                      )}
                      
                      {/* Chef's Special Badge */}
                      {item.isChefSpecial && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1 animate-pulse">
                            <span>⭐</span>
                            <span>CHEF'S SPECIAL</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 relative">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item._id);
                        }}
                        className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 ${
                          theme === 'dark' 
                            ? 'bg-gray-700/90 hover:bg-gray-700' 
                            : 'bg-white/90 hover:bg-white'
                        }`}
                        title={favorites.includes(item._id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <span className={`text-2xl ${favorites.includes(item._id) ? 'text-red-500' : 'text-gray-400'}`}>
                          {favorites.includes(item._id) ? '❤️' : '🤍'}
                        </span>
                      </button>
                      
                      {/* Decorative Element */}
                      <div className={`absolute -top-8 left-6 w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <span className="text-2xl">
                          {item.category === 'Drinks' ? '🥤' : 
                           item.category === 'Food' ? '🍜' : 
                           item.category === 'Desserts' ? '🍰' : 
                           item.category === 'Appetizers' ? '🥟' : '🍴'}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h3 className={`text-2xl font-bold mb-2 group-hover:text-orange-600 transition-colors ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                        }`}>
                          {item.name}
                        </h3>
                        <p className={`mb-4 line-clamp-2 leading-relaxed ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {item.description}
                        </p>
                        
                        {/* Rating Display */}
                        {(() => {
                          const rating = getItemRating(item._id);
                          return rating ? (
                            <div className={`flex items-center space-x-2 mb-3 pb-3 border-b ${
                              theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                            }`}>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-lg ${
                                      star <= Math.round(rating.average)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-gray-700">
                                {rating.average.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({rating.count} {rating.count === 1 ? 'review' : 'reviews'})
                              </span>
                            </div>
                          ) : null;
                        })()}
                        
                        <div className={`flex justify-between items-center pt-4 border-t ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                        }`}>
                          <div className="flex flex-col">
                            <span className={`text-sm font-medium ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>Price</span>
                            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                              Rs. {item.price}
                            </span>
                          </div>
                        <button
                          onClick={() => openInstructionsModal(item)}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                          <span>Add to Cart</span>
                          <span>🛒</span>
                        </button>
                        </div>
                        
                        {/* Rate Item Button */}
                        <button
                          onClick={() => openFeedbackModal(item)}
                          className={`w-full mt-3 px-4 py-2 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 border-2 ${
                            theme === 'dark'
                              ? 'bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/50 border-yellow-700'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300'
                          }`}
                        >
                          <span>⭐</span>
                          <span>Rate this item</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {menuItems.filter((item) => {
                  const query = searchQuery.toLowerCase();
                  const matchesSearch = 
                    item.name.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    (item.category && item.category.toLowerCase().includes(query));
                  let matchesCategory;
                  if (selectedCategory === 'Top Rated') {
                    const rating = getItemRating(item._id);
                    matchesCategory = rating && rating.average >= 4.0;
                  } else {
                    matchesCategory = 
                      selectedCategory === 'All' || 
                      (item.category || 'Others') === selectedCategory;
                  }
                  return matchesSearch && matchesCategory;
                }).length === 0 && (
                  <div className={`col-span-2 text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No menu items found {searchQuery && `matching "${searchQuery}"`} 
                    {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="md:col-span-1">
            {showCart && (
              <div className={`rounded-3xl shadow-2xl p-6 sticky top-24 border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-100'
              }`}>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="text-3xl mr-3">🛒</span>
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Your Cart
                  </span>
                </h2>
                {cart.length === 0 ? (
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-4">
                      {cart.map((cartItem, idx) => (
                        <div
                          key={`${cartItem.item._id}-${idx}`}
                          className={`border-b pb-3 ${
                            theme === 'dark' ? 'border-gray-700' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className={`font-semibold ${
                                theme === 'dark' ? 'text-gray-100' : ''
                              }`}>{cartItem.item.name}</p>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                Rs. {cartItem.price} x {cartItem.quantity}
                              </p>
                              {cartItem.specialInstructions && (
                                <div className={`mt-1 p-2 border rounded-lg ${
                                  theme === 'dark'
                                    ? 'bg-yellow-900/30 border-yellow-700'
                                    : 'bg-yellow-50 border-yellow-200'
                                }`}>
                                  <p className={`text-xs font-semibold ${
                                    theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                                  }`}>📝 Special Instructions:</p>
                                  <p className={`text-xs ${
                                    theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                                  }`}>{cartItem.specialInstructions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(idx, cartItem.quantity - 1)}
                              className={`px-2 py-1 rounded ${
                                theme === 'dark' 
                                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              -
                            </button>
                            <span className={`font-semibold ${
                              theme === 'dark' ? 'text-gray-200' : ''
                            }`}>{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(idx, cartItem.quantity + 1)}
                              className={`px-2 py-1 rounded ${
                                theme === 'dark' 
                                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              +
                            </button>
                            <button
                              onClick={() => {
                                const updatedCart = [...cart];
                                updatedCart.splice(idx, 1);
                                setCart(updatedCart);
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              🗑️
                            </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : ''
                      }`}>
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : ''
                        }`}
                      >
                        <option value="card">Card</option>
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <p className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-gray-100' : ''
                      }`}>
                        Total: Rs. {getTotalPrice().toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-2xl font-bold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      🎉 Place Order
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        {/* <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="px-4 py-3">#{order._id.slice(-6)}</td>
                    <td className="px-4 py-3">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="px-4 py-3">Rs. {order.totalPrice}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          order.status === 'ready'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cooking'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handlePayment(order._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> 
        </div> */}
      </div>
    </div> 
  );
};

export default UserDashboard;
