import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-orange-600">🍽️ Restaurant Management</h1>
            <div className="space-x-4">
              <Link
                to="/register"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to Our Restaurant
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Order delicious food and manage your dining experience
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-orange-500 text-white rounded-lg text-lg font-semibold hover:bg-orange-600 transition shadow-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-orange-500 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg border-2 border-orange-500"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">👤</div>
            <h4 className="text-xl font-semibold mb-2">For Users</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Browse menu items</li>
              <li>• Place orders</li>
              <li>• Track order status</li>
              <li>• Make payments</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">👨‍🍳</div>
            <h4 className="text-xl font-semibold mb-2">For Chefs</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• View assigned orders</li>
              <li>• Update order status</li>
              <li>• Mark orders as ready</li>
              <li>• Send notifications</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">👑</div>
            <h4 className="text-xl font-semibold mb-2">For Admins</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Manage menu items</li>
              <li>• Manage users & chefs</li>
              <li>• View all orders</li>
              <li>• System analytics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; Dipan Rajbanshi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
