import React, {useState, useEffect, useRef} from 'react';
import './BlackJackTableStyle.css';
import Footer from '@components/Footer';
import NavBar from "@components/NavBar.tsx";
import {useNavigate, useParams} from 'react-router-dom';
import {io, Socket} from 'socket.io-client';
import Message from '@components/Error/Message';
import {useLobbyContext} from '@context/LobbyContext';

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

if (!socketRef.current) {
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
    const {leaveLobby} = useLobbyContext();

    const safeEmit = (event: string, data: any) => {
        setLastEmittedEvent({event, data, time: Date.now()});
        if (!socket.connected) {
            socket.connect();
        }
        try {
            socket.emit(event, data);
        } catch (error) {
            setErrorMessage(`Failed to send ${event} action. Please try again.`);
        }
    };

    const handleLeaveSeat = () => {
        if (localPlayerPosition !== null && gameState.gamePhase === 'waiting') {
            safeEmit('leaveSeat', {
                lobbyId: Number(roomId),
                position: localPlayerPosition,
                clientId: localPlayerId ?? undefined
            });
        }
    };

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            setErrorMessage("You must be logged in to play");
            setTimeout(() => navigate('/BlackJackLobby'), 2000);
            return;
        }

        try {
            const userData = JSON.parse(user);
            const userId = userData.usuarioid;
            const userName = userData.username || "Player";

            if (!userId || !roomId) {
                setErrorMessage("Invalid user ID or room ID");
                setTimeout(() => navigate('/BlackJackLobby'), 2000);
                return;
            }

            setLocalPlayerId(userId);
            setUsername(userName);

            if (!initializedRef.current) {
                initializedRef.current = true;

                socket.on('connect', () => {
                    setIsConnected(true);
                    safeEmit('joinLobby', {
                        lobbyId: Number(roomId),
                        clientId: userId,
                        playerName: userName
                    });
                    safeEmit('requestGameState', {
                        lobbyId: Number(roomId)
                    });
                });

                socket.on('disconnect', (reason) => {
                    setIsConnected(false);
                    setErrorMessage(`Disconnected from server: ${reason}. Reconnecting...`);
                });

                socket.on('connect_error', (error) => {
                    setErrorMessage(`Connection error: ${error.message}`);
                });

                socket.on('error', (error) => {
                    setErrorMessage(`Socket error: ${error.message || 'Unknown error'}`);
                });

                socket.on('joinError', (error) => {
                    setErrorMessage(`Error joining game: ${error.message || 'Unknown error'}`);
                });

                socket.on('gameStateUpdate', (updatedGameState) => {
                    setGameState(updatedGameState);
                    const position = updatedGameState.players.findIndex((p: PlayerHand) => p.playerId === userId);
                    setLocalPlayerPosition(position >= 0 ? position : null);
                });

                socket.on('playerJoined', ({playerId, playerName, position}) => {
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
                        setLocalPlayerPosition(position);
                    }
                });

                socket.on('sitDownResponse', (response) => {
                    if (response.error) {
                        setErrorMessage(`Error sitting down: ${response.error}`);
                    }
                });

                socket.on('leaveSeatResponse', (response) => {
                    if (response.error) {
                        setErrorMessage(`Error leaving seat: ${response.error}`);
                    } else if (response.success) {
                        setLocalPlayerPosition(null);
                    }
                });

                socket.on('gamePhaseChanged', ({phase}) => {
                    setGameState(prev => ({...prev, gamePhase: phase}));
                });

                socket.on('actionError', ({message}) => {
                    setErrorMessage(message);
                });

                socket.on('betError', ({message}) => {
                    setErrorMessage(message);
                });
            }

            if (!socket.connected) {
                socket.connect();
            }

            safeEmit('joinLobby', {
                lobbyId: Number(roomId),
                clientId: userId,
                playerName: userName
            });

            safeEmit('requestGameState', {
                lobbyId: Number(roomId)
            });

            return () => {
                safeEmit('leaveLobby', {
                    lobbyId: Number(roomId),
                    clientId: userId
                });
            };
        } catch (error) {
            setErrorMessage("An error occurred while setting up the game.");
            setTimeout(() => navigate('/BlackJackLobby'), 2000);
        }
    }, [roomId, navigate]);

    const handleBettingSpotClick = (playerIndex: number) => {
        if (!isConnected) {
            setErrorMessage("Not connected to the server. Please wait for reconnection.");
            return;
        }

        if (gameState.gamePhase === 'waiting' &&
            gameState.players[playerIndex].playerId === localPlayerId) {
            const now = Date.now();
            if (lastClickedSpot &&
                lastClickedSpot.position === playerIndex &&
                now - lastClickedSpot.time < 500) {
                handleLeaveSeat();
                setLastClickedSpot(null);
                return;
            }
            setLastClickedSpot({position: playerIndex, time: now});
            return;
        }

        if (gameState.gamePhase === 'waiting' && gameState.players[playerIndex].playerId === null) {
            const sitDownData = {
                lobbyId: Number(roomId),
                position: playerIndex,
                clientId: localPlayerId ?? undefined,
                playerName: username
            };
            safeEmit('sitDown', sitDownData);
        }

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
            await leaveLobby(Number(roomId), localPlayerId ?? undefined);
            safeEmit('leaveLobby', {lobbyId: Number(roomId), clientId: localPlayerId ?? undefined});
            navigate('/BlackJackLobby');
        } catch (error) {
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
                    <div className="blackjack-error-message-container">
                        <Message
                            message={errorMessage}
                            type="error"
                            onClose={clearErrorMessage}
                        />
                    </div>
                )}

                {!isConnected && (
                    <div className="blackjack-connection-status" style={{
                        backgroundColor: 'rgba(255,0,0,0.7)',
                        padding: '10px',
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}>
                        Reconnecting to server...
                    </div>
                )}

                <div className="blackjack-table">
                    <div className="blackjack-table-felt">
                        {/* Dealer Area */}
                        <div className="blackjack-dealer-area">
                            <div className="blackjack-dealer-label">Dealer</div>
                            <div className="blackjack-dealer-cards">
                                {gameState.dealerHand.map((card, index) => (
                                    <div
                                        key={index}
                                        className={`blackjack-card ${card.value === '?' ? 'blackjack-back' : ''}`}
                                        style={{color: card.value !== '?' ? getCardColor(card.suit) : '#ffd700'}}
                                    >
                                        {card.value === '?' ? '🂠' : `${card.value}${card.suit}`}
                                    </div>
                                ))}
                            </div>
                            <div className="blackjack-dealer-total">
                                Total: {gameState.dealerTotal}{gameState.dealerHand.some(card => card.value === '?') ? '+' : ''}
                            </div>
                        </div>

                        {/* Table Center */}
                        <div className="blackjack-table-center">
                            <div className="blackjack-table-logo">BLACKJACK</div>
                            <div className="blackjack-table-rules">
                                Dealer must stand on 17<br/>
                                Blackjack pays 3:2
                            </div>
                            <div className="blackjack-game-status">
                                {gameState.gamePhase === 'waiting' && "Waiting for players..."}
                                {gameState.gamePhase === 'betting' && "Place your bets"}
                                {gameState.gamePhase === 'dealing' && "Dealing cards..."}
                                {gameState.gamePhase === 'playing' && `${gameState.players[gameState.currentPlayer]?.playerName}'s turn`}
                                {gameState.gamePhase === 'finished' && "Round complete"}
                            </div>
                        </div>

                        {/* Betting Spots */}
                        <div className="blackjack-betting-spots">
                            {gameState.players.map((player, index) => (
                                <div
                                    key={index}
                                    className={`blackjack-betting-spot
                                                                                                                  ${player.isActive ? 'blackjack-active' : ''}
                                                                                                                  ${index === localPlayerPosition ? 'blackjack-local-player' : ''}
                                                                                                                  ${index === 1 ? 'blackjack-middle-spot' : ''}
                                                                                                                  ${player.playerId === null ? 'blackjack-empty-seat' : ''}
                                                                                                                  ${gameState.currentPlayer === index ? 'blackjack-current-turn' : ''}`}
                                    onClick={() => handleBettingSpotClick(index)}
                                >
                                    <div className="blackjack-spot-label">
                                        {player.playerId === null
                                            ? "Empty Seat"
                                            : (player.playerId === localPlayerId
                                                ? "You"
                                                : player.playerName)}
                                    </div>

                                    {/* Leave Seat button */}
                                    {player.playerId === localPlayerId && gameState.gamePhase === 'waiting' && (
                                        <button
                                            className="blackjack-leave-seat-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
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
                                        <div className="blackjack-bet-amount">
                                            {formatCurrency(player.bet)}
                                        </div>
                                    )}

                                    <div className="blackjack-player-cards">
                                        {player.cards.map((card, cardIndex) => (
                                            <div
                                                key={cardIndex}
                                                className="blackjack-card"
                                                style={{color: getCardColor(card.suit)}}
                                            >
                                                {card.value}{card.suit}
                                            </div>
                                        ))}
                                    </div>

                                    {player.cards.length > 0 && (
                                        <div className="blackjack-player-total">
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
                        <div className="blackjack-action-buttons">
                            <button
                                className="blackjack-action-btn"
                                onClick={handleHit}
                                disabled={!canTakeAction ||
                                    gameState.players[localPlayerPosition!]?.total >= 21}
                            >
                                Hit
                            </button>
                            <button
                                className="blackjack-action-btn"
                                onClick={handleStand}
                                disabled={!canTakeAction}
                            >
                                Stand
                            </button>
                            <button
                                className="blackjack-action-btn"
                                onClick={handleDouble}
                                disabled={
                                    !canTakeAction ||
                                    gameState.players[localPlayerPosition!]?.cards.length !== 2
                                }
                            >
                                Double
                            </button>
                            <button
                                className="blackjack-action-btn blackjack-leave-btn"
                                onClick={handleLeaveTable}
                            >
                                Leave Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chips Area */}
                <div className="blackjack-chips-area">
                    {chipValues.map(value => (
                        <div
                            key={value}
                            className={`blackjack-chip blackjack-chip-${value}
                                                                                                                ${gameState.selectedChip === value ? 'blackjack-selected' : ''}
                                                                                                                ${gameState.gamePhase !== 'betting' || localPlayerPosition === null ? 'blackjack-disabled' : ''}`}
                            onClick={() => gameState.gamePhase === 'betting' && handleChipSelect(value)}
                        >
                            ${value}
                        </div>
                    ))}
                </div>
            </div>

            <div className="blackjack-footer-container">
                <Footer/>
            </div>
        </>
    );
};

export default BlackjackTable;