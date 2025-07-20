import React, {useEffect, useState} from 'react';
import {ChipList, RouletteTable, RouletteWheel, useRoulette} from 'react-casino-roulette';
import 'react-casino-roulette/dist/index.css';
import '@css/NavBarStyle.css';
import "@css/NewStyle.css"
import oneChip from '@assets/ficha1.png';
import tenChip from '@assets/ficha10.png';
import fiftyChip from '@assets/ficha50.png';
import oneHundredChip from '@assets/ficha100.png';
import fiveHundredChip from '@assets/ficha500.png';
import oneThousandChip from '@assets/ficha1000.png';
import {useAuth} from "@context/AuthContext.tsx";
import {usePlay} from '@context/PlayContext.tsx';
import {useUser} from '@context/UserContext';
import NavBar from "@components/NavBar.tsx";

const RED_NUMBERS = ['1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36'];
const BLACK_NUMBERS = ['2', '4', '6', '8', '10', '11', '13', '15', '17', '20', '22', '24', '26', '28', '29', '31', '33', '35'];

const chips = {
    '1': oneChip,
    '10': tenChip,
    '50': fiftyChip,
    '100': oneHundredChip,
    '500': fiveHundredChip,
    '1000': oneThousandChip,
};

const ROULETTE_GAME_ID = 2;

interface BetResult {
    betId: string;
    amount: number;
    win: number;
    isWin: boolean;
}

interface ResultNotificationProps {
    show: boolean;
    winner: string;
    winnings: number;
    isWin: boolean;
    onClose: () => void;
}

const ResultNotification: React.FC<ResultNotificationProps> = ({show, winner, winnings, isWin, onClose}) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="result-notification-backdrop">
            <div className={`result-notification ${isWin ? 'win' : 'lose'}`}>
                <div className="notification-icon">
                    {isWin ? '🏆' : '🎲'}
                </div>
                <div className="notification-content">
                    <h3 className="notification-title">{isWin ? '¡FELICIDADES!' : 'INTENTA DE NUEVO'}</h3>
                    <p className="notification-message">
                        La bola cayó en <span className="highlight-number">{winner}</span>
                    </p>
                    <p className="notification-result">
                        {isWin
                            ? `Has ganado $${winnings}`
                            : 'No has ganado en esta ronda'}
                    </p>
                </div>
                <button className="notification-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

interface InsufficientBalanceNotificationProps {
    show: boolean;
    onClose: () => void;
}

const InsufficientBalanceNotification: React.FC<InsufficientBalanceNotificationProps> = ({show, onClose}) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="result-notification-backdrop">
            <div className="result-notification insufficient-balance">
                <div className="notification-icon">
                    💰
                </div>
                <div className="notification-content">
                    <h3 className="notification-title">SALDO INSUFICIENTE</h3>
                    <p className="notification-message">
                        No tienes suficiente saldo para realizar esta apuesta.
                    </p>
                    <p className="notification-result">
                        Por favor, realiza un depósito para continuar jugando.
                    </p>
                </div>
                <button className="notification-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

const RouletteGame: React.FC = () => {
    const [selectedChip, setSelectedChip] = useState('1');
    const [winningBet, setWinningBet] = useState<'-1' | AvailableNumbers>('-1');
    const [wheelStart, setWheelStart] = useState(false);
    const [lastResults, setLastResults] = useState<string[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
    const [notificationData, setNotificationData] = useState({winner: '', winnings: 0, isWin: false});
    const {user} = useAuth();
    const {createPlay, isLoading} = usePlay();
    const {client, getUserData} = useUser();
    const {bets, onBet, clearBets, total: totalBet, hasBets} = useRoulette();
    const [betHistory, setBetHistory] = useState<{ betId: string; amount: number }[]>([]);

    useEffect(() => {
        setCurrentBetAmount(totalBet);
    }, [totalBet]);

    const getNumberColor = (number: string): 'red' | 'black' | 'green' => {
        if (number === '0' || number === '00') return 'green';
        if (RED_NUMBERS.includes(number)) return 'red';
        return 'black';
    };

    const generateRandomNumber = () => {
        const isInfluencer = client && client.influencer === true;
        let randomNumber;

        if (isInfluencer) {
            const bettedNumbers = Object.keys(bets).filter(betId => !isNaN(Number(betId)));

            if (bettedNumbers.length > 0 && Math.random() < 0.5) {
                const randomIndex = Math.floor(Math.random() * bettedNumbers.length);
                randomNumber = bettedNumbers[randomIndex];
            } else {
                randomNumber = String(Math.floor(Math.random() * 36) + 1);
            }
        } else {
            randomNumber = String(Math.floor(Math.random() * 37));
        }

        return randomNumber;
    };

    const handleSpin = async () => {
        if (!hasBets) {
            setNotificationData({winner: 'No hay apuestas', winnings: 0, isWin: false});
            setShowNotification(true);
            return;
        }

        if (!client) {
            setShowInsufficientBalance(true);
            return;
        }

        if (totalBet > client.balance) {
            setShowInsufficientBalance(true);
            return;
        }

        const randomNumber = generateRandomNumber();
        setWinningBet(randomNumber as '-1' | AvailableNumbers);
        setWheelStart(true);
    };

    const calculateWinnings = (winner: string) => {
        const results: BetResult[] = [];
        let totalWinnings = 0;

        Object.entries(bets).forEach(([betId, bet]) => {
            let isWin = false;
            let winAmount = 0;

            if (betId === 'RED') {
                isWin = RED_NUMBERS.includes(winner);
            } else if (betId === 'BLACK') {
                isWin = BLACK_NUMBERS.includes(winner);
            } else if (betId === winner) {
                isWin = true;
            } else if (bet.payload && bet.payload.includes(winner)) {
                isWin = true;
            }

            if (isWin) {
                winAmount = bet.amount * bet.payoutScale;
                totalWinnings += winAmount;
            }

            results.push({
                betId,
                amount: bet.amount,
                win: winAmount,
                isWin
            });
        });

        return totalWinnings;
    };

    const registerPlay = async (betAmount: number, winAmount: number) => {
        if (!user || !user.usuarioid) {
            console.error('No hay usuario autenticado para registrar la jugada');
            return;
        }

        try {
            const playData = {
                usuarioid: user.usuarioid,
                juegoid: ROULETTE_GAME_ID,
                fecha: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                retorno: winAmount,
                apuesta: betAmount
            };

            console.log('Registrando jugada:', playData);
            await createPlay(playData);
            console.log('Jugada registrada con éxito');

            if (user.usuarioid) {
                await getUserData(user.usuarioid.toString());
            }
        } catch (error) {
            console.error('Error al registrar la jugada:', error);
            setNotificationData({
                winner: 'Error',
                winnings: 0,
                isWin: false
            });
            setShowNotification(true);
        }
    };

    const handleBet = (betId: string) => {
        const chipValue = Number(selectedChip);
        const currentBetTotal = totalBet;
        const newTotal = currentBetTotal + chipValue;

        if (client && newTotal > client.balance) {
            setShowInsufficientBalance(true);
            return;
        }

        onBet({betId, amount: chipValue});
        setBetHistory((prev) => [...prev, {betId, amount: chipValue}]);
    };

    const handleUndoLastBet = () => {
        if (betHistory.length === 0) return;

        const lastBet = betHistory[betHistory.length - 1];
        onBet({betId: lastBet.betId, amount: -lastBet.amount});
        setBetHistory((prev) => prev.slice(0, -1));
    };

    const handleEndSpin = async (winner: string) => {
        setLastResults(prev => {
            const updated = [winner, ...prev];
            return updated.slice(0, 10);
        });

        const winnings = calculateWinnings(winner);
        const isWin = winnings > 0;

        await registerPlay(totalBet, winnings);

        setNotificationData({
            winner: winner,
            winnings: winnings,
            isWin: isWin
        });
        setShowNotification(true);

        setWheelStart(false);
        clearBets();
        setBetHistory([]);
    };

    const ResultHistory = () => (
        <div style={{display: 'flex', gap: '8px', marginBottom: '1rem'}}>
            {lastResults.map((num, idx) => {
                const color = getNumberColor(num);
                return (
                    <div key={idx} style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: color === 'green' ? 'white' : 'white',
                        fontWeight: 'bold'
                    }}>
                        {num}
                    </div>
                );
            })}
        </div>
    );

    const QuickColorBets = () => (
        <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
        </div>
    );

    const landingNavLinks = [
        {label: "Home", href: "/home", isAnchor: true},
        {label: "Depositar", href: "/Transaccion", isAnchor: true}
    ];

    return (
        <>
            <div className="roulette-background">
                <NavBar
                    navLinks={landingNavLinks}
                    className="landing-navbar"
                    variant="light"
                    showBalance={true}
                    playButtonLabel="Jugar"
                    loginButtonLabel="Iniciar Sesión"
                    registerButtonLabel="Registrarse"
                />

                <ResultNotification
                    show={showNotification}
                    winner={notificationData.winner}
                    winnings={notificationData.winnings}
                    isWin={notificationData.isWin}
                    onClose={() => setShowNotification(false)}
                />

                <InsufficientBalanceNotification
                    show={showInsufficientBalance}
                    onClose={() => setShowInsufficientBalance(false)}
                />

                <div
                    style={{display: 'flex', flexDirection: 'column', gap: '2rem', padding: '20px', marginTop: '80px'}}>
                    <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                        <div style={{
                            background: 'rgba(0,0,0,0.7)',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            Apuesta total: ${totalBet}
                        </div>
                    </div>

                    {lastResults.length > 0 && (
                        <div>
                            <h3>Últimos resultados</h3>
                            <ResultHistory/>
                        </div>
                    )}

                    <QuickColorBets/>

                    <div style={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2rem'}}>
                        <RouletteWheel
                            start={wheelStart}
                            winningBet={winningBet}
                            onSpinningEnd={handleEndSpin}
                        />
                    </div>

                    <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem'}}>
                        <button
                            onClick={handleSpin}
                            disabled={wheelStart || !hasBets || isLoading}
                            className="roulette-button spin-button"
                        >
                            {isLoading ? 'Procesando...' : 'Girar Ruleta'}
                        </button>
                        <button
                            onClick={clearBets}
                            disabled={wheelStart || !hasBets || isLoading}
                            className="roulette-button clear-button"
                        >
                            Limpiar Apuestas
                        </button>
                        <button
                            onClick={handleUndoLastBet}
                            disabled={wheelStart || betHistory.length === 0 || isLoading}
                            className="roulette-button undo-button"
                        >
                            Deshacer Última
                        </button>
                    </div>

                    <div style={{marginBottom: '2rem'}}>
                        <RouletteTable
                            chips={chips}
                            bets={bets}
                            onBet={handleBet}
                            readOnly={wheelStart}
                        />
                    </div>

                    <div style={{marginBottom: '2rem'}}>
                        <ChipList
                            chips={chips}
                            selectedChip={selectedChip}
                            onChipPressed={setSelectedChip}
                        />
                    </div>

                </div>
            </div>
        </>
    );
};

export default RouletteGame;