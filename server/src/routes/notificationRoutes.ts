import {Router} from 'express';
import {notificationService} from "../services/notificationService";

const router = Router();

router.post('/create', async (req, res) => {
    const {usuarioid, titulo, contenido, destino, fecha, estado} = req.body;

    try {
        const notification = await notificationService.createNotification({
            usuarioid,
            titulo,
            contenido,
            destino,
            fecha,
            estado
        });
        res.status(201).json(notification);
    } catch (error: any) {
        console.error("Error al crear notificación:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al crear la notificación'});
    }
})

router.get('/:usuarioid', async (req, res) => {
    const {usuarioid} = req.params;

    try {
        const notifications = await notificationService.getNotificationsByUserId(parseInt(usuarioid));
        res.status(200).json(notifications);
    } catch (error: any) {
        console.error("Error al obtener notificaciones:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener las notificaciones'});
    }
})

router.delete('/delete/:notificationId', async (req, res) => {
    const {notificationId} = req.params;

    try {
        const notification = await notificationService.deleteNotificationById(parseInt(notificationId));
        res.status(200).json(notification);
    } catch (error: any) {
        console.error("Error al eliminar notificación:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al eliminar la notificación'});
    }
})

router.get('/count/:usuarioid', async (req, res) => {
    const {usuarioid} = req.params;
    try {
        const count = await notificationService.countUnreadNotificationsByUserId(parseInt(usuarioid));
        res.status(200).json({count});
    } catch (error: any) {
        console.error("Error al contar notificaciones:", error);
        res.status(error.statusCode || 500).json({
            error: error.message || 'Error al contar las notificaciones'
        });
    }
});

router.put('/update/:notificationId', async (req, res) => {
    const {notificationId} = req.params;
    const {estado} = req.body;

    try {
        const updatedNotification = await notificationService.updateNotificationStatus(parseInt(notificationId), estado);
        res.status(200).json(updatedNotification);
    } catch (error: any) {
        console.error("Error al actualizar notificación:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al actualizar la notificación'});
    }
});

router.put('/mark-all-read/:usuarioid', async (req, res) => {
    const {usuarioid} = req.params;

    try {
        const updatedNotifications = await notificationService.markAllNotificationsAsRead(parseInt(usuarioid));
        res.status(200).json(updatedNotifications);
    } catch (error: any) {
        console.error("Error al marcar todas las notificaciones como leídas:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al marcar las notificaciones como leídas'});
    }
});


export default router