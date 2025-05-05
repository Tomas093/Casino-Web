import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface gameData {
    juegoid: number;
    nombre: string;
    funcionando: boolean;
}

export const gameService = {

    createGame: async (data: gameData) => {
        const {juegoid, nombre, funcionando} = data;
        return prisma.juego.create({
            data: {
                juegoid,
                nombre,
                funcionando,
            },
        });
    },

    getGames: async () => {
        return prisma.juego.findMany();
    },

    getGameById: async (juegoid: number) => {
        // Obtener un juego por ID
        return prisma.juego.findUnique({
            where: {juegoid},
        });
    },

    updateGame: async (juegoid: number, data: Partial<Omit<gameData, 'juegoid'>>) => {
        // Actualizar un juego
        return prisma.juego.update({
            where: {juegoid},
            data,
        });
    },

    deleteGame: async (juegoid: number) => {
        // Eliminar un juego
        return prisma.juego.delete({
            where: {juegoid},
        });
    },

};