import {createContext, useContext, ReactNode, useState, useCallback} from 'react';
import playApi from '@api/playApi';


interface PlayData {
    clienteid: number;
    partidaid: number;
    fecha: string;
    retorno: number;
    apuesta: number;
}

interface playContextType {
    createPlay: (playData: PlayData) => Promise<any>;
    getAllPlays: () => Promise<any>;
    getJugadaById: (jugadaid: number) => Promise<any>;
    getAllJugadasByPartidaId: (partidaid: number) => Promise<any>;
    getJugadasByUserId: (userId: number) => Promise<any>;
    getJugadasByRetorno: (retorno: number) => Promise<any>;
    getJugadasCountByUserId: (userId: number) => Promise<any>;

}

interface PlayProviderProps {
    children: ReactNode;
}

const PlayContext = createContext<playContextType | null>(null);

export const PlayProvider = ({children}: PlayProviderProps) => {
    const [ , setIsLoading ] = useState<boolean>(false);

    const createPlay = useCallback(async (playData: PlayData) => {
        setIsLoading(true);
        try {
            return await playApi.createPlay(playData);
        } catch (error) {
            console.error('Error al crear jugada:', error);
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
            console.error('Error al obtener todas las jugadas:', error);
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
            console.error('Error al obtener jugada por ID:', error);
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
            console.error('Error al obtener jugadas por partida ID:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getJugadasByUserId = useCallback(async (userId: number) => {
        setIsLoading(true);
        try {
            return await playApi.getJugadasByUserId(userId);
        } catch (error) {
            console.error('Error al obtener jugadas por usuario ID:', error);
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
            console.error('Error al obtener jugadas por retorno:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getJugadasCountByUserId = useCallback(async (userId: number) => {
        setIsLoading(true);
        try {
            return await playApi.getJugadasCountByUserId(userId);
        } catch (error) {
            console.error('Error al obtener conteo de jugadas por usuario ID:', error);
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
        getJugadasCountByUserId
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
        throw new Error('useTransaction debe ser usado dentro de un TransactionProvider');
    }
    return context;

};



