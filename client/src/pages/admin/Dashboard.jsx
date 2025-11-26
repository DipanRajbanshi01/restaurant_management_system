import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { adminService } from '../../services/adminService';
import { menuService } from '../../services/menuService';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/navbars/AdminNavbar';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-red-50'
    }`}>
      {/* Navbar */}
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {loading ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-300' : ''
          }`}>Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-lg shadow-md ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
            </div>
            <div className={`p-6 rounded-lg shadow-md ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Chefs</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.totalChefs || 0}</p>
            </div>
            <div className={`p-6 rounded-lg shadow-md ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Orders</h3>
              <p className="text-3xl font-bold text-orange-600">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        )}

        {/* Sales Analytics */}
        {stats && (
          <>
            <div className="mb-6">
              <h2 className={`text-2xl font-bold flex items-center ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                <span className="text-3xl mr-2">💰</span>
                Sales Analytics
              </h2>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>COL Sales Analytics</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold opacity-90">Total Sales</h3>
                  <span className="text-3xl">💵</span>
                </div>
                <p className="text-4xl font-bold mb-1">Rs. {stats.totalSales?.toLocaleString() || 0}</p>
                <p className="text-sm opacity-75">All time revenue</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold opacity-90">Today's Sales</h3>
                  <span className="text-3xl">📅</span>
                </div>
                <p className="text-4xl font-bold mb-1">Rs. {stats.todaySales?.toLocaleString() || 0}</p>
                <p className="text-sm opacity-75">Revenue today</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold opacity-90">This Month</h3>
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-4xl font-bold mb-1">Rs. {stats.monthSales?.toLocaleString() || 0}</p>
                <p className="text-sm opacity-75">Monthly revenue</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold opacity-90">Pending Payments</h3>
                  <span className="text-3xl">⏳</span>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.pendingPayments || 0}</p>
                <p className="text-sm opacity-75">Orders awaiting payment</p>
              </div>
            </div>

            {/* Most Sold Items */}
            {stats.mostSoldItems && stats.mostSoldItems.length > 0 && (
              <div className={`rounded-2xl shadow-xl p-8 mb-8 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="mb-6">
                  <h2 className={`text-2xl font-bold flex items-center ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    <span className="text-3xl mr-2">🏆</span>
                    Top 5 Most Sold Items
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Your best performing menu items</p>
                </div>
                
                <div className="grid md:grid-cols-5 gap-4">
                  {stats.mostSoldItems.map((item, index) => (
                    <div
                      key={item._id}
                      className={`rounded-2xl p-4 border-2 hover:border-orange-400 transition-all duration-300 hover:shadow-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-orange-600">#{index + 1}</span>
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-semibold">
                          {item.category || 'Other'}
                        </span>
                      </div>
                      
                      {item.image && (
                        <img
                          src={`http://localhost:5000${item.image}`}
                          alt={item.name}
                          className="w-full h-24 object-cover rounded-xl mb-3"
                        />
                      )}
                      
                      <h3 className={`font-bold mb-2 truncate ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`} title={item.name}>
                        {item.name}
                      </h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Sold:</span>
                          <span className="font-bold text-orange-600">{item.totalQuantity} units</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Revenue:</span>
                          <span className="font-bold text-green-600">Rs. {item.totalRevenue?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Status Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Pending Orders</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders || 0}</p>
                  </div>
                  <span className="text-5xl">⏰</span>
                </div>
              </div>
              <div className={`p-6 rounded-xl shadow-lg border-l-4 border-orange-500 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Cooking</h3>
                    <p className="text-3xl font-bold text-orange-600">{stats.cookingOrders || 0}</p>
                  </div>
                  <span className="text-5xl">👨‍🍳</span>
                </div>
              </div>
              <div className={`p-6 rounded-xl shadow-lg border-l-4 border-green-500 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Ready</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.readyOrders || 0}</p>
                  </div>
                  <span className="text-5xl">✅</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/admin/menu"
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition text-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-4xl mb-2">🍽️</div>
            <h3 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-100' : ''
            }`}>Manage Menu</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Add, edit, or delete menu items</p>
          </Link>
          <Link
            to="/admin/orders"
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition text-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-4xl mb-2">📋</div>
            <h3 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-100' : ''
            }`}>View Orders</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>View and manage all orders</p>
          </Link>
          <Link
            to="/admin/users"
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition text-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-4xl mb-2">👥</div>
            <h3 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-100' : ''
            }`}>Manage Users</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>View users and chefs</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
