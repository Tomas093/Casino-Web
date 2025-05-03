import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import gameApi, {GameData} from '../api/gameApi';

// Definir la interfaz del contexto
interface GameContextType {
  games: GameData[];
  loading: boolean;
  error: string | null;
  selectedGame: GameData | null;
  fetchGames: () => Promise<void>;
  fetchGameById: (id: number) => Promise<void>;
  createGame: (game: Omit<GameData, 'juegoid'>) => Promise<void>;
  updateGame: (id: number, game: Partial<GameData>) => Promise<void>;
  deleteGame: (id: number) => Promise<void>;
  setSelectedGame: (game: GameData | null) => void;
}

// Crear el contexto
const GameContext = createContext<GameContextType | undefined>(undefined);

// Props para el proveedor del contexto
interface GameProviderProps {
  children: ReactNode;
}

// Componente proveedor del contexto
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [games, setGames] = useState<GameData[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los juegos
  const fetchGames = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await gameApi.getGames();
      setGames(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar juegos');
      console.error('Error al cargar juegos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar un juego por ID
  const fetchGameById = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await gameApi.getGameById(id);
      setSelectedGame(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el juego');
      console.error('Error al cargar el juego:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo juego
  const createGame = async (game: Omit<GameData, 'juegoid'>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const newGame = await gameApi.createGame(game);
      setGames([...games, newGame]);
    } catch (err: any) {
      setError(err.message || 'Error al crear el juego');
      console.error('Error al crear el juego:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un juego existente
  const updateGame = async (id: number, game: Partial<GameData>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const updatedGame = await gameApi.updateGame(id, game);
      setGames(games.map(g => g.juegoid === id ? updatedGame : g));
      if (selectedGame && selectedGame.juegoid === id) {
        setSelectedGame(updatedGame);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el juego');
      console.error('Error al actualizar el juego:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un juego
  const deleteGame = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await gameApi.deleteGame(id);
      setGames(games.filter(game => game.juegoid !== id));
      if (selectedGame && selectedGame.juegoid === id) {
        setSelectedGame(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el juego');
      console.error('Error al eliminar el juego:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar la lista inicial de juegos al montar el componente
  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <GameContext.Provider value={{
      games,
      loading,
      error,
      selectedGame,
      fetchGames,
      fetchGameById,
      createGame,
      updateGame,
      deleteGame,
      setSelectedGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext debe ser usado dentro de un GameProvider');
  }
  return context;
};