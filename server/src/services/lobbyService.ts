import {PrismaClient} from '@prisma/client';

export class LobbyService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    // Helper function to convert BigInt values to Number
    private convertBigIntToNumber(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }

        if (typeof data === 'bigint') {
            return Number(data);
        }

        if (Array.isArray(data)) {
            return data.map(item => this.convertBigIntToNumber(item));
        }

        if (typeof data === 'object') {
            const result: any = {};
            for (const key in data) {
                result[key] = this.convertBigIntToNumber(data[key]);
            }
            return result;
        }

        return data;
    }

    async getClientIdByUserId(userId: number): Promise<number | null> {
        try {
            const cliente = await this.prisma.cliente.findFirst({
                where: {usuarioid: userId}
            });
            return cliente ? Number(cliente.clienteid) : null;
        } catch (error) {
            console.error(`Error getting clientId for userId ${userId}:`, error);
            return null;
        }
    }

    async createLobby(lobbyId: number): Promise<any> {
        const result = await this.prisma.black_jack_lobby.create({
            data: {
                lobby_id: lobbyId,
                client1_id: null,
                client2_id: null,
                client3_id: null
            }
        });
        return this.convertBigIntToNumber(result);
    }

    async getAllLobbies(): Promise<any[]> {
        const result = await this.prisma.black_jack_lobby.findMany();
        return this.convertBigIntToNumber(result);
    }

    async getLobbyById(lobbyId: number): Promise<any | null> {
        const result = await this.prisma.black_jack_lobby.findUnique({
            where: {lobby_id: lobbyId}
        });
        return this.convertBigIntToNumber(result);
    }

    async joinLobby(lobbyId: number, userIdStr: string): Promise<any> {
        try {
            const userId = parseInt(userIdStr, 10);
            const clientId = await this.getClientIdByUserId(userId);

            if (!clientId) {
                throw new Error(`No client record found for user ${userId}`);
            }

            const lobby = await this.getLobbyById(lobbyId);
            if (!lobby) {
                throw new Error(`Lobby ${lobbyId} not found`);
            }

            // Check if client is already in lobby
            if (
                lobby.client1_id === clientId ||
                lobby.client2_id === clientId ||
                lobby.client3_id === clientId
            ) {
                return lobby; // Client already in lobby, no update needed
            }

            // Find first empty spot
            let updateData: any = {};

            if (lobby.client1_id === null) {
                updateData.client1_id = clientId;
            } else if (lobby.client2_id === null) {
                updateData.client2_id = clientId;
            } else if (lobby.client3_id === null) {
                updateData.client3_id = clientId;
            } else {
                throw new Error('Lobby is full');
            }

            const result = await this.prisma.black_jack_lobby.update({
                where: {lobby_id: lobbyId},
                data: updateData
            });

            return this.convertBigIntToNumber(result);
        } catch (error) {
            console.error(`Error joining lobby ${lobbyId}:`, error);
            throw error;
        }
    }

    async leaveLobby(lobbyId: number, userIdStr: string): Promise<any> {
        try {
            const userId = parseInt(userIdStr, 10);
            const clientId = await this.getClientIdByUserId(userId);

            if (!clientId) {
                throw new Error(`No client record found for user ${userId}`);
            }

            const lobby = await this.getLobbyById(lobbyId);
            if (!lobby) {
                throw new Error(`Lobby ${lobbyId} not found`);
            }

            let updateData: any = {};

            if (lobby.client1_id === clientId) {
                updateData.client1_id = null;
            } else if (lobby.client2_id === clientId) {
                updateData.client2_id = null;
            } else if (lobby.client3_id === clientId) {
                updateData.client3_id = null;
            } else {
                throw new Error(`Client ${clientId} not found in lobby ${lobbyId}`);
            }

            const result = await this.prisma.black_jack_lobby.update({
                where: {lobby_id: lobbyId},
                data: updateData
            });

            return this.convertBigIntToNumber(result);
        } catch (error) {
            console.error(`Error leaving lobby ${lobbyId}:`, error);
            throw error;
        }
    }

    async getListofPlayersInLobby(lobbyId: number): Promise<string[]> {
        const lobby = await this.getLobbyById(lobbyId);
        if (!lobby) {
            return [];
        }

        const players: string[] = [];
        if (lobby.client1_id) players.push(String(lobby.client1_id));
        if (lobby.client2_id) players.push(String(lobby.client2_id));
        if (lobby.client3_id) players.push(String(lobby.client3_id));

        return players;
    }

    async getLobbyPlayers(lobbyId: number): Promise<any[]> {
        const lobby = await this.getLobbyById(lobbyId);
        if (!lobby) {
            throw new Error(`Lobby ${lobbyId} not found`);
        }

        const playerIds = [lobby.client1_id, lobby.client2_id, lobby.client3_id]
            .filter(id => id !== null);

        if (playerIds.length === 0) {
            return [];
        }

        const result = await this.prisma.cliente.findMany({
            where: {
                clienteid: {in: playerIds as number[]}
            },
            include: {
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        email: true,
                        img: true
                    }
                }
            }
        });

        return this.convertBigIntToNumber(result);
    }

    async getPlayerCount(lobbyId: number): Promise<number> {
        const players = await this.getListofPlayersInLobby(lobbyId);
        return players.length;
    }

    async isLobbyFull(lobbyId: number): Promise<boolean> {
        const playerCount = await this.getPlayerCount(lobbyId);
        return playerCount >= 3;
    }

    async isLobbyEmpty(lobbyId: number): Promise<boolean> {
        const playerCount = await this.getPlayerCount(lobbyId);
        return playerCount === 0;
    }

    async deleteLobby(lobbyId: number): Promise<any> {
        const result = await this.prisma.black_jack_lobby.delete({
            where: {lobby_id: lobbyId}
        });
        return this.convertBigIntToNumber(result);
    }

    async updateLobby(lobbyId: number, data: any): Promise<any> {
        const result = await this.prisma.black_jack_lobby.update({
            where: {lobby_id: lobbyId},
            data
        });
        return this.convertBigIntToNumber(result);
    }

    async clearLobby(lobbyId: number): Promise<any> {
        const result = await this.prisma.black_jack_lobby.update({
            where: {lobby_id: lobbyId},
            data: {
                client1_id: null,
                client2_id: null,
                client3_id: null
            }
        });
        return this.convertBigIntToNumber(result);
    }
}