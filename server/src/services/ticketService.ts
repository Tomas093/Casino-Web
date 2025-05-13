import {PrismaClient} from '@prisma/client';

export const serializeData = (data: any) => {
    return JSON.parse(JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

const getUserByEmail = async (email: string) => {
    const prisma = new PrismaClient();
    try {
        return await prisma.usuario.findUnique({
            where: {email}
        });
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error('Error fetching user by email');
    } finally {
        await prisma.$disconnect();
    }
}

export const ticketService = {
    async createTicket(ticketData: {
        clienteid: number,
        problema: string,
        categoria: string,
        prioridad: string
    }) {
        const prisma = new PrismaClient();
        try {
            // Find admin with fewest open tickets
            const admins = await prisma.administrador.findMany();

            if (!admins || admins.length === 0) {
                throw new Error('No administrators found in the system');
            }

            // Get ticket count for each admin
            const adminStats = await Promise.all(
                admins.map(async (admin) => {
                    const ticketCount = await prisma.ticket.count({
                        where: {
                            adminid: admin.adminid,
                            resuelto: false
                        }
                    });
                    return {
                        adminid: admin.adminid,
                        ticketCount
                    };
                })
            );

            // Find admin with fewest tickets
            const selectedAdmin = adminStats.reduce((prev, current) =>
                prev.ticketCount <= current.ticketCount ? prev : current
            );

            // Create ticket with assigned admin
            return await prisma.ticket.create({
                data: {
                    clienteid: ticketData.clienteid,
                    problema: ticketData.problema,
                    categoria: ticketData.categoria,
                    prioridad: ticketData.prioridad,
                    resuelto: false,
                    adminid: selectedAdmin.adminid
                }
            });
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw new Error('Error creating ticket');
        } finally {
            await prisma.$disconnect();
        }
    },

    async getTicketsByClientId(clienteid: number) {
        const prisma = new PrismaClient();
        try {
            return await prisma.ticket.findMany({
                where: {
                    clienteid: clienteid
                }
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
    },

    async getTicketById(ticketId: number) {
        const prisma = new PrismaClient();
        try {
            return await prisma.ticket.findUnique({
                where: {ticketid: ticketId}
            });
        } catch (error) {
            console.error('Error fetching ticket:', error);
            throw new Error('Error fetching ticket');
        } finally {
            await prisma.$disconnect();
        }
    },

    async editTicket(ticketId: number, ticketData: any) {
        const prisma = new PrismaClient();
        try {
            return await prisma.ticket.update({
                where: {ticketid: ticketId},
                data: ticketData
            });
        } catch (error) {
            console.error('Error updating ticket:', error);
            throw new Error('Error updating ticket');
        } finally {
            await prisma.$disconnect();
        }
    }
};