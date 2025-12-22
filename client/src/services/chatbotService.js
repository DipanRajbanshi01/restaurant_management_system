import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Send chat message
const sendMessage = async (message, userId = null, rating = null) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  // Include Authorization header if token exists (for optional auth)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await axios.post(
    `${API_URL}/chatbot/chat`,
    {
      message,
      rating,
      // Keep userId in body for backward compatibility, but backend prefers req.user
    },
    { headers }
  );
  return response.data;
};

// Get chat logs (admin only)
const getChatLogs = async (page = 1, limit = 20, lowRatingOnly = false) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/chatbot/logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      lowRatingOnly,
    },
  });
  return response.data;
};

const chatbotService = {
  sendMessage,
  getChatLogs,
};

export default chatbotService;

