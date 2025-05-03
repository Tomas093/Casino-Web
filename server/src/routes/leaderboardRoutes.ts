import {Request, Response, Router} from 'express';
import {leaderboardService} from '../services/leaderboardService';

const router = Router();

// Serialize BigInt values to strings
function serializeBigInt(data: any): any {
    if (data === null || data === undefined) return data;

    if (typeof data === 'bigint') {
        return data.toString();
    }

    if (Array.isArray(data)) {
        return data.map(serializeBigInt);
    }

    if (typeof data === 'object') {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
        );
    }

    return data;
}

// Flatten nested user data structure
function flattenUserData(data: any[]): any[] {
    if (!Array.isArray(data)) {
        console.error('Expected array in flattenUserData but got:', typeof data);
        return [];
    }

    return data.map(item => {
        if (!item) return null;

        try {
            // Handle top plays (bets and returns)
            if (item.cliente && item.cliente.usuario) {
                return {
                    jugadaid: item.jugadaid,
                    clienteid: item.clienteid,
                    nombre: item.cliente.usuario.nombre || '',
                    apellido: item.cliente.usuario.apellido || '',
                    img: item.cliente.usuario.img || null,
                    apuesta: item.apuesta,
                    retorno: item.retorno,
                    fecha: item.fecha,
                    juegoNombre: item.juegoNombre || 'Unknown'
                };
            }

            // Check for mostPlayed data format (data format already flattened in service)
            if (item.jugadaCount !== undefined && item.nombre !== undefined && item.img !== undefined) {
                return item; // Already in correct format from service
            }

            // Direct object with nombre/apellido (from our fixed service)
            if (item.nombre !== undefined && item.clienteid !== undefined) {
                // Object already has flattened structure
                return {
                    clienteid: item.clienteid,
                    nombre: item.nombre || '',
                    apellido: item.apellido || '',
                    img: item.img || null,
                    totalProfit: item.totalReturn !== undefined ? item.totalReturn : 0,
                    winPercentage: item.percentGain !== undefined ? item.percentGain * 100 : undefined,
                    saldo: item.saldo !== undefined ? item.saldo : 0,
                    jugadaCount: item.jugadaCount // Add this line to preserve the jugadaCount
                };
            }

            // Fallback case
            return item;
        } catch (error) {
            console.error('Error flattening user data:', error);
            return null;
        }
    }).filter(Boolean); // Remove null entries
}

// Helper to parse time frame parameter
const getTimeframe = (timeframe: string): 'day' | 'month' | 'year' | 'all' => {
    switch(timeframe) {
        case 'day': return 'day';
        case 'month': return 'month';
        case 'year': return 'year';
        default: return 'all';
    }
};

// Convert API timeframe to service timeframe
const convertTimeframe = (timeframe: 'day' | 'month' | 'year' | 'all'): 'day' | 'month' | 'year' | 'historical' => {
    return timeframe === 'all' ? 'historical' : timeframe;
};

// Get top winners by game type
router.get('/game-winners/:gameType', async (req: Request, res: Response) => {
    try {
        const { gameType } = req.params;
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;

        const winners = await leaderboardService.getCumulativeEarnings(
            limit,
            convertTimeframe(timeframe)
        );

        // Transform and flatten the data structure
        const flattenedData = flattenUserData(Array.isArray(winners) ? winners : []);


        const gameWinners = flattenedData.map(player => ({
            ...player,
            profit: player.totalProfit || 0
        }));

        res.status(200).json(serializeBigInt(gameWinners));
    } catch (error) {
        console.error('Error getting top winners by game type:', error);
        res.status(500).json({ message: 'Error getting top winners by game type' });
    }
});

// Get top highest bets
router.get('/highest-bets', async (req: Request, res: Response) => {
    try {
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;

        const highestBets = await leaderboardService.getTopPlaysByBet(
            limit,
            convertTimeframe(timeframe)
        );

        // Transform and flatten data
        const flattenedData = flattenUserData(Array.isArray(highestBets) ? highestBets : []);

        res.status(200).json(serializeBigInt(flattenedData));
    } catch (error) {
        console.error('Error getting highest bets:', error);
        res.status(500).json({ message: 'Error getting highest bets' });
    }
});

// Get top highest returns
router.get('/highest-returns', async (req: Request, res: Response) => {
    try {
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;

        const highestReturns = await leaderboardService.getTopPlaysByReturn(
            limit,
            convertTimeframe(timeframe)
        );

        // Transform and flatten data
        const flattenedData = flattenUserData(Array.isArray(highestReturns) ? highestReturns : []);

        res.status(200).json(serializeBigInt(flattenedData));
    } catch (error) {
        console.error('Error getting highest returns:', error);
        res.status(500).json({ message: 'Error getting highest returns' });
    }
});

// Get top accumulated winnings
router.get('/accumulated-winnings', async (req: Request, res: Response) => {
    try {
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;

        const accumulatedWinnings = await leaderboardService.getCumulativeEarnings(
            limit,
            convertTimeframe(timeframe)
        );

        // Transform and flatten data
        const flattenedData = flattenUserData(Array.isArray(accumulatedWinnings) ? accumulatedWinnings : []);

        res.status(200).json(serializeBigInt(flattenedData));
    } catch (error) {
        console.error('Error getting accumulated winnings:', error);
        res.status(500).json({ message: 'Error getting accumulated winnings' });
    }
});

// Get top win percentage
router.get('/win-percentage', async (req: Request, res: Response) => {
    try {
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;

        const winPercentage = await leaderboardService.getTopByPercentageGain(
            limit,
            convertTimeframe(timeframe)
        );

        // Transform and flatten data
        const flattenedData = flattenUserData(Array.isArray(winPercentage) ? winPercentage : []);

        res.status(200).json(serializeBigInt(flattenedData));
    } catch (error) {
        console.error('Error getting win percentage:', error);
        res.status(500).json({ message: 'Error getting win percentage' });
    }
});

// get top player by how much they played
router.get('/most-played', async (req: Request, res: Response) => {
    try {
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;

        const mostPlayed = await leaderboardService.getTopPlayersByPlays(
            limit,
            convertTimeframe(timeframe)
        );

        // Transform and flatten data
        const flattenedData = flattenUserData(Array.isArray(mostPlayed) ? mostPlayed : []);

        res.status(200).json(serializeBigInt(flattenedData));
    } catch (error) {
        console.error('Error getting most played:', error);
        res.status(500).json({ message: 'Error getting most played' });
    }
});

// Get friends leaderboard
router.get('/friends/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;

        const friendsLeaderboard = await leaderboardService.getFriendsLeaderboard(
            Number(userId),
            limit,
            convertTimeframe(timeframe)
        );

        res.status(200).json(serializeBigInt(friendsLeaderboard));
    } catch (error) {
        console.error('Error fetching friends leaderboard:', error);
        res.status(500).json({ message: 'Error fetching friends leaderboard' });
    }
});

// Get all leaderboards
router.get('/all', async (req: Request, res: Response) => {
    try {
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;
        const timeframeConverted = convertTimeframe(timeframe);

        // Add proper error handling for each request
        const fetchData = async () => {
            try {
                // Fetch all data with proper error handling
                const [highestBets, mostPlayed, highestReturns, accumulatedWinnings, winPercentages] = await Promise.all([
                    leaderboardService.getTopPlaysByBet(limit, timeframeConverted).catch(err => {
                        console.error('Error fetching highest bets:', err);
                        return [];
                    }),
                    leaderboardService.getTopPlayersByPlays(limit, timeframeConverted).catch(err => {
                        console.error('Error fetching most played:', err);
                        return [];
                    }),
                    leaderboardService.getTopPlaysByReturn(limit, timeframeConverted).catch(err => {
                        console.error('Error fetching highest returns:', err);
                        return [];
                    }),
                    leaderboardService.getCumulativeEarnings(limit, timeframeConverted).catch(err => {
                        console.error('Error fetching cumulative earnings:', err);
                        return [];
                    }),
                    leaderboardService.getTopByPercentageGain(limit, timeframeConverted).catch(err => {
                        console.error('Error fetching percentage gain:', err);
                        return [];
                    })
                ]);

                return { highestBets, mostPlayed, highestReturns, accumulatedWinnings, winPercentages };
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
                return {
                    highestBets: [],
                    mostPlayed: [],
                    highestReturns: [],
                    accumulatedWinnings: [],
                    winPercentages: []
                };
            }
        };

        const data = await fetchData();

        // Transform and prepare the response
        const allLeaderboards = {
            highestBets: flattenUserData(Array.isArray(data.highestBets) ? data.highestBets : []),
            mostPlays: flattenUserData(Array.isArray(data.mostPlayed) ? data.mostPlayed : []), // Changed from mostPlayed to mostPlays
            highestReturns: flattenUserData(Array.isArray(data.highestReturns) ? data.highestReturns : []),
            accumulatedWinnings: flattenUserData(Array.isArray(data.accumulatedWinnings) ? data.accumulatedWinnings : []),
            topWinPercentages: flattenUserData(Array.isArray(data.winPercentages) ? data.winPercentages : [])
        };

        res.status(200).json(serializeBigInt(allLeaderboards));
    } catch (error) {
        console.error('Error getting all leaderboards:', error);
        res.status(500).json({ message: 'Error getting all leaderboards' });
    }
});

export default router;

