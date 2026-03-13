import api from './api';

export const puntoRecoleccionService = {
    // Obtener puntos de una recolección
    getByRecoleccion: async (idRecoleccion) => {
        try {
            const response = await api.get(`/recolecciones/${idRecoleccion}/puntos`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener puntos:', error);
            throw error;
        }
    },
    
    registrarBasura: async (idPunto, data) => {
        try {
            const response = await api.post(`/puntos-recoleccion-basura/${idPunto}/registrar`, data);
            return response.data;
        } catch (error) {
            console.error('Error al registrar basura:', error);
            throw error;
        }
    },

    // Marcar punto como recolectado
    completarPunto: async (idPunto) => {
        try {
            const response = await api.post(`/puntos-recoleccion-basura/${idPunto}/completar`);
            return response.data;
        } catch (error) {
            console.error('Error al completar punto:', error);
            throw error;
        }
    },

    // Reportar problema en un punto
    reportarProblema: async (idPunto, observaciones) => {
        try {
            const response = await api.post(`/puntos-recoleccion-basura/${idPunto}/problema`, {
                observaciones
            });
            return response.data;
        } catch (error) {
            console.error('Error al reportar problema:', error);
            throw error;
        }
    }
};