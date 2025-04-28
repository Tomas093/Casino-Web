import axios from 'axios';

const API_URL = 'http://localhost:3001/play';

// Esta interfaz debe coincidir exactamente con lo que espera el backend
interface UserPlayData {
    usuarioid: number;
    juegoid: number;  // Debe ser juegoid, no partidaid
    fecha: string;
    retorno: number;
    apuesta: number;
}
const playApi = {
    createPlay: async (playData: UserPlayData) => {
        try {
            console.log('Enviando datos de jugada al backend:', playData);
            const response = await axios.post(`${API_URL}/jugada`, playData);
            console.log('Respuesta del backend:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error completo en createPlay:', error);
            if (error.response) {
                console.error('Detalles del error de respuesta:', error.response.data);
                throw new Error(error.response.data.error || `Error al crear jugada: ${error.response.status}`);
            } else if (error.request) {
                // La solicitud se hizo pero no se recibió respuesta
                console.error('No hubo respuesta del servidor');
                throw new Error('No se recibió respuesta del servidor. Verifique que el backend esté en ejecución.');
            } else {
                // Algo ocurrió en la configuración de la solicitud
                console.error('Error en la configuración de la solicitud:', error.message);
                throw error;
            }
        }
    },

    getAllPlays: async () => {
        try {
            const response = await axios.get(`${API_URL}/jugadas`);
            return response.data;
        } catch (error: any) {
            console.error('Error completo en getAllPlays:', error);
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
            console.error('Error completo en getJugadaById:', error);
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugada por ID');
            } else {
                throw error;
            }
        }
    },

    getAllJugadasByPartidaId: async (partidaid: number) => {
        try {
            // La ruta del backend espera 'partida'
            const response = await axios.get(`${API_URL}/jugadas/partida/${partidaid}`);
            return response.data;
        } catch (error: any) {
            console.error('Error completo en getAllJugadasByPartidaId:', error);
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadas por partida ID');
            } else {
                throw error;
            }
        }
    },

    getJugadasByUserId: async (userId: number) => {
        try {
            console.log(`Obteniendo jugadas para el cliente ID: ${userId}`);
            const response = await axios.get(`${API_URL}/jugadas/cliente/${userId}`);
            console.log('Jugadas obtenidas:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error completo en getJugadasByUserId:', error);
            if (error.response) {
                throw new Error(error.response.data.error || `Error al obtener jugadas por cliente ID: ${error.response.status}`);
            } else if (error.request) {
                throw new Error('No se recibió respuesta del servidor al obtener jugadas del cliente.');
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
            console.error('Error completo en getJugadasByRetorno:', error);
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener jugadas por retorno');
            } else {
                throw error;
            }
        }
    },
}

export default playApi;