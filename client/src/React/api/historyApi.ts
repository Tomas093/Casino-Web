import axios from 'axios';

const API_URL = 'http://localhost:3001/history';

export interface HistoryData {
    clienteid: number;
    partidaid: number;
    fecha: string;
    retorno: number;
    apuesta: number;
}

// Interfaz para la respuesta del historial
export interface GameHistoryResponse {
    [juegoid: number]: {
        juego: {
            juegoid: number;
            nombre: string;
            descripcion: string;
            [key: string]: any;
        };
        jugadas: HistoryData[];
    };
}

const historyApi = {

    // Obtener el historial de jugadas de un usuario específico
    getUserHistory: async (userId: string | number): Promise<GameHistoryResponse> => {
        try {
            const response = await axios.get(`${API_URL}/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener historial de usuario:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al obtener historial');
            } else {
                throw error;
            }
        }
    }
};

export default historyApi;