import {PrismaClient, black_jack_lobby} from '@prisma/client';

const prisma = new PrismaClient();

export class LobbyService {

    async createLobby(lobbyId: number): Promise<black_jack_lobby> {
        return prisma.black_jack_lobby.create({
            data: {
                lobby_id: lobbyId,
            },
        });
    }

    async joinLobby(lobbyId: number, clientId: string): Promise<black_jack_lobby> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        const clientIdNum = parseInt(clientId, 10);

        // Check if client is already in the lobby
        if (lobby.client1_id === clientIdNum || lobby.client2_id === clientIdNum || lobby.client3_id === clientIdNum) {
            return lobby; // Or throw an error
        }

        let slot: 'client1_id' | 'client2_id' | 'client3_id' | null = null;
        if (lobby.client1_id === null) slot = 'client1_id';
        else if (lobby.client2_id === null) slot = 'client2_id';
        else if (lobby.client3_id === null) slot = 'client3_id';

        if (!slot) {
            throw new Error(`Lobby ${lobbyId} is full.`);
        }

        return prisma.black_jack_lobby.update({
            where: {lobby_id: lobbyId},
            data: {[slot]: clientIdNum},
        });
    }

    async leaveLobby(lobbyId: number, clientId: string): Promise<black_jack_lobby> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        const clientIdNum = parseInt(clientId, 10);
        const dataToUpdate: { [key: string]: number | null } = {};
        if (lobby.client1_id === clientIdNum) dataToUpdate.client1_id = null;
        else if (lobby.client2_id === clientIdNum) dataToUpdate.client2_id = null;
        else if (lobby.client3_id === clientIdNum) dataToUpdate.client3_id = null;
        else {
            throw new Error(`Client ${clientId} not found in lobby ${lobbyId}.`);
        }

        return prisma.black_jack_lobby.update({
            where: {lobby_id: lobbyId},
            data: dataToUpdate,
        });
    }

    async getLobbyPlayers(lobbyId: number): Promise<string[]> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        return [lobby.client1_id, lobby.client2_id, lobby.client3_id]
            .filter((id): id is number => id !== null)
            .map(id => id.toString());
    }

    async getPlayerCount(lobbyId: number): Promise<number> {
        const players = await this.getLobbyPlayers(lobbyId);
        return players.length;
    }

    async getLobbyById(lobbyId: number): Promise<black_jack_lobby | null> {
        return prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });
    }

    async getAllLobbies(): Promise<black_jack_lobby[]> {
        return prisma.black_jack_lobby.findMany();
    }

    async deleteLobby(lobbyId: number): Promise<black_jack_lobby> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        return prisma.black_jack_lobby.delete({
            where: {lobby_id: lobbyId},
        });
    }

    async updateLobby(lobbyId: number, data: Partial<black_jack_lobby>): Promise<black_jack_lobby> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        return prisma.black_jack_lobby.update({
            where: {lobby_id: lobbyId},
            data,
        });
    }

    async clearLobby(lobbyId: number): Promise<black_jack_lobby> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        return prisma.black_jack_lobby.update({
            where: {lobby_id: lobbyId},
            data: {
                client1_id: null,
                client2_id: null,
                client3_id: null,
            },
        });
    }

    async isLobbyFull(lobbyId: number): Promise<boolean> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        return [lobby.client1_id, lobby.client2_id, lobby.client3_id].filter(id => id !== null).length >= 3;
    }

    async isLobbyEmpty(lobbyId: number): Promise<boolean> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        return !lobby.client1_id && !lobby.client2_id && !lobby.client3_id;
    }

    async getListofPlayersInLobby(lobbyId: number): Promise<string[]> {
        const lobby = await prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId},
        });

        if (!lobby) {
            throw new Error(`Lobby with ID ${lobbyId} not found.`);
        }

        return [lobby.client1_id, lobby.client2_id, lobby.client3_id]
            .filter((id): id is number => id !== null)
            .map(id => id.toString());
    }

}