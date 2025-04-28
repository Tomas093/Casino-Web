// 2. Añadamos la función correspondiente en historyService.ts

import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const historyService = {

    getAllGamesHistoryByUserId: async (userId: number) => {
        const cliente = await prisma.cliente.findUnique({
            where: {usuarioid: userId}
        });

        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        const juegosConJugadas = await prisma.juego.findMany({
            where: {
                jugada: {
                    some: {
                        clienteid: cliente.clienteid
                    }
                }
            },
            include: {
                jugada: {
                    where: {
                        clienteid: cliente.clienteid
                    },
                    orderBy: {
                        fecha: 'desc'
                    },
                    take: 5
                }
            }
        });

        // Formatea el resultado como un mapa de juego -> jugadas
        const resultadoPorJuego: Record<number, { juego: any; jugadas: any[] }> = {};

        juegosConJugadas.forEach(juego => {
            const {jugada, ...juegoSinJugadas} = juego;
            resultadoPorJuego[juego.juegoid] = {
                juego: juegoSinJugadas,
                jugadas: jugada
            };
        });

        return resultadoPorJuego;
    },

    // Nueva función para obtener todo el historial sin límite
    getAllCompleteHistoryByUserId: async (userId: number) => {
        const cliente = await prisma.cliente.findUnique({
            where: {usuarioid: userId}
        });

        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        const juegosConJugadas = await prisma.juego.findMany({
            where: {
                jugada: {
                    some: {
                        clienteid: cliente.clienteid
                    }
                }
            },
            include: {
                jugada: {
                    where: {
                        clienteid: cliente.clienteid
                    },
                    orderBy: {
                        fecha: 'desc'
                    }
                    // Sin 'take: 5' para obtener todas las jugadas
                }
            }
        });

        // Formatea el resultado como un mapa de juego -> jugadas
        const resultadoPorJuego: Record<number, { juego: any; jugadas: any[] }> = {};

        juegosConJugadas.forEach(juego => {
            const {jugada, ...juegoSinJugadas} = juego;
            resultadoPorJuego[juego.juegoid] = {
                juego: juegoSinJugadas,
                jugadas: jugada
            };
        });

        return resultadoPorJuego;
    }
}