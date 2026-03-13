import api from './api';

export const contenedorService = {
  // Obtener todos los contenedores
  getAll: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.id_punto_verde) params.append('id_punto_verde', filtros.id_punto_verde);
      if (filtros.id_material) params.append('id_material', filtros.id_material);

      const url = `/contenedores${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener contenedores:', error);
      throw error;
    }
  },

  // Obtener un contenedor por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/contenedores/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener contenedor:', error);
      throw error;
    }
  },

  // Crear nuevo contenedor
  create: async (contenedorData) => {
    try {
      const response = await api.post('/contenedores', {
        id_punto_verde: contenedorData.id_punto_verde,
        id_material: contenedorData.id_material,
        capacidad_m3: parseFloat(contenedorData.capacidad_m3),
        estado_contenedor: contenedorData.estado_contenedor || 'disponible'
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear contenedor:', error);
      throw error;
    }
  },

  // Actualizar contenedor
  update: async (id, contenedorData) => {
    try {
      const response = await api.put(`/contenedores/${id}`, {
        id_punto_verde: contenedorData.id_punto_verde,
        id_material: contenedorData.id_material,
        capacidad_m3: parseFloat(contenedorData.capacidad_m3),
        estado_contenedor: contenedorData.estado_contenedor
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar contenedor:', error);
      throw error;
    }
  },

  // Eliminar contenedor
  delete: async (id) => {
    try {
      const response = await api.delete(`/contenedores/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar contenedor:', error);
      throw error;
    }
  },

  // Obtener contenedores por llenar (alerta)
  getPorLlenar: async () => {
    try {
      const response = await api.get('/contenedores/por-llenar');
      return response.data;
    } catch (error) {
      console.error('Error al obtener contenedores por llenar:', error);
      throw error;
    }
  },

  // Programar vaciado
  programarVaciado: async (data) => {
    try {
      const response = await api.post('/contenedores/programar-vaciado', {
        id_contenedor: data.id_contenedor,
        fecha_programada: data.fecha_programada
      });
      return response.data;
    } catch (error) {
      console.error('Error al programar vaciado:', error);
      throw error;
    }
  },

  // Realizar vaciado
  realizarVaciado: async (idVaciado) => {
    try {
      const response = await api.post(`/contenedores/vaciados/${idVaciado}/realizar`);
      return response.data;
    } catch (error) {
      console.error('Error al realizar vaciado:', error);
      throw error;
    }
  },

  // Obtener vaciados pendientes
  getVaciadosPendientes: async () => {
    try {
      const response = await api.get('/contenedores/vaciados/pendientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener vaciados pendientes:', error);
      throw error;
    }
  }
};