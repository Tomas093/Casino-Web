import React, {useEffect, useRef, useState} from 'react';
import {PaylineType} from '../types';
import '../css/PayVisualizerStyle.css';

type PaylineVisualizerProps = {
    paylines: PaylineType[];
    onClose: () => void;
};

const PaylineVisualizer: React.FC<PaylineVisualizerProps> = ({paylines, onClose}) => {
    const [selectedPaylineId, setSelectedPaylineId] = useState<number>(
        paylines.length > 0 ? paylines[0].id : 1
    );
    const gridRef = useRef<HTMLDivElement>(null);
    const [linePath, setLinePath] = useState<string>('');

    // Get the selected payline
    const selectedPayline = paylines.find(line => line.id === selectedPaylineId) || paylines[0];

    // Create an empty grid for visualization
    const emptyGrid = Array(3).fill(null).map(() => Array(5).fill(false));

    // Mark payline positions in the grid
    const getHighlightedGrid = (payline: PaylineType) => {
        const grid = [...emptyGrid.map(row => [...row])];

        payline.positions.forEach((rowIndex, colIndex) => {
            grid[rowIndex][colIndex] = true;
        });

        return grid;
    };

    const highlightedGrid = getHighlightedGrid(selectedPayline);

    // Calculate the path for the connecting line
    useEffect(() => {
        if (gridRef.current && selectedPayline) {
            // Wait for the DOM to be ready
            setTimeout(() => {
                const grid = gridRef.current;
                if (!grid) return;

                // Get cell dimensions
                const cells = grid.querySelectorAll('.vis-cell.highlighted');
                if (cells.length === 0) return;

                // Calculate centers of highlighted cells
                const cellCenters: [number, number][] = [];
                cells.forEach(cell => {
                    const rect = cell.getBoundingClientRect();
                    const gridRect = grid.getBoundingClientRect();
                    cellCenters.push([
                        rect.left - gridRect.left + rect.width / 2,
                        rect.top - gridRect.top + rect.height / 2
                    ]);
                });

                // Create path data
                let pathData = `M ${cellCenters[0][0]} ${cellCenters[0][1]}`;
                for (let i = 1; i < cellCenters.length; i++) {
                    pathData += ` L ${cellCenters[i][0]} ${cellCenters[i][1]}`;
                }

                setLinePath(pathData);
            }, 100);
        }
    }, [selectedPaylineId, selectedPayline]);

    return (
        <div className="payline-visualizer">
            <div className="visualizer-header">
                <h2>Líneas Ganadoras</h2>
                <button className="close-button" onClick={onClose}>×</button>
            </div>

            <div className="payline-selector">
                <label htmlFor="payline-select">Seleccionar línea:</label>
                <select
                    id="payline-select"
                    value={selectedPaylineId}
                    onChange={(e) => setSelectedPaylineId(Number(e.target.value))}
                >
                    {paylines.map(line => (
                        <option key={line.id} value={line.id}>
                            {line.id}. {line.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="payline-grid" ref={gridRef}>
                {highlightedGrid.map((row, rowIndex) => (
                    <div key={`vis-row-${rowIndex}`} className="vis-row">
                        {row.map((isHighlighted, colIndex) => (
                            <div
                                key={`vis-cell-${rowIndex}-${colIndex}`}
                                className={`vis-cell ${isHighlighted ? 'highlighted' : ''}`}
                            >
                                {isHighlighted && <div className="path-marker">{colIndex + 1}</div>}
                            </div>
                        ))}
                    </div>
                ))}

                <svg className="payline-svg-overlay">
                    <path d={linePath} className="payline-path"/>
                </svg>
            </div>

            <div className="payline-info">
                <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">{selectedPayline.id}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{selectedPayline.name}</span>
                </div>
            </div>
        </div>
    );
};

export default PaylineVisualizer;