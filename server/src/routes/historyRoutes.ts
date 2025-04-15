import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { historyService } from '../services/historyService';

const router = Router();

router.use(isAuthenticated);

// Obtener las últimas 5 jugadas de todos los juegos del usuario Específico
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