import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Logo from '../Logo';
import ThemeToggle from '../common/ThemeToggle';

const UserNavbar = ({ orders = [], cart = [], showCart, setShowCart }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  const ongoingOrders = orders.filter((o) => ['pending', 'cooking', 'ready'].includes(o.status));

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
              to="/user/dashboard"
              className={`px-4 py-2 transition-colors duration-300 font-medium ${
                location.pathname === '/user/dashboard'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/user/orders"
              className={`relative px-4 py-2 transition-colors duration-300 font-medium ${
                location.pathname === '/user/orders'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Orders
              {ongoingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg animate-pulse">
                  {ongoingOrders.length}
                </span>
              )}
            </Link>
            <Link
              to="/user/feedback"
              className={`px-4 py-2 transition-colors duration-300 font-medium flex items-center space-x-1 ${
                location.pathname === '/user/feedback'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
              title="View and browse customer reviews"
            >
              <span>⭐</span>
              <span>Reviews</span>
            </Link>
            {showCart !== undefined && setShowCart && (
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Cart ({cart.length})
              </button>
            )}
            <Link
              to="/user/profile"
              className={`transition-colors duration-300 font-medium flex items-center space-x-2 group ${
                location.pathname === '/user/profile'
                  ? 'text-orange-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'
              }`}
              title="View your profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">Welcome, {user?.name}</span>
            </Link>
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

export default UserNavbar;

