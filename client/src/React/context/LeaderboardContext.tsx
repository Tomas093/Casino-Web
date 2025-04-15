import {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import leaderboardApi from '../api/leaderboardApi';

// Interfaces para los tipos de datos
interface User {
    img: any;
    usuarioid: number;
    nombre: string;
    apellido: string;
}

interface Cliente {
    clienteid: number;
    usuario: User;
    balance?: number;
    jugada?: any[];
}

interface PlayerWithAverageReturn extends Cliente {
    averageReturn: number;
}

interface Jugada {
    jugadaid: number;
    clienteid: number;
    partidaid: number;
    fecha: string;
    retorno: number;
    apuesta: number;
    cliente: Cliente;
}

// Estado del contexto
interface LeaderboardContextState {
    isLoading: boolean;
    error: string | null;
    topPlayersByBalance: Cliente[];
    topPlayersByPlays: Cliente[];
    topPlayersByAverageReturn: PlayerWithAverageReturn[];
    topJugadasByReturn: Jugada[];
    fetchTopPlayersByBalance: () => Promise<void>;
    fetchTopPlayersByPlays: () => Promise<void>;
    fetchTopPlayersByAverageReturn: () => Promise<void>;
    fetchTopJugadasByReturn: () => Promise<void>;
    fetchAllLeaderboards: () => Promise<void>;
}

// Creación del contexto
const LeaderboardContext = createContext<LeaderboardContextState | undefined>(undefined);

// Proveedor del contexto
export const LeaderboardProvider = ({children}: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [topPlayersByBalance, setTopPlayersByBalance] = useState<Cliente[]>([]);
    const [topPlayersByPlays, setTopPlayersByPlays] = useState<Cliente[]>([]);
    const [topPlayersByAverageReturn, setTopPlayersByAverageReturn] = useState<PlayerWithAverageReturn[]>([]);
    const [topJugadasByReturn, setTopJugadasByReturn] = useState<Jugada[]>([]);

    // Obtener jugadores con mayor balance
    const fetchTopPlayersByBalance = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getTop10PlayersBalance();
            setTopPlayersByBalance(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar el tablero de líderes por balance');
        } finally {
            setIsLoading(false);
        }
    };

    // Obtener jugadores con más jugadas
    const fetchTopPlayersByPlays = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getTop10PlayersPlays();
            setTopPlayersByPlays(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar el tablero de líderes por jugadas');
        } finally {
            setIsLoading(false);
        }
    };

    // Obtener jugadores con mejor promedio de retorno
    const fetchTopPlayersByAverageReturn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getTop10PlayersAverageReturn();
            setTopPlayersByAverageReturn(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar el tablero de líderes por retorno promedio');
        } finally {
            setIsLoading(false);
        }
    };

    // Obtener jugadas con mayor retorno
    const fetchTopJugadasByReturn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getTop10PlayersReturns();
            setTopJugadasByReturn(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las jugadas con mayor retorno');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar todos los tableros de líderes
    const fetchAllLeaderboards = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchTopPlayersByBalance(),
                fetchTopPlayersByPlays(),
                fetchTopPlayersByAverageReturn(),
                fetchTopJugadasByReturn()
            ]);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los tableros de líderes');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchAllLeaderboards();
    }, []);

    const value = {
        isLoading,
        error,
        topPlayersByBalance,
        topPlayersByPlays,
        topPlayersByAverageReturn,
        topJugadasByReturn,
        fetchTopPlayersByBalance,
        fetchTopPlayersByPlays,
        fetchTopPlayersByAverageReturn,
        fetchTopJugadasByReturn,
        fetchAllLeaderboards
    };

    return (
        <LeaderboardContext.Provider value={value}>
            {children}
        </LeaderboardContext.Provider>
    );
};

// Hook para usar el contexto
export const useLeaderboard = () => {
    const context = useContext(LeaderboardContext);
    if (context === undefined) {
        throw new Error('useLeaderboard debe ser usado dentro de un LeaderboardProvider');
    }
    return context;
};
