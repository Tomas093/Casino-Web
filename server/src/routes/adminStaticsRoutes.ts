import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/authMiddleware';
import {adminstaticsService} from '../services/adminstaticsService';

const router = Router();

// Get income by payment method
router.get('/ingresos-by-method', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const ingresos = await adminstaticsService.getIngresoByMethod();
        res.status(200).json(ingresos);
    } catch (error: any) {
        console.error("Error getting income by method:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Get withdrawals by payment method
router.get('/egresos-by-method', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const egresos = await adminstaticsService.getEgresoByMethod();
        res.status(200).json(egresos);
    } catch (error: any) {
        console.error("Error getting withdrawals by method:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Get total revenue statistics
router.get('/total-revenue', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const revenue = await adminstaticsService.getTotalRevenue();
        res.status(200).json(revenue);
    } catch (error: any) {
        console.error("Error getting total revenue:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Get transaction stats by method
router.get('/transaction-stats', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const stats = await adminstaticsService.getTransactionStatsByMethod();
        res.status(200).json(stats);
    } catch (error: any) {
        console.error("Error getting transaction stats:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Get counts for platform entities
router.get('/counts', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            totalAdmins,
            totalSuperAdmins,
            totalTickets,
            totalGames,
            totalIngresos,
            totalEgresos,
            totalPromocion,
            totalIngresosWithPromocion
        ] = await Promise.all([
            adminstaticsService.getTotalUsers(),
            adminstaticsService.getTotalAdmins(),
            adminstaticsService.getTotalSuperAdmins(),
            adminstaticsService.getTotalTickets(),
            adminstaticsService.getTotalGames(),
            adminstaticsService.getTotalIngresos(),
            adminstaticsService.getTotalEgresos(),
            adminstaticsService.getTotalPromocion(),
            adminstaticsService.getTotalIngresosWithPromocion()
        ]);

        res.status(200).json({
            totalUsers,
            totalAdmins,
            totalSuperAdmins,
            totalTickets,
            totalGames,
            totalIngresos,
            totalEgresos,
            totalPromocion,
            totalIngresosWithPromocion
        });
    } catch (error: any) {
        console.error("Error getting entity counts:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Get recent high-value activities
router.get('/recent-activities', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const activities = await adminstaticsService.getAllRecentActivities();
        res.status(200).json(activities);
    } catch (error: any) {
        console.error("Error getting recent activities:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

export default router;