import {Request, Response, Router} from 'express';
import {leaderboardService} from '../services/leaderboardService';

const router = Router();

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

// Get top winners by game type (Cambiar Esto)
router.get('/game-winners/:gameType', async (req: Request, res: Response) => {
    try {
        const { gameType } = req.params;
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;
        const winners = await leaderboardService.getCumulativeEarnings(
            limit,
            convertTimeframe(timeframe)
        );

        res.status(200).json(serializeBigInt(winners));
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
        res.status(200).json(serializeBigInt(highestBets));
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
        res.status(200).json(serializeBigInt(highestReturns));
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
        res.status(200).json(serializeBigInt(accumulatedWinnings));
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
        res.status(200).json(serializeBigInt(winPercentage));
    } catch (error) {
        console.error('Error getting win percentage:', error);
        res.status(500).json({ message: 'Error getting win percentage' });
    }
});

// Get all leaderboards
router.get('/all', async (req: Request, res: Response) => {
    try {
        const timeframe = getTimeframe(req.query.timeframe as string);
        const limit = parseInt(req.query.limit as string) || 10;
        const timeframeConverted = convertTimeframe(timeframe);

        const allLeaderboards = {
            // Create a structure that matches what the client expects
            gameWinners: {}, // Would need game-specific implementation
            highestBets: await leaderboardService.getTopPlaysByBet(limit, timeframeConverted),
            highestReturns: await leaderboardService.getTopPlaysByReturn(limit, timeframeConverted),
            accumulatedWinnings: await leaderboardService.getCumulativeEarnings(limit, timeframeConverted),
            topWinPercentages: await leaderboardService.getTopByPercentageGain(limit, timeframeConverted)
        };

        res.status(200).json(serializeBigInt(allLeaderboards));
    } catch (error) {
        console.error('Error getting all leaderboards:', error);
        res.status(500).json({ message: 'Error getting all leaderboards' });
    }
});

export default router;