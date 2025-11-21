import api from './authService';

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },

  // Toggle favorite item
  toggleFavorite: async (itemId) => {
    const response = await api.post(`/users/favorites/${itemId}`);
    return response.data;
  },

  // Get favorites
  getFavorites: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },

  // Update theme
  updateTheme: async (theme) => {
    const response = await api.put('/users/theme', { theme });
    return response.data;
  },
};
