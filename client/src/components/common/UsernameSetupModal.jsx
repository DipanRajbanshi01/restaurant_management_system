import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const UsernameSetupModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { completeGoogleProfile, user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || username.trim().length < 2) {
      toast.error('Username must be at least 2 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await completeGoogleProfile(username.trim());
      if (response && response.success) {
        toast.success('Profile completed successfully!');
        const userRole = response.data?.user?.role || 'user';
        navigate(`/${userRole}/dashboard`);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-3xl shadow-2xl w-full max-w-md mx-4 border transform transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-100'
      }`}>
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Complete Your Profile
            </h2>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Please set a username to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                👤 Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                maxLength={50}
                className={`w-full px-5 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none text-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-200'
                }`}
                placeholder="Enter your username"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '⏳ Saving...' : '✨ Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetupModal;

