import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Logo from '../Logo';
import ThemeToggle from '../common/ThemeToggle';

const AdminNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  return (
    <nav className={`${
      theme === 'dark' 
        ? 'bg-gray-800/80 border-gray-700' 
        : 'bg-white/80 border-gray-100'
    } backdrop-blur-lg shadow-xl border-b sticky top-0 z-50`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/dashboard"
              className={`px-4 py-2 transition-colors duration-300 font-medium ${
                location.pathname === '/admin/dashboard'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/menu"
              className={`px-4 py-2 transition-colors duration-300 font-medium ${
                location.pathname === '/admin/menu'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Menu Items
            </Link>
            <Link
              to="/admin/orders"
              className={`px-4 py-2 transition-colors duration-300 font-medium ${
                location.pathname === '/admin/orders'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Orders
            </Link>
            <Link
              to="/admin/users"
              className={`px-4 py-2 transition-colors duration-300 font-medium ${
                location.pathname === '/admin/users'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Users
            </Link>
            <Link
              to="/admin/feedback"
              className={`px-4 py-2 transition-colors duration-300 font-medium flex items-center space-x-1 ${
                location.pathname === '/admin/feedback'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              <span>⭐</span>
              <span>Feedbacks</span>
            </Link>
            <Link
              to="/admin/chat-logs"
              className={`px-4 py-2 transition-colors duration-300 font-medium flex items-center space-x-1 ${
                location.pathname === '/admin/chat-logs'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              <span>💬</span>
              <span>Chats</span>
            </Link>
            <Link
              to="/admin/support-chat"
              className={`px-4 py-2 transition-colors duration-300 font-medium flex items-center space-x-1 ${
                location.pathname === '/admin/support-chat'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              <span>💬</span>
              <span>Support</span>
            </Link>
            <span className={`font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Welcome, {user?.name}</span>
            <ThemeToggle />
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
  );
};

export default AdminNavbar;

