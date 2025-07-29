import {Router, Request, Response} from 'express';
import {LobbyService} from '../services/lobbyService';

const router = Router();
const lobbyService = new LobbyService();

// Helper function for async route handling
const asyncHandler = (fn: Function) => (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((error: any) => {
        console.error('Async route error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    });
};

// Create a new lobby
router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const {lobbyId} = req.body;

    if (typeof lobbyId !== 'number') {
        return res.status(400).json({error: 'lobbyId must be a number.'});
    }

    try {
        const newLobby = await lobbyService.createLobby(lobbyId);
        res.status(201).json(newLobby);
    } catch (error: any) {
        console.error('Error creating lobby:', error);
        res.status(500).json({
            error: 'Failed to create lobby',
            details: error.message
        });
    }
}));

// Get all lobbies - DEBE IR PRIMERO (sin parámetros)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    try {
        console.log('Attempting to get all lobbies...'); // Debug log
        const lobbies = await lobbyService.getAllLobbies();
        console.log('Successfully retrieved lobbies:', lobbies); // Debug log

        // Ensure we always return an array
        const lobbyArray = Array.isArray(lobbies) ? lobbies : [];
        res.status(200).json(lobbyArray);
    } catch (error: any) {
        console.error('Error getting all lobbies:', error);
        res.status(500).json({
            error: 'Failed to get lobbies',
            details: error.message
        });
    }
}));

// Get the count of players in a lobby
router.get('/:lobbyId/players/count', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    try {
        const count = await lobbyService.getPlayerCount(lobbyId);
        res.status(200).json({count});
    } catch (error: any) {
        console.error(`Error getting player count for lobby ${lobbyId}:`, error);
        res.status(404).json({
            error: 'Failed to get player count',
            details: error.message
        });
    }
}));

// Get all players in a lobby
router.get('/:lobbyId/players', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    try {
        const players = await lobbyService.getLobbyPlayers(lobbyId);
        res.status(200).json(players);
    } catch (error: any) {
        console.error(`Error getting players for lobby ${lobbyId}:`, error);
        res.status(404).json({
            error: 'Failed to get players',
            details: error.message
        });
    }
}));

// Check if a lobby is full
router.get('/:lobbyId/full', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    try {
        const isFull = await lobbyService.isLobbyFull(lobbyId);
        res.status(200).json({isFull});
    } catch (error: any) {
        console.error(`Error checking if lobby ${lobbyId} is full:`, error);
        res.status(404).json({
            error: 'Failed to check if lobby is full',
            details: error.message
        });
    }
}));

// Check if a lobby is empty
router.get('/:lobbyId/empty', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    try {
        const isEmpty = await lobbyService.isLobbyEmpty(lobbyId);
        res.status(200).json({isEmpty});
    } catch (error: any) {
        console.error(`Error checking if lobby ${lobbyId} is empty:`, error);
        res.status(404).json({
            error: 'Failed to check if lobby is empty',
            details: error.message
        });
    }
}));

// Get a specific lobby by ID
router.get('/:lobbyId', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    try {
        const lobby = await lobbyService.getLobbyById(lobbyId);
        if (lobby) {
            res.status(200).json(lobby);
        } else {
            res.status(404).json({message: `Lobby with ID ${lobbyId} not found.`});
        }
    } catch (error: any) {
        console.error(`Error getting lobby ${lobbyId}:`, error);
        res.status(500).json({
            error: 'Failed to get lobby',
            details: error.message
        });
    }
}));

// Add a player to a lobby
router.post('/:lobbyId/join', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);
    const {clientId} = req.body;

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    if (!clientId) {
        return res.status(400).json({error: 'clientId is required.'});
    }

    try {
        const updatedLobby = await lobbyService.joinLobby(lobbyId, clientId);
        res.status(200).json(updatedLobby);
    } catch (error: any) {
        console.error(`Error joining lobby ${lobbyId}:`, error);
        res.status(400).json({
            error: 'Failed to join lobby',
            details: error.message
        });
    }
}));

// Remove a player from a lobby
router.post('/:lobbyId/leave', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);
    const {clientId} = req.body;

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    if (!clientId) {
        return res.status(400).json({error: 'clientId is required.'});
    }

    try {
        const updatedLobby = await lobbyService.leaveLobby(lobbyId, clientId);
        res.status(200).json(updatedLobby);
    } catch (error: any) {
        console.error(`Error leaving lobby ${lobbyId}:`, error);
        res.status(400).json({
            error: 'Failed to leave lobby',
            details: error.message
        });
    }
}));

// Delete a lobby
router.delete('/:lobbyId', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    try {
        const deletedLobby = await lobbyService.deleteLobby(lobbyId);
        res.status(200).json(deletedLobby);
    } catch (error: any) {
        console.error(`Error deleting lobby ${lobbyId}:`, error);
        res.status(404).json({
            error: 'Failed to delete lobby',
            details: error.message
        });
    }
}));

// Update a lobby's data
router.put('/:lobbyId', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    try {
        const updatedLobby = await lobbyService.updateLobby(lobbyId, req.body);
        res.status(200).json(updatedLobby);
    } catch (error: any) {
        console.error(`Error updating lobby ${lobbyId}:`, error);
        res.status(404).json({
            error: 'Failed to update lobby',
            details: error.message
        });
    }
}));

// Clear all players from a lobby
router.post('/:lobbyId/clear', asyncHandler(async (req: Request, res: Response) => {
    const lobbyId = parseInt(req.params.lobbyId);

    if (isNaN(lobbyId)) {
        return res.status(400).json({error: 'Invalid lobbyId parameter.'});
    }

    try {
        const clearedLobby = await lobbyService.clearLobby(lobbyId);
        res.status(200).json(clearedLobby);
    } catch (error: any) {
        console.error(`Error clearing lobby ${lobbyId}:`, error);
        res.status(404).json({
            error: 'Failed to clear lobby',
            details: error.message
        });
    }
}));

export default router;