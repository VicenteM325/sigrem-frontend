import api from './api';

export const puntoVerdeService = {
  // Obtener todos los puntos verdes
  getAll: async () => {
    try {
      const response = await api.get('/puntos-verdes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener puntos verdes:', error);
      throw error;
    }
  },

  // Obtener un punto verde por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/puntos-verdes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener punto verde:', error);
      throw error;
    }
  },

  // Crear nuevo punto verde
  create: async (data) => {
    try {
      const response = await api.post('/puntos-verdes', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear punto verde:', error);
      throw error;
    }
  },

  // Actualizar punto verde
  update: async (id, data) => {
    try {
      const response = await api.put(`/puntos-verdes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar punto verde:', error);
      throw error;
    }
  },

  // Eliminar punto verde
  delete: async (id) => {
    try {
      const response = await api.delete(`/puntos-verdes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar punto verde:', error);
      throw error;
    }
  },

  // Obtener puntos verdes por zona
  getByZona: async (idZona) => {
    try {
      const response = await api.get(`/puntos-verdes/por-zona/${idZona}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener puntos verdes por zona:', error);
      throw error;
    }
  },

  // Obtener para selector
  getForSelect: async () => {
    try {
      const response = await api.get('/puntos-verdes/select');
      return response.data;
    } catch (error) {
      console.error('Error al obtener puntos verdes para selector:', error);
      throw error;
    }
  },

  // Obtener coordenadas para mapa
  getCoordenadas: async () => {
    try {
      const response = await api.get('/puntos-verdes/mapa');
      return response.data;
    } catch (error) {
      console.error('Error al obtener coordenadas:', error);
      throw error;
    }
  },

  getEncargadosDisponibles: async () => {
    try {
      const response = await api.get('/puntos-verdes/encargados-disponibles');
      return response.data;
    } catch (error) {
      console.error('Error al obtener encargados:', error);
      throw error;
    }
  },

  getEncargadoInfo: async (id) => {
    try {
      const response = await api.get(`/puntos-verdes/encargado/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener información del encargado:', error);
      throw error;
    }
  },
  getPuntosVerdesMapa: async () => {
    try {
      const response = await api.get('/puntos-verdes/mapa/completo');
      return response.data;
    } catch (error) {
      console.error('Error al obtener puntos verdes para mapa:', error);
      throw error;
    }
  }
};
