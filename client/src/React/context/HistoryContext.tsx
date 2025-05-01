import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import historyApi, {GameHistoryResponse} from '../api/historyApi';

interface HistoryContextType {
  userHistory: GameHistoryResponse | null;
  fullHistory: any | null;
  loading: boolean;
  error: string | null;
  getUserHistory: (userId: string | number) => Promise<GameHistoryResponse>;
  getAllUserHistory: (userId: string | number) => Promise<any>;
  clearHistory: () => void;
}


const HistoryContext = createContext<HistoryContextType | undefined>(undefined);


interface HistoryProviderProps {
  children: ReactNode;
}


export const HistoryProvider: React.FC<HistoryProviderProps> = ({ children }) => {
  const [userHistory, setUserHistory] = useState<GameHistoryResponse | null>(null);
  const [fullHistory, setFullHistory] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const getAllUserHistory = useCallback(async (userId: string | number): Promise<any> => {
    setLoading(true);
    setError(null);
    try {

      const data = await historyApi.getAllHistory(userId);
      setFullHistory(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener el historial completo del usuario');
      console.error('Error al obtener historial completo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);




  // Limpiar los datos del historial
  const clearHistory = useCallback(() => {
    setUserHistory(null);
    setFullHistory(null);
    setError(null);
  }, []);

  return (
      <HistoryContext.Provider value={{
        userHistory,
        fullHistory,
        loading,
        error,
        getUserHistory,
        getAllUserHistory,
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