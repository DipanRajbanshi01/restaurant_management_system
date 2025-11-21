import api from './authService';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    const response = await api.put(`/orders/${id}/payment`, { paymentStatus });
    return response.data;
  },

  updateOrderNotes: async (id, notes) => {
    const response = await api.put(`/orders/${id}/notes`, { notes });
    return response.data;
  },

  updateEstimatedTime: async (id, estimatedTime) => {
    const response = await api.put(`/orders/${id}/estimated-time`, { estimatedTime });
    return response.data;
  },
};

