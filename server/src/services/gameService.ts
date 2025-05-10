import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface gameData {
    nombre: string;
    estado: boolean;
}

export const gameService = {

    createGame: async (data: gameData) => {
        const {nombre, estado} = data;
        return prisma.juego.create({
            data: {
                nombre,
                estado,
            },
        });
    },

    getAllGames: async () => {
        return prisma.juego.findMany();
    },

    getGameById: async (juegoid: number) => {
        return prisma.juego.findUnique({
            where: {juegoid},
        });
    },

    updateGame: async (juegoid: number, data: Partial<Omit<gameData, 'juegoid'>>) => {
        return prisma.juego.update({
            where: {juegoid},
            data,
        });
    },

    deleteGame: async (juegoid: number) => {
        return prisma.juego.delete({
            where: {juegoid},
        });
    },

};