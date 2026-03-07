import api from './api';

export const rutaService = {
  // Obtener todas las rutas
  getAll: async () => {
    try {
      const response = await api.get('/rutas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener rutas:', error);
      throw error;
    }
  },

  // Obtener una ruta por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/rutas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener ruta:', error);
      throw error;
    }
  },

  // Crear nueva ruta
  create: async (rutaData) => {
    try {
      console.log('Datos recibidos en create:', rutaData);
      
      const response = await api.post('/rutas', rutaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear ruta:', error);
      throw error;
    }
  },

  // Actualizar ruta
  update: async (id, rutaData) => {
    try {
      console.log('Datos recibidos en update:', { id, ...rutaData });
      const response = await api.put(`/rutas/${id}`, rutaData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar ruta:', error);
      throw error;
    }
  },

  // Eliminar ruta
  delete: async (id) => {
    try {
      const response = await api.delete(`/rutas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
      throw error;
    }
  },

  // Obtener rutas para mapa (GeoJSON)
  getForMap: async () => {
    try {
      const response = await api.get('/rutas/mapa');
      return response.data;
    } catch (error) {
      console.error('Error al obtener rutas para mapa:', error);
      throw error;
    }
  },

  // Buscar rutas
  search: async (query) => {
    try {
      const response = await api.get(`/rutas/buscar?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar rutas:', error);
      throw error;
    }
  },

  // Obtener rutas por zona
  getByZona: async (zonaId) => {
    try {
      const response = await api.get(`/rutas/por-zona/${zonaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener rutas por zona:', error);
      throw error;
    }
  },

  // Cambiar estado de ruta
  cambiarEstado: async (id, estadoId) => {
    try {
      const response = await api.patch(`/rutas/${id}/estado`, {
        id_estado: estadoId
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  },

  // Duplicar ruta
  duplicar: async (id, nuevoNombre) => {
    try {
      const response = await api.post(`/rutas/${id}/duplicar`, {
        nombre: nuevoNombre
      });
      return response.data;
    } catch (error) {
      console.error('Error al duplicar ruta:', error);
      throw error;
    }
  }
};