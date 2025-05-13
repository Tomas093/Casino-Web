import axios from 'axios';

const API_URL = 'http://localhost:3001/tiempodesesion';

export interface TiempoDeSesionData {
    usuarioid: number;
    final?: Date | null;
}

const tiempodesesionApi = {

    createtiempodesesion: async (data: TiempoDeSesionData) => {
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

    updatetiempodesesion: async (tiempodesesionid: number, data: TiempoDeSesionData) => {
        try {
            const response = await axios.put(`${API_URL}/${tiempodesesionid}`, data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al actualizar tiempo de juego');
            } else {
                throw error;
            }
        }
    },

    getTotaltiempodesesionByUserId: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/total/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego total:', error);
            throw error;
        }
    },

    getAlltiempodesesionByUserId: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener todos los tiempos de juego:', error);
            throw error;
        }
    },

    getTiempodeSesionById: async (tiempodesesionId: number) => {
        try {
            const response = await axios.get(`${API_URL}/${tiempodesesionId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego por ID:', error);
            throw error;
        }
    },

    getUsertiempodesesionByDay: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/today/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego diario:', error);
            throw error;
        }
    },

    getUsertiempodesesionByWeek: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/week/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego semanal:', error);
            throw error;
        }
    },

    getUsertiempodesesionByMonth: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/month/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego mensual:', error);
            throw error;
        }
    },

    makeHeartbeat: async (tiempodesesionId: number) => {
        try {
            const response = await axios.put(`${API_URL}/heartbeat/${tiempodesesionId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener tiempo de juego:', error);
            throw error;
        }
    }

};

export default tiempodesesionApi;
