// 4. Importante: Reordenar las rutas para evitar conflictos
// En Express, las rutas se evalúan en orden, así que debemos colocar primero
// la ruta más específica para evitar que '/:userid' capture '/allHistory/:userid'

import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/authMiddleware';
import {historyService} from '../services/historyService';

const router = Router();

router.use(isAuthenticated);

// IMPORTANTE: La ruta más específica debe ir primero
router.get('/allHistory/:userid', isAuthenticated, async (req: Request, res: Response) => {
    const { userid: userId } = req.params;
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
        res.status(400).json({ message: 'El ID de usuario debe ser un número válido' });
        return;
    }
    try {
        const history = await historyService.getAllCompleteHistoryByUserId(parsedUserId);
        res.status(200).json(history);
    } catch (error) {
        console.error('Error al obtener el historial completo del cliente:', error);
        res.status(500).json({ message: 'Error al obtener historial completo del cliente' });
    }
});

// Después, la ruta más genérica
router.get('/:userid', isAuthenticated, async (req: Request, res: Response) => {
    const { userid: userId } = req.params;
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
        res.status(400).json({ message: 'El ID de usuario debe ser un número válido' });
        return;
    }
    try {
        const history = await historyService.getAllGamesHistoryByUserId(parsedUserId);
        res.status(200).json(history);
    } catch (error) {
        console.error('Error al obtener el historial del cliente:', error);
        res.status(500).json({ message: 'Error al obtener historial del cliente' });
    }
});

export default router;