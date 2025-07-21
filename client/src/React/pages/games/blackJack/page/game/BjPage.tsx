import React, { useState} from 'react';
import { v4 as uuidv4 } from 'uuid';
import './BlackJackTableStyle.css'

// Importar las imágenes de fichas (en un proyecto real estas serían importadas desde assets)
const chipImages = {
    '1': '/api/placeholder/50/50',
    '10': '/api/placeholder/50/50',
    '50': '/api/placeholder/50/50',
    '100': '/api/placeholder/50/50',
    '500': '/api/placeholder/50/50',
    '1000': '/api/placeholder/50/50'
};

// ==================== TIPOS Y CLASES DEL BLACKJACK ====================
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
    id: string;
    suit: Suit;
    rank: Rank;
    value: number;
    hidden: boolean;
}

interface Player {
    id: string;
    name: string;
    hand: Card[];
    status: 'waiting' | 'playing' | 'standing' | 'busted' | 'blackjack' | 'doubled';
    bet: number;
}

interface GameResult {
    playerId: string;
    playerName: string;
    result: 'win' | 'lose' | 'push' | 'blackjack';
    playerValue: number;
    dealerValue: number;
    winnings: number;
}

// ==================== CLASE MAZO ====================
class Deck {
    private cards: Card[];

    constructor() {
        this.cards = [];
        this.initialize();
    }

    private initialize(): void {
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        for (const suit of suits) {
            for (const rank of ranks) {
                let value: number;
                if (rank === 'A') {
                    value = 11;
                } else if (['J', 'Q', 'K'].includes(rank)) {
                    value = 10;
                } else {
                    value = parseInt(rank);
                }

                this.cards.push({
                    id: uuidv4(),
                    suit,
                    rank,
                    value,
                    hidden: false
                });
            }
        }
        this.shuffle();
    }

    private shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public dealCard(): Card | null {
        if (this.cards.length === 0) {
            this.initialize();
        }
        return this.cards.pop() || null;
    }
}

// ==================== COMPONENTE PRINCIPAL ====================
const EnhancedBlackjack: React.FC = () => {
    // Estados del juego
    const [deck] = useState(() => new Deck());
    const [player, setPlayer] = useState<Player>({
        id: uuidv4(),
        name: 'Jugador 1',
        hand: [],
        status: 'waiting',
        bet: 0
    });
    const [dealer, setDealer] = useState<Card[]>([]);
    const [gamePhase, setGamePhase] = useState<'betting' | 'dealing' | 'playing' | 'finished'>('betting');
    const [selectedChip, setSelectedChip] = useState('25');
    const [balance, setBalance] = useState(1000);
    const [result, setResult] = useState<GameResult | null>(null);
    const [showNotification, setShowNotification] = useState(false);

    const chipValues = ['1', '10', '25', '50', '100', '500'];

    // ==================== FUNCIONES DE UTILIDAD ====================
    const calculateHandValue = (hand: Card[]): number => {
        let value = 0;
        let aceCount = 0;

        for (const card of hand) {
            if (!card.hidden) {
                value += card.value;
                if (card.rank === 'A') {
                    aceCount++;
                }
            }
        }

        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }

        return value;
    };

    const getSuitSymbol = (suit: Suit): string => {
        const symbols = {
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣',
            spades: '♠'
        };
        return symbols[suit];
    };

    const getCardColor = (suit: Suit): string => {
        return ['hearts', 'diamonds'].includes(suit) ? '#dc3545' : '#000';
    };

    // ==================== FUNCIONES DE APUESTA ====================
    const handleBet = () => {
        const chipValue = parseInt(selectedChip);
        if (balance >= chipValue && gamePhase === 'betting') {
            setPlayer(prev => ({
                ...prev,
                bet: prev.bet + chipValue
            }));
            setBalance(prev => prev - chipValue);
        }
    };

    const clearBet = () => {
        if (gamePhase === 'betting') {
            setBalance(prev => prev + player.bet);
            setPlayer(prev => ({
                ...prev,
                bet: 0
            }));
        }
    };

    // ==================== FUNCIONES DEL JUEGO ====================
    const startGame = () => {
        if (player.bet === 0) return;

        setGamePhase('dealing');
        setResult(null);

        // Reiniciar manos
        const newPlayerHand: Card[] = [];
        const newDealerHand: Card[] = [];

        // Repartir cartas iniciales
        for (let i = 0; i < 2; i++) {
            const playerCard = deck.dealCard();
            const dealerCard = deck.dealCard();

            if (playerCard) newPlayerHand.push(playerCard);
            if (dealerCard) {
                if (i === 1) dealerCard.hidden = true; // Segunda carta del dealer oculta
                newDealerHand.push(dealerCard);
            }
        }

        setPlayer(prev => ({
            ...prev,
            hand: newPlayerHand,
            status: 'playing'
        }));
        setDealer(newDealerHand);

        // Verificar blackjack natural
        const playerValue = calculateHandValue(newPlayerHand);
        if (playerValue === 21) {
            setPlayer(prev => ({ ...prev, status: 'blackjack' }));
            setTimeout(() => finishGame('blackjack'), 1000);
        } else {
            setGamePhase('playing');
        }
    };

    const hit = () => {
        if (gamePhase !== 'playing' || player.status !== 'playing') return;

        const newCard = deck.dealCard();
        if (!newCard) return;

        const newHand = [...player.hand, newCard];
        const newValue = calculateHandValue(newHand);

        setPlayer(prev => ({
            ...prev,
            hand: newHand,
            status: newValue > 21 ? 'busted' : newValue === 21 ? 'standing' : 'playing'
        }));

        if (newValue > 21) {
            setTimeout(() => finishGame('busted'), 1000);
        } else if (newValue === 21) {
            setTimeout(() => stand(), 500);
        }
    };

    const stand = () => {
        if (gamePhase !== 'playing') return;

        setPlayer(prev => ({ ...prev, status: 'standing' }));
        setGamePhase('finished');

        // Revelar carta oculta del dealer
        const revealedDealer = dealer.map(card => ({ ...card, hidden: false }));
        setDealer(revealedDealer);

        // Dealer juega
        let dealerHand = [...revealedDealer];
        let dealerValue = calculateHandValue(dealerHand);

        const dealerPlay = () => {
            if (dealerValue < 17) {
                const newCard = deck.dealCard();
                if (newCard) {
                    dealerHand = [...dealerHand, newCard];
                    setDealer([...dealerHand]);
                    dealerValue = calculateHandValue(dealerHand);
                    setTimeout(dealerPlay, 1000);
                }
            } else {
                setTimeout(() => finishGame('compare'), 1000);
            }
        };

        setTimeout(dealerPlay, 1000);
    };

    const double = () => {
        if (gamePhase !== 'playing' || player.hand.length !== 2 || balance < player.bet) return;

        // Doblar apuesta
        setBalance(prev => prev - player.bet);
        setPlayer(prev => ({ ...prev, bet: prev.bet * 2, status: 'doubled' }));

        // Tomar una carta más
        const newCard = deck.dealCard();
        if (!newCard) return;

        const newHand = [...player.hand, newCard];
        const newValue = calculateHandValue(newHand);

        setPlayer(prev => ({
            ...prev,
            hand: newHand
        }));

        setTimeout(() => {
            if (newValue > 21) {
                finishGame('busted');
            } else {
                stand();
            }
        }, 1000);
    };

    const finishGame = (outcome: string) => {
        const playerValue = calculateHandValue(player.hand);
        const dealerValue = calculateHandValue(dealer.map(card => ({ ...card, hidden: false })));

        let gameResult: 'win' | 'lose' | 'push' | 'blackjack';
        let winnings = 0;

        if (outcome === 'busted') {
            gameResult = 'lose';
            winnings = 0;
        } else if (outcome === 'blackjack') {
            const dealerBlackjack = dealer.length === 2 && dealerValue === 21;
            if (dealerBlackjack) {
                gameResult = 'push';
                winnings = player.bet;
            } else {
                gameResult = 'blackjack';
                winnings = player.bet + Math.floor(player.bet * 1.5); // Blackjack paga 3:2
            }
        } else if (outcome === 'compare') {
            if (dealerValue > 21) {
                gameResult = 'win';
                winnings = player.bet * 2;
            } else if (playerValue > dealerValue) {
                gameResult = 'win';
                winnings = player.bet * 2;
            } else if (playerValue < dealerValue) {
                gameResult = 'lose';
                winnings = 0;
            } else {
                gameResult = 'push';
                winnings = player.bet;
            }
        } else {
            gameResult = 'lose';
            winnings = 0;
        }

        setBalance(prev => prev + winnings);

        setResult({
            playerId: player.id,
            playerName: player.name,
            result: gameResult,
            playerValue,
            dealerValue,
            winnings
        });

        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
            newRound();
        }, 3000);
    };

    const newRound = () => {
        setPlayer(prev => ({
            ...prev,
            hand: [],
            status: 'waiting',
            bet: 0
        }));
        setDealer([]);
        setGamePhase('betting');
        setResult(null);
    };

    // ==================== COMPONENTE RESULTADO ====================
    const ResultNotification = () => {
        if (!showNotification || !result) return null;

        const isWin = result.result === 'win' || result.result === 'blackjack';
        const isPush = result.result === 'push';

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`p-6 rounded-lg text-center ${isWin ? 'bg-green-600' : isPush ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>
                    <div className="text-4xl mb-4">
                        {isWin ? '🏆' : isPush ? '🤝' : '😞'}
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                        {result.result === 'blackjack' ? '¡BLACKJACK!' :
                            result.result === 'win' ? '¡GANASTE!' :
                                result.result === 'push' ? 'EMPATE' : 'PERDISTE'}
                    </h3>
                    <p className="mb-2">
                        Jugador: {result.playerValue} | Dealer: {result.dealerValue}
                    </p>
                    <p className="text-lg">
                        {result.result === 'blackjack' ? `Ganaste $${result.winnings}` :
                            result.result === 'win' ? `Ganaste $${result.winnings}` :
                                result.result === 'push' ? `Recuperaste $${result.winnings}` :
                                    `Perdiste $${player.bet}`}
                    </p>
                </div>
            </div>
        );
    };

    // ==================== RENDER ====================
    return (
        <div className="min-h-screen bg-green-800 p-4">
            {/* Header con balance */}
            <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-white mb-4">BLACKJACK</h1>
                <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg inline-block font-bold text-xl">
                    Balance: ${balance}
                </div>
            </div>

            {/* Área del Dealer */}
            <div className="bg-green-700 rounded-lg p-6 mb-6">
                <h2 className="text-white text-xl mb-4 text-center">Dealer</h2>
                <div className="flex justify-center gap-2 mb-4">
                    {dealer.map((card, index) => (
                        <div
                            key={card.id}
                            className={`w-16 h-24 rounded border-2 border-white flex items-center justify-center text-sm font-bold ${
                                card.hidden ? 'bg-blue-900 text-white' : 'bg-white'
                            }`}
                            style={card.hidden ? {} : { color: getCardColor(card.suit) }}
                        >
                            {card.hidden ? '?' : `${card.rank}${getSuitSymbol(card.suit)}`}
                        </div>
                    ))}
                </div>
                <div className="text-white text-center">
                    Total: {gamePhase === 'betting' || gamePhase === 'dealing' ?
                    (dealer.length > 0 ? calculateHandValue([dealer[0]]) + '+' : 0) :
                    calculateHandValue(dealer)
                }
                </div>
            </div>

            {/* Área del Jugador */}
            <div className="bg-blue-700 rounded-lg p-6 mb-6">
                <h2 className="text-white text-xl mb-4 text-center">{player.name}</h2>
                <div className="flex justify-center gap-2 mb-4">
                    {player.hand.map((card) => (
                        <div
                            key={card.id}
                            className="w-16 h-24 bg-white rounded border-2 border-gray-800 flex items-center justify-center text-sm font-bold"
                            style={{ color: getCardColor(card.suit) }}
                        >
                            {card.rank}{getSuitSymbol(card.suit)}
                        </div>
                    ))}
                </div>
                <div className="text-white text-center mb-2">
                    Total: {calculateHandValue(player.hand)}
                    {calculateHandValue(player.hand) === 21 && player.hand.length === 2 && (
                        <span className="text-yellow-300 ml-2">♠ BLACKJACK!</span>
                    )}
                    {calculateHandValue(player.hand) > 21 && (
                        <span className="text-red-300 ml-2">BUST!</span>
                    )}
                </div>
                <div className="text-white text-center">
                    Apuesta: ${player.bet}
                </div>
            </div>

            {/* Área de apuestas */}
            {gamePhase === 'betting' && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h3 className="text-white text-lg mb-4 text-center">Selecciona tu apuesta</h3>

                    {/* Fichas */}
                    <div className="flex justify-center gap-4 mb-6">
                        {chipValues.map((value) => (
                            <button
                                key={value}
                                onClick={() => setSelectedChip(value)}
                                className={`w-16 h-16 rounded-full border-4 font-bold text-sm ${
                                    selectedChip === value
                                        ? 'bg-yellow-400 border-yellow-200 text-black'
                                        : 'bg-red-600 border-red-400 text-white'
                                } hover:scale-110 transition-transform`}
                            >
                                ${value}
                            </button>
                        ))}
                    </div>

                    {/* Botones de apuesta */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleBet}
                            disabled={balance < parseInt(selectedChip)}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            Apostar ${selectedChip}
                        </button>
                        <button
                            onClick={clearBet}
                            disabled={player.bet === 0}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            Limpiar Apuesta
                        </button>
                        <button
                            onClick={startGame}
                            disabled={player.bet === 0}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            Repartir Cartas
                        </button>
                    </div>
                </div>
            )}

            {/* Botones de juego */}
            {gamePhase === 'playing' && player.status === 'playing' && (
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={hit}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg"
                    >
                        Pedir
                    </button>
                    <button
                        onClick={stand}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg"
                    >
                        Plantarse
                    </button>
                    <button
                        onClick={double}
                        disabled={player.hand.length !== 2 || balance < player.bet}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-500 text-white px-8 py-4 rounded-lg font-bold text-lg"
                    >
                        Doblar
                    </button>
                </div>
            )}

            {/* Botón nueva ronda */}
            {gamePhase === 'finished' && !showNotification && (
                <div className="flex justify-center">
                    <button
                        onClick={newRound}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg"
                    >
                        Nueva Ronda
                    </button>
                </div>
            )}

            {/* Notificación de resultado */}
            <ResultNotification />
        </div>
    );
};

export default EnhancedBlackjack;