import { useState,  } from 'react';
import SlotMachine from './components/SlotMachine';
import GameControls from './components/GameControls';
import WinDisplay from './components/WinDisplay';
import { generateRandomBoard, checkWinningLines } from './utils/gamelogic.ts';
import { defaultTheme } from './themes/deafultThemes.tsx';
import { PAYLINES } from './constants/paylines';
import { SymbolsThemeType, GameStateType } from './types';

function Slots() {
    // Estado del juego
    const [gameState, setGameState] = useState<GameStateType>({
        board: generateRandomBoard(),
        isSpinning: false,
        credits: 1000,
        bet: 25, // Apuesta predeterminada: 1 crédito por línea
        winAmount: 0,
        winningLines: [],
        theme: defaultTheme,
    });

    // Manejar el giro
    const handleSpin = () => {
        if (gameState.isSpinning || gameState.credits < gameState.bet) return;

        // Deducir apuesta
        setGameState(prev => ({
            ...prev,
            isSpinning: true,
            credits: prev.credits - prev.bet,
            winAmount: 0,
            winningLines: [],
        }));

        // Simular el tiempo de giro
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
    };

    // Cambiar la apuesta
    const handleBetChange = (newBet: number) => {
        if (!gameState.isSpinning) {
            setGameState(prev => ({ ...prev, bet: newBet }));
        }
    };

    // Cambiar tema (personalización de símbolos)
    const handleThemeChange = (newTheme: SymbolsThemeType) => {
        if (!gameState.isSpinning) {
            setGameState(prev => ({ ...prev, theme: newTheme }));
        }
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
            />

            <WinDisplay
                winAmount={gameState.winAmount}
                winningLines={gameState.winningLines}
            />

            <GameControls
                onSpin={handleSpin}
                onBetChange={handleBetChange}
                credits={gameState.credits}
                bet={gameState.bet}
                isSpinning={gameState.isSpinning}
                onThemeChange={handleThemeChange}
            />
        </div>
    );
}

export default Slots;