import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { resetToken } = useParams();

  useEffect(() => {
    if (!resetToken) {
      setTokenValid(false);
      toast.error('Invalid reset token');
    }
  }, [resetToken]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(resetToken, formData.password);
      if (response && response.success) {
        toast.success('Password reset successful! Logging you in...');
        
        // Auto-login with the returned token
        if (response.data.token && response.data.user) {
          // Clear any previous user's cart
          const previousUserId = localStorage.getItem('previousUserId');
          if (previousUserId && previousUserId !== response.data.user.id) {
            localStorage.removeItem(`restaurantCart_${previousUserId}`);
          }
          localStorage.setItem('token', response.data.token);
          // Redirect to dashboard - AuthContext will verify token on next render
          const userRole = response.data.user.role || 'user';
          setTimeout(() => {
            window.location.href = `/${userRole}/dashboard`;
          }, 1500);
        } else {
          navigate('/login');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      toast.error(errorMessage);
      if (errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${
        theme === 'dark' 
          ? 'bg-gray-900 text-gray-100' 
          : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'
      }`}>
        <div className={`p-10 rounded-3xl shadow-2xl w-full max-w-md border text-center ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-100'
        }`}>
          <div className="text-6xl mb-4">❌</div>
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Invalid or Expired Link
          </h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600 mb-6'}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-2xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'
    }`}>
      <div className={`p-10 rounded-3xl shadow-2xl w-full max-w-md border transform hover:scale-[1.02] transition-all duration-300 relative ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-100'
      }`}>
        {/* Home Button */}
        <Link 
          to="/" 
          className={`absolute top-6 left-6 flex items-center space-x-2 transition-all duration-300 group ${
            theme === 'dark' 
              ? 'text-gray-300 hover:text-orange-500' 
              : 'text-gray-600 hover:text-orange-600'
          }`}
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🏠</span>
          <span className="font-semibold hidden sm:inline">Home</span>
        </Link>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-4xl font-bold mb-2 flex items-center justify-center">
            <span className="text-5xl mr-3">🔑</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Reset Password
            </span>
          </h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            Enter your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              🔒 New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className={`w-full px-5 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none text-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              🔐 Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className={`w-full px-5 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none text-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? '⏳ Resetting...' : '🔄 Reset Password'}
          </button>

          <p className={`text-center pt-4 border-t ${
            theme === 'dark' 
              ? 'text-gray-300 border-gray-700' 
              : 'text-gray-600 border-gray-200'
          }`}>
            Remember your password?{' '}
            <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700 hover:underline">
              Login here 🔑
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

