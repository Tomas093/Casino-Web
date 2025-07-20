import React, { useState, useCallback} from 'react';

// ==================== TIPOS BASE ====================
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
    id: string;
    suit: Suit;
    rank: Rank;
    value: number;
    hidden: boolean;
}

type Hand = Card[];
type PlayerStatus = 'waiting' | 'playing' | 'standing' | 'busted' | 'blackjack' | 'doubled';
type GamePhase = 'setup' | 'dealing' | 'playerTurns' | 'dealerTurn' | 'gameOver';

// ==================== UTILIDADES ====================
const generateId = () => Math.random().toString(36).substr(2, 9);

const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
};

const suitColors = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-gray-800',
    spades: 'text-gray-800'
};

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
                    id: generateId(),
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

    public getRemainingCards(): number {
        return this.cards.length;
    }
}

// ==================== CLASE JUGADOR ====================
class Player {
    public readonly id: string;
    public readonly name: string;
    public hand: Hand;
    public status: PlayerStatus;
    public bet: number;

    constructor(id: string, name: string, initialBet: number = 10) {
        this.id = id;
        this.name = name;
        this.hand = [];
        this.status = 'waiting';
        this.bet = initialBet;
    }

    public addCard(card: Card): void {
        this.hand.push(card);
    }

    public getHandValue(): number {
        let value = 0;
        let aceCount = 0;

        for (const card of this.hand) {
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
    }

    public hasBlackjack(): boolean {
        return this.hand.length === 2 && this.getHandValue() === 21;
    }

    public isBusted(): boolean {
        return this.getHandValue() > 21;
    }

    public canDoubleDown(): boolean {
        return this.hand.length === 2 && this.status === 'playing';
    }

    public reset(): void {
        this.hand = [];
        this.status = 'waiting';
    }
}

// ==================== CLASE DEALER ====================
class Dealer {
    public hand: Hand;

    constructor() {
        this.hand = [];
    }

    public addCard(card: Card): void {
        this.hand.push(card);
    }

    public getHandValue(): number {
        let value = 0;
        let aceCount = 0;

        for (const card of this.hand) {
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
    }

    public revealHiddenCards(): void {
        this.hand.forEach(card => card.hidden = false);
    }

    public shouldHit(): boolean {
        return this.getHandValue() < 17;
    }

    public hasBlackjack(): boolean {
        return this.hand.length === 2 && this.getHandValue() === 21;
    }

    public isBusted(): boolean {
        return this.getHandValue() > 21;
    }

    public reset(): void {
        this.hand = [];
    }
}

// ==================== JUEGO PRINCIPAL ====================
class MultiPlayerBlackjack {
    private deck: Deck;
    private players: Map<string, Player>;
    private dealer: Dealer;
    private currentPlayerIndex: number;
    private playerOrder: string[];
    private phase: GamePhase;

    constructor() {
        this.deck = new Deck();
        this.players = new Map();
        this.dealer = new Dealer();
        this.currentPlayerIndex = 0;
        this.playerOrder = [];
        this.phase = 'setup';
    }

    public addPlayer(name: string, bet: number = 10): string {
        const playerId = generateId();
        const player = new Player(playerId, name, bet);
        this.players.set(playerId, player);
        return playerId;
    }

    public getPlayers(): Player[] {
        return Array.from(this.players.values());
    }

    public startNewGame(): void {
        if (this.players.size === 0) {
            throw new Error('Se necesita al menos un jugador para comenzar');
        }

        this.phase = 'dealing';
        this.currentPlayerIndex = 0;
        this.playerOrder = Array.from(this.players.keys());

        this.players.forEach(player => player.reset());
        this.dealer.reset();

        this.dealInitialCards();
        this.checkNaturalBlackjacks();

        if (this.hasPlayersToPlay()) {
            this.phase = 'playerTurns';
            this.setCurrentPlayerPlaying();
        } else {
            this.startDealerTurn();
        }
    }

    private dealInitialCards(): void {
        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => {
                const card = this.deck.dealCard();
                if (card) player.addCard(card);
            });
        }

        const dealerCard1 = this.deck.dealCard();
        const dealerCard2 = this.deck.dealCard();

        if (dealerCard1) this.dealer.addCard(dealerCard1);
        if (dealerCard2) {
            dealerCard2.hidden = true;
            this.dealer.addCard(dealerCard2);
        }
    }

    private checkNaturalBlackjacks(): void {
        this.players.forEach(player => {
            if (player.hasBlackjack()) {
                player.status = 'blackjack';
            }
        });
    }

    public playerHit(playerId: string): boolean {
        if (this.phase !== 'playerTurns') return false;

        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) return false;

        const card = this.deck.dealCard();
        if (!card) return false;

        currentPlayer.addCard(card);

        if (currentPlayer.isBusted()) {
            currentPlayer.status = 'busted';
            this.nextPlayer();
        } else if (currentPlayer.getHandValue() === 21) {
            currentPlayer.status = 'standing';
            this.nextPlayer();
        }

        return true;
    }

    public playerStand(playerId: string): boolean {
        if (this.phase !== 'playerTurns') return false;

        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) return false;

        currentPlayer.status = 'standing';
        this.nextPlayer();
        return true;
    }

    public playerDouble(playerId: string): boolean {
        if (this.phase !== 'playerTurns') return false;

        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) return false;
        if (!currentPlayer.canDoubleDown()) return false;

        const card = this.deck.dealCard();
        if (!card) return false;

        currentPlayer.addCard(card);
        currentPlayer.bet *= 2;

        if (currentPlayer.isBusted()) {
            currentPlayer.status = 'busted';
        } else {
            currentPlayer.status = 'doubled';
        }

        this.nextPlayer();
        return true;
    }

    private getCurrentPlayer(): Player | null {
        if (this.currentPlayerIndex >= this.playerOrder.length) return null;
        const playerId = this.playerOrder[this.currentPlayerIndex];
        return this.players.get(playerId) || null;
    }

    private setCurrentPlayerPlaying(): void {
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer && currentPlayer.status === 'waiting') {
            currentPlayer.status = 'playing';
        }
    }

    private nextPlayer(): void {
        this.currentPlayerIndex++;

        if (this.hasPlayersToPlay()) {
            this.setCurrentPlayerPlaying();
        } else {
            this.startDealerTurn();
        }
    }

    private hasPlayersToPlay(): boolean {
        for (let i = this.currentPlayerIndex; i < this.playerOrder.length; i++) {
            const player = this.players.get(this.playerOrder[i]);
            if (player && player.status === 'waiting') {
                return true;
            }
        }
        return false;
    }

    private startDealerTurn(): void {
        this.phase = 'dealerTurn';
        this.dealer.revealHiddenCards();

        const hasActivePlayers = Array.from(this.players.values())
            .some(player => !['busted'].includes(player.status));

        if (hasActivePlayers) {
            while (this.dealer.shouldHit()) {
                const card = this.deck.dealCard();
                if (card) this.dealer.addCard(card);
            }
        }

        this.phase = 'gameOver';
    }

    public getGameState() {
        return {
            phase: this.phase,
            players: Array.from(this.players.values()),
            dealer: this.dealer,
            currentPlayer: this.getCurrentPlayer(),
            deckRemaining: this.deck.getRemainingCards()
        };
    }

    public canPlayerAct(playerId: string): boolean {
        if (this.phase !== 'playerTurns') return false;
        const currentPlayer = this.getCurrentPlayer();
        return currentPlayer?.id === playerId && currentPlayer.status === 'playing';
    }

    public getResults() {
        const dealerValue = this.dealer.getHandValue();
        const dealerBusted = this.dealer.isBusted();
        const dealerBlackjack = this.dealer.hasBlackjack();

        return Array.from(this.players.values()).map(player => {
            const playerValue = player.getHandValue();
            let result: string;

            if (player.status === 'busted') {
                result = 'Perdiste';
            } else if (player.status === 'blackjack') {
                if (dealerBlackjack) {
                    result = 'Empate';
                } else {
                    result = '¡Blackjack!';
                }
            } else if (dealerBusted) {
                result = 'Ganaste';
            } else if (playerValue > dealerValue) {
                result = 'Ganaste';
            } else if (playerValue < dealerValue) {
                result = 'Perdiste';
            } else {
                result = 'Empate';
            }

            return {
                playerId: player.id,
                playerName: player.name,
                result,
                playerValue,
                dealerValue
            };
        });
    }
}

// ==================== COMPONENTES REACT ====================
const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
    if (card.hidden) {
        return (
            <div className="w-16 h-24 bg-blue-800 border-2 border-blue-900 rounded-lg flex items-center justify-center shadow-md">
                <div className="w-12 h-20 bg-blue-600 rounded border-2 border-blue-400"></div>
            </div>
        );
    }

    return (
        <div className="w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center shadow-md">
            <div className={`text-sm font-bold ${suitColors[card.suit]}`}>
                {card.rank}
            </div>
            <div className={`text-lg ${suitColors[card.suit]}`}>
                {suitSymbols[card.suit]}
            </div>
        </div>
    );
};

const HandComponent: React.FC<{ hand: Hand; value: number; label: string; isDealer?: boolean }> = ({
                                                                                                       hand, value, label, isDealer = false
                                                                                                   }) => {
    return (
        <div className="mb-4">
            <h3 className="font-bold text-lg mb-2">{label}</h3>
            <div className="flex gap-2 mb-2">
                {hand.map((card) => (
                    <CardComponent key={card.id} card={card} />
                ))}
            </div>
            <p className="text-sm font-medium">
                Valor: {isDealer && hand.some(c => c.hidden) ? '?' : value}
                {value === 21 && hand.length === 2 && ' (¡Blackjack!)'}
                {value > 21 && ' (¡Te pasaste!)'}
            </p>
        </div>
    );
};

const PlayerComponent: React.FC<{
    player: Player;
    isCurrentPlayer: boolean;
    canAct: boolean;
    onHit: () => void;
    onStand: () => void;
    onDouble: () => void;
}> = ({ player, isCurrentPlayer, canAct, onHit, onStand, onDouble }) => {
    const getStatusText = (status: PlayerStatus) => {
        switch (status) {
            case 'waiting': return 'Esperando';
            case 'playing': return '¡Es tu turno!';
            case 'standing': return 'Se plantó';
            case 'busted': return '¡Se pasó!';
            case 'blackjack': return '¡Blackjack!';
            case 'doubled': return 'Dobló apuesta';
            default: return '';
        }
    };

    const getStatusColor = (status: PlayerStatus) => {
        switch (status) {
            case 'playing': return 'text-green-600';
            case 'busted': return 'text-red-600';
            case 'blackjack': return 'text-purple-600';
            case 'doubled': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className={`p-4 border-2 rounded-lg ${isCurrentPlayer ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{player.name}</h3>
                <span className="text-sm text-gray-500">Apuesta: ${player.bet}</span>
            </div>

            <HandComponent
                hand={player.hand}
                value={player.getHandValue()}
                label=""
            />

            <p className={`text-sm font-medium mb-3 ${getStatusColor(player.status)}`}>
                {getStatusText(player.status)}
            </p>

            {canAct && (
                <div className="flex gap-2">
                    <button
                        onClick={onHit}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Pedir carta
                    </button>
                    <button
                        onClick={onStand}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Plantarse
                    </button>
                    {player.canDoubleDown() && (
                        <button
                            onClick={onDouble}
                            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                        >
                            Doblar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ==================== COMPONENTE PRINCIPAL ====================
const BlackjackGame: React.FC = () => {
    const [game] = useState(() => new MultiPlayerBlackjack());
    const [gameState, setGameState] = useState(game.getGameState());
    const [playerName, setPlayerName] = useState('');

    const updateGameState = useCallback(() => {
        setGameState(game.getGameState());
    }, [game]);

    const addPlayer = () => {
        if (playerName.trim() && gameState.phase === 'setup') {
            game.addPlayer(playerName.trim());
            setPlayerName('');
            updateGameState();
        }
    };

    const startGame = () => {
        if (gameState.players.length > 0) {
            game.startNewGame();
            updateGameState();
        }
    };

    const playerHit = (playerId: string) => {
        game.playerHit(playerId);
        updateGameState();
    };

    const playerStand = (playerId: string) => {
        game.playerStand(playerId);
        updateGameState();
    };

    const playerDouble = (playerId: string) => {
        game.playerDouble(playerId);
        updateGameState();
    };

    const resetGame = () => {
        window.location.reload();
    };

    const getPhaseText = () => {
        switch (gameState.phase) {
            case 'setup': return 'Configurando partida';
            case 'dealing': return 'Repartiendo cartas...';
            case 'playerTurns': return 'Turnos de jugadores';
            case 'dealerTurn': return 'Turno del dealer';
            case 'gameOver': return '¡Partida terminada!';
        }
    };

    return (
        <div className="min-h-screen bg-green-800 p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-white text-center mb-8">
                    🃏 Blackjack Multijugador
                </h1>

                <div className="text-center mb-6">
          <span className="inline-block bg-white px-4 py-2 rounded-lg font-semibold">
            {getPhaseText()}
          </span>
                </div>

                {/* Configuración inicial */}
                {gameState.phase === 'setup' && (
                    <div className="bg-white p-6 rounded-lg mb-6">
                        <h2 className="text-2xl font-bold mb-4">Añadir Jugadores</h2>
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Nombre del jugador"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                            />
                            <button
                                onClick={addPlayer}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Añadir
                            </button>
                        </div>

                        {gameState.players.length > 0 && (
                            <>
                                <div className="mb-4">
                                    <h3 className="font-bold mb-2">Jugadores:</h3>
                                    <ul className="list-disc list-inside">
                                        {gameState.players.map((player) => (
                                            <li key={player.id}>{player.name}</li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={startGame}
                                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-lg"
                                >
                                    ¡Comenzar Partida!
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Área del Dealer */}
                {gameState.phase !== 'setup' && (
                    <div className="bg-white p-6 rounded-lg mb-6">
                        <HandComponent
                            hand={gameState.dealer.hand}
                            value={gameState.dealer.getHandValue()}
                            label="🎩 Dealer"
                            isDealer={true}
                        />
                    </div>
                )}

                {/* Área de Jugadores */}
                {gameState.phase !== 'setup' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {gameState.players.map((player) => (
                            <PlayerComponent
                                key={player.id}
                                player={player}
                                isCurrentPlayer={gameState.currentPlayer?.id === player.id}
                                canAct={game.canPlayerAct(player.id)}
                                onHit={() => playerHit(player.id)}
                                onStand={() => playerStand(player.id)}
                                onDouble={() => playerDouble(player.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Resultados finales */}
                {gameState.phase === 'gameOver' && (
                    <div className="bg-white p-6 rounded-lg mb-6">
                        <h2 className="text-2xl font-bold mb-4 text-center">🏆 Resultados</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {game.getResults().map((result) => (
                                <div key={result.playerId} className="p-4 border rounded-lg text-center">
                                    <h3 className="font-bold text-lg">{result.playerName}</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Jugador: {result.playerValue} | Dealer: {result.dealerValue}
                                    </p>
                                    <p className={`font-bold text-lg ${
                                        result.result.includes('Ganaste') || result.result.includes('Blackjack')
                                            ? 'text-green-600'
                                            : result.result.includes('Empate')
                                                ? 'text-yellow-600'
                                                : 'text-red-600'
                                    }`}>
                                        {result.result}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botones de control */}
                <div className="text-center">
                    {gameState.phase === 'gameOver' && (
                        <button
                            onClick={resetGame}
                            className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold text-lg"
                        >
                            Nueva Partida
                        </button>
                    )}

                    <div className="mt-4 text-white text-sm">
                        Cartas restantes en mazo: {gameState.deckRemaining}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlackjackGame;