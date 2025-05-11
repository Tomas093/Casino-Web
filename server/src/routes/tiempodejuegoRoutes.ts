import {Request, Response, Router} from 'express';
import {tiempodejuegoService} from '../services/tiempodejuegoService';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
    const {usuarioid, final} = req.body;

    try {
        if (!usuarioid) {
            throw new Error('El campo usuarioid es obligatorio.');
        }

        const tiempodejuego = await tiempodejuegoService.createTiempoDeJuego({usuarioid, final});
        res.status(201).json(tiempodejuego);
    } catch (error: any) {
        console.error("Error al crear tiempo de juego:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al crear el tiempo de juego'});
    }
});


router.get('/user/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const tiempodejuego = await tiempodejuegoService.getAllTiempoDeJuegoByUserId(parseInt(userId));
        res.status(200).json(tiempodejuego);
    } catch (error: any) {
        console.error("Error al obtener tiempos de juego por usuario:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener los tiempos de juego'});
    }
});

router.get('/today/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const tiempodejuego = await tiempodejuegoService.getTotalTiempoDeJuegoByUserId(parseInt(userId));
        res.status(200).json(tiempodejuego);
    } catch (error: any) {
        console.error("Error al obtener tiempo de juego total por usuario:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el tiempo de juego total'});
    }
});

router.get('/week/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const tiempodejuego = await tiempodejuegoService.getUserTiempoDeJuegoByWeek(parseInt(userId));
        res.status(200).json(tiempodejuego);
    } catch (error: any) {
        console.error("Error al obtener tiempo de juego por día:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el tiempo de juego por día'});
    }
});

router.get('/month/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const tiempodejuego = await tiempodejuegoService.getUserTiempoDeJuegoByMonth(parseInt(userId));
        res.status(200).json(tiempodejuego);
    } catch (error: any) {
        console.error("Error al obtener tiempo de juego por mes:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el tiempo de juego por mes'});
    }
});


router.put('/:tiempodejuegoid', async (req: Request, res: Response) => {
    const {tiempodejuegoid} = req.params;
    const {usuarioid, final} = req.body;

    try {
        const tiempodejuego = await tiempodejuegoService.updateTiempoDeJuego(parseInt(tiempodejuegoid), {
            usuarioid,
            final
        });
        res.status(200).json(tiempodejuego);
    } catch (error: any) {
        console.error("Error al actualizar tiempo de juego:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al actualizar el tiempo de juego'});
    }
});

export default router;