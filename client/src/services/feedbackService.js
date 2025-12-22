import api from './authService';

export const feedbackService = {
  // Create feedback
  createFeedback: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },

  // Get all feedbacks with pagination
  getFeedbacks: async (page = 1, limit = 10) => {
    const response = await api.get(`/feedback?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get feedbacks for a specific menu item
  getItemFeedbacks: async (itemId) => {
    const response = await api.get(`/feedback/item/${itemId}`);
    return response.data;
  },

  // Get user's own feedbacks
  getMyFeedbacks: async () => {
    const response = await api.get('/feedback/my');
    return response.data;
  },

  // Get feedbacks for chef (menu feedbacks + their order feedbacks)
  getChefFeedbacks: async () => {
    const response = await api.get('/feedback/chef');
    return response.data;
  },

  // Update feedback
  updateFeedback: async (id, feedbackData) => {
    const response = await api.put(`/feedback/${id}`, feedbackData);
    return response.data;
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  },

  // Get rating statistics
  getRatingStats: async () => {
    const response = await api.get('/feedback/stats/ratings');
    return response.data;
  },
};

