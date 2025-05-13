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
            return limites || [];

        } catch (error) {
            console.error('Error al obtener el límite monetario:', error);
            throw new Error('Error al obtener el límite monetario');
        }
    },

    async getlimiteMonetarioByClienteId(clienteId: number) {
        try {
            const limites = await prisma.limitemonetario.findMany({
                where: {
                    clienteid: clienteId
                }
            });
            return limites || [];

        } catch (error) {
            console.error('Error al obtener el límite monetario:', error);
            throw new Error('Error al obtener el límite monetario');
        }
    },

    async getlimiteHorarioByClienteId(clienteId: number) {
        try {
            const limites = await prisma.limitehorario.findMany({
                where: {
                    clienteid: clienteId
                }
            });
            return limites || [];

        } catch (error) {
            console.error('Error al obtener el límite horario:', error);
            throw new Error('Error al obtener el límite horario');
        }
    },

    async updateLimiteMonetarioByClienteId(clienteId: number, limiteDiario: number, limiteSemanal: number, limiteMensual: number) {
        try {
            return await prisma.limitemonetario.upsert({
                where: {
                    clienteid: clienteId
                },
                update: {
                    limitediario: limiteDiario,
                    limitesemanal: limiteSemanal,
                    limitemensual: limiteMensual
                },
                create: {
                    clienteid: clienteId,
                    limitediario: limiteDiario,
                    limitesemanal: limiteSemanal,
                    limitemensual: limiteMensual
                }
            });
        } catch (error) {
            console.error('Error al actualizar el límite monetario:', error);
            throw new Error('Error al actualizar el límite monetario');
        }
    },

    async updateLimiteHorarioByClienteId(clienteId: number, limiteDiario: number, limiteSemanal: number, limiteMensual: number) {
        try {
            return await prisma.limitehorario.upsert({
                where: {
                    clienteid: clienteId
                },
                update: {
                    limitediario: limiteDiario,
                    limitesemanal: limiteSemanal,
                    limitemensual: limiteMensual
                },
                create: {
                    clienteid: clienteId,
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
