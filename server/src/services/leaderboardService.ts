import {PrismaClient} from '@prisma/client';

type Timeframe = 'day' | 'month' | 'year' | 'historical';

const prisma = new PrismaClient();

function buildDateFilter(timeframe: Timeframe, refDate: Date = new Date()) {
    if (timeframe === 'historical') return undefined;

    const start = new Date(refDate);
    const end = new Date(refDate);

    switch (timeframe) {
        case 'day':
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'month':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(start.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'year':
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            end.setFullYear(start.getFullYear() + 1, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
    }

    return {gte: start, lte: end};
}

export const leaderboardService = {
    async getTopPlayersByPlays(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        const dateFilter = buildDateFilter(timeframe, date);
        const players = await prisma.cliente.findMany({
            include: {
                usuario: {select: {usuarioid: true, nombre: true, apellido: true, img: true}},
                jugada: true
            },
            where: dateFilter ? {jugada: {some: {fecha: dateFilter}}} : {}
        });
        return players
            .map(player => ({
                ...player,
                jugadaCount: player.jugada.length
            }))
            .sort((a, b) => b.jugadaCount - a.jugadaCount)
            .slice(0, limit);
    },

    async getTopPlaysByReturn(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        const df = buildDateFilter(timeframe, date);
        return prisma.jugada.findMany({
            include: {
                cliente: {include: {usuario: {select: {usuarioid: true, nombre: true, apellido: true, img: true}}}}
            },
            where: df ? {fecha: df} : {},
            orderBy: {retorno: 'desc'},
            take: limit
        });
    },

    async getTopPlaysByBet(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        const df = buildDateFilter(timeframe, date);
        return prisma.jugada.findMany({
            include: {
                cliente: {include: {usuario: {select: {usuarioid: true, nombre: true, apellido: true, img: true}}}}
            },
            where: df ? {fecha: df} : {},
            orderBy: {apuesta: 'desc'},
            take: limit
        });
    },

    async getCumulativeEarnings(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        const df = buildDateFilter(timeframe, date);
        const groups = await prisma.jugada.groupBy({
            by: ['clienteid'],
            where: df ? {fecha: df} : {},
            _sum: {retorno: true}
        });

        const enriched = await Promise.all(
            groups.map(async (g) => {
                const cliente = await prisma.cliente.findUnique({
                    where: {clienteid: g.clienteid ?? undefined},
                    include: {usuario: {select: {usuarioid: true, nombre: true, apellido: true, img: true}}}
                });
                return {
                    cliente,
                    totalReturn: g._sum.retorno ?? 0
                };
            })
        );

        return enriched
            .sort((a, b) => b.totalReturn - a.totalReturn)
            .slice(0, limit);
    },

    async getTopByPercentageGain(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        const df = buildDateFilter(timeframe, date);
        const groups = await prisma.jugada.groupBy({
            by: ['clienteid'],
            where: df ? {fecha: df} : {},
            _sum: {retorno: true, apuesta: true}
        });

        const enriched = await Promise.all(
            groups.map(async (g) => {
                const {_sum: sums, clienteid} = g;
                const retorno = sums.retorno ?? 0;
                const apuesta = sums.apuesta ?? 0;
                const percentGain = apuesta > 0 ? (retorno - apuesta) / apuesta : 0;
                const cliente = await prisma.cliente.findUnique({
                    where: {clienteid: clienteid ?? undefined},
                    include: {usuario: {select: {usuarioid: true, nombre: true, apellido: true, img: true}}}
                });
                return {
                    cliente,
                    percentGain
                };
            })
        );

        return enriched
            .sort((a, b) => b.percentGain - a.percentGain)
            .slice(0, limit);
    }
};
