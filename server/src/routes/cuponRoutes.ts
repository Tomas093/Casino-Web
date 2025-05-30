import {Request, Response, Router} from 'express';
import {cuponService} from '../services/cuponService';

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
    try {
        const cupon = await cuponService.getAllCupon();
        res.status(200).json(cupon);
    } catch (error: any) {
        console.error('Error al obtener todos los cupones:', error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener los cupones'});
    }
});

router.post('/create', async (req: Request, res: Response) => {
    const {cuponid, beneficio, fechainicio, fechafin, cantidadusos, mincarga, maxcarga} = req.body;

    try {
        const cupon = await cuponService.createCupon({
            cuponid,
            beneficio,
            fechainicio,
            fechafin,
            cantidadusos,
            mincarga,
            maxcarga
        });
        res.status(201).json(cupon);
    } catch (error: any) {
        console.error('Error al crear cupón:', error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al crear el cupón'});
    }
});

router.get('/:cuponid', async (req: Request, res: Response) => {
    const {cuponid} = req.params;

    try {
        const cupon = await cuponService.getCuponById(cuponid);
        res.status(200).json(cupon);
    } catch (error: any) {
        console.error('Error al obtener cupón:', error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el cupón'});
    }
});

router.put('/:cuponid', async (req: Request, res: Response) => {
    const {cuponid} = req.params;
    const {beneficio, fechainicio, fechafin, cantidadusos, mincarga, maxcarga} = req.body;

    try {
        const cupon = await cuponService.updateCupon(cuponid, {
            cuponid, // optional, but can be included for consistency
            beneficio,
            fechainicio,
            fechafin,
            cantidadusos,
            mincarga,
            maxcarga
        });
        res.status(200).json(cupon);
    } catch (error: any) {
        console.error('Error al actualizar cupón:', error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al actualizar el cupón'});
    }
});

router.put('/usage/:couponId', async (req: Request, res: Response) => {
    const {couponId} = req.params;

    try {
        const updatedCupon = await cuponService.updatecuponUsage(couponId);
        res.status(200).json(updatedCupon);
    } catch (error: any) {
        console.error('Error al actualizar el uso del cupón:', error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al actualizar el uso del cupón'});
    }
});

router.delete('/:cuponid', async (req: Request, res: Response) => {
    const {cuponid} = req.params;

    try {
        await cuponService.deleteCupon(cuponid);
        res.status(204).send();
    } catch (error: any) {
        console.error('Error al eliminar cupón:', error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al eliminar el cupón'});
    }
});

export default router;