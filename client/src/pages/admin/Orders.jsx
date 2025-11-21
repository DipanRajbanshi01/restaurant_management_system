import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/navbars/AdminNavbar';

const AdminOrders = () => {
  const { logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      if (response.success) {
        toast.success('Order status updated');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-red-50'
    }`}>
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-300' : ''
          }`}>Loading orders...</div>
        ) : (
          <div className={`rounded-lg shadow-md overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Order ID</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Customer</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Chef</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Items</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Total</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Status</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Payment</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className={`border-b ${
                    theme === 'dark' 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <td className={`px-4 py-3 ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}>#{order._id.slice(-6)}</td>
                    <td className={`px-4 py-3 ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}>
                      {order.user?.name || 'N/A'}
                      <br />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>{order.user?.email}</span>
                    </td>
                    <td className={`px-4 py-3 ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}>
                      {order.chef ? (
                        <div>
                          <span className={`text-sm font-semibold ${
                            theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                          }`}>👨‍🍳 {order.chef.name}</span>
                        </div>
                      ) : (
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>Not assigned</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}>
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className={`px-4 py-3 font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}>Rs. {order.totalPrice}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          order.status === 'ready'
                            ? theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                            : order.status === 'cooking'
                            ? theme === 'dark' ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                            : order.status === 'completed'
                            ? theme === 'dark' ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'
                            : order.status === 'cancelled'
                            ? theme === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          order.paymentStatus === 'paid'
                            ? theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'cancelled'
                            ? theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                            : theme === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`px-2 py-1 border rounded text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : ''
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="cooking">Cooking</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="8" className={`px-4 py-8 text-center ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
