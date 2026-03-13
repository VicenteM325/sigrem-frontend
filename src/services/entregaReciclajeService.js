import api from './api';

export const entregaReciclajeService = {
  // Obtener todas las entregas
  getAll: async () => {
    try {
      const response = await api.get('/entregas-reciclaje');
      return response.data;
    } catch (error) {
      console.error('Error al obtener entregas:', error);
      throw error;
    }
  },

  // Obtener una entrega por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/entregas-reciclaje/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener entrega:', error);
      throw error;
    }
  },

  // Crear nueva entrega
  create: async (entregaData) => {
    try {
      const response = await api.post('/entregas-reciclaje', {
        id_punto_verde: parseInt(entregaData.id_punto_verde),
        id_material: parseInt(entregaData.id_material),
        id_ciudadano: parseInt(entregaData.id_ciudadano),
        cantidad_kg: parseFloat(entregaData.cantidad_kg)
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear entrega:', error);
      throw error;
    }
  },

  // Obtener entregas por ciudadano
  getByCiudadano: async (idCiudadano) => {
    try {
      const response = await api.get(`/entregas-reciclaje/ciudadano/${idCiudadano}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener entregas del ciudadano:', error);
      throw error;
    }
  },

  // Obtener entregas del día
  getDelDia: async () => {
    try {
      const response = await api.get('/entregas-reciclaje/del-dia');
      return response.data;
    } catch (error) {
      console.error('Error al obtener entregas del día:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  getEstadisticas: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get(`/entregas-reciclaje/estadisticas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // Obtener materiales top
  getMaterialesTop: async (limite = 5) => {
    try {
      const response = await api.get(`/entregas-reciclaje/materiales-top?limite=${limite}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener materiales top:', error);
      throw error;
    }
  }
};