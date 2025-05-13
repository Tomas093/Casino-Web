import React, { useState, useEffect } from 'react';
import '@css/MinesweeperStyle.css';
import { useAuth } from "@context/AuthContext.tsx";
import { usePlay } from '@context/PlayContext.tsx';
import { useUser } from '@context/UserContext';
import GameBackground from '@components/GameBackground.tsx';
import { useNavigate } from 'react-router-dom';


// ID del juego de Minesweeper
const MINESWEEPER_GAME_ID = 3; // Asumiendo que es el ID 3 (ajusta según corresponda)

// Notificación de saldo insuficiente
const InsufficientBalanceNotification = ({ show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Cerrar automáticamente después de 5 segundos

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

// Componente de notificación de resultado
const ResultNotification = ({ show, result, onClose }) => {
    const { isWin, winnings } = result;

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Cerrar automáticamente después de 5 segundos

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="result-notification-backdrop">
            <div className={`result-notification ${isWin ? 'win' : 'lose'}`}>
                <div className="notification-icon">
                    {isWin ? '🏆' : '💣'}
                </div>
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
    const [currentWinAmount, setCurrentWinAmount] = useState<number>(0);
    const [clickedCells, setClickedCells] = useState<number[]>([]);

    // Nuevos estados para manejar notificaciones
    const [showInsufficientBalance, setShowInsufficientBalance] = useState<boolean>(false);
    const [showResultNotification, setShowResultNotification] = useState<boolean>(false);
    const [notificationResult, setNotificationResult] = useState({ isWin: false, winnings: 0 });

    // Context hooks
    const { user } = useAuth();
    const { createPlay, isLoading } = usePlay();
    const { client, getUserData } = useUser();
    const navigate = useNavigate();

    // Estado local para el balance (para actualización inmediata)
    const [localBalance, setLocalBalance] = useState<number>(0);

    useEffect(() => {
        // Actualizar el balance local cuando cambie el balance del cliente
        if (client && client.balance !== undefined) {
            setLocalBalance(Number(client.balance));
        }
    }, [client]);

    // Grid size options
    const gridSizeOptions = [25, 36, 49, 64];

    // Mines options
    const minesOptions = [4, 15, 25, 35, 1];


    // Función para registrar una jugada
    const registerPlay = async (betAmount: number, winAmount: number) => {
        if (!user || !user.usuarioid) {
            console.error('No hay usuario autenticado para registrar la jugada');
            return;
        }

        try {
            // Crear objeto de datos para la jugada
            const playData = {
                usuarioid: user.usuarioid,
                juegoid: MINESWEEPER_GAME_ID,
                fecha: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                retorno: winAmount,
                apuesta: betAmount
            };

            console.log('Registrando jugada:', playData);
            // Enviar la jugada al servidor
            await createPlay(playData);
            console.log('Jugada registrada con éxito');

            // Actualizar inmediatamente el balance local
            const netResult = winAmount - betAmount;
            setLocalBalance(prevBalance => prevBalance + netResult);

            // Actualizar los datos del cliente para refrescar el balance
            if (user.usuarioid) {
                await getUserData(user.usuarioid.toString());
            }
        } catch (error) {
            console.error('Error al registrar la jugada:', error);
        }
    };

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

    // Función modificada para generar ubicaciones de bombas con ventaja para influencers
    const generateBombLocations = (gridSize: number, totalMines: number): number[] => {
        const isInfluencer = client && client.influencer === true;
        const newBombLocations: number[] = [];

        // Si es influencer, aplicamos lógica de ventaja
        if (isInfluencer) {
            // Generamos una "zona segura" para los influencers
            // Esta zona segura será un área del tablero donde no habrá minas
            // Por ejemplo, podemos hacer que el cuadrante superior izquierdo sea más seguro
            const dimension = getGridDimensions(gridSize);
            const safeAreaSize = Math.floor(gridSize * 0.4); // 40% del grid será más seguro

            // Creamos un array con todas las posiciones posibles
            const allPositions: number[] = [];
            for (let i = 1; i <= gridSize; i++) {
                allPositions.push(i);
            }

            // Definimos las posiciones en la zona segura (primera mitad del tablero)
            const safePositions: number[] = allPositions.slice(0, safeAreaSize);

            // Definimos las posiciones menos seguras (resto del tablero)
            const unsafePositions: number[] = allPositions.slice(safeAreaSize);

            // Distribuimos las minas: 20% en zona segura, 80% en zona no segura
            const minesInSafeArea = Math.floor(totalMines * 0.2);
            const minesInUnsafeArea = totalMines - minesInSafeArea;

            // Colocamos algunas minas en la zona segura
            while (newBombLocations.length < minesInSafeArea && safePositions.length > 0) {
                const randomIndex = Math.floor(Math.random() * safePositions.length);
                const position = safePositions[randomIndex];
                newBombLocations.push(position);
                safePositions.splice(randomIndex, 1); // Eliminamos esta posición
            }

            // Colocamos el resto de las minas en la zona no segura
            while (newBombLocations.length < totalMines && unsafePositions.length > 0) {
                const randomIndex = Math.floor(Math.random() * unsafePositions.length);
                const position = unsafePositions[randomIndex];
                newBombLocations.push(position);
                unsafePositions.splice(randomIndex, 1); // Eliminamos esta posición
            }
        } else {
            // Para usuarios regulares, distribución normal de minas
            while (newBombLocations.length < totalMines) {
                const randomLocation = Math.floor(Math.random() * gridSize) + 1;
                if (!newBombLocations.includes(randomLocation)) {
                    newBombLocations.push(randomLocation);
                }
            }
        }

        return newBombLocations;
    };

    // Initialize game
    const initGame = async () => {
        // Verificar si el usuario tiene balance suficiente
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
        setClickedCells([]); // Reiniciar las celdas clickeadas

        // Actualizar inmediatamente el balance local para reflejar la apuesta
        setLocalBalance(prevBalance => prevBalance - betAmount);

        // Generar ubicaciones de bombas con posible ventaja para influencers
        const newBombLocations = generateBombLocations(gridSize, totalMines);
        setBombLocations(newBombLocations);
    };

    // Función modificada para comprobar si hay que mover una mina (para influencers)
    const shouldMoveMine = (cellIndex: number): boolean => {
        const isInfluencer = client && client.influencer === true;

        if (isInfluencer && bombLocations.includes(cellIndex)) {
            // Si es la primera vez que haría click en una mina, le damos una segunda oportunidad
            // (Solo lo hacemos si no ha revelado muchas celdas todavía)
            const clickedCellCount = clickedCells.length;

            // Solo movemos la mina si el jugador ha revelado menos del 30% del tablero
            const maxSafeCells = Math.floor(gridSize * 0.3);

            // Probabilidad de mover la mina: 80% en los primeros clicks, luego va disminuyendo
            const moveChance = clickedCellCount < 5 ? 0.8 : 0.5;

            return clickedCellCount < maxSafeCells && Math.random() < moveChance;
        }

        return false;
    };

    // Handle cell click
    const handleCellClick = (cellIndex: number) => {
        if (!gameStarted || gameOver || revealedCells[cellIndex - 1]) {
            return;
        }

        // Agregar celda a las clickeadas
        setClickedCells(prev => [...prev, cellIndex]);

        const newRevealedCells = [...revealedCells];
        newRevealedCells[cellIndex - 1] = true;
        setRevealedCells(newRevealedCells);

        // Verificar si debemos mover una mina para un influencer afortunado
        if (shouldMoveMine(cellIndex)) {
            // El jugador hizo clic en una mina, pero le daremos otra oportunidad
            // Movemos la mina a otra ubicación
            let newBombLocations = [...bombLocations];

            // Remover esta mina
            newBombLocations = newBombLocations.filter(loc => loc !== cellIndex);

            // Añadir una nueva en una ubicación diferente
            let newLocation;
            let attempts = 0;
            const maxAttempts = 100; // Evitar bucle infinito

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

                // Incrementar hit points como si fuera una celda normal
                const newHitPoints = hitPoints + 1;
                setHitPoints(newHitPoints);

                // Calcular potencial ganancia
                const multiplier = getMultiplier(newHitPoints);
                const winAmount = betAmount * multiplier;
                setCurrentWinAmount(winAmount);

                return; // Salimos de la función para no procesar más
            }
        }

        // Check if clicked on a bomb
        if (bombLocations.includes(cellIndex)) {
            setGameOver(true);

            // Mostrar notificación de derrota
            setNotificationResult({
                isWin: false,
                winnings: 0
            });
            setShowResultNotification(true);

            // Registrar la jugada como perdida
            registerPlay(betAmount, 0);
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

    // Handle cashout
    const handleCashout = async () => {
        if (currentWinAmount > 0) {
            // Registrar la jugada como ganada
            await registerPlay(betAmount, currentWinAmount);

            // Mostrar notificación de ganancia
            setNotificationResult({
                isWin: true,
                winnings: currentWinAmount
            });
            setShowResultNotification(true);

            setGameStarted(false);
            setGameOver(true);
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
            currentGame="Minesweeper"
            userName="Usuario"
            onDeposit={() => navigate('/Transaccion')}
            onExit={() => navigate('/home')}
            onNavigate={(destination) => navigate(`/${destination}`)}
        >
            <div className="mines-background">

                {/* Notificación de saldo insuficiente */}
                <InsufficientBalanceNotification
                    show={showInsufficientBalance}
                    onClose={() => setShowInsufficientBalance(false)}
                />

                {/* Notificación de resultado */}
                <ResultNotification
                    show={showResultNotification}
                    result={notificationResult}
                    onClose={() => setShowResultNotification(false)}
                />

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

                        {/* Right panel - Game Grid */}
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