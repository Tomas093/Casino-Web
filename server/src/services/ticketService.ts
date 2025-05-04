import {PrismaClient} from '@prisma/client';


export const serializeData = (data: any) => {
    return JSON.parse(JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

export const ticketService = {
    async createTicket(ticketData: any) {
        const prisma = new PrismaClient();
        try {
            return await prisma.ticket.create({
                data: ticketData
            });
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw new Error('Error creating ticket');
        } finally {
            await prisma.$disconnect();
        }
    },

    async getTicketsByClientId(clientId: number) {
        const prisma = new PrismaClient();
        try {
            return await prisma.ticket.findMany({
                where: {clienteid: clientId}
            });
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw new Error('Error fetching tickets');
        } finally {
            await prisma.$disconnect();
        }
    },

    async getTicketsByAdminId(adminId: number) {
        const prisma = new PrismaClient();
        try {
            const tickets = await prisma.ticket.findMany({
                where: {adminid: adminId},
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
            });

            // Use the utility function to handle BigInt serialization
            return serializeData(tickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw new Error('Error fetching tickets');
        } finally {
            await prisma.$disconnect();
        }
    }
}