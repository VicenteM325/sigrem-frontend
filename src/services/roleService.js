// src/services/roleService.js
import api from './api';

export const roleService = {
  // Obtener todos los roles
  async getRoles() {
    try {
      const response = await api.get('/roles');
      console.log('Roles desde backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener roles:', error);
      // Fallback con los roles del seeder
      return {
        roles: [
          { id: 1, name: 'super-admin' },
          { id: 2, name: 'administrador' },
          { id: 3, name: 'supervisor' },
          { id: 4, name: 'conductor' },
          { id: 5, name: 'operador' },
          { id: 6, name: 'encargado-pv' },
          { id: 7, name: 'cuadrilla' },
          { id: 8, name: 'ciudadano' },
          { id: 9, name: 'auditor' },
        ]
      };
    }
  },

  // Obtener un rol por ID
  async getRoleById(id) {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      throw error;
    }
  },

  // Obtener todos los permisos
  async getPermissions() {
    try {
      const response = await api.get('/permisos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  }
};