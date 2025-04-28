import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { leaderboardService } from '../services/leaderboardService';

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

// Obtener los 10 jugadores con mayor balance
router.get('/top-balance', async (_req: Request, res: Response) => {
    try {
        const topPlayers = await leaderboardService.getTop10PlayersBalance();
        res.status(200).json(serializeBigInt(topPlayers)); // Aplicar serializeBigInt
    } catch (error) {
        console.error('Error al obtener jugadores con mayor balance:', error);
        res.status(500).json({ message: 'Error al obtener jugadores con mayor balance' });
    }
});

// Obtener los 10 jugadores con mayor número de jugadas
router.get('/top-plays',  async (_req: Request, res: Response) => {
    try {
        const topPlayers = await leaderboardService.getTop10PlayersPlays();
        res.status(200).json(serializeBigInt(topPlayers)); // Aplicar serializeBigInt
    } catch (error) {
        console.error('Error al obtener jugadores con más jugadas:', error);
        res.status(500).json({ message: 'Error al obtener jugadores con más jugadas' });
    }
});

// Obtener los 10 jugadores con mayor retorno promedio
router.get('/top-average-return', async (_req: Request, res: Response) => {
    try {
        const topPlayers = await leaderboardService.getTop10PlayersAverageReturn();
        res.status(200).json(serializeBigInt(topPlayers)); // Aplicar serializeBigInt
    } catch (error) {
        console.error('Error al obtener jugadores con mayor retorno promedio:', error);
        res.status(500).json({ message: 'Error al obtener jugadores con mayor retorno promedio' });
    }
});

// Obtener las 10 jugadas con mayor retorno
router.get('/top-returns', async (_req: Request, res: Response) => {
    try {
        const topPlays = await leaderboardService.getTop10PlayersReturns();
        res.status(200).json(serializeBigInt(topPlays)); // Aplicar serializeBigInt
    } catch (error) {
        console.error('Error al obtener jugadas con mayor retorno:', error);
        res.status(500).json({ message: 'Error al obtener jugadas con mayor retorno' });
    }
});

export default router;