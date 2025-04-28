import {Router, Request, Response} from 'express';
import {isAuthenticated} from '../middlewares/authMiddleware';
import {playService} from '../services/playService';

const router = Router();

// Crear una jugada
router.post('/jugada', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
    const {usuarioid, juegoid, fecha, retorno, apuesta} = req.body;

    if (!usuarioid || !juegoid || !fecha || retorno === undefined || apuesta === undefined) {
        res.status(400).json({
            message: 'Datos incompletos',
            received: {usuarioid, juegoid, fecha, retorno, apuesta}
        });
        return;
    }

    try {
        console.log('playRoutes: Recibiendo solicitud para crear jugada:', req.body);
        const jugada = await playService.createJugada({usuarioid, juegoid, fecha, retorno, apuesta});
        console.log('playRoutes: Jugada creada exitosamente:', jugada);
        res.status(201).json(jugada);
    } catch (error: any) {
        console.error('Error al crear jugada:', error);
        res.status(500).json({
            message: 'Error al crear jugada',
            error: error.message
        });
    }
});

// Obtener todas las jugadas
router.get('/jugadas', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
    try {
        const jugadas = await playService.getAllJugadas();
        res.status(200).json(jugadas);
    } catch (error: any) {
        console.error('Error al obtener todas las jugadas:', error);
        res.status(500).json({
            message: 'Error al obtener todas las jugadas',
            error: error.message
        });
    }
});

// Obtener todas las jugadas de una partida
router.get('/jugadas/partida/:partidaid', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
    const {partidaid} = req.params;
    try {
        const jugadas = await playService.getJugadasByJuegoId(parseInt(partidaid));
        res.status(200).json(jugadas);
    } catch (error: any) {
        console.error('Error al obtener jugadas de la partida:', error);
        res.status(500).json({
            message: 'Error al obtener jugadas de la partida',
            error: error.message
        });
    }
});

// Obtener una jugada por ID
router.get('/jugada/:jugadaid', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
    const {jugadaid} = req.params;
    try {
        const jugada = await playService.getJugadaById(parseInt(jugadaid));
        if (!jugada) {
            res.status(404).json({message: 'Jugada no encontrada'});
            return;
        }
        res.status(200).json(jugada);
    } catch (error: any) {
        console.error('Error al obtener jugada:', error);
        res.status(500).json({
            message: 'Error al obtener jugada',
            error: error.message
        });
    }
});

// Obtener todas las jugadas con un retorno mayor a un valor específico
router.get('/jugadas/retorno/:retorno', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
    const {retorno} = req.params;
    try {
        const jugadas = await playService.getJugadasByRetorno(parseFloat(retorno));
        res.status(200).json(jugadas);
    } catch (error: any) {
        console.error('Error al obtener jugadas con retorno mayor a:', error);
        res.status(500).json({
            message: 'Error al obtener jugadas con retorno mayor a',
            error: error.message
        });
    }
});

// Corrige la ruta para que coincida con lo que espera playApi.ts
router.get('/jugadas/cliente/:userId', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
    const {userId} = req.params;
    try {
        console.log(`playRoutes: Buscando jugadas para usuario ID: ${userId}`);
        const jugadas = await playService.getJugadasByUserId(parseInt(userId));
        console.log(`playRoutes: Se encontraron ${jugadas.length} jugadas`);
        res.status(200).json(jugadas);
    } catch (error: any) {
        console.error('Error al obtener jugadas del cliente:', error);
        res.status(500).json({
            message: 'Error al obtener jugadas del cliente',
            error: error.message
        });
    }
});

export default router;