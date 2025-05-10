import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/authMiddleware';
import {transactionService} from '../services/transactionService';

const router = Router();

// Crear un ingreso
router.post('/ingreso', isAuthenticated, async (req: Request, res: Response) => {
    const {usuarioid, fecha, metodo, monto, cuponid} = req.body;
    const usuario = req.session.usuario;

    if (!usuario) {
        res.status(401).json({error: 'Usuario no autenticado'});
        return;
    }

    try {
        const ingreso = await transactionService.createIngreso({
            usuarioid,
            fecha,
            metodo,
            monto,
            cuponid
        });
        res.status(201).json(ingreso);
    } catch (error: any) {
        console.error('Error al crear ingreso:', error);
        res.status(400).json({error: error.message || 'Error al crear ingreso'});
    }
});

// Crear un retiro
router.post('/egreso', isAuthenticated, async (req: Request, res: Response) => {
    const {usuarioid, fecha, metodo, monto} = req.body;
    const usuario = req.session.usuario;

    if (!usuario) {
        res.status(401).json({error: 'Usuario no autenticado'});
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
        console.error('Error al crear retiro:', error);
        res.status(400).json({error: error.message || 'Error al crear retiro'});
    }
});

// Obtener transacciones de un usuario
router.get('/user/:userId', isAuthenticated, async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
        const transactions = await transactionService.getUserTransactions(parseInt(userId));
        res.status(200).json(transactions);
    } catch (error: any) {
        console.error('Error al obtener transacciones:', error);
        res.status(400).json({error: error.message || 'Error al obtener transacciones'});
    }
});

// Obtener estadísticas de ingresos totales
router.get('/revenue', isAuthenticated, async (_req: Request, res: Response) => {
    try {
        const revenue = await transactionService.getTotalRevenue();
        res.status(200).json(revenue);
    } catch (error: any) {
        console.error('Error al obtener ingresos totales:', error);
        res.status(400).json({error: error.message || 'Error al obtener ingresos totales'});
    }
});

// Obtener estadísticas de transacciones por método de pago
router.get('/stats/method', isAuthenticated, async (_req: Request, res: Response) => {
    try {
        const stats = await transactionService.getTransactionStatsByMethod();
        res.status(200).json(stats);
    } catch (error: any) {
        console.error('Error al obtener estadísticas por método:', error);
        res.status(400).json({error: error.message || 'Error al obtener estadísticas por método'});
    }
});

export default router;