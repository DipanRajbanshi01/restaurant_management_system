import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import UserDashboard from './pages/user/Dashboard';
import UserOrders from './pages/user/Orders';
import UserFeedback from './pages/user/Feedback';
import UserProfile from './pages/user/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminFeedback from './pages/admin/Feedback';
import AdminChatLogs from './pages/admin/ChatLogs';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

// Components
import Chatbot from './components/Chatbot';

// Pages
import ChefDashboard from './pages/chef/Dashboard';
import ChefFeedback from './pages/chef/Feedback';
import AdminMenu from './pages/admin/Menu';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <Router future={{ v7_relativeSplatPath: true }}>
            <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* User Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/orders"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/feedback"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            
            {/* Chef Routes */}
            <Route
              path="/chef/dashboard"
              element={
                <ProtectedRoute allowedRoles={['chef']}>
                  <ChefDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chef/feedback"
              element={
                <ProtectedRoute allowedRoles={['chef']}>
                  <ChefFeedback />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chat-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminChatLogs />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            <Chatbot />
            <ToastContainer position="top-right" autoClose={3000} />
            </div>
          </Router>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

