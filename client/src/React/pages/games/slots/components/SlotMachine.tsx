import { useState, useEffect } from 'react';
import { BoardType, PaylineType, WinningLineType, SymbolsThemeType } from '../types';


type SlotMachineProps = {
    board: BoardType;
    isSpinning: boolean;
    winningLines: WinningLineType[];
    paylines: PaylineType[];
    theme: SymbolsThemeType;
};

const SlotMachine = ({ board, isSpinning, winningLines, paylines, theme }: SlotMachineProps) => {
    // Estado para manejar la animación de las líneas ganadoras
    const [showWinningLines, setShowWinningLines] = useState(false);
    const [activePaylineIndex, setActivePaylineIndex] = useState<number | null>(null);

    // Efecto para mostrar las líneas ganadoras después del giro
    useEffect(() => {
        if (winningLines.length > 0) {
            setShowWinningLines(true);

            // Ciclo de animación para mostrar cada línea ganadora por turno
            let currentIndex = 0;
            const interval = setInterval(() => {
                setActivePaylineIndex(winningLines[currentIndex].paylineId);
                currentIndex = (currentIndex + 1) % winningLines.length;
            }, 1500);

            return () => clearInterval(interval);
        } else {
            setShowWinningLines(false);
            setActivePaylineIndex(null);
        }
    }, [winningLines]);

    // Función para verificar si una posición está en una línea ganadora activa
    const isPositionInActiveLine = (col: number, row: number): boolean => {
        if (!showWinningLines || activePaylineIndex === null) return false;

        const activeLine = paylines.find(line => line.id === activePaylineIndex);
        return activeLine ? activeLine.positions[col] === row : false;
    };

    // Función para aplicar clases de estilo a las celdas
    const getCellClasses = (col: number, row: number): string => {
        let classes = "slot-cell";

        if (isSpinning) {
            classes += " spinning";
        } else if (isPositionInActiveLine(col, row)) {
            classes += " highlight";
        }

        return classes;
    };

    return (
        <div className="slot-machine">
            {/* Tablero principal */}
            <div className={`slot-board ${isSpinning ? 'spinning' : ''}`}>
                {board.map((column, colIndex) => (
                    <div key={`col-${colIndex}`} className="slot-column">
                        {column.map((symbolId, rowIndex) => (
                            <div
                                key={`cell-${colIndex}-${rowIndex}`}
                                className={getCellClasses(colIndex, rowIndex)}
                            >
                                <div className="symbol">
                                    {theme.symbols[symbolId]}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Visualización de líneas de pago */}
            {showWinningLines && activePaylineIndex !== null && (
                <div className="paylines-display">
                    <div className="payline-info">
                        {winningLines.map(line =>
                                line.paylineId === activePaylineIndex ? (
                                    <div key={`win-${line.paylineId}`}>
                  <span className="payline-name">
                    {paylines.find(p => p.id === line.paylineId)?.name}
                  </span>
                                        <span className="win-amount">
                    {theme.symbols[line.symbolId]} x {line.count} = {line.win.toFixed(2)}
                  </span>
                                    </div>
                                ) : null
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlotMachine;