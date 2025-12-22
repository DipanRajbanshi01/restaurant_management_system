import api from './authService';

export const khaltiService = {
  initiatePayment: async (orderId) => {
    const response = await api.post('/khalti/initiate', { orderId });
    return response.data;
  },

  verifyPayment: async (pidx) => {
    const response = await api.post('/khalti/verify', { pidx });
    return response.data;
  },
};

