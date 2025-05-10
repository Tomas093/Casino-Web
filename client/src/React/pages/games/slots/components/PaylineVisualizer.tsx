import React, {useState} from 'react';
import {PaylineType} from '../types';
import '../css/PaylineVisualizerStyle.css';

type PaylineVisualizerProps = {
    paylines: PaylineType[];
    onClose: () => void;
};

const PaylineVisualizer: React.FC<PaylineVisualizerProps> = ({paylines, onClose}) => {
    const [selectedPaylineId, setSelectedPaylineId] = useState<number>(1);

    // Obtener la línea de pago seleccionada
    const selectedPayline = paylines.find(line => line.id === selectedPaylineId) || paylines[0];

    // Crear una matriz vacía para visualización
    const emptyGrid = Array(3).fill(null).map(() => Array(5).fill(false));

    // Marcar las posiciones de la línea de pago en la matriz
    const getHighlightedGrid = (payline: PaylineType) => {
        const grid = [...emptyGrid.map(row => [...row])];

        payline.positions.forEach((rowIndex, colIndex) => {
            grid[rowIndex][colIndex] = true;
        });

        return grid;
    };

    const highlightedGrid = getHighlightedGrid(selectedPayline);

    return (
        <div className="payline-visualizer">
            <div className="visualizer-header">
                <h2>Visualizador de Líneas de Pago</h2>
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

            <div className="payline-grid">
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
                <div className="info-item">
                    <span className="info-label">Posiciones:</span>
                    <span className="info-value">[{selectedPayline.positions.join(', ')}]</span>
                </div>
            </div>
        </div>
    );
};

export default PaylineVisualizer;