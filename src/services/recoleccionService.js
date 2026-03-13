// services/recoleccionService.js
import api from './api';

export const recoleccionService = {
  // Obtener todas las recolecciones
  getAll: async () => {
    try {
      const response = await api.get('/recolecciones');
      return response.data;
    } catch (error) {
      console.error('Error al obtener recolecciones:', error);
      throw error;
    }
  },

  // Obtener una recolección por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/recolecciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener recolección:', error);
      throw error;
    }
  },

  // Obtener recolecciones pendientes
  getPendientes: async () => {
    try {
      const response = await api.get('/recolecciones/pendientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener recolecciones pendientes:', error);
      throw error;
    }
  },

  // Obtener recolecciones en progreso
  getEnProgreso: async () => {
    try {
      const response = await api.get('/recolecciones/en-progreso');
      return response.data;
    } catch (error) {
      console.error('Error al obtener recolecciones en progreso:', error);
      throw error;
    }
  },

  // Iniciar recolección
  iniciar: async (id) => {
    try {
      const response = await api.post(`/recolecciones/${id}/iniciar`);
      return response.data;
    } catch (error) {
      console.error('Error al iniciar recolección:', error);
      throw error;
    }
  },

  // Finalizar recolección
  finalizar: async (id, data) => {
    try {
      const response = await api.post(`/recolecciones/${id}/finalizar`, data);
      return response.data;
    } catch (error) {
      console.error('Error al finalizar recolección:', error);
      throw error;
    }
  },

  // Reportar incidencia
  reportarIncidencia: async (id, observaciones) => {
    try {
      const response = await api.post(`/recolecciones/${id}/reportar-incidencia`, {
        observaciones
      });
      return response.data;
    } catch (error) {
      console.error('Error al reportar incidencia:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  getEstadisticas: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get(
        `/recolecciones/estadisticas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
};