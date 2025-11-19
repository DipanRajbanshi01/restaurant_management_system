import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="bg-gradient-to-br from-white to-gray-50 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 transform hover:scale-[1.02] transition-all duration-300 relative">
        {/* Home Button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-all duration-300 group"
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
          <p className="text-gray-600">Login to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none text-lg"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 outline-none text-lg"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>

          <p className="text-center text-gray-600 pt-4 border-t border-gray-200">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 font-semibold hover:text-orange-700 hover:underline">
              Register here ✨
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
