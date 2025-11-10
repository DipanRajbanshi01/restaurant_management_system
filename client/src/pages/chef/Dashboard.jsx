import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';

const ChefDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
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

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      if (response.success) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-600">Chef Dashboard</h1>
            <div className="flex items-center space-x-4">
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
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Pending Orders</h3>
            <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Cooking</h3>
            <p className="text-3xl font-bold text-yellow-600">{cookingOrders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
          </div>
        </div>

        {/* Orders */}
        <h2 className="text-2xl font-bold mb-4">Orders</h2>
        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: Rs. {order.totalPrice}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      order.status === 'ready'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'cooking'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="space-y-1">
                    {order.items?.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {item.item?.name || 'N/A'} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'cooking')}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                    >
                      Start Cooking
                    </button>
                  )}
                  {order.status === 'cooking' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No orders available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefDashboard;

