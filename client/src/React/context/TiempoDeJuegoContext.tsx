import { createContext, ReactNode, useContext, useState } from 'react';
import tiempodejuegoApi, { TiempoDeJuegoData } from '../api/tiempodejuegoApi';

// Types for returned data
interface TiempoDeJuegoRecord {
  tiempodejuegoid: number;
  user_id: number;
  inicio: string;
  fin: string | null;
}

interface TiempoDeJuegoStats {
  totalDurationMinutes: number;
}

// Context state
interface TiempoDeJuegoContextState {
  isLoading: boolean;
  error: string | null;
  tiempoDeJuegoRecords: TiempoDeJuegoRecord[];
  tiempoDeJuegoDiario: TiempoDeJuegoStats | null;
  tiempoDeJuegoSemanal: TiempoDeJuegoStats | null;
  tiempoDeJuegoMensual: TiempoDeJuegoStats | null;
  createTiempoDeJuego: (data: TiempoDeJuegoData) => Promise<void>;
  updateTiempoDeJuego: (tiempodejuegoid: number, data: TiempoDeJuegoData) => Promise<void>;
  fetchAllTiempoDeJuego: (userId: number) => Promise<void>;
  fetchTiempoDeJuegoDaily: (userId: number) => Promise<void>;
  fetchTiempoDeJuegoWeekly: (userId: number) => Promise<void>;
  fetchTiempoDeJuegoMonthly: (userId: number) => Promise<void>;
  fetchAllStats: (userId: number) => Promise<void>;
}

// Create context
const TiempoDeJuegoContext = createContext<TiempoDeJuegoContextState | undefined>(undefined);

// Context provider
export const TiempoDeJuegoProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiempoDeJuegoRecords, setTiempoDeJuegoRecords] = useState<TiempoDeJuegoRecord[]>([]);
  const [tiempoDeJuegoDiario, setTiempoDeJuegoDiario] = useState<TiempoDeJuegoStats | null>(null);
  const [tiempoDeJuegoSemanal, setTiempoDeJuegoSemanal] = useState<TiempoDeJuegoStats | null>(null);
  const [tiempoDeJuegoMensual, setTiempoDeJuegoMensual] = useState<TiempoDeJuegoStats | null>(null);

  // Create new time record
  const createTiempoDeJuego = async (data: TiempoDeJuegoData) => {
    setIsLoading(true);
    setError(null);
    try {
      await tiempodejuegoApi.createTiempoDeJuego(data);
      // Refresh the records if needed
      if (data.usuarioid) {
        await fetchAllTiempoDeJuego(data.usuarioid);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear tiempo de juego');
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing time record
  const updateTiempoDeJuego = async (tiempodejuegoid: number, data: TiempoDeJuegoData) => {
    setIsLoading(true);
    setError(null);
    try {
      await tiempodejuegoApi.updateTiempoDeJuego(tiempodejuegoid, data);
      // Refresh the records if needed
      if (data.usuarioid) {
        await fetchAllTiempoDeJuego(data.usuarioid);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar tiempo de juego');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all time records for a user
  const fetchAllTiempoDeJuego = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tiempodejuegoApi.getAllTiempoDeJuegoByUserId(userId);
      setTiempoDeJuegoRecords(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener registros de tiempo de juego');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch daily stats
  const fetchTiempoDeJuegoDaily = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tiempodejuegoApi.getUserTiempoDeJuegoByDay(userId);
      setTiempoDeJuegoDiario(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener tiempo de juego diario');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weekly stats
  const fetchTiempoDeJuegoWeekly = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tiempodejuegoApi.getUserTiempoDeJuegoByWeek(userId);
      setTiempoDeJuegoSemanal(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener tiempo de juego semanal');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch monthly stats
  const fetchTiempoDeJuegoMonthly = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tiempodejuegoApi.getUserTiempoDeJuegoByMonth(userId);
      setTiempoDeJuegoMensual(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener tiempo de juego mensual');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all stats at once
  const fetchAllStats = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Execute all requests in parallel for efficiency
      await Promise.all([
        fetchAllTiempoDeJuego(userId),
        fetchTiempoDeJuegoDaily(userId),
        fetchTiempoDeJuegoWeekly(userId),
        fetchTiempoDeJuegoMonthly(userId)
      ]);
    } catch (err: any) {
      setError(err.message || 'Error al obtener estadísticas de tiempo de juego');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    error,
    tiempoDeJuegoRecords,
    tiempoDeJuegoDiario,
    tiempoDeJuegoSemanal,
    tiempoDeJuegoMensual,
    createTiempoDeJuego,
    updateTiempoDeJuego,
    fetchAllTiempoDeJuego,
    fetchTiempoDeJuegoDaily,
    fetchTiempoDeJuegoWeekly,
    fetchTiempoDeJuegoMonthly,
    fetchAllStats
  };

  return (
    <TiempoDeJuegoContext.Provider value={value}>
      {children}
    </TiempoDeJuegoContext.Provider>
  );
};

// Hook for using the context
export const useTiempoDeJuego = () => {
  const context = useContext(TiempoDeJuegoContext);
  if (context === undefined) {
    throw new Error('useTiempoDeJuego must be used within a TiempoDeJuegoProvider');
  }
  return context;
};