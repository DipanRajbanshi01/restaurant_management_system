import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Get all support chats (admin only)
export const getSupportChats = async (status = null) => {
  const response = await axios.get(
    `${API_URL}/support/chats${status ? `?status=${status}` : ''}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Get user's support chat
export const getUserSupportChat = async () => {
  const response = await axios.get(
    `${API_URL}/support/chat`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Get support chat by ID
export const getSupportChatById = async (chatId) => {
  const response = await axios.get(
    `${API_URL}/support/chat/${chatId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Send user message
export const sendUserMessage = async (message) => {
  const response = await axios.post(
    `${API_URL}/support/chat/message`,
    { message },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Send admin message
export const sendAdminMessage = async (chatId, message) => {
  const response = await axios.post(
    `${API_URL}/support/chat/${chatId}/message`,
    { message },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Assign admin to chat
export const assignAdmin = async (chatId) => {
  const response = await axios.put(
    `${API_URL}/support/chat/${chatId}/assign`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Resolve chat
export const resolveChat = async (chatId) => {
  const response = await axios.put(
    `${API_URL}/support/chat/${chatId}/resolve`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

