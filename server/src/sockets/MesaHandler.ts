import {Server, Socket} from 'socket.io';
import {LobbyService} from '../services/lobbyService';

const lobbyService = new LobbyService();

export function setupMesaHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        let currentLobbyId: number | null = null;
        let currentClientId: string | null = null;

        socket.on('joinLobby', async ({lobbyId, clientId}) => {
            currentLobbyId = lobbyId;
            currentClientId = clientId;

            try {
                // Check if lobby is full
                const isFull = await lobbyService.isLobbyFull(lobbyId);
                if (isFull) {
                    socket.emit('joinError', {message: 'Lobby is full'});
                    return;
                }

                // Add player to lobby
                await lobbyService.joinLobby(lobbyId, clientId);

                // Get updated player list
                const players = await lobbyService.getLobbyPlayers(lobbyId);

                // Join socket room and emit update
                socket.join(lobbyId.toString());
                io.to(lobbyId.toString()).emit('lobbyUpdate', {players});
            } catch (error: any) {
                socket.emit('joinError', {message: error.message});
            }
        });

        socket.on('disconnect', async () => {
            if (currentLobbyId && currentClientId) {
                try {
                    // Remove player from lobby
                    await lobbyService.leaveLobby(currentLobbyId, currentClientId);

                    // Get updated player list
                    const players = await lobbyService.getLobbyPlayers(currentLobbyId);

                    // Emit update to others
                    io.to(currentLobbyId.toString()).emit('lobbyUpdate', {players});
                } catch {
                    // Ignore errors on disconnect
                }
            }
        });
    });
}