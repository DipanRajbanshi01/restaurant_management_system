import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/navbars/AdminNavbar';

const AdminUsers = () => {
  const { logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, chefsRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getChefs(),
      ]);
      setUsers(usersRes.data || []);
      setChefs(chefsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(id);
        toast.success('User deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete user');
      }
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
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'users'
                ? 'bg-orange-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('chefs')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'chefs'
                ? 'bg-orange-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Chefs ({chefs.length})
          </button>
        </div>

        {loading ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-300' : ''
          }`}>Loading...</div>
        ) : (
          <div className={`rounded-lg shadow-md overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Name</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Email</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Role</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Created</th>
                  <th className={`px-4 py-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'users' ? users : chefs).map((person) => (
                  <tr key={person._id} className={`border-b ${
                    theme === 'dark' 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <td className={`px-4 py-3 ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}>{person.name}</td>
                    <td className={`px-4 py-3 ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}>{person.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          person.role === 'admin'
                            ? theme === 'dark' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-800'
                            : person.role === 'chef'
                            ? theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                            : theme === 'dark' ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {person.role}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(person.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {person.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(person._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(activeTab === 'users' ? users : chefs).length === 0 && (
                  <tr>
                    <td colSpan="5" className={`px-4 py-8 text-center ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No {activeTab} found
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

export default AdminUsers;
