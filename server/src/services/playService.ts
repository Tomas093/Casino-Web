import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface PlayData {
    clienteid: number;
    juegoid: number;
    fecha: string;
    retorno: number;
    apuesta: number;
}

// Funciones auxiliares privadas
const findClienteById = async (clienteid: number) => {
    const cliente = await prisma.cliente.findUnique({
        where: {clienteid}
    });

    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    return cliente;
};

const findClienteByUsuarioId = async (usuarioid: number) => {
    const cliente = await prisma.cliente.findUnique({
        where: {usuarioid}
    });

    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    return cliente;
}

const findJuegoById = async (juegoid: number) => {
    const juego = await prisma.juego.findUnique({
        where: {juegoid}
    });

    if (!juego) {
        throw new Error('Juego no encontrado');
    }

    return juego;
};

export const playService = {

    createJugada: async (data: PlayData) => {
        const {clienteid, juegoid, fecha, retorno, apuesta} = data;

        // Validar cliente y juego
        await findClienteById(clienteid);
        await findJuegoById(juegoid);

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
        return prisma.jugada.create({
            data: {
                clienteid,
                juegoid,
                fecha: new Date(fecha),
                apuesta,
                retorno: retorno
            }
        });

    },

    // Obtener todas las jugadas de un usuario
    getJugadasByUserId: async (userId: number) => {
        const cliente = await findClienteById(userId);
        return prisma.jugada.findMany({
            where: {clienteid: cliente.clienteid},
            include: {
                cliente: true,
                juego: true
            }
        });
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

    getJugadasCountByUserId: async (UserId: number) => {
        const cliente = await findClienteById(UserId);
        return prisma.jugada.count({
            where: {clienteid: cliente.clienteid}
        });
    }
}