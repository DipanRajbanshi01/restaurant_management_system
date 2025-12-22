import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { theme } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response && response.success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

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
            <span className="text-5xl mr-3">🔐</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Forgot Password
            </span>
          </h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {emailSent 
              ? 'Check your email for reset instructions' 
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                📧 Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-5 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none text-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-200'
                }`}
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
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
        ) : (
          <div className="text-center space-y-6">
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' 
                ? 'bg-green-900/30 border border-green-700' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="text-6xl mb-4">✅</div>
              <h3 className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-green-300' : 'text-green-800'
              }`}>
                Email Sent!
              </h3>
              <p className={theme === 'dark' ? 'text-green-200' : 'text-green-700'}>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className={`text-sm mt-4 ${
                theme === 'dark' ? 'text-green-300' : 'text-green-600'
              }`}>
                Please check your inbox and click the link to reset your password.
                The link will expire in 10 minutes.
              </p>
            </div>

            <div className="space-y-3">
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Didn't receive the email?
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Try Again
              </button>
              <Link
                to="/login"
                className={`block w-full py-3 rounded-2xl font-semibold text-center transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-orange-500' 
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

