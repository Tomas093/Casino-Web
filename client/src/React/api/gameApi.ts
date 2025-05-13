import axios from 'axios';

const API_URL = 'http://localhost:3001/game';

export interface GameData {
    juegoid: number;
    nombre: string;
    estado: boolean | null | undefined;
}

const gameApi = {

    getGames: async (): Promise<GameData[]> => {
        try {
            const response = await axios.get(`${API_URL}/all`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener juegos:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al obtener juegos');
            } else {
                throw error;
            }
        }
    },

    // Obtener un juego por ID
    getGameById: async (gameId: number): Promise<GameData> => {
        try {
            const response = await axios.get(`${API_URL}/${gameId}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error al obtener juego con ID ${gameId}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al obtener juego');
            } else {
                throw error;
            }
        }
    },

    createGame: async (gameData: GameData): Promise<GameData> => {
        try {
            const response = await axios.post(`${API_URL}/create`, gameData);
            return response.data;
        } catch (error: any) {
            console.error('Error al crear juego:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al crear juego');
            } else {
                throw error;
            }
        }
    },


    updateGame: async (gameId: number, gameData: GameData): Promise<GameData> => {
        try {
            const response = await axios.put(`${API_URL}/edit/${gameId}`, gameData);
            return response.data;
        } catch (error: any) {
            console.error(`Error al actualizar juego con ID ${gameId}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al actualizar juego');
            } else {
                throw error;
            }
        }
    },

    deleteGame: async (gameId: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/delete/${gameId}`);
        } catch (error: any) {
            console.error(`Error al eliminar juego con ID ${gameId}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al eliminar juego');
            } else {
                throw error;
            }
        }
    }
};

export default gameApi;