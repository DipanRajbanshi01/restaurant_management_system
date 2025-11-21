import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { toast } from 'react-toastify';
import ChefNavbar from '../../components/navbars/ChefNavbar';

const ChefDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chefSpecials, setChefSpecials] = useState([]);
  const [showSpecialForm, setShowSpecialForm] = useState(false);
  const [specialFormData, setSpecialFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Food',
    image: '',
  });
  const [estimatedTimeModal, setEstimatedTimeModal] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(30);

  useEffect(() => {
    fetchOrders();
    fetchChefSpecials();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChefSpecials = async () => {
    try {
      const response = await menuService.getMenuItems();
      // Filter for chef specials only
      const specials = response.data?.filter(item => item.isChefSpecial) || [];
      setChefSpecials(specials);
    } catch (error) {
      console.error('Error fetching chef specials:', error);
    }
  };

  const handleCreateSpecial = async (e) => {
    e.preventDefault();
    
    if (!specialFormData.name || !specialFormData.price) {
      toast.error('Please provide item name and price');
      return;
    }

    try {
      const response = await menuService.createChefSpecial(specialFormData);
      if (response.success) {
        toast.success("Chef's special created successfully!");
        setShowSpecialForm(false);
        setSpecialFormData({
          name: '',
          description: '',
          price: '',
          category: 'Food',
          image: '',
        });
        fetchChefSpecials();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create special');
    }
  };

  const handleRemoveSpecial = async (id) => {
    if (!window.confirm("Remove this chef's special?")) return;

    try {
      const response = await menuService.removeChefSpecial(id);
      if (response.success) {
        toast.success("Chef's special removed successfully");
        fetchChefSpecials();
      }
    } catch (error) {
      toast.error('Failed to remove special');
    }
  };

  const updateOrderStatus = async (orderId, status, estimatedTimeMinutes = null) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      if (response.success) {
        // If starting to cook, set estimated time
        if (status === 'cooking' && estimatedTimeMinutes) {
          await orderService.updateEstimatedTime(orderId, estimatedTimeMinutes);
        }
        toast.success(`Order status updated to ${status}`);
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const cookingOrders = orders.filter((o) => o.status === 'cooking');

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Navbar */}
      <ChefNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Pending Orders</h3>
            <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Cooking</h3>
            <p className="text-3xl font-bold text-yellow-600">{cookingOrders.length}</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
          </div>
        </div>

        {/* Orders */}
        <h2 className={`text-2xl font-bold mb-4 ${
          theme === 'dark' ? 'text-gray-100' : ''
        }`}>Orders</h2>
        {loading ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-300' : ''
          }`}>Loading orders...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`rounded-lg shadow-md p-6 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-gray-100' : ''
                    }`}>Order #{order._id.slice(-6)}</h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Customer: {order.user?.name || 'N/A'}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Total: Rs. {order.totalPrice}
                    </p>
                    {order.chef && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center ${
                          theme === 'dark'
                            ? 'text-purple-300 bg-purple-900/30'
                            : 'text-purple-600 bg-purple-50'
                        }`}>
                          👨‍🍳 {order.chef._id === user?.id ? 'You are' : order.chef.name + ' is'} cooking this
                        </span>
                        {order.estimatedTime && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center ${
                            theme === 'dark'
                              ? 'text-blue-300 bg-blue-900/30'
                              : 'text-blue-600 bg-blue-50'
                          }`}>
                            ⏱️ Est. {order.estimatedTime} min
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      order.status === 'ready'
                        ? theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                        : order.status === 'cooking'
                        ? theme === 'dark' ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                        : theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className={`font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Items:</h4>
                  <ul className="space-y-2">
                    {order.items?.map((item, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex justify-between items-start">
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                          }`}>
                            • {item.item?.name || 'N/A'} x {item.quantity}
                          </span>
                        </div>
                        {item.specialInstructions && (
                          <div className={`ml-4 mt-1 p-2 border-l-4 rounded ${
                            theme === 'dark'
                              ? 'bg-yellow-900/30 border-yellow-700'
                              : 'bg-yellow-50 border-yellow-400'
                          }`}>
                            <p className={`text-xs font-semibold flex items-center ${
                              theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                            }`}>
                              <span className="mr-1">⚠️</span> Special Instructions:
                            </p>
                            <p className={`text-xs mt-1 font-medium ${
                              theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                            }`}>
                              {item.specialInstructions}
                            </p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col space-y-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'cooking')}
                      className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-all duration-300 font-semibold"
                    >
                      🍳 Start Cooking
                    </button>
                  )}
                  {order.status === 'cooking' && order.chef && order.chef._id === user?.id && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-300 font-semibold"
                    >
                      ✓ Mark Ready
                    </button>
                  )}
                  {order.status === 'cooking' && order.chef && order.chef._id !== user?.id && (
                    <div className={`w-full py-2 rounded-lg text-center font-semibold border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 border-gray-600'
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      🔒 {order.chef.name} is handling this order
                    </div>
                  )}
                  {order.status === 'ready' && order.chef && (
                    <div className={`w-full py-2 rounded-lg text-center font-semibold border-2 ${
                      theme === 'dark'
                        ? 'bg-green-900/30 text-green-200 border-green-700'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      ✓ Order Ready (Prepared by {order.chef._id === user?.id ? 'You' : order.chef.name})
                    </div>
                  )}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className={`col-span-2 text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No orders available
              </div>
            )}
          </div>
        )}

        {/* Chef's Specials Section */}
        <div className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold flex items-center ${
              theme === 'dark' ? 'text-gray-100' : ''
            }`}>
              <span className="text-3xl mr-3">⭐</span>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Chef's Specials
              </span>
            </h2>
            <button
              onClick={() => setShowSpecialForm(!showSpecialForm)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
            >
              {showSpecialForm ? '✕ Cancel' : '+ Add Special'}
            </button>
          </div>

          {/* Chef Special Form */}
          {showSpecialForm && (
            <div className={`rounded-3xl p-6 shadow-xl mb-6 border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-purple-200'
            }`}>
              <form onSubmit={handleCreateSpecial} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={specialFormData.name}
                      onChange={(e) => setSpecialFormData({ ...specialFormData, name: e.target.value })}
                      required
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 focus:outline-none ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="e.g., Today's Special Pasta"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Price (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={specialFormData.price}
                      onChange={(e) => setSpecialFormData({ ...specialFormData, price: e.target.value })}
                      required
                      min="0"
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 focus:outline-none ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="150"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>Description</label>
                  <textarea
                    value={specialFormData.description}
                    onChange={(e) => setSpecialFormData({ ...specialFormData, description: e.target.value })}
                    rows="2"
                    className={`w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 focus:outline-none ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'border-gray-200'
                    }`}
                    placeholder="Describe your special dish..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>Category</label>
                    <select
                      value={specialFormData.category}
                      onChange={(e) => setSpecialFormData({ ...specialFormData, category: e.target.value })}
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 focus:outline-none ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                    >
                      <option value="Food">Food</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Appetizers">Appetizers</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>Image URL (Optional)</label>
                    <input
                      type="text"
                      value={specialFormData.image}
                      onChange={(e) => setSpecialFormData({ ...specialFormData, image: e.target.value })}
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 focus:outline-none ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="/images/..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg"
                >
                  ✨ Create Chef's Special
                </button>
              </form>
            </div>
          )}

          {/* Chef Specials List */}
          {chefSpecials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {chefSpecials.map((special) => (
                <div
                  key={special._id}
                  className={`rounded-2xl p-4 shadow-lg border-2 relative ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                  }`}
                >
                  <div className="absolute top-2 right-2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      ⭐ CHEF'S SPECIAL
                    </span>
                  </div>
                  {special.image && (
                    <img
                      src={`http://localhost:5000${special.image}`}
                      alt={special.name}
                      className="w-full h-32 object-cover rounded-xl mb-3"
                    />
                  )}
                  <h3 className={`font-bold text-lg mb-1 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}>{special.name}</h3>
                  {special.description && (
                    <p className={`text-sm mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{special.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-orange-600">Rs. {special.price}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      theme === 'dark'
                        ? 'bg-purple-900/30 text-purple-300'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {special.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSpecial(special._id)}
                    className="w-full mt-2 px-3 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`rounded-2xl p-8 text-center shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <span className="text-6xl mb-3 block">👨‍🍳</span>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>No chef's specials yet. Create one to highlight your signature dish!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;

