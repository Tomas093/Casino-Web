import React, {useEffect, useState} from 'react';
import '@css/MinesweeperStyle.css';
import {useAuth} from "@context/AuthContext.tsx";
import {usePlay} from '@context/PlayContext.tsx';
import {useUser} from '@context/UserContext';
import GameBackground from '@components/GameBackground.tsx';
import {useNavigate} from 'react-router-dom';
import InsufficientBalanceNotification from '@/React/components/games/InsufficientBalanceNotification.tsx';

const MINESWEEPER_GAME_ID = 3;

interface ResultNotificationProps {
    show: boolean;
    result: { isWin: boolean; winnings: number };
    onClose: () => void;
}

const ResultNotification: React.FC<ResultNotificationProps> = ({show, result, onClose}) => {
    const {isWin, winnings} = result;

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
                <div className="notification-icon">{isWin ? '🏆' : '💣'}</div>
                <div className="notification-content">
                    <h3 className="notification-title">{isWin ? '¡FELICIDADES!' : 'INTENTA DE NUEVO'}</h3>
                    <p className="notification-message">
                        {isWin
                            ? `Has hecho un cash-out exitoso`
                            : 'Has encontrado una mina'}
                    </p>
                    <p className="notification-result">
                        {isWin
                            ? `Has ganado $${winnings.toFixed(2)}`
                            : 'Mejor suerte la próxima vez'}
                    </p>
                </div>
                <button className="notification-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

interface MineProps {
    initialCredits?: number;
}

const Minesweeper: React.FC<MineProps> = () => {
    const [gridSize, setGridSize] = useState<number>(64);
    const [totalMines, setTotalMines] = useState<number>(1);
    const [betAmount, setBetAmount] = useState<number>(5);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [bombLocations, setBombLocations] = useState<number[]>([]);
    const [revealedCells, setRevealedCells] = useState<boolean[]>(Array(gridSize).fill(false));
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [hitPoints, setHitPoints] = useState<number>(0);
    const [currentWinAmount, setCurrentWinAmount] = useState<number>(0);
    const [clickedCells, setClickedCells] = useState<number[]>([]);
    const [showInsufficientBalance, setShowInsufficientBalance] = useState<boolean>(false);
    const [showResultNotification, setShowResultNotification] = useState<boolean>(false);
    const [notificationResult, setNotificationResult] = useState({isWin: false, winnings: 0});

    const {user} = useAuth();
    const {createPlay, isLoading} = usePlay();
    const {client, getUserData} = useUser();
    const navigate = useNavigate();
    const [localBalance, setLocalBalance] = useState<number>(0);

    useEffect(() => {
        if (client && client.balance !== undefined) {
            setLocalBalance(Number(client.balance));
        }
    }, [client]);

    const gridSizeOptions = [25, 36, 49, 64];
    const minesOptions = [4, 15, 25, 35, 1];

    const registerPlay = async (betAmount: number, winAmount: number) => {
        if (!user || !user.usuarioid) {
            console.error('No hay usuario autenticado para registrar la jugada');
            return;
        }

        try {
            const playData = {
                usuarioid: user.usuarioid,
                juegoid: MINESWEEPER_GAME_ID,
                fecha: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                retorno: winAmount,
                apuesta: betAmount
            };

            console.log('Registrando jugada:', playData);
            await createPlay(playData);
            console.log('Jugada registrada con éxito');

            const netResult = winAmount - betAmount;
            setLocalBalance(prevBalance => prevBalance + netResult);

            if (user.usuarioid) {
                await getUserData(user.usuarioid.toString());
            }
        } catch (error) {
            console.error('Error al registrar la jugada:', error);
        }
    };

    const getGridDimensions = (size: number): number => {
        return Math.sqrt(size);
    };

    const getMultiplier = (hits: number): number => {
        const houseEdge = 0.9;
        const safeRemaining = gridSize - totalMines - hits;
        const tilesRemaining = gridSize - hits;

        if (safeRemaining <= 0 || tilesRemaining <= 0) return 0;

        const probability = safeRemaining / tilesRemaining;
        const fairMultiplier = 1 / probability;
        const offeredMultiplier = fairMultiplier * houseEdge;

        return Number(offeredMultiplier.toFixed(2));
    };

    const generateBombLocations = (gridSize: number, totalMines: number): number[] => {
        const isInfluencer = client && client.influencer;
        const newBombLocations: number[] = [];

        if (isInfluencer) {
            const safeAreaSize = Math.floor(gridSize * 0.4);
            const allPositions: number[] = [];
            for (let i = 1; i <= gridSize; i++) {
                allPositions.push(i);
            }

            const safePositions: number[] = allPositions.slice(0, safeAreaSize);
            const unsafePositions: number[] = allPositions.slice(safeAreaSize);

            const minesInSafeArea = Math.floor(totalMines * 0.2);

            while (newBombLocations.length < minesInSafeArea && safePositions.length > 0) {
                const randomIndex = Math.floor(Math.random() * safePositions.length);
                const position = safePositions[randomIndex];
                newBombLocations.push(position);
                safePositions.splice(randomIndex, 1);
            }

            while (newBombLocations.length < totalMines && unsafePositions.length > 0) {
                const randomIndex = Math.floor(Math.random() * unsafePositions.length);
                const position = unsafePositions[randomIndex];
                newBombLocations.push(position);
                unsafePositions.splice(randomIndex, 1);
            }
        } else {
            while (newBombLocations.length < totalMines) {
                const randomLocation = Math.floor(Math.random() * gridSize) + 1;
                if (!newBombLocations.includes(randomLocation)) {
                    newBombLocations.push(randomLocation);
                }
            }
        }

        return newBombLocations;
    };

    const initGame = async () => {
        if (!client) {
            console.error('No hay cliente autenticado');
            return;
        }

        if (!client || client.balance === undefined || Number(client.balance) < betAmount) {
            setShowInsufficientBalance(true);
            return;
        }

        setGameStarted(true);
        setBombLocations([]);
        setRevealedCells(Array(gridSize).fill(false));
        setGameOver(false);
        setHitPoints(0);
        setCurrentWinAmount(0);
        setClickedCells([]);

        setLocalBalance(prevBalance => prevBalance - betAmount);

        const newBombLocations = generateBombLocations(gridSize, totalMines);
        setBombLocations(newBombLocations);
    };

    const shouldMoveMine = (cellIndex: number): boolean => {
        const isInfluencer = client && client.influencer;

        if (isInfluencer && bombLocations.includes(cellIndex)) {
            const clickedCellCount = clickedCells.length;
            const maxSafeCells = Math.floor(gridSize * 0.3);
            const moveChance = clickedCellCount < 5 ? 0.8 : 0.5;

            return clickedCellCount < maxSafeCells && Math.random() < moveChance;
        }

        return false;
    };

    const handleCellClick = (cellIndex: number) => {
        if (!gameStarted || gameOver || revealedCells[cellIndex - 1]) {
            return;
        }

        setClickedCells(prev => [...prev, cellIndex]);

        const newRevealedCells = [...revealedCells];
        newRevealedCells[cellIndex - 1] = true;
        setRevealedCells(newRevealedCells);

        if (shouldMoveMine(cellIndex)) {
            let newBombLocations = [...bombLocations];
            newBombLocations = newBombLocations.filter(loc => loc !== cellIndex);

            let newLocation;
            let attempts = 0;
            const maxAttempts = 100;

            do {
                newLocation = Math.floor(Math.random() * gridSize) + 1;
                attempts++;
            } while ((newBombLocations.includes(newLocation) ||
                newLocation === cellIndex ||
                revealedCells[newLocation - 1]) &&
            attempts < maxAttempts);

            if (attempts < maxAttempts) {
                newBombLocations.push(newLocation);
                setBombLocations(newBombLocations);

                const newHitPoints = hitPoints + 1;
                setHitPoints(newHitPoints);

                const multiplier = getMultiplier(newHitPoints);
                const winAmount = betAmount * multiplier;
                setCurrentWinAmount(winAmount);

                return;
            }
        }

        if (bombLocations.includes(cellIndex)) {
            setGameOver(true);

            setNotificationResult({
                isWin: false,
                winnings: 0
            });
            setShowResultNotification(true);

            registerPlay(betAmount, 0);
        } else {
            const newHitPoints = hitPoints + 1;
            setHitPoints(newHitPoints);

            const multiplier = getMultiplier(newHitPoints);
            const winAmount = betAmount * multiplier;
            setCurrentWinAmount(winAmount);
        }
    };

    const adjustBet = (action: 'half' | 'double' | 'max') => {
        if (!client) return;

        switch (action) {
            case 'half':
                setBetAmount(prev => Math.max(1, Math.floor(prev / 2)));
                break;
            case 'double':
                setBetAmount(prev => Math.min(localBalance, prev * 2));
                break;
            case 'max':
                setBetAmount(localBalance);
                break;
        }
    };

    const handleCashout = async () => {
        if (currentWinAmount > 0) {
            await registerPlay(betAmount, currentWinAmount);

            setNotificationResult({
                isWin: true,
                winnings: currentWinAmount
            });
            setShowResultNotification(true);

            setGameStarted(false);
            setGameOver(true);
        }
    };

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
            currentGame="Minesweeper"
            userName="Usuario"
            onDeposit={() => navigate('/Transaccion')}
            onExit={() => navigate('/home')}
            onNavigate={(destination) => navigate(`/${destination}`)}
        >
            <div className="mines-background">

                <InsufficientBalanceNotification
                    show={showInsufficientBalance}
                    onClose={() => setShowInsufficientBalance(false)}
                />

                <ResultNotification
                    show={showResultNotification}
                    result={notificationResult}
                    onClose={() => setShowResultNotification(false)}
                />

                <div className="minesweeper-container">
                    <div className="game-layout">
                        <div className="settings-panel">
                            <div className="setting-group">
                                <h3>Bet Amount</h3>
                                <div className="bet-input">
                                    <span className="currency-symbol-mines">$</span>
                                    <input
                                        type="number"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                        min="1"
                                        max={localBalance}
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
                                disabled={gameStarted && !gameOver || isLoading}
                            >
                                {isLoading ? 'Procesando...' : 'Start Game'}
                            </button>

                            {gameStarted && !gameOver && (
                                <button
                                    className="cashout-btn"
                                    onClick={handleCashout}
                                    disabled={hitPoints === 0 || isLoading}
                                >
                                    Cash Out (${currentWinAmount.toFixed(2)})
                                </button>
                            )}

                        </div>

                        <div className="game-panel">
                            {renderGrid()}
                        </div>
                    </div>
                </div>
            </div>
        </GameBackground>
    );
};

export default Minesweeper;