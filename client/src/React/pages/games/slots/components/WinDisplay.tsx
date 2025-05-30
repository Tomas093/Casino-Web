import { useEffect, useState } from 'react';
import { WinningLineType } from '../types';
type WinDisplayProps = {
    winAmount: number;
    winningLines: WinningLineType[];
};

const WinDisplay = ({ winAmount, winningLines }: WinDisplayProps) => {
    const [isAnimating, setIsAnimating] = useState(false);

    // Animar cuando hay una ganancia
    useEffect(() => {
        if (winAmount > 0) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [winAmount]);

    // If there's no win, don't render anything
    if (winAmount <= 0) {
        return null;
    }

    return (
        <div className={`win-display ${isAnimating ? 'win-animation' : ''}`}>
            <div className="win-title">¡GANASTE!</div>
            <div className="win-amount">{winAmount.toFixed(2)}</div>
            <div className="win-lines-count">
                {winningLines.length} {winningLines.length === 1 ? 'línea' : 'líneas'}
            </div>
        </div>
    );
};

export default WinDisplay;