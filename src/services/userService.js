import api from './api';

export const userService = {
  async getUsers() {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  async getUser(id) {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      console.log('Creando usuario:', userData);
      
      const payload = {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        telefono: userData.telefono,
        direccion: userData.direccion,
        estado: userData.estado ?? true,
        roles: Array.isArray(userData.roles) ? userData.roles : [userData.roles],
      };

      // Agregar licencia si es conductor
      if (payload.roles.includes('conductor') && userData.licencia) {
        payload.licencia = userData.licencia;
        payload.fecha_vencimiento_licencia = userData.fecha_vencimiento_licencia;
        payload.categoria_licencia = userData.categoria_licencia;
        payload.disponible = userData.disponible ?? true;
      }

      console.log('Payload a enviar:', payload);
      const response = await api.post('/usuarios', payload);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      console.log('Actualizando usuario:', id, userData);
      
      const payload = {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        email: userData.email,
        telefono: userData.telefono,
        direccion: userData.direccion,
        estado: userData.estado,
        roles: Array.isArray(userData.roles) ? userData.roles : [userData.roles],
      };

      if (userData.password) {
        payload.password = userData.password;
        payload.password_confirmation = userData.password_confirmation;
      }

      if (payload.roles.includes('conductor') && userData.licencia) {
        payload.licencia = userData.licencia;
        payload.fecha_vencimiento_licencia = userData.fecha_vencimiento_licencia;
        payload.categoria_licencia = userData.categoria_licencia;
        payload.disponible = userData.disponible ?? true;
      }

      console.log('Payload a enviar:', payload);
      const response = await api.put(`/usuarios/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
};