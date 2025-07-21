import React, {useState, useEffect} from 'react';
import './BlackJackTableStyle.css';
import Footer from '@components/Footer';
import NavBar from "@components/NavBar.tsx";
import {useNavigate, useParams} from 'react-router-dom';
import {io, Socket} from 'socket.io-client';

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
}

interface GameState {
    dealerHand: Card[];
    dealerTotal: number;
    players: PlayerHand[];
    currentPlayer: number;
    gamePhase: 'betting' | 'dealing' | 'playing' | 'finished';
    selectedChip: number;
}

const chipValues = [1, 10, 50, 100, 500, 1000];

const socket: Socket = io('http://localhost:3001'); // Adjust if needed

const BlackjackTable: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        dealerHand: [
            {suit: '♠', value: 'K', numericValue: 10},
            {suit: '', value: '?', numericValue: 0}
        ],
        dealerTotal: 10,
        players: [
            {
                cards: [
                    {suit: '♥', value: 'A', numericValue: 11},
                    {suit: '♦', value: '9', numericValue: 9}
                ],
                total: 20,
                bet: 25,
                isActive: true
            },
            {
                cards: [
                    {suit: '♣', value: 'J', numericValue: 10},
                    {suit: '♠', value: '6', numericValue: 6}
                ],
                total: 16,
                bet: 50,
                isActive: false
            },
            {
                cards: [
                    {suit: '♥', value: '8', numericValue: 8},
                    {suit: '♦', value: '3', numericValue: 3}
                ],
                total: 11,
                bet: 100,
                isActive: false
            }
        ],
        currentPlayer: 0,
        gamePhase: 'playing',
        selectedChip: 25
    });

    const navigate = useNavigate();
    const {roomId} = useParams();

    useEffect(() => {
        // Join lobby on mount
        const user = localStorage.getItem("user");
        const usuarioid: number | null = user ? JSON.parse(user).usuarioid : null;

        if (roomId && usuarioid) {
            socket.emit('joinLobby', {lobbyId: Number(roomId), clientId: usuarioid});
        }

        socket.on('lobbyUpdate', () => {
            // Optional: handle lobby updates
        });

        // Cleanup on unmount
        return () => {
            if (roomId && usuarioid) {
                socket.emit('leaveLobby', {lobbyId: Number(roomId), clientId: usuarioid});
            }
            socket.disconnect();
        };
    }, [roomId]);

    const handleChipSelect = (value: number) => {
        setGameState(prev => ({
            ...prev,
            selectedChip: value
        }));
    };

    const handleBettingSpotClick = (playerIndex: number) => {
        if (gameState.gamePhase === 'betting') {
            setGameState(prev => ({
                ...prev,
                players: prev.players.map((player, index) =>
                    index === playerIndex
                        ? {...player, bet: player.bet + prev.selectedChip}
                        : player
                )
            }));
        } else {
            setGameState(prev => ({
                ...prev,
                currentPlayer: playerIndex,
                players: prev.players.map((player, index) => ({
                    ...player,
                    isActive: index === playerIndex
                }))
            }));
        }
    };

    const handleHit = () => {
        if (gameState.gamePhase === 'playing') {
            const suits = ['♠', '♥', '♦', '♣'];
            const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            const randomSuit = suits[Math.floor(Math.random() * suits.length)];
            const randomValue = values[Math.floor(Math.random() * values.length)];

            let numericValue = 0;
            if (randomValue === 'A') numericValue = 11;
            else if (['J', 'Q', 'K'].includes(randomValue)) numericValue = 10;
            else numericValue = parseInt(randomValue);

            const newCard: Card = {
                suit: randomSuit,
                value: randomValue,
                numericValue
            };

            setGameState(prev => ({
                ...prev,
                players: prev.players.map((player, index) =>
                    index === prev.currentPlayer
                        ? {
                            ...player,
                            cards: [...player.cards, newCard],
                            total: player.total + numericValue
                        }
                        : player
                )
            }));
        }
    };

    const handleStand = () => {
        const nextPlayer = gameState.currentPlayer + 1;
        if (nextPlayer < gameState.players.length) {
            setGameState(prev => ({
                ...prev,
                currentPlayer: nextPlayer,
                players: prev.players.map((player, index) => ({
                    ...player,
                    isActive: index === nextPlayer
                }))
            }));
        } else {
            setGameState(prev => ({
                ...prev,
                gamePhase: 'finished',
                players: prev.players.map(player => ({...player, isActive: false}))
            }));
        }
    };

    const handleDouble = () => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.map((player, index) =>
                index === prev.currentPlayer
                    ? {...player, bet: player.bet * 2}
                    : player
            )
        }));
        handleHit();
    };

    const getCardColor = (suit: string) => {
        return ['♥', '♦'].includes(suit) ? '#dc3545' : '#000';
    };

    const formatCurrency = (amount: number) => {
        return `$${amount}`;
    };

    // Salir button handler
    const handleLeaveTable = () => {
        console.log('roomId:', roomId); // Log roomId for debugging
        const user = localStorage.getItem("user");
        const usuarioid: number | null = user ? JSON.parse(user).usuarioid : null;
        console.log(usuarioid)

        if (!usuarioid || !roomId) {
            alert("You must be logged in and have a valid room to leave the table.");
            return;
        }
        socket.emit('leaveLobby', {lobbyId: Number(roomId), clientId: usuarioid});
        navigate('/BlackJackLobby');
    };

    return (
        <>
            <NavBar/>
            <div className="blackjack-container">
                <div className="blackjack-table">
                    <div className="table-felt">
                        {/* Área del Dealer */}
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

                        {/* Centro de la mesa */}
                        <div className="table-center">
                            <div className="table-logo">BLACKJACK</div>
                            <div className="table-rules">
                                Dealer debe plantarse en 17<br/>
                                Blackjack paga 3:2
                            </div>
                        </div>

                        {/* Posiciones de apuesta */}
                        <div className="betting-spots">
                            {gameState.players.map((player, index) => (
                                <div
                                    key={index}
                                    className={`betting-spot${player.isActive ? ' active' : ''}${index === 1 ? ' middle-spot' : ''}`}
                                    onClick={() => handleBettingSpotClick(index)}
                                >
                                    <div className="spot-label">Jugador {index + 1}</div>

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

                                    <div className="player-total">
                                        Total: {player.total}
                                        {player.total === 21 && player.cards.length === 2 && (
                                            <span style={{color: '#ffd700', marginLeft: '5px'}}>♠ BLACKJACK!</span>
                                        )}
                                        {player.total > 21 && (
                                            <span style={{color: '#ff4444', marginLeft: '5px'}}>BUST!</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botones de acción */}
                        <div className="action-buttons">
                            <button
                                className="action-btn"
                                onClick={handleHit}
                                disabled={gameState.gamePhase !== 'playing' || gameState.players[gameState.currentPlayer]?.total >= 21}
                            >
                                Pedir
                            </button>
                            <button
                                className="action-btn"
                                onClick={handleStand}
                                disabled={gameState.gamePhase !== 'playing'}
                            >
                                Plantarse
                            </button>
                            <button
                                className="action-btn"
                                onClick={handleDouble}
                                disabled={
                                    gameState.gamePhase !== 'playing' ||
                                    gameState.players[gameState.currentPlayer]?.cards.length !== 2
                                }
                            >
                                Doblar
                            </button>
                            <button
                                className="action-btn leave-btn"
                                onClick={handleLeaveTable}
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
                {/* Fichas */}
                <div className="chips-area">
                    {chipValues.map(value => (
                        <div
                            key={value}
                            className={`chip chip-${value} ${gameState.selectedChip === value ? 'selected' : ''}`}
                            onClick={() => handleChipSelect(value)}
                        >
                            ${value}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer posicionado fuera del contenedor de blackjack */}
            <div className="footer-container">
                <Footer/>
            </div>
        </>
    );
};

export default BlackjackTable;