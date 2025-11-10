import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { menuService } from '../../services/menuService';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-600">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/menu"
                className="px-4 py-2 text-gray-700 hover:text-orange-600"
              >
                Menu Items
              </Link>
              <Link
                to="/admin/orders"
                className="px-4 py-2 text-gray-700 hover:text-orange-600"
              >
                Orders
              </Link>
              <Link
                to="/admin/users"
                className="px-4 py-2 text-gray-700 hover:text-orange-600"
              >
                Users
              </Link>
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

        {/* Order Status Stats */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Pending Orders</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Cooking</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.cookingOrders || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Ready</h3>
              <p className="text-3xl font-bold text-green-600">{stats.readyOrders || 0}</p>
            </div>
          </div>
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
