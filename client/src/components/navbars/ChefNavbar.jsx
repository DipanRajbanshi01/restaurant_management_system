import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Logo from '../Logo';
import ThemeToggle from '../common/ThemeToggle';

const ChefNavbar = () => {
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
              to="/chef/dashboard"
              className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                location.pathname === '/chef/dashboard'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-purple-500' : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              🏠 Dashboard
            </Link>
            <Link
              to="/chef/feedback"
              className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                location.pathname === '/chef/feedback'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : theme === 'dark' ? 'text-gray-300 hover:text-purple-500' : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              ⭐ Feedbacks
            </Link>
            <span className={`font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>👨‍🍳 {user?.name}</span>
            <ThemeToggle />
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ChefNavbar;

