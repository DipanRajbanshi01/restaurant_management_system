import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authService.verifyToken();
      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        // Don't auto-login after registration, redirect to login
        return response;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        // Clear any previous user's cart before setting new user
        const previousUserId = user?.id;
        if (previousUserId && previousUserId !== response.data.user.id) {
          localStorage.removeItem(`restaurantCart_${previousUserId}`);
        }
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.data.token);
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (token) => {
    try {
      const response = await authService.googleLogin(token);
      if (response.success && response.data) {
        // Cart will be loaded automatically by Dashboard component based on user ID
        // No need to clear previous user's cart - it's stored separately per user
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.data.token);
        return response;
      }
      throw new Error(response.message || 'Google login failed');
    } catch (error) {
      throw error;
    }
  };

  const completeGoogleProfile = async (name) => {
    try {
      const response = await authService.completeGoogleProfile(name);
      if (response.success && response.data) {
        setUser(response.data.user);
        return response;
      }
      throw new Error(response.message || 'Failed to complete profile');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Don't clear cart on logout - keep it for when user logs back in
    // Cart will be automatically loaded when user logs in again
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const updateUserContext = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    googleLogin,
    completeGoogleProfile,
    logout,
    updateUserContext,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

