import axios from 'axios';
import { TimeFrame } from '../context/LeaderboardContext';

const API_URL = 'http://localhost:3001/leaderboard';

const leaderboardApi = {
    // Get top winners by specific game type
    getTopWinnersByGameType: async (gameType: string, timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/game-winners/${gameType}`, {
                params: { timeframe, limit }
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || `Error getting top winners for ${gameType}`);
            } else {
                throw error;
            }
        }
    },

    // Get players with highest bets
    getHighestBets: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/highest-bets`, {
                params: { timeframe, limit }
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting highest bets');
            } else {
                throw error;
            }
        }
    },

    // Get plays with highest returns
    getHighestReturns: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/highest-returns`, {
                params: { timeframe, limit }
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting highest returns');
            } else {
                throw error;
            }
        }
    },

    // Get players with highest accumulated winnings
    getAccumulatedWinnings: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/accumulated-winnings`, {
                params: { timeframe, limit }
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting accumulated winnings');
            } else {
                throw error;
            }
        }
    },

    // Get players with highest win percentage
    getWinPercentage: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/win-percentage`, {
                params: { timeframe, limit }
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting win percentage');
            } else {
                throw error;
            }
        }
    },

    // Get all leaderboard data at once
    getAllLeaderboards: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/all`, {
                params: { timeframe, limit }
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting all leaderboard data');
            } else {
                throw error;
            }
        }
    }
};

export default leaderboardApi;
