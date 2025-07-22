import axios from 'axios';

const API_URL = 'http://localhost:3001/lobby'; // Adjust if your base URL is different

export interface Lobby {
    lobby_id: number;
    client1: string | null;
    client2: string | null;
    client3: string | null;
}

const handleApiError = (error: any, context: string) => {
    console.error(`Error ${context}:`, error);
    if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Error in ${context}`);
    }
    throw error;
};

const lobbyApi = {
    createLobby: async (lobbyId: number): Promise<Lobby> => {
        try {
            const response = await axios.post<Lobby>(`${API_URL}/`, {lobbyId});
            return response.data;
        } catch (error) {
            handleApiError(error, 'creating lobby');
            throw error; // Re-throw to be handled by the caller
        }
    },

    getAllLobbies: async (): Promise<Lobby[]> => {
        try {
            const response = await axios.get<Lobby[]>(`${API_URL}/`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'getting all lobbies');
            throw error;
        }
    },

    getLobbyById: async (lobbyId: number): Promise<Lobby> => {
        try {
            const response = await axios.get<Lobby>(`${API_URL}/${lobbyId}`);
            return response.data;
        } catch (error) {
            handleApiError(error, `getting lobby ${lobbyId}`);
            throw error;
        }
    },

    joinLobby: async (lobbyId: number, clientId: string): Promise<Lobby> => {
        try {
            const response = await axios.post<Lobby>(`${API_URL}/${lobbyId}/join`, {clientId});
            return response.data;
        } catch (error) {
            handleApiError(error, `joining lobby ${lobbyId}`);
            throw error;
        }
    },

    leaveLobby: async (lobbyId: number, clientId: string): Promise<Lobby> => {
        try {
            const response = await axios.post<Lobby>(`${API_URL}/${lobbyId}/leave`, {clientId});
            return response.data;
        } catch (error) {
            handleApiError(error, `leaving lobby ${lobbyId}`);
            throw error;
        }
    },

    getLobbyPlayers: async (lobbyId: number): Promise<string[]> => {
        try {
            const response = await axios.get<string[]>(`${API_URL}/${lobbyId}/players`);
            return response.data;
        } catch (error) {
            handleApiError(error, `getting players for lobby ${lobbyId}`);
            throw error;
        }
    },

    getPlayerCount: async (lobbyId: number): Promise<{ count: number }> => {
        try {
            const response = await axios.get<{ count: number }>(`${API_URL}/${lobbyId}/players/count`);
            return response.data;
        } catch (error) {
            handleApiError(error, `getting player count for lobby ${lobbyId}`);
            throw error;
        }
    },

    deleteLobby: async (lobbyId: number): Promise<Lobby> => {
        try {
            const response = await axios.delete<Lobby>(`${API_URL}/${lobbyId}`);
            return response.data;
        } catch (error) {
            handleApiError(error, `deleting lobby ${lobbyId}`);
            throw error;
        }
    },

    updateLobby: async (lobbyId: number, data: Partial<Lobby>): Promise<Lobby> => {
        try {
            const response = await axios.put<Lobby>(`${API_URL}/${lobbyId}`, data);
            return response.data;
        } catch (error) {
            handleApiError(error, `updating lobby ${lobbyId}`);
            throw error;
        }
    },

    clearLobby: async (lobbyId: number): Promise<Lobby> => {
        try {
            const response = await axios.post<Lobby>(`${API_URL}/${lobbyId}/clear`);
            return response.data;
        } catch (error) {
            handleApiError(error, `clearing lobby ${lobbyId}`);
            throw error;
        }
    },

    isLobbyFull: async (lobbyId: number): Promise<{ isFull: boolean }> => {
        try {
            const response = await axios.get<{ isFull: boolean }>(`${API_URL}/${lobbyId}/full`);
            return response.data;
        } catch (error) {
            handleApiError(error, `checking if lobby ${lobbyId} is full`);
            throw error;
        }
    },

    isLobbyEmpty: async (lobbyId: number): Promise<{ isEmpty: boolean }> => {
        try {
            const response = await axios.get<{ isEmpty: boolean }>(`${API_URL}/${lobbyId}/empty`);
            return response.data;
        } catch (error) {
            handleApiError(error, `checking if lobby ${lobbyId} is empty`);
            throw error;
        }
    },
};

export default lobbyApi;