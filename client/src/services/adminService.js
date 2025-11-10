import api from './authService';

export const adminService = {
  createChef: async (chefData) => {
    const response = await api.post('/admin/create-chef', chefData);
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getChefs: async () => {
    const response = await api.get('/admin/chefs');
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

