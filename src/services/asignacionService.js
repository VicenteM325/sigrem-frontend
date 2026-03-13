import api from './api';

export const asignacionService = {
  // Obtener todas las asignaciones
  getAll: async (filtros = {}) => {
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.id_camion) params.append('id_camion', filtros.id_camion);
      if (filtros.id_ruta) params.append('id_ruta', filtros.id_ruta);

      const url = `/asignaciones-ruta-camion${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      throw error;
    }
  },

  // Obtener una asignación por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/asignaciones-ruta-camion/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener asignación:', error);
      throw error;
    }
  },

  // Crear nueva asignación
  create: async (asignacionData) => {
    try {
      const response = await api.post('/asignaciones-ruta-camion', {
        id_ruta: asignacionData.id_ruta,
        id_camion: asignacionData.id_camion,
        fecha_programada: asignacionData.fecha_programada,
        total_estimado_kg: asignacionData.total_estimado_kg ? parseFloat(asignacionData.total_estimado_kg) : null
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear asignación:', error);
      throw error;
    }
  },

  // Actualizar asignación
  update: async (id, asignacionData) => {
    try {
      const response = await api.put(`/asignaciones-ruta-camion/${id}`, {
        id_ruta: asignacionData.id_ruta,
        id_camion: asignacionData.id_camion,
        fecha_programada: asignacionData.fecha_programada,
        total_estimado_kg: asignacionData.total_estimado_kg ? parseFloat(asignacionData.total_estimado_kg) : null
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar asignación:', error);
      throw error;
    }
  },

  // Eliminar asignación
  delete: async (id) => {
    try {
      const response = await api.delete(`/asignaciones-ruta-camion/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      throw error;
    }
  },

  // Cambiar estado de la asignación
  cambiarEstado: async (id, estado, totalRealKg = null) => {
    try {
      const data = { estado };
      if (totalRealKg !== null) {
        data.total_real_kg = parseFloat(totalRealKg);
      }
      const response = await api.patch(`/asignaciones-ruta-camion/${id}/estado`, data);
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  },

  // Obtener asignaciones pendientes
  getPendientes: async () => {
    try {
      const response = await api.get('/asignaciones-ruta-camion/pendientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener asignaciones pendientes:', error);
      throw error;
    }
  },

  // Obtener asignaciones por fecha
  getByFecha: async (fecha) => {
    try {
      const response = await api.get(`/asignaciones-ruta-camion/por-fecha/${fecha}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener asignaciones por fecha:', error);
      throw error;
    }
  },

  // Obtener calendario de asignaciones
  getCalendario: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get(`/asignaciones-ruta-camion/calendario?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener calendario:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  getEstadisticas: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get(`/asignaciones-ruta-camion/estadisticas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // Verificar disponibilidad de camión
  verificarDisponibilidad: async (idCamion, fecha) => {
    try {
      const response = await api.get(`/asignaciones-ruta-camion/verificar-disponibilidad?id_camion=${idCamion}&fecha=${fecha}`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  }
};