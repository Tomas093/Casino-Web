import {v4 as uuidv4} from 'uuid';

// ==================== TIPOS BASE ====================
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
    id: string;
    suit: Suit;
    rank: Rank;
    value: number;
    hidden: boolean;
}

export type Hand = Card[];

export type PlayerStatus = 'waiting' | 'playing' | 'standing' | 'busted' | 'blackjack' | 'doubled';
export type GamePhase = 'setup' | 'dealing' | 'playerTurns' | 'dealerTurn' | 'gameOver';

// ==================== CLASE MAZO ====================
export class Deck {
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
            this.initialize(); // Reinicializa si se agota
        }
        return this.cards.pop() || null;
    }

    public getRemainingCards(): number {
        return this.cards.length;
    }
}

// ==================== CLASE JUGADOR ====================
export class Player {
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

        // Ajustar ases de 11 a 1 para evitar pasarse
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
export class Dealer {
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

// ==================== SISTEMA DE ACCIONES ====================
export interface GameAction {
    type: 'hit' | 'stand' | 'double' | 'newGame' | 'addPlayer';
    playerId?: string;
    playerName?: string;
}

export interface GameResult {
    playerId: string;
    playerName: string;
    result: 'win' | 'lose' | 'push' | 'blackjack';
    playerValue: number;
    dealerValue: number;
}

// ==================== JUEGO PRINCIPAL ====================
export class MultiPlayerBlackjack {
    private deck: Deck;
    private players: Map<string, Player>;
    private dealer: Dealer;
    private currentPlayerIndex: number;
    private playerOrder: string[];
    private phase: GamePhase;
    private results: GameResult[];

    constructor() {
        this.deck = new Deck();
        this.players = new Map();
        this.dealer = new Dealer();
        this.currentPlayerIndex = 0;
        this.playerOrder = [];
        this.phase = 'setup';
        this.results = [];
    }

    // ==================== GESTIÓN DE JUGADORES ====================
    public addPlayer(name: string, bet: number = 10): string {
        const playerId = uuidv4();
        const player = new Player(playerId, name, bet);
        this.players.set(playerId, player);
        return playerId;
    }

    public removePlayer(playerId: string): boolean {
        if (this.phase === 'playerTurns' && this.getCurrentPlayer()?.id === playerId) {
            return false; // No se puede eliminar al jugador actual durante su turno
        }
        return this.players.delete(playerId);
    }

    public getPlayers(): Player[] {
        return Array.from(this.players.values());
    }

    // ==================== LÓGICA DEL JUEGO ====================
    public startNewGame(): void {
        if (this.players.size === 0) {
            throw new Error('Se necesita al menos un jugador para comenzar');
        }

        this.phase = 'dealing';
        this.results = [];
        this.currentPlayerIndex = 0;
        this.playerOrder = Array.from(this.players.keys());

        // Reiniciar jugadores y dealer
        this.players.forEach(player => player.reset());
        this.dealer.reset();

        // Repartir cartas iniciales
        this.dealInitialCards();

        // Verificar blackjacks naturales
        this.checkNaturalBlackjacks();

        // Comenzar turnos de jugadores
        if (this.hasPlayersToPlay()) {
            this.phase = 'playerTurns';
            this.setCurrentPlayerPlaying();
        } else {
            this.startDealerTurn();
        }
    }

    private dealInitialCards(): void {
        // Dos cartas para cada jugador
        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => {
                const card = this.deck.dealCard();
                if (card) player.addCard(card);
            });
        }

        // Dos cartas para el dealer (segunda oculta)
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

    // ==================== ACCIONES DE JUGADOR ====================
    public executeAction(action: GameAction): boolean {
        switch (action.type) {
            case 'hit':
                return this.playerHit(action.playerId!);
            case 'stand':
                return this.playerStand(action.playerId!);
            case 'double':
                return this.playerDouble(action.playerId!);
            case 'newGame':
                this.startNewGame();
                return true;
            case 'addPlayer':
                if (action.playerName) {
                    this.addPlayer(action.playerName);
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    private playerHit(playerId: string): boolean {
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

    private playerStand(playerId: string): boolean {
        if (this.phase !== 'playerTurns') return false;

        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) return false;

        currentPlayer.status = 'standing';
        this.nextPlayer();
        return true;
    }

    private playerDouble(playerId: string): boolean {
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

    // ==================== CONTROL DE TURNOS ====================
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

    // ==================== TURNO DEL DEALER ====================
    private startDealerTurn(): void {
        this.phase = 'dealerTurn';
        this.dealer.revealHiddenCards();

        // El dealer solo juega si hay jugadores que no se pasaron
        const hasActivePlayers = Array.from(this.players.values())
            .some(player => !['busted'].includes(player.status));

        if (hasActivePlayers) {
            while (this.dealer.shouldHit()) {
                const card = this.deck.dealCard();
                if (card) this.dealer.addCard(card);
            }
        }

        this.calculateResults();
        this.phase = 'gameOver';
    }

    // ==================== CÁLCULO DE RESULTADOS ====================
    private calculateResults(): void {
        this.results = [];
        const dealerValue = this.dealer.getHandValue();
        const dealerBusted = this.dealer.isBusted();
        const dealerBlackjack = this.dealer.hasBlackjack();

        this.players.forEach(player => {
            const playerValue = player.getHandValue();
            let result: 'win' | 'lose' | 'push' | 'blackjack';

            if (player.status === 'busted') {
                result = 'lose';
            } else if (player.status === 'blackjack') {
                if (dealerBlackjack) {
                    result = 'push';
                } else {
                    result = 'blackjack';
                }
            } else if (dealerBusted) {
                result = 'win';
            } else if (playerValue > dealerValue) {
                result = 'win';
            } else if (playerValue < dealerValue) {
                result = 'lose';
            } else {
                result = 'push';
            }

            this.results.push({
                playerId: player.id,
                playerName: player.name,
                result,
                playerValue,
                dealerValue
            });
        });
    }

    // ==================== GETTERS ====================
    public getGameState() {
        return {
            phase: this.phase,
            players: Array.from(this.players.values()),
            dealer: this.dealer,
            currentPlayer: this.getCurrentPlayer(),
            results: this.results,
            deckRemaining: this.deck.getRemainingCards()
        };
    }

    public getResults(): GameResult[] {
        return this.results;
    }

    public canPlayerAct(playerId: string): boolean {
        if (this.phase !== 'playerTurns') return false;
        const currentPlayer = this.getCurrentPlayer();
        return currentPlayer?.id === playerId && currentPlayer.status === 'playing';
    }

    public getAvailableActions(playerId: string): string[] {
        if (!this.canPlayerAct(playerId)) return [];

        const actions = ['hit', 'stand'];
        const player = this.players.get(playerId);

        if (player?.canDoubleDown()) {
            actions.push('double');
        }

        return actions;
    }
}

export default MultiPlayerBlackjack;