import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const findClienteByUsuarioId = async (usuarioid: number) => {
    const cliente = await prisma.cliente.findUnique({
        where: {usuarioid}
    });

    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    return cliente;
};


export const limitService = {

    async getlimiteHorario(userId: number) {
        try {
            const cliente = await findClienteByUsuarioId(userId);
            
            const limites = await prisma.limitehorario.findMany({
                where: {
                    clienteid: cliente.clienteid
                }
            });
            
            // Return empty array if no limits found rather than undefined
            return limites || [];
            
        } catch (error) {
            console.error('Error al obtener el límite horario:', error);
            throw new Error('Error al obtener el límite horario');
        }
    },

    async getlimiteMonetario(userId: number) {
        try {
            const cliente = await findClienteByUsuarioId(userId);
            
            const limites = await prisma.limitemonetario.findMany({
                where: {
                    clienteid: cliente.clienteid
                }
            });
            
            // Return empty array if no limits found rather than undefined
            return limites || [];
            
        } catch (error) {
            console.error('Error al obtener el límite monetario:', error);
            throw new Error('Error al obtener el límite monetario');
        }
    },

    // In limitService.ts - add these methods
    async updateLimiteHorario(userId: number, limiteDiario: number, limiteSemanal: number, limiteMensual: number) {
        try {
            const cliente = await findClienteByUsuarioId(userId);

            return await prisma.limitehorario.upsert({
                where: {
                    clienteid: cliente.clienteid
                },
                update: {
                    limitediario: limiteDiario,
                    limitesemanal: limiteSemanal,
                    limitemensual: limiteMensual
                },
                create: {
                    clienteid: cliente.clienteid,
                    limitediario: limiteDiario,
                    limitesemanal: limiteSemanal,
                    limitemensual: limiteMensual
                }
            });
        } catch (error) {
            console.error('Error al actualizar el límite horario:', error);
            throw new Error('Error al actualizar el límite horario');
        }
    },

    async updateLimiteMonetario(userId: number, limiteDiario: number, limiteSemanal: number, limiteMensual: number) {
        try {
            const cliente = await findClienteByUsuarioId(userId);

            return await prisma.limitemonetario.upsert({
                where: {
                    clienteid: cliente.clienteid
                },
                update: {
                    limitediario: limiteDiario,
                    limitesemanal: limiteSemanal,
                    limitemensual: limiteMensual
                },
                create: {
                    clienteid: cliente.clienteid,
                    limitediario: limiteDiario,
                    limitesemanal: limiteSemanal,
                    limitemensual: limiteMensual
                }
            });
        } catch (error) {
            console.error('Error al actualizar el límite monetario:', error);
            throw new Error('Error al actualizar el límite monetario');
        }
    }
}
