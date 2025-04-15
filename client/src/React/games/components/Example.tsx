// Example.tsx - Ejemplo de uso del componente
import React from 'react';
import GameBackground from '../../pages/games/GameBackground.tsx';
import '@css/ExampleStyle.css';

const RouletteGame: React.FC = () => {
    return (
        <div className="roulette-content">
            {/* Aquí va tu componente de ruleta */}
            <div className="roulette-placeholder">
                <h2>Ruleta Europea</h2>
                <div className="roulette-wheel"></div>
                <div className="betting-table"></div>
                <div className="game-controls">
                    <button className="bet-button">Apostar</button>
                    <button className="spin-button">Girar</button>
                    <button className="clear-button">Limpiar</button>
                </div>
            </div>
        </div>
    );
};

const CasinoGameExample: React.FC = () => {
    return (
        <GameBackground title="Ruleta Europea">
            <RouletteGame />
        </GameBackground>
    );
};

export default CasinoGameExample;