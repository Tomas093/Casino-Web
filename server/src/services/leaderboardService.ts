import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const leaderboardService = {

    // get Top 10 players with the highest balance
    async getTop10PlayersBalance() {
        try {
            return await prisma.cliente.findMany({
                include: {
                    usuario: {
                        select: {
                            usuarioid: true,
                            nombre: true,
                            apellido: true,
                            img: true // Añadido el campo img
                        }
                    }
                },
                orderBy: {
                    balance: 'desc'
                },
                take: 10
            });
        } catch (error) {
            throw new Error('Error al obtener los mejores jugadores');
        }
    },

    // get Top 10 players with the highest number of plays
    async getTop10PlayersPlays() {
        try {
            return await prisma.cliente.findMany({
                include: {
                    usuario: {
                        select: {
                            usuarioid: true,
                            nombre: true,
                            apellido: true,
                            img: true
                        }
                    },
                    jugada: true // Corrected property name
                },
                orderBy: {
                    jugada: {
                        _count: 'desc' // Corrected property name
                    }
                },
                take: 10
            });
        } catch (error) {
            throw new Error('Error al obtener los mejores jugadores');
        }
    },

    // get Top 10 players with the highest average return
    async getTop10PlayersAverageReturn() {
        try {
            const players = await prisma.jugada.groupBy({
                by: ['clienteid'],
                _avg: {
                    retorno: true
                },
                orderBy: {
                    _avg: {
                        retorno: 'desc'
                    }
                },
                take: 10
            });

            return await Promise.all(
                players.map(async (player) => {
                    // Verificamos si clienteid es null
                    if (player.clienteid === null) {
                        return { averageReturn: player._avg.retorno ?? 0 };
                    }

                    const cliente = await prisma.cliente.findUnique({
                        where: { clienteid: player.clienteid },
                        include: {
                            usuario: {
                                select: {
                                    usuarioid: true,
                                    nombre: true,
                                    apellido: true,
                                    img: true // Añadido el campo img
                                }
                            }
                        }
                    });
                    return { ...cliente, averageReturn: player._avg.retorno ?? 0 };
                })
            );
        } catch (error) {
            throw new Error('Error al obtener los mejores jugadores');
        }
    },

    // get Top 10 players with the highest returns
    async getTop10PlayersReturns() {
        try {
            return await prisma.jugada.findMany({
                include: {
                    cliente: {
                        include: {
                            usuario: {
                                select: {
                                    usuarioid: true,
                                    nombre: true,
                                    apellido: true,
                                    img: true // Añadido el campo img
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    retorno: 'desc'
                },
                take: 10
            });
        } catch (error) {
            throw new Error('Error al obtener los mejores jugadores');
        }
    }
};
