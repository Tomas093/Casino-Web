import {PrismaClient} from '@prisma/client';

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
            return await prisma.ticket.findMany({
                where: {adminid: adminId}
            });
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw new Error('Error fetching tickets');
        } finally {
            await prisma.$disconnect();
        }
    }






}