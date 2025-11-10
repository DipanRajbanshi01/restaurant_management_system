import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { menuService } from '../../services/menuService';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const socket = useSocket();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
    fetchNotifications();
  }, []);

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

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.item._id === item._id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.item._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { item, quantity: 1, price: item.price }]);
    }
    toast.success('Item added to cart');
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((cartItem) => cartItem.item._id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(
      cart.map((cartItem) =>
        cartItem.item._id === itemId ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
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
        })),
        totalPrice: getTotalPrice(),
        paymentMethod,
      };

      const response = await orderService.createOrder(orderData);
      if (response.success) {
        toast.success('Order placed successfully!');
        setCart([]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-600">User Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/user/orders"
                className="relative px-4 py-2 text-gray-700 hover:text-orange-600"
              >
                Orders
                {orders.filter((o) => o.status === 'ready').length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {orders.filter((o) => o.status === 'ready').length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Cart ({cart.length})
              </button>
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Menu Items</h2>
            {loading ? (
              <div className="text-center py-8">Loading menu...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-orange-600">
                          Rs. {item.price}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="md:col-span-1">
            {showCart && (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-4">Cart</h2>
                {cart.length === 0 ? (
                  <p className="text-gray-500">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-4">
                      {cart.map((cartItem) => (
                        <div
                          key={cartItem.item._id}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <div>
                            <p className="font-semibold">{cartItem.item.name}</p>
                            <p className="text-sm text-gray-600">
                              Rs. {cartItem.price} x {cartItem.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                updateQuantity(cartItem.item._id, cartItem.quantity - 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded"
                            >
                              -
                            </button>
                            <span>{cartItem.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(cartItem.item._id, cartItem.quantity + 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(cartItem.item._id)}
                              className="ml-2 text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="card">Card</option>
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <p className="text-xl font-bold">
                        Total: Rs. {getTotalPrice().toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600"
                    >
                      Place Order
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8">
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
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
