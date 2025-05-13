import axios from 'axios';
import {TimeFrame} from '../context/LeaderboardContext';

const API_URL = 'http://localhost:3001/leaderboard';

const leaderboardApi = {
    // Get top winners by specific game type
    getTopWinnersByGameType: async (gameType: string, timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/game-winners/${encodeURIComponent(gameType)}`, {
                params: {timeframe, limit}
            });
            return response.data || [];
        } catch (error: any) {
            console.error(`Error fetching winners for game ${gameType}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || `Error getting top winners for ${gameType}`);
            } else {
                throw new Error(`Network error while fetching ${gameType} winners`);
            }
        }
    },

    // Get players with highest bets
    getHighestBets: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/highest-bets`, {
                params: {timeframe, limit}
            });
            return response.data || [];
        } catch (error: any) {
            console.error("Error fetching highest bets:", error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting highest bets');
            } else {
                throw new Error('Network error while fetching highest bets');
            }
        }
    },

    // Get plays with highest returns
    getHighestReturns: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/highest-returns`, {
                params: {timeframe, limit}
            });
            return response.data || [];
        } catch (error: any) {
            console.error("Error fetching highest returns:", error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting highest returns');
            } else {
                throw new Error('Network error while fetching highest returns');
            }
        }
    },

    // Get players with highest accumulated winnings
    getAccumulatedWinnings: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/accumulated-winnings`, {
                params: {timeframe, limit}
            });
            return response.data || [];
        } catch (error: any) {
            console.error("Error fetching accumulated winnings:", error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting accumulated winnings');
            } else {
                throw new Error('Network error while fetching accumulated winnings');
            }
        }
    },

    // Get players with highest win percentage
    getWinPercentage: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/win-percentage`, {
                params: {timeframe, limit}
            });
            return response.data || [];
        } catch (error: any) {
            console.error("Error fetching win percentages:", error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting win percentage');
            } else {
                throw new Error('Network error while fetching win percentages');
            }
        }
    },

    // Get player with the highest amount of plays
    getMostPlays: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/most-played`, {
                params: {timeframe, limit}
            });
            return response.data || [];
        } catch (error: any) {
            console.error("Error fetching most plays:", error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting most plays');
            } else {
                throw new Error('Network error while fetching most plays');
            }
        }
    },

    // Get leaderboard data for friends
    getFriendsLeaderboard: async (userId: number, timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/friends/${userId}`, {
                params: { timeframe, limit }
            });
            return response.data || [];
        } catch (error: any) {
            console.error("Error fetching friends leaderboard:", error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting friends leaderboard');
            } else {
                throw new Error('Network error while fetching friends leaderboard');
            }
        }
    },

    // Get all leaderboard data at once
    getAllLeaderboards: async (timeframe: TimeFrame = 'all', limit: number = 10) => {
        try {
            const response = await axios.get(`${API_URL}/all`, {
                params: {timeframe, limit}
            });

            // Ensure we have default empty arrays for each category
            return {
                gameWinners: response.data.gameWinners || {},
                highestBets: response.data.highestBets || [],
                highestReturns: response.data.highestReturns || [],
                accumulatedWinnings: response.data.accumulatedWinnings || [],
                topWinPercentages: response.data.topWinPercentages || [],
                mostPlays: response.data.mostPlays || []
            };
        } catch (error: any) {
            console.error("Error fetching all leaderboard data:", error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error getting all leaderboard data');
            } else {
                throw new Error('Network error while fetching leaderboard data');
            }
        }
    }

};

export default leaderboardApi;
