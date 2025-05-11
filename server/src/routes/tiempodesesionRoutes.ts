import {Request, Response, Router} from 'express';
import {tiempodesesionService} from '../services/tiempodesesionService';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
    const {usuarioid, final} = req.body;

    try {
        if (!usuarioid) {
            throw new Error('El campo usuarioid es obligatorio.');
        }

        const tiempodesesion = await tiempodesesionService.createtiempodesesion({usuarioid, final});
        res.status(201).json(tiempodesesion);
    } catch (error: any) {
        console.error("Error al crear tiempo de juego:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al crear el tiempo de juego'});
    }
});


router.get('/user/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const tiempodesesion = await tiempodesesionService.getAlltiempodesesionByUserId(parseInt(userId));
        res.status(200).json(tiempodesesion);
    } catch (error: any) {
        console.error("Error al obtener tiempos de juego por usuario:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener los tiempos de juego'});
    }
});

router.get('/today/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const tiempodesesion = await tiempodesesionService.getTotaltiempodesesionByUserId(parseInt(userId));
        res.status(200).json(tiempodesesion);
    } catch (error: any) {
        console.error("Error al obtener tiempo de juego total por usuario:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el tiempo de juego total'});
    }
});

router.get('/week/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const tiempodesesion = await tiempodesesionService.getUsertiempodesesionByWeek(parseInt(userId));
        res.status(200).json(tiempodesesion);
    } catch (error: any) {
        console.error("Error al obtener tiempo de juego por día:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el tiempo de juego por día'});
    }
});

router.get('/month/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const tiempodesesion = await tiempodesesionService.getUsertiempodesesionByMonth(parseInt(userId));
        res.status(200).json(tiempodesesion);
    } catch (error: any) {
        console.error("Error al obtener tiempo de juego por mes:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el tiempo de juego por mes'});
    }
});

router.get('/:tiempodesesionid', async (req: Request, res: Response) => {
    const {tiempodesesionid} = req.params;

    try {
        const tiempodesesion = await tiempodesesionService.getTiempodeSesionById(parseInt(tiempodesesionid));
        res.status(200).json(tiempodesesion);
    } catch (error: any) {
        console.error("Error al obtener tiempo de juego por ID:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el tiempo de juego por ID'});
    }
})


router.put('/:tiempodesesionid', async (req: Request, res: Response) => {
    const {tiempodesesionid} = req.params;
    const {usuarioid, final} = req.body;

    try {
        const tiempodesesion = await tiempodesesionService.updatetiempodesesion(parseInt(tiempodesesionid), {
            usuarioid,
            final
        });
        res.status(200).json(tiempodesesion);
    } catch (error: any) {
        console.error("Error al actualizar tiempo de juego:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al actualizar el tiempo de juego'});
    }
});

router.put('/heartbeat/:tiempodesesionid', async (req: Request, res: Response) => {
    const {tiempodesesionid} = req.params;

    try {
        const tiempodesesion = await tiempodesesionService.makeHeartbeat(parseInt(tiempodesesionid));
        res.status(200).json(tiempodesesion);
    } catch (error: any) {
        console.error("Error al actualizar el heartbeat:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al actualizar el heartbeat'});
    }
})

export default router;