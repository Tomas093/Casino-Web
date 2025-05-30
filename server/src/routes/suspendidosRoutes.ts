import {Request, Response, Router} from 'express';
import {suspendidosService} from '../services/suspendiosService'

const router = Router();

interface suspendidosData {
    usuarioid: number;
    fechafin?: Date | null;
    adminid?: number;
    razon?: string;
}

router.post('/create', async (req: Request, res: Response) => {
    const {usuarioid, fechafin, razon} = req.body;

    try {
        if (!usuarioid) {
            throw new Error('El campo usuarioid es obligatorio.');
        }

        const suspendidos = await suspendidosService.createsuspendidos({usuarioid, fechafin, razon});
        res.status(201).json(suspendidos);
    } catch (error: any) {
        console.error("Error al crear suspendido:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al crear el suspendido'});
    }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const suspendidos = await suspendidosService.getAllsuspendidosByUserId(parseInt(userId));
        res.status(200).json(suspendidos);
    } catch (error: any) {
        console.error("Error al obtener suspendidos por usuario:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener los suspendidos'});
    }
});

router.get('/all', async (req: Request, res: Response) => {
    try {
        const suspendidos = await suspendidosService.getAllsuspendidos();
        res.status(200).json(suspendidos);
    } catch (error: any) {
        console.error("Error al obtener todos los suspendidos:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener todos los suspendidos'});
    }
});

router.get('/:suspendidosId', async (req: Request, res: Response) => {
    const {suspendidosId} = req.params;

    try {
        const suspendidos = await suspendidosService.getsuspendidosById(parseInt(suspendidosId));
        res.status(200).json(suspendidos);
    } catch (error: any) {
        console.error("Error al obtener suspendido por ID:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el suspendido'});
    }
});

router.put('/:suspendidosId', async (req: Request, res: Response) => {
    const {suspendidosId} = req.params;
    const {fechafin, razon} = req.body;

    try {
        const suspendidos = await suspendidosService.updatesuspendidos(parseInt(suspendidosId), {fechafin, razon});
        res.status(200).json(suspendidos);
    } catch (error: any) {
        console.error("Error al actualizar suspendido:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al actualizar el suspendido'});
    }
});

router.delete('/user/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        await suspendidosService.deletesuspendidos(parseInt(userId));
        res.status(204).send();
    } catch (error: any) {
        if (error.message === 'Suspendido not found') {
            res.status(404).json({ error: 'Suspendido not found' });
        } else {
            console.error("Error al eliminar suspendido:", error);
            res.status(error.statusCode || 500).json({error: error.message || 'Error al eliminar el suspendido'});
        }
    }
});

router.get('/is-suspended/:userId', async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const suspendidos = await suspendidosService.isUseridSuspendido(parseInt(userId));
        res.status(200).json(suspendidos);
    } catch (error: any) {
        console.error("Error al verificar si el usuario está suspendido:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al verificar la suspensión del usuario'});
    }
})

router.delete('/:suspendidosId', async (req: Request, res: Response) => {
    const {suspendidosId} = req.params;

    try {
        await suspendidosService.deletesuspendidos(parseInt(suspendidosId));
        res.status(204).send();
    } catch (error: any) {
        if (error.message === 'Suspendido not found') {
            res.status(404).json({ error: 'Suspendido not found' });
        } else {
            console.error("Error al eliminar suspendido:", error);
            res.status(error.statusCode || 500).json({error: error.message || 'Error al eliminar el suspendido'});
        }
    }
});

export default router;





