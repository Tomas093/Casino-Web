import React, {useState, useEffect, useRef} from 'react';
import './BlackJackTableStyle.css';
import Footer from '@components/Footer';
import NavBar from "@components/NavBar.tsx";
import {useNavigate, useParams} from 'react-router-dom';
import {io, Socket} from 'socket.io-client';
import Message from '@components/Error/Message';
import { useLobbyContext } from '@context/LobbyContext';

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

const chipValues = [1, 10, 50, 100, 500, 1000];
const socketRef = {current: null as Socket | null};

// Initialize socket only once with debug options
if (!socketRef.current) {
    console.log('Creating new socket connection');
    socketRef.current = io('http://localhost:3001', {
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000,
        transports: ['websocket', 'polling']
    });
}

const BlackjackTable: React.FC = () => {
    const socket = socketRef.current!;
    const [gameState, setGameState] = useState<GameState>({
        dealerHand: [
            {suit: '♠', value: 'K', numericValue: 10},
            {suit: '', value: '?', numericValue: 0}
        ],
        dealerTotal: 10,
        players: [
            {cards: [], total: 0, bet: 0, isActive: false, playerId: null, playerName: "Empty Seat"},
            {cards: [], total: 0, bet: 0, isActive: false, playerId: null, playerName: "Empty Seat"},
            {cards: [], total: 0, bet: 0, isActive: false, playerId: null, playerName: "Empty Seat"}
        ],
        currentPlayer: -1,
        gamePhase: 'waiting',
        selectedChip: 25
    });

    const [localPlayerId, setLocalPlayerId] = useState<number | null>(null);
    const [localPlayerPosition, setLocalPlayerPosition] = useState<number | null>(null);
    const [username, setUsername] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [lastEmittedEvent, setLastEmittedEvent] = useState<{ event: string, data: any, time: number } | null>(null);
    const [lastClickedSpot, setLastClickedSpot] = useState<{ position: number, time: number } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const {roomId} = useParams();
    const initializedRef = useRef(false);
    const { leaveLobby } = useLobbyContext();

    // Debug function to safely emit socket events
    const safeEmit = (event: string, data: any) => {
        console.log(`Emitting ${event}:`, data);
        setLastEmittedEvent({event, data, time: Date.now()});

        if (!socket.connected) {
            console.warn('Socket not connected! Attempting to reconnect...');
            socket.connect();
        }

        try {
            socket.emit(event, data);
        } catch (error) {
            console.error(`Error emitting ${event}:`, error);
            setErrorMessage(`Failed to send ${event} action. Please try again.`);
        }
    };

    const handleLeaveSeat = () => {
        if (localPlayerPosition !== null && gameState.gamePhase === 'waiting') {
            console.log("🪑 Leaving seat at position", localPlayerPosition);

            safeEmit('leaveSeat', {
                lobbyId: Number(roomId),
                position: localPlayerPosition,
                clientId: localPlayerId
            });
        }
    };

    useEffect(() => {
        console.log('BlackjackTable component mounted');

        // Get local user info
        const user = localStorage.getItem("user");
        if (!user) {
            console.error('No user found in localStorage');
            setErrorMessage("You must be logged in to play");
            setTimeout(() => navigate('/BlackJackLobby'), 2000);
            return;
        }

        try {
            const userData = JSON.parse(user);
            const userId = userData.usuarioid;
            const userName = userData.username || "Player";

            console.log('User data loaded:', {userId, userName});

            if (!userId || !roomId) {
                console.error('Invalid user ID or room ID', {userId, roomId});
                setErrorMessage("Invalid user ID or room ID");
                setTimeout(() => navigate('/BlackJackLobby'), 2000);
                return;
            }

            setLocalPlayerId(userId);
            setUsername(userName);

            // Debug socket state
            console.log('Socket state:', {
                id: socket.id,
                connected: socket.connected,
                disconnected: socket.disconnected
            });

            // Avoid duplicate event listeners
            if (!initializedRef.current) {
                initializedRef.current = true;

                console.log('Setting up socket event listeners');

                socket.on('connect', () => {
                    console.log('🟢 Connected to server:', socket.id);
                    setIsConnected(true);

                    // Re-join room after reconnection
                    safeEmit('joinLobby', {
                        lobbyId: Number(roomId),
                        clientId: userId,
                        playerName: userName
                    });

                    // Request current game state
                    safeEmit('requestGameState', {
                        lobbyId: Number(roomId)
                    });
                });

                socket.on('disconnect', (reason) => {
                    console.log('🔴 Disconnected from server. Reason:', reason);
                    setIsConnected(false);
                    setErrorMessage(`Disconnected from server: ${reason}. Reconnecting...`);
                });

                socket.on('connect_error', (error) => {
                    console.error('❌ Socket connection error:', error);
                    setErrorMessage(`Connection error: ${error.message}`);
                });

                socket.on('error', (error) => {
                    console.error('❌ Socket error:', error);
                    setErrorMessage(`Socket error: ${error.message || 'Unknown error'}`);
                });

                socket.on('joinError', (error) => {
                    console.error('❌ Failed to join lobby:', error);
                    setErrorMessage(`Error joining game: ${error.message || 'Unknown error'}`);
                });

                // Debug any server response
                socket.onAny((event, ...args) => {
                    console.log(`📥 Server event: ${event}`, args);
                });

                socket.on('gameStateUpdate', (updatedGameState) => {
                    console.log('🎮 Received game state update:', updatedGameState);
                    setGameState(updatedGameState);

                    // Find local player's position in the updated game state
                    const position = updatedGameState.players.findIndex((p: PlayerHand) => p.playerId === userId);
                    console.log('Local player position:', position, 'userId:', userId);
                    setLocalPlayerPosition(position >= 0 ? position : null);
                });

                socket.on('playerJoined', ({playerId, playerName, position}) => {
                    console.log('👤 Player joined event:', {playerId, playerName, position});

                    setGameState(prev => {
                        const updatedPlayers = [...prev.players];
                        updatedPlayers[position] = {
                            ...updatedPlayers[position],
                            playerId,
                            playerName,
                            isActive: true,
                        };
                        return {...prev, players: updatedPlayers};
                    });

                    if (playerId === userId) {
                        console.log('This is local player joining at position:', position);
                        setLocalPlayerPosition(position);
                    }
                });

                socket.on('sitDownResponse', (response) => {
                    console.log('🪑 sitDown response:', response);
                    if (response.error) {
                        console.error('Error sitting down:', response.error);
                        setErrorMessage(`Error sitting down: ${response.error}`);
                    }
                });

                socket.on('leaveSeatResponse', (response) => {
                    console.log('🪑 leaveSeat response:', response);
                    if (response.error) {
                        console.error('Error leaving seat:', response.error);
                        setErrorMessage(`Error leaving seat: ${response.error}`);
                    } else if (response.success) {
                        setLocalPlayerPosition(null);
                    }
                });

                socket.on('gamePhaseChanged', ({phase}) => {
                    console.log('🔄 Game phase changed:', phase);
                    setGameState(prev => ({...prev, gamePhase: phase}));
                });

                socket.on('actionError', ({message}) => {
                    console.error('❌ Action error:', message);
                    setErrorMessage(message);
                });

                socket.on('betError', ({message}) => {
                    console.error('❌ Betting error:', message);
                    setErrorMessage(message);
                });
            }

            if (!socket.connected) {
                console.log('Socket not connected, connecting now...');
                socket.connect();
            }

            // Join lobby and request current state
            safeEmit('joinLobby', {
                lobbyId: Number(roomId),
                clientId: userId,
                playerName: userName
            });

            safeEmit('requestGameState', {
                lobbyId: Number(roomId)
            });

            return () => {
                console.log('Component unmounting, leaving lobby');
                safeEmit('leaveLobby', {
                    lobbyId: Number(roomId),
                    clientId: userId
                });
            };
        } catch (error) {
            console.error('Error in useEffect:', error);
            setErrorMessage("An error occurred while setting up the game.");
            setTimeout(() => navigate('/BlackJackLobby'), 2000);
        }
    }, [roomId, navigate]);

    const handleBettingSpotClick = (playerIndex: number) => {
        console.log("👆 Click on position:", playerIndex);
        console.log("Game phase:", gameState.gamePhase);
        console.log("Is seat empty:", gameState.players[playerIndex].playerId === null);
        console.log("Local player ID:", localPlayerId);
        console.log("Username:", username);
        console.log("Room ID:", roomId);

        if (!isConnected) {
            console.warn("⚠️ Not connected to server");
            setErrorMessage("Not connected to the server. Please wait for reconnection.");
            return;
        }

        // Handle double-click to leave seat (if it's your seat)
        if (gameState.gamePhase === 'waiting' &&
            gameState.players[playerIndex].playerId === localPlayerId) {
            const now = Date.now();
            if (lastClickedSpot &&
                lastClickedSpot.position === playerIndex &&
                now - lastClickedSpot.time < 500) { // 500ms threshold for double-click
                handleLeaveSeat();
                setLastClickedSpot(null);
                return;
            }
            setLastClickedSpot({position: playerIndex, time: now});
            return;
        }

        // Only allow sitting at empty seats
        if (gameState.gamePhase === 'waiting' && gameState.players[playerIndex].playerId === null) {
            console.log("🪑 Attempting to sit down at position", playerIndex);

            const sitDownData = {
                lobbyId: Number(roomId),
                position: playerIndex,
                clientId: localPlayerId,
                playerName: username
            };

            safeEmit('sitDown', sitDownData);
        }

        // Only allow betting on your own position
        if (gameState.gamePhase === 'betting' && playerIndex === localPlayerPosition) {
            safeEmit('placeBet', {
                lobbyId: Number(roomId),
                position: playerIndex,
                amount: gameState.selectedChip
            });
        }
    };

    const handleChipSelect = (value: number) => {
        setGameState(prev => ({
            ...prev,
            selectedChip: value
        }));
    };

    const handleHit = () => {
        if (gameState.gamePhase === 'playing' && gameState.currentPlayer === localPlayerPosition) {
            safeEmit('playerAction', {
                lobbyId: Number(roomId),
                action: 'hit',
                position: localPlayerPosition
            });
        }
    };

    const handleStand = () => {
        if (gameState.gamePhase === 'playing' && gameState.currentPlayer === localPlayerPosition) {
            safeEmit('playerAction', {
                lobbyId: Number(roomId),
                action: 'stand',
                position: localPlayerPosition
            });
        }
    };

    const handleDouble = () => {
        if (gameState.gamePhase === 'playing' &&
            gameState.currentPlayer === localPlayerPosition &&
            gameState.players[localPlayerPosition!].cards.length === 2) {
            safeEmit('playerAction', {
                lobbyId: Number(roomId),
                action: 'double',
                position: localPlayerPosition
            });
        }
    };

    const handleLeaveTable = async () => {
        try {
            await leaveLobby(Number(roomId), localPlayerId);
            safeEmit('leaveLobby', {lobbyId: Number(roomId), clientId: localPlayerId});

            navigate('/BlackJackLobby');
        } catch (error) {
            console.error('Error leaving table:', error);
            navigate('/BlackJackLobby');
        }
    };

    const getCardColor = (suit: string) => {
        return ['♥', '♦'].includes(suit) ? '#dc3545' : '#000';
    };

    const formatCurrency = (amount: number) => {
        return `$${amount}`;
    };

    const canTakeAction = gameState.gamePhase === 'playing' &&
        gameState.currentPlayer === localPlayerPosition;

    const clearErrorMessage = () => {
        setErrorMessage(null);
    };

    return (
        <>
            <NavBar/>
            <div className="blackjack-container">
                {errorMessage && (
                    <div className="error-message-container">
                        <Message
                            message={errorMessage}
                            type="error"
                            onClose={clearErrorMessage}
                        />
                    </div>
                )}

                {!isConnected && (
                    <div className="connection-status" style={{
                        backgroundColor: 'rgba(255,0,0,0.7)',
                        padding: '10px',
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}>
                        Reconnecting to server...
                    </div>
                )}

                {lastEmittedEvent && (
                    <div className="debug-info" style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'lime',
                        padding: '5px',
                        fontSize: '10px',
                        position: 'fixed',
                        bottom: '10px',
                        left: '10px',
                        maxWidth: '300px',
                        zIndex: 1000
                    }}>
                        Last event: {lastEmittedEvent.event}<br/>
                        Time: {new Date(lastEmittedEvent.time).toLocaleTimeString()}
                    </div>
                )}

                <div className="blackjack-table">
                    <div className="table-felt">
                        {/* Dealer Area */}
                        <div className="dealer-area">
                            <div className="dealer-label">Dealer</div>
                            <div className="dealer-cards">
                                {gameState.dealerHand.map((card, index) => (
                                    <div
                                        key={index}
                                        className={`card ${card.value === '?' ? 'back' : ''}`}
                                        style={{color: card.value !== '?' ? getCardColor(card.suit) : '#ffd700'}}
                                    >
                                        {card.value === '?' ? '🂠' : `${card.value}${card.suit}`}
                                    </div>
                                ))}
                            </div>
                            <div className="dealer-total">
                                Total: {gameState.dealerTotal}{gameState.dealerHand.some(card => card.value === '?') ? '+' : ''}
                            </div>
                        </div>

                        {/* Table Center */}
                        <div className="table-center">
                            <div className="table-logo">BLACKJACK</div>
                            <div className="table-rules">
                                Dealer must stand on 17<br/>
                                Blackjack pays 3:2
                            </div>
                            <div className="game-status">
                                {gameState.gamePhase === 'waiting' && "Waiting for players..."}
                                {gameState.gamePhase === 'betting' && "Place your bets"}
                                {gameState.gamePhase === 'dealing' && "Dealing cards..."}
                                {gameState.gamePhase === 'playing' && `${gameState.players[gameState.currentPlayer]?.playerName}'s turn`}
                                {gameState.gamePhase === 'finished' && "Round complete"}
                            </div>
                        </div>

                        {/* Betting Spots */}
                        <div className="betting-spots">
                            {gameState.players.map((player, index) => (
                                <div
                                    key={index}
                                    className={`betting-spot
                                                          ${player.isActive ? ' active' : ''}
                                                          ${index === localPlayerPosition ? ' local-player' : ''}
                                                          ${index === 1 ? ' middle-spot' : ''}
                                                          ${player.playerId === null ? ' empty-seat' : ''}
                                                          ${gameState.currentPlayer === index ? ' current-turn' : ''}`}
                                    onClick={() => handleBettingSpotClick(index)}
                                >
                                    <div className="spot-label">
                                        {player.playerId === null
                                            ? "Empty Seat"
                                            : (player.playerId === localPlayerId
                                                ? "You"
                                                : player.playerName)}
                                    </div>

                                    {/* Leave Seat button */}
                                    {player.playerId === localPlayerId && gameState.gamePhase === 'waiting' && (
                                        <button
                                            className="leave-seat-btn"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the betting spot click
                                                handleLeaveSeat();
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                backgroundColor: '#ff4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '3px 6px',
                                                fontSize: '10px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Leave Seat
                                        </button>
                                    )}

                                    {player.bet > 0 && (
                                        <div className="bet-amount">
                                            {formatCurrency(player.bet)}
                                        </div>
                                    )}

                                    <div className="player-cards">
                                        {player.cards.map((card, cardIndex) => (
                                            <div
                                                key={cardIndex}
                                                className="card"
                                                style={{color: getCardColor(card.suit)}}
                                            >
                                                {card.value}{card.suit}
                                            </div>
                                        ))}
                                    </div>

                                    {player.cards.length > 0 && (
                                        <div className="player-total">
                                            Total: {player.total}
                                            {player.total === 21 && player.cards.length === 2 && (
                                                <span style={{color: '#ffd700', marginLeft: '5px'}}>♠ BLACKJACK!</span>
                                            )}
                                            {player.total > 21 && (
                                                <span style={{color: '#ff4444', marginLeft: '5px'}}>BUST!</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className="action-btn"
                                onClick={handleHit}
                                disabled={!canTakeAction ||
                                    gameState.players[localPlayerPosition!]?.total >= 21}
                            >
                                Hit
                            </button>
                            <button
                                className="action-btn"
                                onClick={handleStand}
                                disabled={!canTakeAction}
                            >
                                Stand
                            </button>
                            <button
                                className="action-btn"
                                onClick={handleDouble}
                                disabled={
                                    !canTakeAction ||
                                    gameState.players[localPlayerPosition!]?.cards.length !== 2
                                }
                            >
                                Double
                            </button>
                            <button
                                className="action-btn leave-btn"
                                onClick={handleLeaveTable}
                            >
                                Leave Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chips Area */}
                <div className="chips-area">
                    {chipValues.map(value => (
                        <div
                            key={value}
                            className={`chip chip-${value}
                                                    ${gameState.selectedChip === value ? 'selected' : ''}
                                                    ${gameState.gamePhase !== 'betting' || localPlayerPosition === null ? 'disabled' : ''}`}
                            onClick={() => gameState.gamePhase === 'betting' && handleChipSelect(value)}
                        >
                            ${value}
                        </div>
                    ))}
                </div>
            </div>

            <div className="footer-container">
                <Footer/>
            </div>
        </>
    );
};

export default BlackjackTable;