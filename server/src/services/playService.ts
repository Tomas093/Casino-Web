import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface PlayData {
    clienteid: number;
    juegoid: number;
    fecha: string;
    retorno: number;
    apuesta: number;
}

interface UserPlayData {
    usuarioid: number;
    juegoid: number;
    fecha: string;
    retorno: number;
    apuesta: number;
}


const findClienteById = async (clienteid: number) => {
    const cliente = await prisma.cliente.findUnique({
        where: {clienteid}
    });

    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    return cliente;
};

const findJuegoById = async (juegoid: number) => {
    const juego = await prisma.juego.findUnique({
        where: {juegoid}
    });

    if (!juego) {
        throw new Error('Juego no encontrado');
    }

    return juego;
};

const findClienteByUsuarioId = async (usuarioid: number) => {
    const cliente = await prisma.cliente.findUnique({
        where: {usuarioid}
    });

    if (!cliente) {
        throw new Error(`Cliente no encontrado para el usuario ID: ${usuarioid}`);
    }

    return cliente;
}

export const playService = {
    createJugada: async (data: UserPlayData) => {
        try {
            const {usuarioid, juegoid, fecha, retorno, apuesta} = data;

            // Primero encontramos el cliente asociado al usuario
            const client = await findClienteByUsuarioId(usuarioid);
            if (!client) {
                throw new Error(`Cliente no encontrado para el usuario ID: ${usuarioid}`);
            }

            const clienteid = client.clienteid;

            // Verificamos que el juego exista
            await findJuegoById(juegoid);

            console.log(`Creando jugada para cliente ID: ${clienteid}, juego ID: ${juegoid}`);

            // Actualizar el balance del cliente
            await prisma.cliente.update({
                where: {clienteid},
                data: {
                    balance: {
                        increment: retorno - apuesta
                    }
                }
            });

            // Crear la jugada
            const newJugada = await prisma.jugada.create({
                data: {
                    clienteid,
                    juegoid,
                    fecha: new Date(fecha),
                    apuesta,
                    retorno: retorno
                }
            });

            console.log(`Jugada creada con ID: ${newJugada.jugadaid}`);
            return newJugada;
        } catch (error) {
            console.error('Error en playService.createJugada:', error);
            throw error;
        }
    },

    // Obtener todas las jugadas de un usuario
    getJugadasByUserId: async (userId: number) => {
        try {
            const cliente = await findClienteByUsuarioId(userId);
            return prisma.jugada.findMany({
                where: {clienteid: cliente.clienteid},
                include: {
                    cliente: true,
                    juego: true
                }
            });
        } catch (error) {
            console.error(`Error al obtener jugadas para usuario ID: ${userId}`, error);
            throw error;
        }
    },

    // Obtener todas las jugadas de un juego
    getJugadasByJuegoId: async (juegoid: number) => {
        await findJuegoById(juegoid);

        return prisma.jugada.findMany({
            where: {juegoid},
            include: {
                cliente: true
            }
        });
    },

    // Obtener todas las jugadas con un retorno mayor a un valor específico
    getJugadasByRetorno: async (retorno: number) => {
        return prisma.jugada.findMany({
            where: {retorno: {gt: retorno}},
            include: {
                cliente: true,
                juego: true
            }
        });
    },

    // Obtener todas las jugadas
    getAllJugadas: async () => {
        return prisma.jugada.findMany({
            include: {
                cliente: true,
                juego: true
            }
        });
    },

    // Obtener una jugada por ID
    getJugadaById: async (jugadaid: number) => {
        const jugada = await prisma.jugada.findUnique({
            where: {jugadaid},
            include: {
                cliente: true,
                juego: true
            }
        });

        if (!jugada) {
            throw new Error('Jugada no encontrada');
        }

        return jugada;
    },
}