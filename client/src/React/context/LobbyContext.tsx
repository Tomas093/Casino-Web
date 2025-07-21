import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import lobbyApi, {Lobby} from '@api/lobbyApi';

interface LobbyContextType {
    isLoading: boolean;
    createLobby: (lobbyId: number) => Promise<Lobby>;
    getAllLobbies: () => Promise<Lobby[]>;
    getLobbyById: (lobbyId: number) => Promise<Lobby>;
    joinLobby: (lobbyId: number, clientId: string) => Promise<Lobby>;
    leaveLobby: (lobbyId: number, clientId: string) => Promise<Lobby>;
    getLobbyPlayers: (lobbyId: number) => Promise<string[]>;
    getPlayerCount: (lobbyId: number) => Promise<{ count: number }>;
    deleteLobby: (lobbyId: number) => Promise<Lobby>;
    updateLobby: (lobbyId: number, data: Partial<Lobby>) => Promise<Lobby>;
    clearLobby: (lobbyId: number) => Promise<Lobby>;
    isLobbyFull: (lobbyId: number) => Promise<{ isFull: boolean }>;
    isLobbyEmpty: (lobbyId: number) => Promise<{ isEmpty: boolean }>;
}

export const LobbyContext = createContext<LobbyContextType | null>(null);

export const LobbyProvider = ({children}: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const createLobby = useCallback(async (lobbyId: number) => {
        setIsLoading(true);
        try {
            return await lobbyApi.createLobby(lobbyId);
        } catch (error) {
            console.error('Error creating lobby:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAllLobbies = useCallback(async () => {
        setIsLoading(true);
        try {
            return await lobbyApi.getAllLobbies();
        } catch (error) {
            console.error('Error getting all lobbies:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getLobbyById = useCallback(async (lobbyId: number) => {
        setIsLoading(true);
        try {
            return await lobbyApi.getLobbyById(lobbyId);
        } catch (error) {
            console.error(`Error getting lobby ${lobbyId}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const joinLobby = useCallback(async (lobbyId: number, clientId: string) => {
        setIsLoading(true);
        try {
            return await lobbyApi.joinLobby(lobbyId, clientId);
        } catch (error) {
            console.error(`Error joining lobby ${lobbyId}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const leaveLobby = useCallback(async (lobbyId: number, clientId: string) => {
        setIsLoading(true);
        try {
            return await lobbyApi.leaveLobby(lobbyId, clientId);
        } catch (error) {
            console.error(`Error leaving lobby ${lobbyId}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getLobbyPlayers = useCallback(async (lobbyId: number) => {
        setIsLoading(true);
        try {
            return await lobbyApi.getLobbyPlayers(lobbyId);
        } catch (error) {
            console.error(`Error getting players for lobby ${lobbyId}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getPlayerCount = useCallback(async (lobbyId: number) => {
        setIsLoading(true);
        try {
            return await lobbyApi.getPlayerCount(lobbyId);
        } catch (error) {
            console.error(`Error getting player count for lobby ${lobbyId}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteLobby = useCallback(async (lobbyId: number) => {
        setIsLoading(true);
        try {
            return await lobbyApi.deleteLobby(lobbyId);
        } catch (error) {
            console.error(`Error deleting lobby ${lobbyId}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateLobby = useCallback(async (lobbyId: number, data: Partial<Lobby>) => {
        setIsLoading(true);
        try {
            return await lobbyApi.updateLobby(lobbyId, data);
        } catch (error) {
            console.error(`Error updating lobby ${lobbyId}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearLobby = useCallback(async (lobbyId: number) => {
        setIsLoading(true);
        try {
            return await lobbyApi.clearLobby(lobbyId);
        } catch (error) {
            console.error(`Error clearing lobby ${lobbyId}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const isLobbyFull = useCallback(async (lobbyId: number) => {
        setIsLoading(true);
        try {
            return await lobbyApi.isLobbyFull(lobbyId);
        } catch (error) {
            console.error(`Error checking if lobby ${lobbyId} is full:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const isLobbyEmpty = useCallback(async (lobbyId: number) => {
        setIsLoading(true);
        try {
            return await lobbyApi.isLobbyEmpty(lobbyId);
        } catch (error) {
            console.error(`Error checking if lobby ${lobbyId} is empty:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value = {
        isLoading,
        createLobby,
        getAllLobbies,
        getLobbyById,
        joinLobby,
        leaveLobby,
        getLobbyPlayers,
        getPlayerCount,
        deleteLobby,
        updateLobby,
        clearLobby,
        isLobbyFull,
        isLobbyEmpty,
    };

    return (
        <LobbyContext.Provider value={value}>
            {children}
        </LobbyContext.Provider>
    );
};

export const useLobbyContext = () => {
    const context = useContext(LobbyContext);
    if (!context) {
        throw new Error('useLobbyContext must be used within a LobbyProvider');
    }
    return context;
};