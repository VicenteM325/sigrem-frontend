import api from './api';

export const zonaService = {
  // Obtener todas las zonas
  getAll: async () => {
    try {
      const response = await api.get('/zonas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener zonas:', error);
      throw error;
    }
  },

  // Obtener una zona por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/zonas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener zona:', error);
      throw error;
    }
  },

  // Crear nueva zona
  create: async (zonaData) => {
    try {
      const response = await api.post('/zonas', {
        nombre_zona: zonaData.nombre_zona,
        densidad_poblacional: zonaData.densidad_poblacional ? parseFloat(zonaData.densidad_poblacional) : null,
        tipos_zona: zonaData.tipos_zona || []
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear zona:', error);
      throw error;
    }
  },

  // Actualizar zona
  update: async (id, zonaData) => {
    try {
      const response = await api.put(`/zonas/${id}`, {
        nombre_zona: zonaData.nombre_zona,
        densidad_poblacional: zonaData.densidad_poblacional ? parseFloat(zonaData.densidad_poblacional) : null,
        tipos_zona: zonaData.tipos_zona || []
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar zona:', error);
      throw error;
    }
  },

  // Eliminar zona
  delete: async (id) => {
    try {
      const response = await api.delete(`/zonas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar zona:', error);
      throw error;
    }
  },

  // Obtener zonas para selector
  getForSelect: async () => {
    try {
      const response = await api.get('/zonas/select');
      return response.data;
    } catch (error) {
      console.error('Error al obtener zonas para select:', error);
      throw error;
    }
  }
};