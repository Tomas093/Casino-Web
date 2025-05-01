import React, {useState,} from 'react';
import '@css/MinesweeperStyle.css';
import GameBackground from '../../pages/games/GameBackground.tsx';


interface MineProps {
    initialCredits?: number;
}

const Minesweeper: React.FC<MineProps> = ({
                                              initialCredits = 1000
                                          }) => {
    // Game configuration
    const [gridSize, setGridSize] = useState<number>(64);
    const [totalMines, setTotalMines] = useState<number>(1);
    const [betAmount, setBetAmount] = useState<number>(5);
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    // Game state
    const [bombLocations, setBombLocations] = useState<number[]>([]);
    const [revealedCells, setRevealedCells] = useState<boolean[]>(Array(gridSize).fill(false));
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [hitPoints, setHitPoints] = useState<number>(0);
    const [totalCredits, setTotalCredits] = useState<number>(initialCredits);
    const [currentWinAmount, setCurrentWinAmount] = useState<number>(0);

    // Grid size options
    const gridSizeOptions = [25, 36, 49, 64];

    // Mines options
    const minesOptions = [4, 15, 25, 35, 1];

    // Calculate grid dimensions
    const getGridDimensions = (size: number): number => {
        return Math.sqrt(size);
    };

    // Get multiplier based on current game state
    const getMultiplier = (hits: number): number => {
        // Basic calculation for multiplier based on probability
        const houseEdge = 0.9; // House edge factor
        const safeRemaining = gridSize - totalMines - hits;
        const tilesRemaining = gridSize - hits;

        if (safeRemaining <= 0 || tilesRemaining <= 0) return 0;

        const probability = safeRemaining / tilesRemaining;
        const fairMultiplier = 1 / probability;
        const offeredMultiplier = fairMultiplier * houseEdge;

        return Number(offeredMultiplier.toFixed(2));
    };

    // Initialize game
    const initGame = () => {
        if (totalCredits < betAmount) {
            alert("Not enough credits!");
            return;
        }

        setGameStarted(true);
        setBombLocations([]);
        setRevealedCells(Array(gridSize).fill(false));
        setGameOver(false);
        setHitPoints(0);
        setCurrentWinAmount(0);

        // Deduct bet amount
        setTotalCredits(prev => prev - betAmount);

        const newBombLocations: number[] = [];

        // Generate random bomb locations
        while (newBombLocations.length < totalMines) {
            const randomLocation = Math.floor(Math.random() * gridSize) + 1;

            if (!newBombLocations.includes(randomLocation)) {
                newBombLocations.push(randomLocation);
            }
        }

        setBombLocations(newBombLocations);
    };

    // Handle cell click
    const handleCellClick = (cellIndex: number) => {
        if (!gameStarted || gameOver || revealedCells[cellIndex - 1]) {
            return;
        }

        const newRevealedCells = [...revealedCells];
        newRevealedCells[cellIndex - 1] = true;
        setRevealedCells(newRevealedCells);

        // Check if clicked on a bomb
        if (bombLocations.includes(cellIndex)) {
            setGameOver(true);
            // Game over - reveal all bomb locations
        } else {
            // Increment hit points
            const newHitPoints = hitPoints + 1;
            setHitPoints(newHitPoints);

            // Calculate potential win amount
            const multiplier = getMultiplier(newHitPoints);
            const winAmount = betAmount * multiplier;
            setCurrentWinAmount(winAmount);
        }
    };

    // Handle bet adjustment
    const adjustBet = (action: 'half' | 'double' | 'max') => {
        switch (action) {
            case 'half':
                setBetAmount(prev => Math.max(1, Math.floor(prev / 2)));
                break;
            case 'double':
                setBetAmount(prev => Math.min(totalCredits, prev * 2));
                break;
            case 'max':
                setBetAmount(totalCredits);
                break;
        }
    };

    // Handle cashout
    const handleCashout = () => {
        if (currentWinAmount > 0) {
            setTotalCredits(prev => prev + currentWinAmount);
            setGameStarted(false);
        }
    };

    // Generate grid cells
    const renderGrid = () => {
        const cells = [];
        const dimension = getGridDimensions(gridSize);

        for (let i = 1; i <= gridSize; i++) {
            cells.push(
                <div
                    key={i}
                    className={`
            mine-cell
            ${revealedCells[i - 1] && !bombLocations.includes(i) ? 'revealed' : ''}
            ${gameOver && bombLocations.includes(i) ? 'bomb' : ''}
          `}
                    onClick={() => handleCellClick(i)}
                >
                    {gameOver && bombLocations.includes(i) ? '💣' : ''}
                </div>
            );
        }

        return (
            <div
                className="mine-grid"
                style={{
                    gridTemplateColumns: `repeat(${dimension}, 1fr)`,
                    gridTemplateRows: `repeat(${dimension}, 1fr)`
                }}
            >
                {cells}
            </div>
        );
    };

    return (
        <GameBackground
            currentGame="Minesweeper VIP"
            userName="Usuario VIP"
            balance={totalCredits}
            onNavigate={(destination) => console.log(`Navegando a: ${destination}`)}
            onDeposit={() => console.log('Abriendo depósito')}
            onExit={() => console.log('Saliendo del juego')}
            onSettings={() => console.log('Abriendo configuración')}
        >

            <div className="minesweeper-container">
                <div className="game-layout">
                    {/* Left panel - Settings */}
                    <div className="settings-panel">
                        <div className="setting-group">
                            <h3>Bet Amount</h3>
                            <div className="bet-input">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    max={totalCredits}
                                />
                            </div>
                            <div className="bet-buttons">
                                <button
                                    className="bet-btn half"
                                    onClick={() => adjustBet('half')}
                                >
                                    1/2
                                </button>
                                <button
                                    className="bet-btn double"
                                    onClick={() => adjustBet('double')}
                                >
                                    2x
                                </button>
                                <button
                                    className="bet-btn max"
                                    onClick={() => adjustBet('max')}
                                >
                                    Max
                                </button>
                            </div>
                        </div>

                        <div className="setting-group">
                            <h3>Grid Size</h3>
                            <div className="option-buttons">
                                {gridSizeOptions.map(size => (
                                    <button
                                        key={size}
                                        className={`option-btn ${gridSize === size ? 'selected' : ''}`}
                                        onClick={() => setGridSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-group">
                            <h3>Number of Mines</h3>
                            <div className="option-buttons">
                                {minesOptions.map(mines => (
                                    <button
                                        key={mines}
                                        className={`option-btn ${totalMines === mines ? 'selected' : ''}`}
                                        onClick={() => setTotalMines(mines)}
                                    >
                                        {mines}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className="start-game-btn"
                            onClick={initGame}
                            disabled={gameStarted && !gameOver}
                        >
                            Start Game
                        </button>

                        {gameStarted && !gameOver && (
                            <button
                                className="cashout-btn"
                                onClick={handleCashout}
                                disabled={hitPoints === 0}
                            >
                                Cash Out (${currentWinAmount.toFixed(2)})
                            </button>
                        )}

                        <div className="credits-display">
                            Credits: ${totalCredits.toFixed(2)}
                        </div>
                    </div>

                    {/* Right panel - Game Grid */}
                    <div className="game-panel">
                        {renderGrid()}
                    </div>
                </div>
            </div>
        </GameBackground>
    );
};
// const CasinoGameExample: React.FC = () => {
//     return (
//         <GameBackground title="Ruleta Europea">
//             <Minesweeper />
//         </GameBackground>
//     );
// };
export default Minesweeper;