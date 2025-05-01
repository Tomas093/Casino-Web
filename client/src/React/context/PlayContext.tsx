import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import playApi from '@api/playApi';

// Esta interfaz debe coincidir exactamente con lo que espera el backend
interface UserPlayData {
    usuarioid: number;
    juegoid: number;  // Debe ser juegoid, no partidaid
    fecha: string;
    retorno: number;
    apuesta: number;
}

interface playContextType {
    createPlay: (playData: UserPlayData) => Promise<any>;
    getAllPlays: () => Promise<any>;
    getJugadaById: (jugadaid: number) => Promise<any>;
    getAllJugadasByPartidaId: (partidaid: number) => Promise<any>;
    getJugadasByUserId: (userId: number) => Promise<any>;
    getJugadasByRetorno: (retorno: number) => Promise<any>;
    isLoading: boolean; // Añadido para poder mostrar estados de carga
}

interface PlayProviderProps {
    children: ReactNode;
}

const PlayContext = createContext<playContextType | null>(null);

export const PlayProvider = ({children}: PlayProviderProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const createPlay = useCallback(async (playData: UserPlayData) => {
        setIsLoading(true);
        try {
            console.log('PlayContext: Creando jugada con datos:', playData);
            const result = await playApi.createPlay(playData);
            console.log('PlayContext: Jugada creada exitosamente:', result);
            return result;
        } catch (error) {
            console.error('PlayContext: Error al crear jugada:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAllPlays = useCallback(async () => {
        setIsLoading(true);
        try {
            return await playApi.getAllPlays();
        } catch (error) {
            console.error('PlayContext: Error al obtener todas las jugadas:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getJugadaById = useCallback(async (jugadaid: number) => {
        setIsLoading(true);
        try {
            return await playApi.getJugadaById(jugadaid);
        } catch (error) {
            console.error('PlayContext: Error al obtener jugada por ID:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAllJugadasByPartidaId = useCallback(async (partidaid: number) => {
        setIsLoading(true);
        try {
            return await playApi.getAllJugadasByPartidaId(partidaid);
        } catch (error) {
            console.error('PlayContext: Error al obtener jugadas por partida ID:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getJugadasByUserId = useCallback(async (userId: number) => {
        setIsLoading(true);
        try {
            console.log(`PlayContext: Obteniendo jugadas para el cliente ID: ${userId}`);
            const result = await playApi.getJugadasByUserId(userId);
            console.log(`PlayContext: Jugadas obtenidas para cliente ${userId}:`, result);
            return result;
        } catch (error) {
            console.error('PlayContext: Error al obtener jugadas por usuario ID:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getJugadasByRetorno = useCallback(async (retorno: number) => {
        setIsLoading(true);
        try {
            return await playApi.getJugadasByRetorno(retorno);
        } catch (error) {
            console.error('PlayContext: Error al obtener jugadas por retorno:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const contextValue : playContextType = {
        createPlay,
        getAllPlays,
        getJugadaById,
        getAllJugadasByPartidaId,
        getJugadasByUserId,
        getJugadasByRetorno,
        isLoading
    }

    return (
        <PlayContext.Provider value={contextValue}>
            {children}
        </PlayContext.Provider>
    );
}

export const usePlay = () => {
    const context = useContext(PlayContext);
    if (!context) {
        throw new Error('usePlay debe ser usado dentro de un PlayProvider');
    }
    return context;
};