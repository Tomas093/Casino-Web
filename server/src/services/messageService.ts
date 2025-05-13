import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const serializeData = (data: any) => {
    return JSON.parse(JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

export const messageService = {
    async createMessage(messageData: any) {
        const prisma = new PrismaClient();
        try {
            const {ticketid, contenido, emisorid} = messageData;
            return await prisma.mensaje.create({
                data: {
                    ticketid,
                    contenido,
                    usuarioid: emisorid,
                },
            });
        } catch (error) {
            console.error('Error creating message:', error);
            throw new Error('Error creating message');
        } finally {
            await prisma.$disconnect();
        }
    },

    async getMessagesByTicketId(ticketId: number) {
        const prisma = new PrismaClient();
        try {
            const messages = await prisma.mensaje.findMany({
                where: {ticketid: ticketId},
                include: {
                    tickets: {
                        include: {
                            cliente: {
                                include: {
                                    usuario: {
                                        select: {
                                            nombre: true,
                                            apellido: true,
                                            img: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return serializeData(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw new Error('Error fetching messages');
        } finally {
            await prisma.$disconnect();
        }
    },

    async editMessage(messageId: number, messageData: any) {
        const prisma = new PrismaClient();
        try {
            return await prisma.mensaje.update({
                where: {mensajeid: messageId},
                data: messageData,
            });
        } catch (error) {
            console.error('Error updating message:', error);
            throw new Error('Error updating message');
        } finally {
            await prisma.$disconnect();
        }
    },
};