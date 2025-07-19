import {PrismaClient, estado_enum} from '@prisma/client';

const prisma = new PrismaClient();

export const notificationService = {
    async createNotification(notificationData: any) {
        try {
            const {usuarioid, titulo, contenido, destino, fecha, estado} = notificationData;
            return await prisma.notificaciones.create({
                data: {
                    usuarioid,
                    titulo,
                    contenido,
                    destino,
                    fecha: fecha || new Date(),
                    estado: estado || estado_enum.pendiente,
                },
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            throw new Error('Error creating notification');
        }
    },

    async getNotificationsByUserId(usuarioid: number) {
        try {
            return await prisma.notificaciones.findMany({
                where: {usuarioid},
                orderBy: {fecha: 'desc'},
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw new Error('Error fetching notifications');
        }
    },

    async deleteNotificationById(notificationId: number) {
        try {
            return await prisma.notificaciones.delete({
                where: {notificacion_id: notificationId},
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw new Error('Error deleting notification');
        }
    },

    async countUnreadNotificationsByUserId(usuarioid: number) {
        try {
            return await prisma.notificaciones.count({
                where: {usuarioid},
            });
        } catch (error) {
            console.error('Error fetching count notifications:', error);
            throw new Error('Error fetching count notifications');
        }
    },

    async updateNotificationStatus(notificationId: number, estado: estado_enum | null) {
        try {
            return await prisma.notificaciones.update({
                where: {notificacion_id: notificationId},
                data: {estado},
            });
        } catch (error) {
            console.error('Error updating notification status:', error);
            throw new Error('Error updating notification status');
        }
    },

    async markAllNotificationsAsRead(usuarioid: number) {
        try {
            return await prisma.notificaciones.updateMany({
                where: {usuarioid, estado: estado_enum.pendiente},
                data: {estado: estado_enum.leida},
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw new Error('Error marking all notifications as read');
        }
    },
};