import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import tiempodesesionApi, {TiempoDeSesionData} from '@api/tiempodesesionApi.ts';

// Types for returned data
interface tiempodesesionRecord {
    tiempodesesion: number;
    user_id: number;
    inicio: string;
    fin: string | null;
}

interface tiempodesesionStats {
    totalDurationMinutes: number;
}

// Context state
interface tiempodesesionContextState {
    isLoading: boolean;
    error: string | null;
    tiempodesesionRecords: tiempodesesionRecord[];
    tiempodesesionDiario: tiempodesesionStats | null;
    tiempodesesionSemanal: tiempodesesionStats | null;
    tiempodesesionMensual: tiempodesesionStats | null;
    createtiempodesesion: (data: TiempoDeSesionData) => Promise<void>;
    updatetiempodesesion: (tiempodesesion: number, data: TiempoDeSesionData) => Promise<void>;
    fetchAlltiempodesesion: (userId: number) => Promise<void>;
    fetchtiempodesesionDaily: (userId: number) => Promise<void>;
    fetchtiempodesesionWeekly: (userId: number) => Promise<void>;
    fetchtiempodesesionMonthly: (userId: number) => Promise<void>;
    fetchAllStats: (userId: number) => Promise<void>;
    makeHeartbeat: (tiempodesesionid: number) => Promise<void>;
    getTiempodeSesionById: (tiempodesesionId: number) => Promise<tiempodesesionRecord | null>;
}

// Create context
const TiempoDeSesionContext = createContext<tiempodesesionContextState | undefined>(undefined);

// Context provider
export const TiempoDeSesionProvider = ({children}: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tiempodesesionRecords, settiempodesesionRecords] = useState<tiempodesesionRecord[]>([]);
    const [tiempodesesionDiario, settiempodesesionDiario] = useState<tiempodesesionStats | null>(null);
    const [tiempodesesionSemanal, settiempodesesionSemanal] = useState<tiempodesesionStats | null>(null);
    const [tiempodesesionMensual, settiempodesesionMensual] = useState<tiempodesesionStats | null>(null);

    // Memoized makeHeartbeat to avoid re-creating on each render
    const makeHeartbeat = useCallback(async (tiempodesesionId: number) => {
        try {
            await tiempodesesionApi.makeHeartbeat(tiempodesesionId);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar tiempo de sesión');
        }
    }, []);

    // Make heartbeat every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const tiempodesesionid = localStorage.getItem('timepodesesionid');
            if (tiempodesesionid) {
                makeHeartbeat(parseInt(tiempodesesionid));
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [makeHeartbeat]);

    // Memoized functions
    const fetchAlltiempodesesion = useCallback(async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await tiempodesesionApi.getAlltiempodesesionByUserId(userId);
            settiempodesesionRecords(data);
        } catch (err: any) {
            setError(err.message || 'Error al obtener registros de tiempo de juego');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchtiempodesesionDaily = useCallback(async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await tiempodesesionApi.getUsertiempodesesionByDay(userId);
            settiempodesesionDiario(data);
        } catch (err: any) {
            setError(err.message || 'Error al obtener tiempo de juego diario');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchtiempodesesionWeekly = useCallback(async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await tiempodesesionApi.getUsertiempodesesionByWeek(userId);
            settiempodesesionSemanal(data);
        } catch (err: any) {
            setError(err.message || 'Error al obtener tiempo de juego semanal');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchtiempodesesionMonthly = useCallback(async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await tiempodesesionApi.getUsertiempodesesionByMonth(userId);
            settiempodesesionMensual(data);
        } catch (err: any) {
            setError(err.message || 'Error al obtener tiempo de juego mensual');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAllStats = useCallback(async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchAlltiempodesesion(userId),
                fetchtiempodesesionDaily(userId),
                fetchtiempodesesionWeekly(userId),
                fetchtiempodesesionMonthly(userId)
            ]);
        } catch (err: any) {
            setError(err.message || 'Error al obtener estadísticas de tiempo de juego');
        } finally {
            setIsLoading(false);
        }
    }, [
        fetchAlltiempodesesion,
        fetchtiempodesesionDaily,
        fetchtiempodesesionWeekly,
        fetchtiempodesesionMonthly
    ]);

    const createtiempodesesion = useCallback(async (data: TiempoDeSesionData) => {
        setIsLoading(true);
        setError(null);
        try {
            await tiempodesesionApi.createtiempodesesion(data);
            if (data.usuarioid) {
                await fetchAlltiempodesesion(data.usuarioid);
            }
        } catch (err: any) {
            setError(err.message || 'Error al crear tiempo de juego');
        } finally {
            setIsLoading(false);
        }
    }, [fetchAlltiempodesesion]);

    const updatetiempodesesion = useCallback(async (tiempodesesion: number, data: TiempoDeSesionData) => {
        setIsLoading(true);
        setError(null);
        try {
            await tiempodesesionApi.updatetiempodesesion(tiempodesesion, data);
            if (data.usuarioid) {
                await fetchAlltiempodesesion(data.usuarioid);
            }
        } catch (err: any) {
            setError(err.message || 'Error al actualizar tiempo de juego');
        } finally {
            setIsLoading(false);
        }
    }, [fetchAlltiempodesesion]);

    const getTiempodeSesionById = useCallback(async (tiempodesesionId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            return await tiempodesesionApi.getTiempodeSesionById(tiempodesesionId);
        } catch (err: any) {
            setError(err.message || 'Error al obtener tiempo de juego');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value = {
        isLoading,
        error,
        tiempodesesionRecords,
        tiempodesesionDiario,
        tiempodesesionSemanal,
        tiempodesesionMensual,
        createtiempodesesion,
        updatetiempodesesion,
        fetchAlltiempodesesion,
        fetchtiempodesesionDaily,
        fetchtiempodesesionWeekly,
        fetchtiempodesesionMonthly,
        fetchAllStats,
        makeHeartbeat,
        getTiempodeSesionById
    };

    return (
        <TiempoDeSesionContext.Provider value={value}>
            {children}
        </TiempoDeSesionContext.Provider>
    );
};

// Hook for using the context
export const usetiempodesesion = () => {
    const context = useContext(TiempoDeSesionContext);
    if (context === undefined) {
        throw new Error('usetiempodesesion must be used within a tiempodesesionProvider');
    }
    return context;
};