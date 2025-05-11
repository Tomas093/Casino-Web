import axios from 'axios';

const API_URL = 'http://localhost:3001/tiempodejuego';

export interface TiempoDeJuegoData {
    usuarioid: number;
    final?: Date | null; // Ensure final is optional and nullable
}

const tiempodejuegoApi = {

    createTiempoDeJuego: async (data: TiempoDeJuegoData) => {
        try {
            const response = await axios.post(`${API_URL}/create`, data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al crear tiempo de juego');
            } else {
                throw error;
            }
        }
    },

    updateTiempoDeJuego: async (tiempodejuegoid: number, data: TiempoDeJuegoData) => {
        try {
            const response = await axios.put(`${API_URL}/${tiempodejuegoid}`, data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al actualizar tiempo de juego');
            } else {
                throw error;
            }
        }
    },

    getTotalTiempoDeJuegoByUserId: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/total/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego total:', error);
            throw error;
        }
    },

    getAllTiempoDeJuegoByUserId: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/all/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener todos los tiempos de juego:', error);
            throw error;
        }
    },

    getUserTiempoDeJuegoByDay: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/today/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego diario:', error);
            throw error;
        }
    },

    getUserTiempoDeJuegoByWeek: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/week/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego semanal:', error);
            throw error;
        }
    },

    getUserTiempoDeJuegoByMonth: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/month/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego mensual:', error);
            throw error;
        }
    }
};

export default tiempodejuegoApi;
