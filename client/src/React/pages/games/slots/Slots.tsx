import {useCallback, useEffect, useState} from 'react';
import SlotMachine from './components/SlotMachine';
import GameControls from './components/GameControls';
import WinDisplay from './components/WinDisplay';
import {checkWinningLines, generateRandomBoard} from './utils/gamelogic.ts';
import {defaultTheme} from './themes/deafultThemes.tsx';
import {PAYLINES} from './constants/paylines';
import {GameStateType} from './types';
import './css/SlotsStyle.css';
import GameBackground from '@components/GameBackground.tsx';
import {useNavigate} from 'react-router-dom';
import {useAuth} from "@context/AuthContext.tsx";
import {usePlay} from '@context/PlayContext.tsx';
import {useUser} from '@context/UserContext';
import InsufficientBalanceNotification from '@/React/components/games/InsufficientBalanceNotification.tsx';

const SLOTS_GAME_ID = 4;

function Slots() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {createPlay, isLoading} = usePlay();
    const {client, getUserData} = useUser();

    const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

    const [gameState, setGameState] = useState<GameStateType>({
        board: generateRandomBoard(),
        isSpinning: false,
        bet: 25,
        winAmount: 0,
        winningLines: [],
        theme: defaultTheme,
        credits: 0,
    });

    const [isAutoSpinActive, setIsAutoSpinActive] = useState(false);

    useEffect(() => {
        if (user && user.usuarioid) {
            getUserData(user.usuarioid.toString())
                .catch(error => console.error('Error al obtener datos del usuario:', error));
        }
    }, [user, getUserData]);

    const handleBetChange = (newBet: number) => {
        if (newBet <= 0) return;
        setGameState(prev => ({
            ...prev,
            bet: newBet,
        }));
    };

    const handleThemeChange = (newTheme: typeof defaultTheme) => {
        if (!newTheme) return;
        setGameState(prev => ({
            ...prev,
            theme: newTheme,
        }));
    };

    const registerPlay = async (betAmount: number, winAmount: number) => {
        if (!user || !user.usuarioid) {
            console.error('No hay usuario autenticado para registrar la jugada');
            return;
        }
        try {
            const playData = {
                usuarioid: user.usuarioid,
                juegoid: SLOTS_GAME_ID,
                fecha: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                retorno: winAmount,
                apuesta: betAmount
            };
            await createPlay(playData);
            if (user.usuarioid) {
                await getUserData(user.usuarioid.toString());
            }
        } catch (error) {
            console.error('Error al registrar la jugada:', error);
        }
    };

    const handleSpin = useCallback(async () => {
        if (gameState.isSpinning || isLoading) {
            return;
        }
        if (!client) {
            setShowInsufficientBalance(true);
            return;
        }
        const currentBalance = Number(client.balance || 0);
        if (currentBalance < gameState.bet) {
            setShowInsufficientBalance(true);
            if (isAutoSpinActive) {
                setIsAutoSpinActive(false);
            }
            return;
        }
        setGameState(prev => ({
            ...prev,
            isSpinning: true,
            winAmount: 0,
            winningLines: [],
        }));
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newBoard = generateRandomBoard(client);
            const results = checkWinningLines(newBoard, PAYLINES, gameState.bet);
            await registerPlay(gameState.bet, results.totalWin);
            setGameState(prev => ({
                ...prev,
                board: newBoard,
                isSpinning: false,
                winAmount: results.totalWin,
                winningLines: results.winningLines,
            }));
        } catch (error) {
            console.error('Error durante el giro:', error);
            setGameState(prev => ({
                ...prev,
                isSpinning: false
            }));
        }
    }, [gameState.bet, gameState.isSpinning, isAutoSpinActive, client, createPlay, user, isLoading]);

    useEffect(() => {
        let timeout: NodeJS.Timeout | null = null;
        if (!gameState.isSpinning && isAutoSpinActive && client) {
            const currentBalance = Number(client.balance || 0);
            if (currentBalance >= gameState.bet) {
                const baseDelay = 700;
                const additionalDelayPerLine = 2000;
                const winningLinesCount = gameState.winningLines.length;
                const delayTime = baseDelay + (winningLinesCount * additionalDelayPerLine);
                timeout = setTimeout(() => {
                    handleSpin();
                }, delayTime);
            } else {
                setIsAutoSpinActive(false);
            }
        }
        return () => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
        };
    }, [gameState.isSpinning, isAutoSpinActive, gameState.bet, handleSpin, gameState.winningLines, client]);

    const handleAutoSpinToggle = () => {
        setIsAutoSpinActive(prev => {
            const newState = !prev;
            if (newState && !gameState.isSpinning && client) {
                const currentBalance = Number(client.balance || 0);
                if (currentBalance >= gameState.bet) {
                    handleSpin();
                } else {
                    setShowInsufficientBalance(true);
                    return false;
                }
            }
            return newState;
        });
    };

    const isControlDisabled = gameState.isSpinning || isLoading;

    return (
        <GameBackground
            currentGame="Slots"
            userName="Usuario"
            onDeposit={() => navigate('/Transaccion')}
            onExit={() => navigate('/home')}
            onNavigate={(destination) => navigate(`/${destination}`)}
        >
            <div className="slot-game">
                <InsufficientBalanceNotification
                    show={showInsufficientBalance}
                    onClose={() => setShowInsufficientBalance(false)}
                />

                <SlotMachine
                    board={gameState.board}
                    isSpinning={gameState.isSpinning}
                    winningLines={gameState.winningLines}
                    paylines={PAYLINES}
                    theme={gameState.theme}
                    showConnectedLines={true}
                />

                <WinDisplay
                    winAmount={gameState.winAmount}
                    winningLines={gameState.winningLines}
                />

                <GameControls
                    onSpin={handleSpin}
                    onBetChange={handleBetChange}
                    onThemeChange={handleThemeChange}
                    onAutoSpinToggle={handleAutoSpinToggle}
                    credits={Number(client?.balance || 0)}
                    bet={gameState.bet}
                    isSpinning={isControlDisabled}
                    isAutoSpinActive={isAutoSpinActive}
                />
            </div>
        </GameBackground>
    );
}

export default Slots;