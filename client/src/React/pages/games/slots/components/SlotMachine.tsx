import {useEffect, useRef, useState} from 'react';
import {BoardType, PaylineType, SymbolsThemeType, WinningLineType} from '../types';
import '../css/SlotMachineStyle.css';

type SlotMachineProps = {
                    board: BoardType;
                    isSpinning: boolean;
                    winningLines: WinningLineType[];
                    paylines: PaylineType[];
                    theme: SymbolsThemeType;
                    showConnectedLines?: boolean;
                };

                const SlotMachine = ({
                    board,
                    isSpinning,
                    winningLines,
                    paylines,
                    theme,
                    showConnectedLines = true
                }: SlotMachineProps) => {
                    const [showWinningLines, setShowWinningLines] = useState(false);
                    const [activePaylineIndex, setActivePaylineIndex] = useState<number | null>(null);
                    const spinRefs = useRef<(HTMLDivElement | null)[]>([]);
                    const boardRef = useRef<HTMLDivElement>(null);
                    const [linePaths, setLinePaths] = useState<string[]>([]);
                    const [activeLineIndex, setActiveLineIndex] = useState<number>(0);

                    // Efecto para mostrar las líneas ganadoras después del giro
                    useEffect(() => {
                        if (winningLines.length > 0) {
                            setShowWinningLines(true);

                            let currentIndex = 0;
                            const interval = setInterval(() => {
                                setActivePaylineIndex(winningLines[currentIndex].paylineId);
                                setActiveLineIndex(currentIndex);
                                currentIndex = (currentIndex + 1) % winningLines.length;
                            }, 1500);

                            return () => clearInterval(interval);
                        } else {
                            setShowWinningLines(false);
                            setActivePaylineIndex(null);
                            setLinePaths([]);
                        }
                    }, [winningLines]);

                    // Efecto para calcular las líneas conectoras
                    useEffect(() => {
                        if (boardRef.current && showWinningLines && activePaylineIndex !== null && showConnectedLines) {
                            // Esperar a que el DOM esté listo
                            setTimeout(() => {
                                const board = boardRef.current;
                                if (!board) return;

                                const newPaths: string[] = [];

                                winningLines.forEach(winLine => {
                                    const payline = paylines.find(p => p.id === winLine.paylineId);
                                    if (!payline) return;

                                    // Obtener las celdas para esta línea
                                    const cellCoordinates: {x: number, y: number}[] = [];

                                    payline.positions.forEach((rowIndex, colIndex) => {
                                        // Si ya no es parte de la combinación ganadora (después del conteo), no incluirlo
                                        if (colIndex >= winLine.count) return;

                                        const cellSelector = `.slot-column:nth-child(${colIndex + 1}) .slot-cell:nth-child(${rowIndex + 1})`;
                                        const cell = board.querySelector(cellSelector);

                                        if (cell) {
                                            const rect = cell.getBoundingClientRect();
                                            const boardRect = board.getBoundingClientRect();

                                            cellCoordinates.push({
                                                x: rect.left - boardRect.left + rect.width / 2,
                                                y: rect.top - boardRect.top + rect.height / 2
                                            });
                                        }
                                    });

                                    if (cellCoordinates.length >= 3) { // Mínimo 3 símbolos para una línea ganadora
                                        let pathData = `M ${cellCoordinates[0].x} ${cellCoordinates[0].y}`;
                                        for (let i = 1; i < cellCoordinates.length; i++) {
                                            pathData += ` L ${cellCoordinates[i].x} ${cellCoordinates[i].y}`;
                                        }
                                        newPaths.push(pathData);
                                    }
                                });

                                setLinePaths(newPaths);
                            }, 100);
                        }
                    }, [showWinningLines, activePaylineIndex, winningLines, paylines, showConnectedLines]);

                    // Función para verificar si una posición está en una línea ganadora activa
                    const isPositionInActiveLine = (col: number, row: number): boolean => {
                        if (!showWinningLines || activePaylineIndex === null) return false;

                        const winLine = winningLines.find(wl => wl.paylineId === activePaylineIndex);
                        if (!winLine) return false;

                        const payline = paylines.find(p => p.id === activePaylineIndex);
                        if (!payline) return false;

                        // Solo considerar las primeras `count` columnas de la línea ganadora
                        if (col >= winLine.count) return false;

                        return payline.positions[col] === row;
                    };

                    // Función para aplicar clases de estilo a las celdas
                    const getCellClasses = (col: number, row: number): string => {
                        let classes = "slot-cell";
                        if (isPositionInActiveLine(col, row)) {
                            classes += " highlight";
                        }
                        return classes;
                    };

                    // Generar símbolos extra para la animación
                    const generateExtendedSymbols = (symbolIds: number[]) => {
                        // Creamos símbolos extras arriba y abajo para dar efecto de continuidad
                        const extraSymbols = [...Array(5)].map(() =>
                            Math.floor(Math.random() * theme.symbols.length)
                        );

                        return [...extraSymbols, ...symbolIds, ...extraSymbols];
                    };

                    return (
                        <div className="slot-machine">
                            {/* Tablero principal */}
                            <div className="slot-board" ref={boardRef}>
                                {board.map((column, colIndex) => (
                                    <div
                                        key={`col-${colIndex}`}
                                        className={`slot-column ${isSpinning ? 'spinning' : ''}`}
                                        ref={el => {
                                            spinRefs.current[colIndex] = el;
                                        }}
                                    >
                                        <div className="column-content">
                                            {isSpinning ? (
                                                // Mostrar símbolos extendidos durante el giro
                                                generateExtendedSymbols(column).map((symbolId, idx) => (
                                                    <div key={`spin-cell-${colIndex}-${idx}`} className="slot-cell">
                                                        <div className="symbol">{theme.symbols[symbolId]}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                // Mostrar solo los 3 símbolos cuando no está girando
                                                column.map((symbolId, rowIndex) => (
                                                    <div
                                                        key={`cell-${colIndex}-${rowIndex}`}
                                                        className={getCellClasses(colIndex, rowIndex)}
                                                    >
                                                        <div className="symbol">
                                                            {theme.symbols[symbolId]}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* SVG para dibujar las líneas conectoras */}
                                {showConnectedLines && showWinningLines && linePaths.length > 0 && (
                                    <svg className="paylines-overlay" data-testid="paylines-svg">
                                        <path
                                            d={linePaths[activeLineIndex]}
                                            className="payline-path"
                                            stroke="#ffd700"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
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