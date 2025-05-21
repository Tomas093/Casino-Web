import {PrismaClient} from '@prisma/client';

type Timeframe = 'day' | 'month' | 'year' | 'historical' | 'all';
type OrderByField = 'retorno' | 'apuesta';

const prisma = new PrismaClient();

function buildDateFilter(timeframe: Timeframe, refDate: Date = new Date()) {
    if (timeframe === 'historical' || timeframe === 'all') return undefined;

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

async function getTopPlays(
    limit: number,
    timeframe: Timeframe,
    orderByField: OrderByField,
    date?: Date
) {
    try {
        const df = buildDateFilter(timeframe, date);

        return prisma.jugada.findMany({
            where: df ? {fecha: df} : {},
            include: {
                cliente: {
                    include: {
                        usuario: {
                            select: {
                                usuarioid: true,
                                nombre: true,
                                apellido: true,
                                img: true
                            }
                        }
                    }
                },
                juego: {
                    select: {
                        nombre: true
                    }
                }
            },
            orderBy: {
                [orderByField]: 'desc'
            },
            take: limit
        }).then(plays => {
            return plays.map(play => ({
                ...play,
                juegoNombre: play.juego?.nombre || 'Unknown'
            }));
        });
    } catch (error) {
        console.error(`Error in getTopPlays (${orderByField}):`, error);
        return [];
    }
}

async function getClientAggregations(
    limit: number,
    timeframe: Timeframe,
    date?: Date
) {
    try {
        const df = buildDateFilter(timeframe, date);

        return prisma.cliente.findMany({
            select: {
                clienteid: true,
                balance: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        img: true
                    }
                },
                jugada: df ? {
                    where: {fecha: df},
                    select: {
                        retorno: true,
                        apuesta: true
                    }
                } : {
                    select: {
                        retorno: true,
                        apuesta: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error in getClientAggregations:', error);
        return [];
    }
}

export const leaderboardService = {
    async getTopPlayersByPlays(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        try {
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
                    clienteid: player.clienteid,
                    nombre: player.usuario.nombre,
                    apellido: player.usuario.apellido,
                    img: player.usuario.img,
                    jugadaCount: player.jugada.length
                }))
                .sort((a, b) => b.jugadaCount - a.jugadaCount)
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getTopPlayersByPlays:', error);
            return [];
        }
    },

    async getTopPlaysByReturn(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        return getTopPlays(limit, timeframe, 'retorno', date);
    },

    async getTopPlaysByBet(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        return getTopPlays(limit, timeframe, 'apuesta', date);
    },

    async getCumulativeEarnings(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        try {
            const results = await getClientAggregations(limit, timeframe, date);

            return results.map(client => {
                const totalRetorno = client.jugada.reduce((sum, j) => sum + Number(j.retorno), 0);
                const totalApuesta = client.jugada.reduce((sum, j) => sum + Number(j.apuesta), 0);
                const totalReturn = totalRetorno - totalApuesta;

                return {
                    clienteid: client.clienteid,
                    nombre: client.usuario.nombre,
                    apellido: client.usuario.apellido,
                    img: client.usuario.img,
                    totalReturn
                };
            })
                .sort((a, b) => b.totalReturn - a.totalReturn)
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getCumulativeEarnings:', error);
            return [];
        }
    },

    async getTopByPercentageGain(
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        try {
            const results = await getClientAggregations(limit, timeframe, date);

            return results.map(client => {
                const totalRetorno = client.jugada.reduce((sum, j) => sum + Number(j.retorno), 0);
                const totalApuesta = client.jugada.reduce((sum, j) => sum + Number(j.apuesta), 0);
                const percentGain = totalApuesta > 0 ? totalRetorno / totalApuesta : 0;

                return {
                    clienteid: client.clienteid,
                    nombre: client.usuario.nombre,
                    apellido: client.usuario.apellido,
                    img: client.usuario.img,
                    percentGain,
                    saldo: client.balance
                };
            })
                .filter(client => client.percentGain > 0)
                .sort((a, b) => b.percentGain - a.percentGain)
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getTopByPercentageGain:', error);
            return [];
        }
    },

    async getFriendsLeaderboard(
        userId: number,
        limit: number = 10,
        timeframe: Timeframe = 'historical',
        date?: Date
    ) {
        try {
            const dateFilter = buildDateFilter(timeframe, date);

            const friends = await prisma.amistad.findMany({
                where: {
                    OR: [{ usuario1_id: userId }, { usuario2_id: userId }]
                },
                include: {
                    usuario_amistad_usuario1_idTousuario: {
                        select: { cliente: { include: { jugada: true, usuario: true } } }
                    },
                    usuario_amistad_usuario2_idTousuario: {
                        select: { cliente: { include: { jugada: true, usuario: true } } }
                    }
                }
            });

            // Get user's own client and jugadas
            const userClient = await prisma.cliente.findUnique({
                where: { usuarioid: userId },
                include: { jugada: true, usuario: true }
            });

            const friendClients = friends.flatMap(friend => {
                const friendClient =
                    friend.usuario1_id === userId
                        ? friend.usuario_amistad_usuario2_idTousuario.cliente
                        : friend.usuario_amistad_usuario1_idTousuario.cliente;

                if (!friendClient) return [];

                const filteredJugadas = dateFilter
                    ? friendClient.jugada.filter(j => j.fecha && j.fecha >= dateFilter.gte && j.fecha <= dateFilter.lte)
                    : friendClient.jugada;

                const totalProfit = filteredJugadas.reduce((sum, j) => sum + (j.retorno || 0) - (j.apuesta || 0), 0);
                const jugadaCount = filteredJugadas.length;
                const winPercentage =
                    filteredJugadas.length > 0
                        ? (filteredJugadas.filter(j => (j.retorno || 0) > (j.apuesta || 0)).length / filteredJugadas.length) * 100
                        : 0;

                const mayorRetorno = filteredJugadas.length > 0
                    ? Math.max(...filteredJugadas.map(j => Number(j.retorno || 0))).toString()
                    : '0';

                const mayorApuesta = filteredJugadas.length > 0
                    ? Math.max(...filteredJugadas.map(j => Number(j.apuesta || 0))).toString()
                    : '0';

                return {
                    clienteid: friendClient.clienteid,
                    nombre: friendClient.usuario.nombre,
                    apellido: friendClient.usuario.apellido,
                    img: friendClient.usuario.img,
                    gananciaNeta: totalProfit.toString(),
                    mayorRetorno,
                    mayorApuesta,
                    winPercentage,
                    jugadaCount
                };
            });

            // Add user's own stats
            if (userClient) {
                const filteredJugadas = dateFilter
                    ? userClient.jugada.filter(j => j.fecha && j.fecha >= dateFilter.gte && j.fecha <= dateFilter.lte)
                    : userClient.jugada;

                const totalProfit = filteredJugadas.reduce((sum, j) => sum + (j.retorno || 0) - (j.apuesta || 0), 0);
                const jugadaCount = filteredJugadas.length;
                const winPercentage =
                    filteredJugadas.length > 0
                        ? (filteredJugadas.filter(j => (j.retorno || 0) > (j.apuesta || 0)).length / filteredJugadas.length) * 100
                        : 0;

                const mayorRetorno = filteredJugadas.length > 0
                    ? Math.max(...filteredJugadas.map(j => Number(j.retorno || 0))).toString()
                    : '0';

                const mayorApuesta = filteredJugadas.length > 0
                    ? Math.max(...filteredJugadas.map(j => Number(j.apuesta || 0))).toString()
                    : '0';

                friendClients.push({
                    clienteid: userClient.clienteid,
                    nombre: userClient.usuario.nombre,
                    apellido: userClient.usuario.apellido,
                    img: userClient.usuario.img,
                    gananciaNeta: totalProfit.toString(),
                    mayorRetorno,
                    mayorApuesta,
                    winPercentage,
                    jugadaCount
                });
            }

            return friendClients
                .sort((a, b) => parseFloat(b.gananciaNeta) - parseFloat(a.gananciaNeta))
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getFriendsLeaderboard:', error);
            return [];
        }
    }
};
