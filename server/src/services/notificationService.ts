import {PrismaClient} from '@prisma/client';


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
                    estado: estado || 'pendiente',
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
                where: {usuarioid}
            });
        } catch (error) {
            console.error('Error fetching count notifications:', error);
            throw new Error('Error fetching count notifications');
        }
    }
}
