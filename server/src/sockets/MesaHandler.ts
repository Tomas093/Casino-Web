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
                    activeGames.set(lobbyId, {
                        gameState: initializeGameState(),
                        timers: {}
                    });
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
            if (activeGames.has(lobbyId)) {
                socket.emit('gameStateUpdate', activeGames.get(lobbyId)!.gameState);
            } else {
                const newGameState = initializeGameState();
                activeGames.set(lobbyId, {gameState: newGameState, timers: {}});
                socket.emit('gameStateUpdate', newGameState);
            }
        });

        // Sit at a specific position
        socket.on('sitDown', ({lobbyId, position, clientId, playerName}) => {
            try {
                console.log(`Player ${clientId} sitting at position ${position} in lobby ${lobbyId}`);

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

            } catch (error: any) {
                console.error(`Error leaving seat: ${error.message}`);
                socket.emit('leaveSeatResponse', {error: error.message});
            }
        });

        // Place bet
        socket.on('placeBet', ({lobbyId, position, amount}) => {
            try {
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

                // Broadcast updated game state
                io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

                // Check if all active players have bet
                const activePlayers = game.gameState.players.filter(p => p.isActive);
                const allBet = activePlayers.every(p => p.bet > 0);

                if (allBet && activePlayers.length > 0) {
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

    // Notify clients about phase change
    io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'dealing'});
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

    // Create a new shuffled deck
    const deck = createDeck();

    // Deal initial cards
    const activePlayers = game.gameState.players
        .map((player, index) => ({player, index}))
        .filter(({player}) => player.isActive && player.bet > 0);

    // Deal first card to each player
    activePlayers.forEach(({player, index}) => {
        const card = deck.pop();
        if (card) {
            player.cards.push(card);
            player.total = calculateHandTotal(player.cards);
        }
    });

    // Deal first card to dealer (face up)
    const dealerCard1 = deck.pop();
    if (dealerCard1) {
        game.gameState.dealerHand.push(dealerCard1);
        game.gameState.dealerTotal = calculateHandTotal(game.gameState.dealerHand);
    }

    // Deal second card to each player
    activePlayers.forEach(({player, index}) => {
        const card = deck.pop();
        if (card) {
            player.cards.push(card);
            player.total = calculateHandTotal(player.cards);
        }
    });

    // Deal second card to dealer (face down - will be represented differently to clients)
    const dealerCard2 = deck.pop();
    if (dealerCard2) {
        // The '?' value is just for representation - the server knows the real card
        game.gameState.dealerHand.push(dealerCard2);
        // We'll store the correct total but only show the first card's value to players
    }

    // Update game state with dealt cards
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

    // Check for blackjacks
    let dealerBlackjack = calculateHandTotal(game.gameState.dealerHand) === 21;

    // If dealer has blackjack, reveal it immediately
    if (dealerBlackjack) {
        game.gameState.gamePhase = 'finished';
        io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'finished'});

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

    // Find the first active player
    const firstPlayerIndex = game.gameState.players.findIndex(
        p => p.isActive && p.bet > 0
    );

    if (firstPlayerIndex >= 0) {
        game.gameState.currentPlayer = firstPlayerIndex;

        // Check for player blackjack
        if (game.gameState.players[firstPlayerIndex].total === 21) {
            // Automatically stand on blackjack
            handleStand(io, lobbyId, firstPlayerIndex);
        }
    } else {
        // No active players, go straight to dealer play
        playDealerHand(io, lobbyId);
    }

    io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'playing'});
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);
};

const handleHit = (io: Server, lobbyId: number, position: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    const player = game.gameState.players[position];

    // Deal a card from the deck
    const deck = createDeck(); // In a real implementation, we would maintain the deck state
    const card = deck.pop();

    if (card) {
        player.cards.push(card);
        player.total = calculateHandTotal(player.cards);

        // Update game state
        io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

        // Check if player busted
        if (player.total > 21) {
            // Automatically move to next player
            moveToNextPlayer(io, lobbyId);
        }
    }
};

const handleStand = (io: Server, lobbyId: number, position: number) => {
    if (!activeGames.has(lobbyId)) return;

    // Move to the next player
    moveToNextPlayer(io, lobbyId);
};

const handleDouble = (io: Server, lobbyId: number, position: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    const player = game.gameState.players[position];

    // Double the bet
    player.bet *= 2;

    // Deal one card
    const deck = createDeck(); // In a real implementation, we would maintain the deck state
    const card = deck.pop();

    if (card) {
        player.cards.push(card);
        player.total = calculateHandTotal(player.cards);

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
        io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

        // Check for blackjack
        if (game.gameState.players[nextPlayer].total === 21) {
            // Automatically stand on blackjack
            handleStand(io, lobbyId, nextPlayer);
        }
    } else {
        // All players have completed their turns, move to dealer's play
        playDealerHand(io, lobbyId);
    }
};

const playDealerHand = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;
    game.gameState.currentPlayer = -1; // No active player during dealer's turn

    // Reveal dealer's hole card
    game.gameState.dealerTotal = calculateHandTotal(game.gameState.dealerHand);

    // Dealer draws until reaching 17 or higher
    const dealerPlay = () => {
        io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

        if (game.gameState.dealerTotal < 17) {
            // Deal another card to dealer
            const deck = createDeck(); // In a real implementation, we would maintain the deck state
            const card = deck.pop();

            if (card) {
                game.gameState.dealerHand.push(card);
                game.gameState.dealerTotal = calculateHandTotal(game.gameState.dealerHand);

                // Set timeout for next draw for visual effect
                game.timers.dealerDraw = setTimeout(() => dealerPlay(), 1000);
            }
        } else {
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

    io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'finished'});
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);

    // After a delay, reset for the next round
    game.timers.nextRound = setTimeout(() => {
        resetGame(io, lobbyId);
    }, 5000);
};

const resetGame = (io: Server, lobbyId: number) => {
    if (!activeGames.has(lobbyId)) return;

    const game = activeGames.get(lobbyId)!;

    // Keep player positions but reset hands and bets
    game.gameState.players.forEach(player => {
        player.cards = [];
        player.total = 0;
        player.bet = 0;
    });

    // Reset dealer
    game.gameState.dealerHand = [];
    game.gameState.dealerTotal = 0;

    // Set game phase to betting for next round
    game.gameState.gamePhase = 'betting';
    game.gameState.currentPlayer = -1;

    io.to(`lobby-${lobbyId}`).emit('gamePhaseChanged', {phase: 'betting'});
    io.to(`lobby-${lobbyId}`).emit('gameStateUpdate', game.gameState);
};