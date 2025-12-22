import api from './authService';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  updateCart: async (items) => {
    const response = await api.put('/cart', { items });
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  addToCart: async (itemId, quantity = 1, specialInstructions = '') => {
    const response = await api.post('/cart/add', {
      itemId,
      quantity,
      specialInstructions,
    });
    return response.data;
  },

  removeFromCart: async (itemId, specialInstructions) => {
    const params = specialInstructions ? { specialInstructions } : {};
    const response = await api.delete(`/cart/item/${itemId}`, { params });
    return response.data;
  },

  updateItemQuantity: async (itemId, quantity, specialInstructions) => {
    const response = await api.put(`/cart/item/${itemId}`, {
      quantity,
      specialInstructions,
    });
    return response.data;
  },
};

