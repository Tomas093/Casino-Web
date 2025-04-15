import React, { useState, useEffect } from 'react';
import '@css/MinesweeperStyle.css';

interface MineProps {
    totalMines: number;
    gridSize: number;
}

const Minesweeper: React.FC<MineProps> = ({ totalMines = 4, gridSize = 20 }) => {
    // State to track bomb locations
    const [bombLocations, setBombLocations] = useState<number[]>([]);
    // State to track revealed cells
    const [revealedCells, setRevealedCells] = useState<boolean[]>(Array(gridSize).fill(false));
    // State to track game status
    const [gameOver, setGameOver] = useState<boolean>(false);
    // State to track hits (non-bomb clicks)
    const [hitPoints, setHitPoints] = useState<number>(0);

    // Initialize game
    const initGame = () => {
        setBombLocations([]);
        setRevealedCells(Array(gridSize).fill(false));
        setGameOver(false);
        setHitPoints(0);

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

    // Initialize the game when component mounts
    useEffect(() => {
        initGame();
    }, []);

    // Handle cell click
    const handleCellClick = (cellIndex: number) => {
        // Prevent actions if game is over or cell is already revealed
        if (gameOver || revealedCells[cellIndex - 1]) {
            return;
        }

        const newRevealedCells = [...revealedCells];
        newRevealedCells[cellIndex - 1] = true;
        setRevealedCells(newRevealedCells);

        // Check if clicked on a bomb
        if (bombLocations.includes(cellIndex)) {
            // Game over - reveal all cells
            setGameOver(true);
        } else {
            // Increment hit points
            setHitPoints(prev => prev + 1);
        }
    };

    return (
        <div className="minesweeper-container">
            <h2>React Minesweeper</h2>

            <div className="game-board">
                <div className="mine-box">
                    {Array.from({ length: gridSize }, (_, i) => i + 1).map(cellIndex => (
                        <div
                            key={cellIndex}
                            className={`
                mine-item 
                ${revealedCells[cellIndex - 1] && !bombLocations.includes(cellIndex) ? 'not-bomb' : ''} 
                ${gameOver && bombLocations.includes(cellIndex) ? 'bomb-item' : ''}
              `}
                            data-item={cellIndex}
                            onClick={() => handleCellClick(cellIndex)}
                        >
                            {cellIndex}
                        </div>
                    ))}
                </div>
            </div>

            <div className="game-controls">
                <div className="stats">
                    <div className="hit-points">Hits: {hitPoints}</div>
                </div>
                <button
                    className="btn-play-again"
                    onClick={initGame}
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};
// const CasinoGameExample: React.FC = () => {
//     return (
//         <GameBackground title="Ruleta Europea">
//             <Minesweeper totalMines={0} gridSize={0} />
//         </GameBackground>
//     );
// };

export default Minesweeper;