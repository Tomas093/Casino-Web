import axios from 'axios';

const API_URL = 'http://localhost:3001/leaderboard';

const leaderboardApi = {

    // Obtener los 10 jugadores con mayor balance
    getTop10PlayersBalance: async () => {
        try {
            const response = await axios.get(`${API_URL}/top-balance`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadores con mayor balance');
            } else {
                throw error;
            }
        }
    },

    // Obtener los 10 jugadores con mayor número de jugadas
    getTop10PlayersPlays: async () => {
        try {
            const response = await axios.get(`${API_URL}/top-plays`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadores con más jugadas');
            } else {
                throw error;
            }
        }
    },

    // Obtener los 10 jugadores con mayor retorno promedio
    getTop10PlayersAverageReturn: async () => {
        try {
            const response = await axios.get(`${API_URL}/top-average-return`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadores con mayor retorno promedio');
            } else {
                throw error;
            }
        }
    },

    // Obtener las 10 jugadas con mayor retorno
    getTop10PlayersReturns: async () => {
        try {
            const response = await axios.get(`${API_URL}/top-returns`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadas con mayor retorno');
            } else {
                throw error;
            }
        }
    }
};

export default leaderboardApi;