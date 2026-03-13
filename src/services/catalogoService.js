import api from './api';

export const catalogoService = {
  // Tipos de residuo
  getTiposResiduo: async () => {
    try {
      const response = await api.get('/tipos-residuo');
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de residuo:', error);
      throw error;
    }
  },

  getTiposResiduoForSelect: async () => {
    try {
      const response = await api.get('/tipos-residuo/select');
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de residuo para select:', error);
      throw error;
    }
  },

  // Estados de ruta
  getEstadosRuta: async () => {
    try {
      const response = await api.get('/estados-ruta');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estados de ruta:', error);
      throw error;
    }
  },

  getEstadoActivo: async () => {
    try {
      const response = await api.get('/estados-ruta/activo');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estado activo:', error);
      throw error;
    }
  }
};