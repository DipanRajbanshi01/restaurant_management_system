import api from './authService';

export const menuService = {
  getMenuItems: async () => {
    const response = await api.get('/menu');
    return response.data;
  },

  getMenuItem: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  createMenuItem: async (itemData) => {
    const response = await api.post('/menu', itemData);
    return response.data;
  },

  updateMenuItem: async (id, itemData) => {
    const response = await api.put(`/menu/${id}`, itemData);
    return response.data;
  },

  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },
};

