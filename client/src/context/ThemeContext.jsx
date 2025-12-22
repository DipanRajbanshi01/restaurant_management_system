import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { userService } from '../services/userService';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Apply theme to document
  const applyTheme = React.useCallback((newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Sync with user's theme preference when logged in
  useEffect(() => {
    if (isAuthenticated && user?.theme) {
      setTheme(user.theme);
      localStorage.setItem('theme', user.theme);
    }
  }, [user, isAuthenticated]);

  // Toggle theme
  const toggleTheme = React.useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Update user's theme preference if logged in
    if (isAuthenticated) {
      try {
        await userService.updateTheme(newTheme);
      } catch (error) {
        console.error('Failed to update theme preference:', error);
      }
    }
  }, [theme, isAuthenticated]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

