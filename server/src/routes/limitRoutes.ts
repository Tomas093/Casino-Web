import {Request, Response, Router} from "express";
import {limitService} from "../services/limitService";

const router = Router();

// Get horario limit by usuarioid
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

// Get monetario limit by usuarioid
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

// Get horario limit by clienteid
router.get('/limitehorario/cliente/:clienteid', async (req: Request, res: Response) => {
    const {clienteid} = req.params;
    try {
        const limitehorario = await limitService.getlimiteHorarioByClienteId(parseInt(clienteid, 10));
        res.status(200).json(limitehorario);
    } catch (error) {
        console.error("Error al obtener el límite horario por cliente:", error);
        res.status(500).json({error: 'Error al obtener el límite horario por cliente'});
    }
});

// Get monetario limit by clienteid
router.get('/limitemonetario/cliente/:clienteid', async (req: Request, res: Response) => {
    const {clienteid} = req.params;
    try {
        const limitemonetario = await limitService.getlimiteMonetarioByClienteId(parseInt(clienteid, 10));
        res.status(200).json(limitemonetario);
    } catch (error) {
        console.error("Error al obtener el límite monetario por cliente:", error);
        res.status(500).json({error: 'Error al obtener el límite monetario por cliente'});
    }
});

// Update horario limit by usuarioid
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

// Update monetario limit by usuarioid
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

// Update horario limit by clienteid
router.put('/limitehorario/cliente/:clienteid', async (req: Request, res: Response) => {
    const {clienteid} = req.params;
    const {limitediario, limitesemanal, limitemensual} = req.body;

    try {
        const result = await limitService.updateLimiteHorarioByClienteId(
            parseInt(clienteid, 10),
            limitediario,
            limitesemanal,
            limitemensual
        );
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al actualizar el límite horario por cliente:", error);
        res.status(500).json({error: 'Error al actualizar el límite horario por cliente'});
    }
});

// Update monetario limit by clienteid
router.put('/limitemonetario/cliente/:clienteid', async (req: Request, res: Response) => {
    const {clienteid} = req.params;
    const {limitediario, limitesemanal, limitemensual} = req.body;

    try {
        const result = await limitService.updateLimiteMonetarioByClienteId(
            parseInt(clienteid, 10),
            limitediario,
            limitesemanal,
            limitemensual
        );
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al actualizar el límite monetario por cliente:", error);
        res.status(500).json({error: 'Error al actualizar el límite monetario por cliente'});
    }
});

export default router;