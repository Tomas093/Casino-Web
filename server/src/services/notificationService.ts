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
        } finally {
            await prisma.$disconnect();
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
        } finally {
            await prisma.$disconnect();
        }
    },
};