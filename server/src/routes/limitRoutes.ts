import {Request, Response, Router} from "express";
import {limitService} from "../services/limitService";

const router = Router();

router.get('/limitehorario/:id', async (req: Request, res: Response) => {
    const {id: userId} = req.params;
    try {
        const limitehorario = await limitService.getlimiteHorario(parseInt(userId, 10));
        res.status(200).json(limitehorario);
    } catch (error) {
        console.error("Error al obtener el límite horario:", error);
        res.status(500).json({error: 'Error al obtener el límite horario'});
    }
});

router.get('/limitemonetario/:id', async (req: Request, res: Response) => {
    const {id: userId} = req.params;
    try {
        const limitemonetario = await limitService.getlimiteMonetario(parseInt(userId, 10));
        res.status(200).json(limitemonetario);
    } catch (error) {
        console.error("Error al obtener el límite monetario:", error);
        res.status(500).json({error: 'Error al obtener el límite monetario'});
    }
});

// In limitRoutes.ts - add these routes
router.put('/limitehorario/:id', async (req: Request, res: Response) => {
    const {id: userId} = req.params;
    const {limitediario, limitesemanal, limitemensual} = req.body;

    try {
        const result = await limitService.updateLimiteHorario(
            parseInt(userId, 10),
            limitediario,
            limitesemanal,
            limitemensual
        );
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al actualizar el límite horario:", error);
        res.status(500).json({error: 'Error al actualizar el límite horario'});
    }
});

router.put('/limitemonetario/:id', async (req: Request, res: Response) => {
    const {id: userId} = req.params;
    const {limitediario, limitesemanal, limitemensual} = req.body;

    try {
        const result = await limitService.updateLimiteMonetario(
            parseInt(userId, 10),
            limitediario,
            limitesemanal,
            limitemensual
        );
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al actualizar el límite monetario:", error);
        res.status(500).json({error: 'Error al actualizar el límite monetario'});
    }
});
export default router;