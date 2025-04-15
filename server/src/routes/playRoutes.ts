import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { playService } from '../services/playService';

const router = Router();

// Crear una jugada
router.post('/jugada', isAuthenticated, async (req: Request, res: Response) => {
    const { clienteid, juegoid, fecha, retorno, apuesta } = req.body;
    try {
        const jugada = await playService.createJugada({ clienteid, juegoid, fecha, retorno, apuesta });
        res.status(201).json(jugada);
    } catch (error) {
        console.error('Error al crear jugada:', error);
        res.status(500).json({ message: 'Error al crear jugada' });
    }

});

// Obtener todas las jugadas
router.get('/jugadas', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const jugadas = await playService.getAllJugadas();
        res.status(200).json(jugadas);
    } catch (error) {
        console.error('Error al obtener todas las jugadas:', error);
        res.status(500).json({ message: 'Error al obtener todas las jugadas' });
    }
});

// Obtener todas las jugadas de una partida
router.get('/jugadas/partida/:partidaid', isAuthenticated, async (req: Request, res: Response) => {
    const { partidaid } = req.params;
    try {
        const jugadas = await playService.getJugadasByJuegoId(parseInt(partidaid));
        res.status(200).json(jugadas);
    } catch (error) {
        console.error('Error al obtener jugadas de la partida:', error);
        res.status(500).json({ message: 'Error al obtener jugadas de la partida' });
    }
});

// Obtener una jugada por ID
router.get('/jugada/:jugadaid', isAuthenticated, async (req: Request, res: Response) => {
    const { jugadaid } = req.params;
    try {
        const jugada = await playService.getJugadaById(parseInt(jugadaid));
        res.status(200).json(jugada);
    } catch (error) {
        console.error('Error al obtener jugada:', error);
        res.status(500).json({ message: 'Error al obtener jugada' });
    }
});

// Obtener todas las jugadas con un retorno mayor a un valor específico
router.get('/jugadas/retorno/:retorno', isAuthenticated, async (req: Request, res: Response) => {
    const { retorno } = req.params;
    try {
        const jugadas = await playService.getJugadasByRetorno(parseFloat(retorno));
        res.status(200).json(jugadas);
    } catch (error) {
        console.error('Error al obtener jugadas con retorno mayor a:', error);
        res.status(500).json({ message: 'Error al obtener jugadas con retorno mayor a' });
    }
});

// Obtener todas las jugadas de un cliente por ID
router.get('/jugadas/user/:userid', isAuthenticated, async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const jugadas = await playService.getJugadasByUserId(parseInt(userId));
        res.status(200).json(jugadas);
    } catch (error) {
        console.error('Error al obtener jugadas del cliente:', error);
        res.status(500).json({ message: 'Error al obtener jugadas del cliente' });
    }
});

router.get('jugadas/count/:userid',isAuthenticated, async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const count = await playService.getJugadasCountByUserId(parseInt(userId));
        res.status(200).json(count);
    } catch (error) {
        console.error('Error al obtener el conteo de jugadas del cliente:', error);
        res.status(500).json({ message: 'Error al obtener el conteo de jugadas del cliente' });
    }
})


export default router


