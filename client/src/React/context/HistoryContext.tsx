import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import historyApi, { GameHistoryResponse } from '../api/historyApi';

// Definir la interfaz del contexto
interface HistoryContextType {
  userHistory: GameHistoryResponse | null;
  loading: boolean;
  error: string | null;
  getUserHistory: (userId: string | number) => Promise<GameHistoryResponse>;
  clearHistory: () => void;
}

// Crear el contexto
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// Props para el proveedor del contexto
interface HistoryProviderProps {
  children: ReactNode;
}

// Componente proveedor del contexto
export const HistoryProvider: React.FC<HistoryProviderProps> = ({ children }) => {
  const [userHistory, setUserHistory] = useState<GameHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener el historial de un usuario específico
  const getUserHistory = useCallback(async (userId: string | number): Promise<GameHistoryResponse> => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyApi.getUserHistory(userId);
      setUserHistory(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener el historial del usuario');
      console.error('Error al obtener historial:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar los datos del historial
  const clearHistory = useCallback(() => {
    setUserHistory(null);
    setError(null);
  }, []);

  return (
    <HistoryContext.Provider value={{
      userHistory,
      loading,
      error,
      getUserHistory,
      clearHistory
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory debe ser usado dentro de un HistoryProvider');
  }
  return context;
};