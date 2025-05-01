import {createContext, ReactNode, useContext, useState} from 'react';
import leaderboardApi from '../api/leaderboardApi';

// Type for timeframe filtering
export type TimeFrame = 'day' | 'month' | 'year' | 'all';

// Interfaces for data types
interface GameWinner {
    clienteid: number;
    nombre: string;
    apellido: string;
    profit: string; // BigInt is serialized as string
}

interface HighestBet {
    jugadaid: number;
    clienteid: number;
    nombre: string;
    apellido: string;
    apuesta: string; // BigInt is serialized as string
    fecha: string;
    juegoNombre: string;
}

interface HighestReturn {
    jugadaid: number;
    clienteid: number;
    nombre: string;
    apellido: string;
    retorno: string; // BigInt is serialized as string
    fecha: string;
    juegoNombre: string;
}

interface AccumulatedWinning {
    clienteid: number;
    nombre: string;
    apellido: string;
    totalProfit: string; // BigInt is serialized as string
}

interface WinPercentage {
    clienteid: number;
    nombre: string;
    apellido: string;
    totalBets: number;
    wins: number;
    winPercentage: number;
    totalProfit: string; // BigInt is serialized as string
}

// Context state
interface LeaderboardContextState {
    isLoading: boolean;
    error: string | null;
    timeframe: TimeFrame;
    setTimeframe: (timeframe: TimeFrame) => void;
    gameWinners: {
        [gameType: string]: GameWinner[];
    };
    highestBets: HighestBet[];
    highestReturns: HighestReturn[];
    accumulatedWinnings: AccumulatedWinning[];
    topWinPercentages: WinPercentage[];
    fetchGameWinners: (gameType: string) => Promise<void>;
    fetchHighestBets: () => Promise<void>;
    fetchHighestReturns: () => Promise<void>;
    fetchAccumulatedWinnings: () => Promise<void>;
    fetchTopWinPercentages: () => Promise<void>;
    fetchAllLeaderboards: () => Promise<void>;
}

// Create context
const LeaderboardContext = createContext<LeaderboardContextState | undefined>(undefined);

// Context provider
export const LeaderboardProvider = ({children}: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<TimeFrame>('all');
    const [gameWinners, setGameWinners] = useState<{[gameType: string]: GameWinner[]}>({});
    const [highestBets, setHighestBets] = useState<HighestBet[]>([]);
    const [highestReturns, setHighestReturns] = useState<HighestReturn[]>([]);
    const [accumulatedWinnings, setAccumulatedWinnings] = useState<AccumulatedWinning[]>([]);
    const [topWinPercentages, setTopWinPercentages] = useState<WinPercentage[]>([]);

    // Fetch winners by game type
    const fetchGameWinners = async (gameType: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getTopWinnersByGameType(gameType, timeframe);
            setGameWinners(prev => ({...prev, [gameType]: data}));
        } catch (err: any) {
            setError(err.message || `Error loading leaderboard for ${gameType}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch highest bets
    const fetchHighestBets = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getHighestBets(timeframe);
            setHighestBets(data);
        } catch (err: any) {
            setError(err.message || 'Error loading highest bets leaderboard');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch highest returns
    const fetchHighestReturns = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getHighestReturns(timeframe);
            setHighestReturns(data);
        } catch (err: any) {
            setError(err.message || 'Error loading highest returns leaderboard');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch accumulated winnings
    const fetchAccumulatedWinnings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getAccumulatedWinnings(timeframe);
            setAccumulatedWinnings(data);
        } catch (err: any) {
            setError(err.message || 'Error loading accumulated winnings leaderboard');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch top win percentages
    const fetchTopWinPercentages = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getWinPercentage(timeframe);
            setTopWinPercentages(data);
        } catch (err: any) {
            setError(err.message || 'Error loading win percentage leaderboard');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all leaderboard data at once
    const fetchAllLeaderboards = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaderboardApi.getAllLeaderboards(timeframe);
            setGameWinners(data.gameWinners);
            setHighestBets(data.highestBets);
            setHighestReturns(data.highestReturns);
            setAccumulatedWinnings(data.accumulatedWinnings);
            setTopWinPercentages(data.topWinPercentages);
        } catch (err: any) {
            setError(err.message || 'Error loading leaderboards');
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        isLoading,
        error,
        timeframe,
        setTimeframe,
        gameWinners,
        highestBets,
        highestReturns,
        accumulatedWinnings,
        topWinPercentages,
        fetchGameWinners,
        fetchHighestBets,
        fetchHighestReturns,
        fetchAccumulatedWinnings,
        fetchTopWinPercentages,
        fetchAllLeaderboards
    };

    return (
        <LeaderboardContext.Provider value={value}>
            {children}
        </LeaderboardContext.Provider>
    );
};

// Hook for using the context
export const useLeaderboard = () => {
    const context = useContext(LeaderboardContext);
    if (context === undefined) {
        throw new Error('useLeaderboard must be used within a LeaderboardProvider');
    }
    return context;
};