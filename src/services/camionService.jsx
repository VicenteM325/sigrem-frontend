import api from './api';

export const camionService = {
  // Obtener todos los camiones
  getAll: async () => {
    try {
      const response = await api.get('/camiones');
      return response.data;
    } catch (error) {
      console.error('Error al obtener camiones:', error);
      throw error;
    }
  },

  // Obtener un camión por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/camiones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener camión:', error);
      throw error;
    }
  },

  // Crear nuevo camión
  create: async (camionData) => {
    try {
      const response = await api.post('/camiones', {
        placa: camionData.placa,
        capacidad_toneladas: parseFloat(camionData.capacidad_toneladas),
        estado_vehiculo: camionData.estado_vehiculo || 'operativo',
        id_conductor: camionData.id_conductor || null
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear camión:', error);
      throw error;
    }
  },

    // Obtener camiones disponibles para una fecha específica
    getDisponiblesParaFecha: async (fecha) => {
      try {
        const response = await api.get(`/camiones/disponibles-para-fecha/${fecha}`);
        return response.data;
      } catch (error) {
        console.error('Error al obtener camiones disponibles para fecha:', error);
        throw error;
      }
    },

  // Actualizar camión
  update: async (id, camionData) => {
    try {
      const response = await api.put(`/camiones/${id}`, {
        placa: camionData.placa,
        capacidad_toneladas: parseFloat(camionData.capacidad_toneladas),
        estado_vehiculo: camionData.estado_vehiculo,
        id_conductor: camionData.id_conductor || null
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar camión:', error);
      throw error;
    }
  },

  // Eliminar camión
  delete: async (id) => {
    try {
      const response = await api.delete(`/camiones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar camión:', error);
      throw error;
    }
  },

  // Obtener camiones para selector
  getForSelect: async () => {
    try {
      const response = await api.get('/camiones/select');
      return response.data;
    } catch (error) {
      console.error('Error al obtener camiones para select:', error);
      throw error;
    }
  },

  // Obtener camiones disponibles (sin asignaciones activas)
  getDisponibles: async () => {
    try {
      const response = await api.get('/camiones/disponibles');
      return response.data;
    } catch (error) {
      console.error('Error al obtener camiones disponibles:', error);
      throw error;
    }
  },

  // Cambiar estado del camión
  cambiarEstado: async (id, estado) => {
    try {
      const response = await api.patch(`/camiones/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  },

  // Obtener conductores disponibles para asignar
  getConductoresDisponibles: async () => {
    try {
      const response = await api.get('/camiones/conductores-disponibles');
      return response.data;
    } catch (error) {
      console.error('Error al obtener conductores disponibles:', error);
      throw error;
    }
  },

  // Asignar conductor a camión
  asignarConductor: async (id, idConductor) => {
    try {
      const response = await api.post(`/camiones/${id}/asignar-conductor`, {
        id_conductor: idConductor
      });
      return response.data;
    } catch (error) {
      console.error('Error al asignar conductor:', error);
      throw error;
    }
  },

  // Quitar conductor de camión
  quitarConductor: async (id) => {
    try {
      const response = await api.delete(`/camiones/${id}/quitar-conductor`);
      return response.data;
    } catch (error) {
      console.error('Error al quitar conductor:', error);
      throw error;
    }
  }
};