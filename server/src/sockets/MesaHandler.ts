import {Server, Socket} from 'socket.io';
import {LobbyService} from '../services/lobbyService';

// Card and Game State types
interface Card {
    suit: string;
    value: string;
    numericValue: number;
}

interface PlayerHand {
    cards: Card[];
    total: number;
    bet: number;
    isActive: boolean;
    playerId: number | null;
    playerName: string;
}

interface GameState {
    dealerHand: Card[];
    dealerTotal: number;
    players: PlayerHand[];
    currentPlayer: number;
    gamePhase: 'waiting' | 'betting' | 'dealing' | 'playing' | 'finished';
    selectedChip: number;
}

// Track active games by lobby ID
const activeGames = new Map<number, {
    gameState: GameState,
    timers: { [key: string]: NodeJS.Timeout }
}>();

// Create a new deck of cards
const createDeck = (): Card[] => {
    const suits = ['♥', '♦', '♣', '♠'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];

    for (const suit of suits) {
        for (const value of values) {
            let numericValue: number;
            if (value === 'A') numericValue = 11;
            else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
            else numericValue = parseInt(value);

            deck.push({suit, value, numericValue});
        }
    }

    return shuffleDeck(deck);
};

// Shuffle the deck using Fisher-Yates algorithm
const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Initialize a new game state
const initializeGameState = (): GameState => {
    return {
        dealerHand: [],
        dealerTotal: 0,
        players: [
            {cards: [], total: 0, bet: 0, isActive: false, playerId: null, playerName: "Empty Seat"},
            {cards: [], total: 0, bet: 0, isActive: false, playerId: null, playerName: "Empty Seat"},
            {cards: [], total: 0, bet: 0, isActive: false, playerId: null, playerName: "Empty Seat"}
        ],
        currentPlayer: -1,
        gamePhase: 'waiting',
        selectedChip: 25
    };
};

// Calculate the total value of a hand (with Ace handling)
const calculateHandTotal = (cards: Card[]): number => {
    let total = 0;
    let aceCount = 0;

    for (const card of cards) {
        if (card.value === 'A') {
            aceCount++;
            total += 11;
        } else {
            total += card.numericValue;
        }
    }

    // Adjust aces if needed to avoid busting
    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
    }

    return total;
};

// Debug function to log game state
const debugGameState = (lobbyId: number) => {
    if (activeGames.has(lobbyId)) {
        const game = activeGames.get(lobbyId)!;
        console.log(`[DEBUG] Game state for lobby ${lobbyId}:`, {
            gamePhase: game.gameState.gamePhase,
            players: game.gameState.players.map((p, i) => ({
                position: i,
                name: p.playerName,
                playerId: p.playerId,
                isActive: p.isActive,
                seated: p.playerId !== null
            })),
            hasWaitingTimer: !!game.timers.waiting,
            currentPlayer: game.gameState.currentPlayer
        });
    }
};

// --- FIXED: Start betting phase with waiting timer ---
const startBettingPhaseWithTimer = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;
    const game = activeGames.get(lobbyId)!;

    // Set phase to waiting and notify clients
    game.gameState.gamePhase = 'waiting';
    io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'waiting'});
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

    console.log(`[DEBUG] Starting waiting phase timer for lobby ${lobbyId}`);

    // Clear any previous timer
    if (game.timers.waiting) {
        clearTimeout(game.timers.waiting);
        console.log(`[DEBUG] Cleared previous timer for lobby ${lobbyId}`);
    }

    // Start timer (10 seconds for testing, change to 60000 for production)
    game.timers.waiting = setTimeout(() => {
        console.log(`[DEBUG] Timer expired for lobby ${lobbyId}, checking for players...`);

        // Check for at least one seated player
        const seatedPlayers = game.gameState.players.filter(p => p.isActive && p.playerId !== null);
        console.log(`[DEBUG] Found ${seatedPlayers.length} seated players:`, seatedPlayers.map(p => `${p.playerName} (ID: ${p.playerId})`));

        if (seatedPlayers.length > 0) {
            console.log(`[DEBUG] Moving to betting phase for lobby ${lobbyId}`);
            // Move to betting phase
            game.gameState.gamePhase = 'betting';
            io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'betting'});
            io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);
        } else {
            console.log(`[DEBUG] No seated players, repeating waiting phase for lobby ${lobbyId}`);
            // No players, repeat waiting phase
            startBettingPhaseWithTimer(io, lobbyId);
        }
    }, 10000); // Change to 60000 for production

    console.log(`[DEBUG] Timer set for lobby ${lobbyId}, will expire in 10 seconds`);
};

export const setupMesaHandlers = (io: Server, lobbyService: LobbyService) => {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Join lobby
        socket.on('joinLobby', async ({lobbyId, clientId, playerName}) => {
            try {
                console.log(`Player ${clientId} (${playerName}) joining lobby ${lobbyId}`);

                // Join the socket room for this lobby
                socket.join(`lobby-${lobbyId}`);

                // If this is a new game, initialize it
                if (!activeGames.has(lobbyId)) {
                    console.log(`[DEBUG] Creating new game for lobby ${lobbyId}`);
                    activeGames.set(lobbyId, {
                        gameState: initializeGameState(),
                        timers: {}
                    });
                    // Start waiting phase with timer
                    startBettingPhaseWithTimer(io, lobbyId);
                } else {
                    console.log(`[DEBUG] Game already exists for lobby ${lobbyId}`);
                    debugGameState(lobbyId);
                }

                // Notify client of successful join
                socket.emit('joinLobbyResponse', {
                    success: true,
                    message: `Joined lobby ${lobbyId}`
                });
            } catch (error: any) {
                console.error(`Error joining lobby: ${error.message}`);
                socket.emit('joinError', {message: error.message});
            }
        });

        // Leave lobby
        socket.on('leaveLobby', ({lobbyId, clientId}) => {
            console.log(`Player ${clientId} leaving lobby ${lobbyId}`);
            socket.leave(`lobby-${lobbyId}`);

            // If player was seated, handle leaving the seat
            if (activeGames.has(lobbyId)) {
                const game = activeGames.get(lobbyId)!;
                const playerIndex = game.gameState.players.findIndex(p => p.playerId === clientId);

                if (playerIndex >= 0) {
                    console.log(`[DEBUG] Player ${clientId} leaving seat at position ${playerIndex}`);
                    game.gameState.players[playerIndex] = {
                        cards: [],
                        total: 0,
                        bet: 0,
                        isActive: false,
                        playerId: null,
                        playerName: "Empty Seat"
                    };

                    // Broadcast updated game state
                    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);
                }
            }
        });

        // Request current game state
        socket.on('requestGameState', ({lobbyId}) => {
            console.log(`[DEBUG] Game state requested for lobby ${lobbyId}`);
            if (activeGames.has(lobbyId)) {
                const gameState = activeGames.get(lobbyId)!.gameState;
                socket.emit('gameStateUpdate', gameState);
                debugGameState(lobbyId);
            } else {
                console.log(`[DEBUG] No game found for lobby ${lobbyId}, creating new one`);
                const newGameState = initializeGameState();
                activeGames.set(lobbyId, {gameState: newGameState, timers: {}});
                socket.emit('gameStateUpdate', newGameState);
                startBettingPhaseWithTimer(io, lobbyId);
            }
        });

        // Sit at a specific position - FIXED VERSION
        socket.on('sitDown', ({lobbyId, position, clientId, playerName}) => {
            try {
                console.log(`Player ${clientId} (${playerName}) sitting at position ${position} in lobby ${lobbyId}`);

                if (!activeGames.has(lobbyId)) {
                    throw new Error('Game not found');
                }

                const game = activeGames.get(lobbyId)!;

                // Check if position is valid
                if (position < 0 || position >= game.gameState.players.length) {
                    throw new Error('Invalid position');
                }

                // Check if position is already taken
                if (game.gameState.players[position].playerId !== null) {
                    throw new Error('Seat already taken');
                }

                // Check if player is already seated elsewhere
                const existingPosition = game.gameState.players.findIndex(p => p.playerId === clientId);
                if (existingPosition >= 0) {
                    throw new Error('You are already seated at this table');
                }

                // Take the seat
                game.gameState.players[position] = {
                    ...game.gameState.players[position],
                    isActive: true,
                    playerId: clientId,
                    playerName
                };

                console.log(`[DEBUG] Player ${playerName} seated at position ${position}. Current game phase: ${game.gameState.gamePhase}`);

                // *** CLAVE: Si estamos en waiting phase, reiniciar el timer ***
                if (game.gameState.gamePhase === 'waiting') {
                    console.log(`[DEBUG] Restarting timer because player joined during waiting phase`);
                    startBettingPhaseWithTimer(io, lobbyId);
                }

                // Emit seat confirmation to the player
                socket.emit('sitDownResponse', {
                    success: true,
                    position
                });

                // Broadcast to all clients that the player joined
                io.to(`lobby-${lobbyId}`).emit('playerJoined', {
                    position,
                    playerId: clientId,
                    playerName
                });

                // Update game state for everyone
                io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);
                debugGameState(lobbyId);

            } catch (error: any) {
                console.error(`Error sitting down: ${error.message}`);
                socket.emit('sitDownResponse', {error: error.message});
            }
        });

        // Leave a seat
        socket.on('leaveSeat', ({lobbyId, position, clientId}) => {
            try {
                console.log(`Player ${clientId} leaving seat at position ${position} in lobby ${lobbyId}`);

                if (!activeGames.has(lobbyId)) {
                    throw new Error('Game not found');
                }

                const game = activeGames.get(lobbyId)!;

                // Check if position is valid and occupied by this client
                if (position < 0 || position >= game.gameState.players.length ||
                    game.gameState.players[position].playerId !== clientId) {
                    throw new Error('Invalid position or not your seat');
                }

                // Check if game is in progress
                if (game.gameState.gamePhase !== 'waiting' && game.gameState.players[position].isActive) {
                    throw new Error('Cannot leave during an active game');
                }

                // Leave the seat
                game.gameState.players[position] = {
                    cards: [],
                    total: 0,
                    bet: 0,
                    isActive: false,
                    playerId: null,
                    playerName: "Empty Seat"
                };

                // Emit confirmation to the player
                socket.emit('leaveSeatResponse', {
                    success: true,
                    message: 'Seat vacated successfully'
                });

                // Update game state for everyone
                io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);
                debugGameState(lobbyId);

            } catch (error: any) {
                console.error(`Error leaving seat: ${error.message}`);
                socket.emit('leaveSeatResponse', {error: error.message});
            }
        });

        // Place bet
        socket.on('placeBet', ({lobbyId, position, amount}) => {
            try {
                console.log(`[DEBUG] Bet placed: lobby ${lobbyId}, position ${position}, amount ${amount}`);

                if (!activeGames.has(lobbyId)) {
                    throw new Error('Game not found');
                }

                const game = activeGames.get(lobbyId)!;

                // Validate game phase
                if (game.gameState.gamePhase !== 'betting') {
                    throw new Error('Not in betting phase');
                }

                // Update bet for the player
                game.gameState.players[position].bet += amount;
                console.log(`[DEBUG] Player at position ${position} now has bet: ${game.gameState.players[position].bet}`);

                // Broadcast updated game state
                io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

                // Check if all active players have bet
                const activePlayers = game.gameState.players.filter(p => p.isActive && p.playerId !== null);
                const allBet = activePlayers.every(p => p.bet > 0);
                console.log(`[DEBUG] Active players: ${activePlayers.length}, All bet: ${allBet}`);

                if (allBet && activePlayers.length > 0) {
                    console.log(`[DEBUG] All players have bet, starting dealing phase`);
                    // Start dealing phase
                    startDealingPhase(io, lobbyId);
                }

            } catch (error: any) {
                console.error(`Error placing bet: ${error.message}`);
                socket.emit('betError', {message: error.message});
            }
        });

        // Player actions (hit, stand, double)
        socket.on('playerAction', ({lobbyId, action, position}) => {
            try {
                console.log(`[DEBUG] Player action: ${action} at position ${position} in lobby ${lobbyId}`);

                if (!activeGames.has(lobbyId)) {
                    throw new Error('Game not found');
                }

                const game = activeGames.get(lobbyId)!;

                // Validate game phase
                if (game.gameState.gamePhase !== 'playing') {
                    throw new Error('Not in playing phase');
                }

                // Validate it's this player's turn
                if (game.gameState.currentPlayer !== position) {
                    throw new Error('Not your turn');
                }

                // Handle different actions
                switch (action) {
                    case 'hit':
                        handleHit(io, lobbyId, position);
                        break;

                    case 'stand':
                        handleStand(io, lobbyId, position);
                        break;

                    case 'double':
                        handleDouble(io, lobbyId, position);
                        break;

                    default:
                        throw new Error('Invalid action');
                }

            } catch (error: any) {
                console.error(`Error processing player action: ${error.message}`);
                socket.emit('actionError', {message: error.message});
            }
        });

        // Disconnect handling
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            // Actual disconnect handling would be more complex in a full implementation
        });
    });
};

// Game flow functions
const startDealingPhase = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    game.gameState.gamePhase = 'dealing';

    console.log(`[DEBUG] Starting dealing phase for lobby ${lobbyId}`);

    // Clear any existing timers
    if (game.timers.waiting) {
        clearTimeout(game.timers.waiting);
        delete game.timers.waiting;
    }

    // Notify clients about phase change
    io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'dealing'});
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

    // Create a new shuffled deck
    const deck = createDeck();

    // Deal initial cards
    const activePlayers = game.gameState.players
        .map((player, index) => ({player, index}))
        .filter(({player}) => player.isActive && player.bet > 0);

    console.log(`[DEBUG] Dealing cards to ${activePlayers.length} active players`);

    // Deal first card to each player
    activePlayers.forEach(({player, index}) => {
        const card = deck.pop();
        if (card) {
            player.cards.push(card);
            player.total = calculateHandTotal(player.cards);
            console.log(`[DEBUG] Dealt ${card.value}${card.suit} to player at position ${index}`);
        }
    });

    // Deal first card to dealer (face up)
    const dealerCard1 = deck.pop();
    if (dealerCard1) {
        game.gameState.dealerHand.push(dealerCard1);
        game.gameState.dealerTotal = calculateHandTotal(game.gameState.dealerHand);
        console.log(`[DEBUG] Dealt ${dealerCard1.value}${dealerCard1.suit} to dealer (face up)`);
    }

    // Deal second card to each player
    activePlayers.forEach(({player, index}) => {
        const card = deck.pop();
        if (card) {
            player.cards.push(card);
            player.total = calculateHandTotal(player.cards);
            console.log(`[DEBUG] Dealt second card ${card.value}${card.suit} to player at position ${index}, total: ${player.total}`);
        }
    });

    // Deal second card to dealer (face down - will be represented differently to clients)
    const dealerCard2 = deck.pop();
    if (dealerCard2) {
        game.gameState.dealerHand.push(dealerCard2);
        console.log(`[DEBUG] Dealt hole card to dealer`);
    }

    // Update game state with dealt cards
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

    // Check for blackjacks
    let dealerBlackjack = calculateHandTotal(game.gameState.dealerHand) === 21;
    console.log(`[DEBUG] Dealer has blackjack: ${dealerBlackjack}`);

    // If dealer has blackjack, reveal it immediately
    if (dealerBlackjack) {
        game.gameState.gamePhase = 'finished';
        game.gameState.dealerTotal = calculateHandTotal(game.gameState.dealerHand);
        io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'finished'});
        io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

        // Process results for all players
        processGameResults(io, lobbyId);
    } else {
        // Start the playing phase with the first active player
        startPlayingPhase(io, lobbyId);
    }
};

const startPlayingPhase = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    game.gameState.gamePhase = 'playing';

    console.log(`[DEBUG] Starting playing phase for lobby ${lobbyId}`);

    // Find the first active player
    const firstPlayerIndex = game.gameState.players.findIndex(
        p => p.isActive && p.bet > 0
    );

    if (firstPlayerIndex >= 0) {
        game.gameState.currentPlayer = firstPlayerIndex;
        console.log(`[DEBUG] First player turn: position ${firstPlayerIndex}`);

        // Check for player blackjack
        if (game.gameState.players[firstPlayerIndex].total === 21) {
            console.log(`[DEBUG] Player at position ${firstPlayerIndex} has blackjack, auto-standing`);
            // Automatically stand on blackjack
            handleStand(io, lobbyId, firstPlayerIndex);
        }
    } else {
        // No active players, go straight to dealer play
        console.log(`[DEBUG] No active players, going to dealer play`);
        playDealerHand(io, lobbyId);
    }

    io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'playing'});
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);
};

const handleHit = (io: Server, lobbyId: number, position: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    const player = game.gameState.players[position];

    console.log(`[DEBUG] Player at position ${position} hits`);

    // Deal a card from the deck
    const deck = createDeck(); // In a real implementation, we would maintain the deck state
    const card = deck.pop();

    if (card) {
        player.cards.push(card);
        player.total = calculateHandTotal(player.cards);
        console.log(`[DEBUG] Dealt ${card.value}${card.suit} to player at position ${position}, new total: ${player.total}`);

        // Update game state
        io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

        // Check if player busted
        if (player.total > 21) {
            console.log(`[DEBUG] Player at position ${position} busted with ${player.total}`);
            // Automatically move to next player
            moveToNextPlayer(io, lobbyId);
        }
    }
};

const handleStand = (io: Server, lobbyId: number, position: number) => {
    if (!activeGames.has(lobbyId)) return;

    console.log(`[DEBUG] Player at position ${position} stands`);
    // Move to the next player
    moveToNextPlayer(io, lobbyId);
};

const handleDouble = (io: Server, lobbyId: number, position: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    const player = game.gameState.players[position];

    console.log(`[DEBUG] Player at position ${position} doubles down`);

    // Double the bet
    const originalBet = player.bet;
    player.bet *= 2;
    console.log(`[DEBUG] Bet doubled from ${originalBet} to ${player.bet}`);

    // Deal one card
    const deck = createDeck(); // In a real implementation, we would maintain the deck state
    const card = deck.pop();

    if (card) {
        player.cards.push(card);
        player.total = calculateHandTotal(player.cards);
        console.log(`[DEBUG] Dealt ${card.value}${card.suit} for double down, new total: ${player.total}`);

        // Update game state
        io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

        // Always move to next player after doubling
        moveToNextPlayer(io, lobbyId);
    }
};

const moveToNextPlayer = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;

    // Find the next active player
    let nextPlayer = -1;
    for (let i = game.gameState.currentPlayer + 1; i < game.gameState.players.length; i++) {
        if (game.gameState.players[i].isActive && game.gameState.players[i].bet > 0) {
            nextPlayer = i;
            break;
        }
    }

    if (nextPlayer >= 0) {
        // Move to next player
        game.gameState.currentPlayer = nextPlayer;
        console.log(`[DEBUG] Moving to next player at position ${nextPlayer}`);
        io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

        // Check for blackjack
        if (game.gameState.players[nextPlayer].total === 21) {
            console.log(`[DEBUG] Next player at position ${nextPlayer} has blackjack, auto-standing`);
            // Automatically stand on blackjack
            handleStand(io, lobbyId, nextPlayer);
        }
    } else {
        // All players have completed their turns, move to dealer's play
        console.log(`[DEBUG] All players finished, moving to dealer play`);
        playDealerHand(io, lobbyId);
    }
};

const playDealerHand = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    game.gameState.currentPlayer = -1; // No active player during dealer's turn

    console.log(`[DEBUG] Starting dealer play`);

    // Reveal dealer's hole card
    game.gameState.dealerTotal = calculateHandTotal(game.gameState.dealerHand);
    console.log(`[DEBUG] Dealer reveals hole card, total: ${game.gameState.dealerTotal}`);

    // Dealer draws until reaching 17 or higher
    const dealerPlay = () => {
        io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

        if (game.gameState.dealerTotal < 17) {
            console.log(`[DEBUG] Dealer has ${game.gameState.dealerTotal}, must hit`);
            // Deal another card to dealer
            const deck = createDeck(); // In a real implementation, we would maintain the deck state
            const card = deck.pop();

            if (card) {
                game.gameState.dealerHand.push(card);
                game.gameState.dealerTotal = calculateHandTotal(game.gameState.dealerHand);
                console.log(`[DEBUG] Dealer draws ${card.value}${card.suit}, new total: ${game.gameState.dealerTotal}`);

                // Set timeout for next draw for visual effect
                game.timers.dealerDraw = setTimeout(() => dealerPlay(), 1000);
            }
        } else {
            console.log(`[DEBUG] Dealer stands with ${game.gameState.dealerTotal}`);
            // Dealer is done, determine outcomes
            processGameResults(io, lobbyId);
        }
    };

    // Start dealer play
    dealerPlay();
};

const processGameResults = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    game.gameState.gamePhase = 'finished';

    console.log(`[DEBUG] Processing game results for lobby ${lobbyId}`);

    // Clear any dealer draw timers
    if (game.timers.dealerDraw) {
        clearTimeout(game.timers.dealerDraw);
        delete game.timers.dealerDraw;
    }

    io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'finished'});
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

    // After a delay, reset for the next round
    game.timers.nextRound = setTimeout(() => {
        resetGame(io, lobbyId);
    }, 5000);
};

// --- MODIFIED: Reset game to use waiting phase ---
const resetGame = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;

    console.log(`[DEBUG] Resetting game for lobby ${lobbyId}`);

    // Clear any existing timers
    if (game.timers.nextRound) {
        clearTimeout(game.timers.nextRound);
        delete game.timers.nextRound;
    }

    // Keep player positions but reset hands and bets
    game.gameState.players.forEach((player, index) => {
        if (player.playerId !== null) {
            console.log(`[DEBUG] Resetting player at position ${index}: ${player.playerName}`);
        }
        player.cards = [];
        player.total = 0;
        player.bet = 0;
    });

    // Reset dealer
    game.gameState.dealerHand = [];
    game.gameState.dealerTotal = 0;
    game.gameState.currentPlayer = -1;

    // Start waiting phase with timer
    startBettingPhaseWithTimer(io, lobbyId);
};