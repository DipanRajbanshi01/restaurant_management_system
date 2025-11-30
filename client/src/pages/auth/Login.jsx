import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import UsernameSetupModal from '../../components/common/UsernameSetupModal';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await googleLogin(credentialResponse.credential);
      if (response && response.success) {
        if (response.data.user.needsUsername) {
          setShowUsernameModal(true);
        } else {
          toast.success('Login successful!');
          const userRole = response.data?.user?.role || 'user';
          navigate(`/${userRole}/dashboard`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    // More specific error messages
    if (error?.error === 'popup_closed_by_user') {
      toast.info('Login cancelled');
    } else if (error?.error === 'access_denied') {
      toast.error('Access denied. Please try again.');
    } else {
      toast.error('Google login failed. Please check your browser settings or try again.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      if (response && response.success) {
        toast.success('Login successful!');
        const userRole = response.data?.user?.role || 'user';
        navigate(`/${userRole}/dashboard`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
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
            <span className="text-5xl mr-3">🔑</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Login to your account</p>
        </div>
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
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-5 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none text-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-200'
              }`}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className={`block text-sm font-semibold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                🔒 Password
              </label>
              
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-5 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none text-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
            <Link
                to="/forgot-password"
                className={`text-sm ${
                  theme === 'dark' 
                    ? 'text-orange-400 hover:text-orange-300' 
                    : 'text-orange-600 hover:text-orange-700'
                } font-semibold hover:underline`}
              >
                Forgot Password?
              </Link>
          </div>
          

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>

          <div className="relative my-6">
            <div className={`absolute inset-0 flex items-center ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className={`w-full border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${
                theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500'
              }`}>
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme={theme === 'dark' ? 'filled_black' : 'outline'}
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
            />
          </div>

          <p className={`text-center pt-4 border-t ${
            theme === 'dark' 
              ? 'text-gray-300 border-gray-700' 
              : 'text-gray-600 border-gray-200'
          }`}>
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 font-semibold hover:text-orange-700 hover:underline">
              Register here ✨
            </Link>
          </p>
        </form>
      </div>
      <UsernameSetupModal 
        isOpen={showUsernameModal} 
        onClose={() => setShowUsernameModal(false)} 
      />
    </div>
  );
};

export default Login;
