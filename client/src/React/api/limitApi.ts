import axios from 'axios';

const API_URL = 'http://localhost:3001/limit';

export interface LimitData {
    clienteid: number;
    limitediario: number;
    limitosemanal: number;
    limitomensual: number;
}

interface LimitUpdateData {
    limitediario: number;
    limitesemanal: number;
    limitemensual: number;
}

const limitApi = {
    getLimitHorario: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/limitehorario/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener límite horario:', error);
            throw error;
        }
    },

    getLimitMonetario: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/limitemonetario/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener límite monetario:', error);
            throw error;
        }
    },

    updateLimitHorario: async (userId: number, limits: LimitUpdateData) => {
        try {
            const response = await axios.put(`${API_URL}/limitehorario/${userId}`, limits);
            return response.data;
        } catch (error: any) {
            console.error('Error al actualizar límite horario:', error);
            throw error;
        }
    },

    updateLimitMonetario: async (userId: number, limits: LimitUpdateData) => {
        try {
            const response = await axios.put(`${API_URL}/limitemonetario/${userId}`, limits);
            return response.data;
        } catch (error: any) {
            console.error('Error al actualizar límite monetario:', error);
            throw error;
        }
    }
};

export default limitApi;