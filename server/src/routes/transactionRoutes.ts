import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { transactionService } from '../services/transactionService';

const router = Router();

// Crear un ingreso
router.post('/ingreso', isAuthenticated, async (req: Request, res: Response) => {
    const { usuarioid, fecha, metodo, monto } = req.body;
    const usuario = req.session.usuario;

    if (!usuario) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
    }

    try {
        const ingreso = await transactionService.createIngreso({
            usuarioid,
            fecha,
            metodo,
            monto
        });
        res.status(201).json(ingreso);
    } catch (error: any) {
        console.error("Error al crear ingreso:", error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Error al procesar el ingreso' });
    }
});

// Crear un egreso (retiro)
router.post('/retiro', isAuthenticated, async (req: Request, res: Response) => {
    const { usuarioid, fecha, metodo, monto } = req.body;
    const usuario = req.session.usuario;

    if (!usuario) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
    }

    try {
        const egreso = await transactionService.createEgreso({
            usuarioid,
            fecha,
            metodo,
            monto
        });
        res.status(201).json(egreso);
    } catch (error: any) {
        console.error("Error al crear egreso:", error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Error al procesar el retiro' });
    }
});

router.get('/totalRevenue', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const totalRevenue = await transactionService.getTotalRevenue();
        res.status(200).json(totalRevenue);
    } catch (error: any) {
        console.error("Error al obtener ingresos totales:", error);
        res.status(error.statusCode || 500).json({message: error.message || 'Error del servidor'});
    }
});

// Obtener todas las transacciones por metodo
router.get('/methodCount', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const methodCount = await transactionService.getTransactionStatsByMethod();
        res.status(200).json(methodCount);
    } catch (error: any) {
        console.error("Error al obtener conteo por metodo:", error);
        res.status(error.statusCode || 500).json({message: error.message || 'Error del servidor'});
    }
})

// Obtener todas las transacciones de un usuario
router.get('/:userId', isAuthenticated, async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const transacciones = await transactionService.getUserTransactions(Number(userId));
        res.status(200).json(transacciones);
    } catch (error: any) {
        console.error("Error al obtener transacciones:", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error del servidor' });
    }
});

export default router;