import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface TiempoDeJuegoData {
    usuarioid: number;
    final?: Date | null;
}

const verifyUserExists = async (usuarioid: number) => {
    if (usuarioid === undefined || usuarioid === null) {
        throw new Error('ID de usuario no válido');
    }

    const usuario = await prisma.usuario.findUnique({
        where: {
            usuarioid: usuarioid
        }
    });

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    return usuario;
};


const getOverlappingDurationMinutes = (
    inicio: Date,
    fin: Date,
    rangeStart: Date,
    rangeEnd: Date

): number => {
    const overlapStart = new Date(Math.max(inicio.getTime(), rangeStart.getTime()));
    const overlapEnd = new Date(Math.min(fin.getTime(), rangeEnd.getTime()));

    if (overlapStart >= overlapEnd) return 0;

    return Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 60000); // en minutos
};


const calculateTotalDurationMinutes = (
    records: { inicio: Date; fin: Date | null }[],
    rangeStart: Date,
    rangeEnd: Date
): number => {
    return records.reduce((sum, {inicio, fin}) => {
        if (!fin) return sum;
        return sum + getOverlappingDurationMinutes(inicio, fin, rangeStart, rangeEnd);
    }, 0);
};


const getTiempoDeJuegoInRange = async (
    usuarioid: number,
    startDate: Date,
    endDate: Date
) => {
    await verifyUserExists(usuarioid);

    const records = await prisma.tiempodejuego.findMany({
        where: {
            user_id: usuarioid,
            fin: {
                gte: startDate,
                lte: endDate,
                not: null
            },
            inicio: {}
        },
        select: {
            inicio: true,
            fin: true
        }
    });


    const totalDurationMinutes = calculateTotalDurationMinutes(records, startDate, endDate);

    return {totalDurationMinutes};
};

export const tiempodejuegoService = {
    createTiempoDeJuego: async (data: TiempoDeJuegoData) => {
        const {usuarioid, final} = data;
        await verifyUserExists(usuarioid);

        return prisma.tiempodejuego.create({
            data: {
                user_id: usuarioid,
                inicio: new Date(), // Set inicio to current time when created
                fin: final,         // This will be updated later when session ends
            }
        });
    },

    updateTiempoDeJuego: async (tiempodejuegoid: number, data: TiempoDeJuegoData) => {
        const {final} = data;

        const tiempoDeJuego = await prisma.tiempodejuego.findUnique({
            where: {tiempodejuegoid}
        });

        if (!tiempoDeJuego) {
            throw new Error('Tiempo de juego no encontrado');
        }

        return prisma.tiempodejuego.update({
            where: {tiempodejuegoid},
            data: {
                fin: final,
            }
        });
    },

    getTotalTiempoDeJuegoByUserId: async (usuarioid: number) => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        return getTiempoDeJuegoInRange(usuarioid, startOfDay, endOfDay);
    },

    getAllTiempoDeJuegoByUserId: async (usuarioid: number) => {
        await verifyUserExists(usuarioid);

        return prisma.tiempodejuego.findMany({
            where: {user_id: usuarioid},
            orderBy: {fin: 'desc'}
        });
    },

    getUserTiempoDeJuegoByDay: async (usuarioid: number) => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        return getTiempoDeJuegoInRange(usuarioid, startOfDay, endOfDay);
    },

    getUserTiempoDeJuegoByWeek: async (usuarioid: number) => {
        const now = new Date();
        const day = now.getDay();
        const diffToMonday = (day === 0 ? -6 : 1 - day);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return getTiempoDeJuegoInRange(usuarioid, startOfWeek, endOfWeek);
    },

    getUserTiempoDeJuegoByMonth: async (usuarioid: number) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        return getTiempoDeJuegoInRange(usuarioid, startOfMonth, endOfMonth);
    },
};