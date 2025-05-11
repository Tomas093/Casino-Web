import {useCallback, useEffect, useState} from 'react';
import SlotMachine from './components/SlotMachine';
import GameControls from './components/GameControls';
import WinDisplay from './components/WinDisplay';
import {generateRandomBoard, checkWinningLines} from './utils/gamelogic.ts';
import {defaultTheme} from './themes/deafultThemes.tsx';
import {PAYLINES} from './constants/paylines';
import {GameStateType} from './types';
import './css/SlotsStyle.css';

function Slots() {
    // Estado del juego
    const [gameState, setGameState] = useState<GameStateType>({
        board: generateRandomBoard(),
        isSpinning: false,
        credits: 1000000,
        bet: 25,
        winAmount: 0,
        winningLines: [],
        theme: defaultTheme,
    });

    // Estado para Auto Spin
    const [isAutoSpinActive, setIsAutoSpinActive] = useState(false);

    const handleBetChange = (newBet: number) => {
        setGameState(prev => ({
            ...prev,
            bet: newBet,
        }));
    };

    const handleThemeChange = (newTheme: typeof defaultTheme) => {
        setGameState(prev => ({
            ...prev,
            theme: newTheme,
        }));
    };

    // Manejar el giro - usando useCallback para asegurar referencia estable
    const handleSpin = useCallback(() => {
        if (gameState.isSpinning || gameState.credits < gameState.bet) {
            // Si no hay suficientes créditos para seguir con auto-spin, desactivarlo
            if (isAutoSpinActive && gameState.credits < gameState.bet) {
                setIsAutoSpinActive(false);
            }
            return;
        }

        // Deducir apuesta
        setGameState(prev => ({
            ...prev,
            isSpinning: true,
            credits: prev.credits - prev.bet,
            winAmount: 0,
            winningLines: [],
        }));

        setTimeout(() => {
            const newBoard = generateRandomBoard();
            const results = checkWinningLines(newBoard, PAYLINES, gameState.bet);

            setGameState(prev => ({
                ...prev,
                board: newBoard,
                isSpinning: false,
                credits: prev.credits + results.totalWin,
                winAmount: results.totalWin,
                winningLines: results.winningLines,
            }));
        }, 1500);
    }, [gameState.bet, gameState.credits, gameState.isSpinning, isAutoSpinActive]);

    // Modify the auto-spin effect in Slots.tsx
    // Modify the auto-spin effect
    useEffect(() => {
        let timeout: number | null = null;

        if (!gameState.isSpinning && isAutoSpinActive && gameState.credits >= gameState.bet) {
            const baseDelay = 700;
            const additionalDelayPerLine = 2000;
            const winningLinesCount = gameState.winningLines.length;
            const delayTime = baseDelay + (winningLinesCount * additionalDelayPerLine);

            timeout = window.setTimeout(() => {
                handleSpin();
            }, delayTime);
        }

        return () => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
        };
    }, [gameState.isSpinning, isAutoSpinActive, gameState.credits, gameState.bet, handleSpin, gameState.winningLines]);

    // Función para activar/desactivar Auto Spin
    const handleAutoSpinToggle = () => {
        setIsAutoSpinActive(prev => {
            const newState = !prev;
            // Si estamos activando auto-spin y no estamos girando, iniciamos inmediatamente
            if (newState && !gameState.isSpinning && gameState.credits >= gameState.bet) {
                handleSpin();
            }
            return newState;
        });
    };

    return (
        <div className="slot-game">
            <h1>Australis Casino - Slot Machine</h1>

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
                credits={gameState.credits}
                bet={gameState.bet}
                isSpinning={gameState.isSpinning}
                isAutoSpinActive={isAutoSpinActive}
            />
        </div>
    );
}

export default Slots;