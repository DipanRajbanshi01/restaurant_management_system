import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { menuService } from '../../services/menuService';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/navbars/AdminNavbar';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [showChefForm, setShowChefForm] = useState(false);
  const [chefData, setChefData] = useState({ name: '', email: '', password: '' });
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

  const handleCreateChef = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.createChef(chefData);
      if (response.success) {
        toast.success('Chef account created successfully!');
        setChefData({ name: '', email: '', password: '' });
        setShowChefForm(false);
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create chef account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Navbar */}
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Total Chefs</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.totalChefs || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
              <p className="text-3xl font-bold text-orange-600">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        )}

        {/* Sales Analytics */}
        {stats && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-3xl mr-2">💰</span>
                Sales Analytics
              </h2>
              <p className="text-gray-600">COL Sales Analytics</p>
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
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <span className="text-3xl mr-2">🏆</span>
                    Top 5 Most Sold Items
                  </h2>
                  <p className="text-gray-600">Your best performing menu items</p>
                </div>
                
                <div className="grid md:grid-cols-5 gap-4">
                  {stats.mostSoldItems.map((item, index) => (
                    <div
                      key={item._id}
                      className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg"
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
                      
                      <h3 className="font-bold text-gray-800 mb-2 truncate" title={item.name}>
                        {item.name}
                      </h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Sold:</span>
                          <span className="font-bold text-orange-600">{item.totalQuantity} units</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Revenue:</span>
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
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Pending Orders</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders || 0}</p>
                  </div>
                  <span className="text-5xl">⏰</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Cooking</h3>
                    <p className="text-3xl font-bold text-orange-600">{stats.cookingOrders || 0}</p>
                  </div>
                  <span className="text-5xl">👨‍🍳</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Ready</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.readyOrders || 0}</p>
                  </div>
                  <span className="text-5xl">✅</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Create Chef Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create Chef Account</h2>
            <button
              onClick={() => setShowChefForm(!showChefForm)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {showChefForm ? 'Cancel' : 'Create Chef'}
            </button>
          </div>

          {showChefForm && (
            <form onSubmit={handleCreateChef} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={chefData.name}
                  onChange={(e) => setChefData({ ...chefData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={chefData.email}
                  onChange={(e) => setChefData({ ...chefData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={chefData.password}
                  onChange={(e) => setChefData({ ...chefData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
              >
                Create Chef Account
              </button>
            </form>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/admin/menu"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">🍽️</div>
            <h3 className="text-xl font-semibold">Manage Menu</h3>
            <p className="text-gray-600">Add, edit, or delete menu items</p>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">📋</div>
            <h3 className="text-xl font-semibold">View Orders</h3>
            <p className="text-gray-600">View and manage all orders</p>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">👥</div>
            <h3 className="text-xl font-semibold">Manage Users</h3>
            <p className="text-gray-600">View users and chefs</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
