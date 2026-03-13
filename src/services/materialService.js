import api from './api';

export const materialService = {
  getForSelect: async () => {
    try {
      const response = await api.get('/materiales/select');
      return response.data;
    } catch (error) {
      console.error('Error cargando materiales:', error);
      throw error;
    }
  }
};