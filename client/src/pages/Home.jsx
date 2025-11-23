import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

const Home = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-lg shadow-xl border-b sticky top-0 z-50 ${
        theme === 'dark'
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-gray-100'
      }`}>
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Register
              </Link>
              <Link
                to="/login"
                className={`px-6 py-2.5 rounded-full font-semibold border-2 transform hover:scale-105 transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 border-gray-600 hover:border-orange-400 hover:shadow-lg'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:shadow-lg'
                }`}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-6 flex items-center justify-center animate-fade-in">
            <span className="text-7xl mr-4">🍽️</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Welcome to COL Restaurant
            </span>
          </h2>
          <p className={`text-2xl mb-12 leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Experience culinary excellence with our delicious menu and seamless ordering system
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xl font-bold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-2"
            >
              <span>🚀</span>
              <span>Get Started</span>
            </Link>
            <Link
              to="/login"
              className={`px-10 py-4 rounded-full text-xl font-bold transform hover:scale-105 transition-all duration-300 shadow-2xl border-2 hover:border-orange-400 flex items-center space-x-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700'
                  : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>👤</span>
              <span>Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center mb-4 flex items-center justify-center">
          <span className="text-5xl mr-3">✨</span>
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Features
          </span>
        </h3>
        <p className={`text-center mb-12 text-lg ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>Everything you need for a perfect dining experience</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-white to-orange-50 border-gray-100'
          }`}>
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">👤</div>
            <h4 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>For Users</h4>
            <ul className={`space-y-3 text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li className="flex items-center"><span className="text-orange-500 mr-2">✓</span> Browse menu items</li>
              <li className="flex items-center"><span className="text-orange-500 mr-2">✓</span> Place orders</li>
              <li className="flex items-center"><span className="text-orange-500 mr-2">✓</span> Track order status</li>
              <li className="flex items-center"><span className="text-orange-500 mr-2">✓</span> Make payments</li>
            </ul>
          </div>

          <div className={`group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-white to-blue-50 border-gray-100'
          }`}>
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">👨‍🍳</div>
            <h4 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>For Chefs</h4>
            <ul className={`space-y-3 text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span> View assigned orders</li>
              <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span> Update order status</li>
              <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span> Mark orders as ready</li>
              <li className="flex items-center"><span className="text-blue-500 mr-2">✓</span> Send notifications</li>
            </ul>
          </div>

          <div className={`group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-white to-purple-50 border-gray-100'
          }`}>
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">👑</div>
            <h4 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>For Admins</h4>
            <ul className={`space-y-3 text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Manage menu items</li>
              <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Manage users & chefs</li>
              <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> View all orders</li>
              <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> System analytics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h4 className="text-xl font-bold mb-4">About Us</h4>
              <p className="text-gray-400">
                Experience culinary excellence with our delicious menu and seamless ordering system.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col space-y-2">
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </div>
            </div>
            
            {/* Social Media */}
            <div>
              <h4 className="text-xl font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors text-2xl"
                  title="Facebook"
                >
                  📘
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors text-2xl"
                  title="Instagram"
                >
                  📷
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-2xl"
                  title="Twitter"
                >
                  🐦
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors text-2xl"
                  title="YouTube"
                >
                  ▶️
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-lg">© 2025 <span className="font-bold">Dipan Rajbanshi</span>. All rights reserved.</p>
            <p className="text-gray-400 mt-2">Made with ❤️ for food lovers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
