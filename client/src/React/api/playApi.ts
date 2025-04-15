import axios from 'axios';

const API_URL = 'http://localhost:3001/play';

interface PlayData {
    clienteid: number;
    partidaid: number;
    fecha: string;
    retorno: number;
    apuesta: number;
}

const playApi = {

    createPlay: async (playData: PlayData) => {
        try {
            const response = await axios.post(`${API_URL}/jugada`, playData);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al crear jugada');
            } else {
                throw error;
            }
        }
    },

    getAllPlays: async () => {
        try {
            const response = await axios.get(`${API_URL}/jugadas`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadas');
            } else {
                throw error;
            }
        }
    },

    getJugadaById: async (jugadaid: number) => {
        try {
            const response = await axios.get(`${API_URL}/jugada/${jugadaid}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugada por ID');
            } else {
                throw error;
            }
        }
    },

    getAllJugadasByPartidaId: async (partidaid: number) => {
        try {
            const response = await axios.get(`${API_URL}/jugadas/partida/${partidaid}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadas por partida ID');
            } else {
                throw error;
            }
        }
    },

    getJugadasByUserId: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/jugadas/cliente/${userId}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadas por cliente ID');
            } else {
                throw error;
            }
        }
    },

    getJugadasByRetorno: async (retorno: number) => {
        try {
            const response = await axios.get(`${API_URL}/jugadas/retorno/${retorno}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadas por retorno');
            } else {
                throw error;
            }
        }

    },

    getJugadasCountByUserId: async (userId: number) => {
        try {
            const response = await axios.get(`${API_URL}/jugadas/count/${userId}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener el conteo de jugadas por cliente ID');
            } else {
                throw error;
            }
        }
    }

}

export default playApi;
