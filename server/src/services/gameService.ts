import { PrismaClient } from '@prisma/client';

    const prisma = new PrismaClient();

    interface gameData {
        juegoid: number;
        nombre: string;
        estado: boolean | null | undefined;
    }

    export const gameService = {
        createGame: async (data: gameData) => {
            const { juegoid, nombre, estado } = data;

            // Crear el juego
            return prisma.juego.create({
                data: {
                    juegoid,
                    nombre,
                    estado,
                },
            });
        },

        getGames: async () => {
            // Obtener todos los juegos
            return prisma.juego.findMany();
        },

        getGameById: async (juegoid: number) => {
            // Obtener un juego por ID
            return prisma.juego.findUnique({
                where: { juegoid },
            });
        },

        updateGame: async (juegoid: number, data: Partial<Omit<gameData, 'juegoid'>>) => {
            // Actualizar un juego
            return prisma.juego.update({
                where: { juegoid },
                data,
            });
        },

        deleteGame: async (juegoid: number) => {
            // Eliminar un juego
            return prisma.juego.delete({
                where: { juegoid },
            });
        },
    };