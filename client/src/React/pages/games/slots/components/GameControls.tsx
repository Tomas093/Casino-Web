import { SymbolsThemeType } from '../types';
import { defaultTheme, fruitTheme, cardsTheme } from '../themes/deafultThemes.tsx';


type GameControlsProps = {
    onSpin: () => void;
    onBetChange: (bet: number) => void;
    onThemeChange: (theme: SymbolsThemeType) => void;
    credits: number;
    bet: number;
    isSpinning: boolean;
};

const GameControls = ({
                          onSpin,
                          onBetChange,
                          onThemeChange,
                          credits,
                          bet,
                          isSpinning
                      }: GameControlsProps) => {
    // Lista de temas disponibles
    const availableThemes = [defaultTheme, fruitTheme, cardsTheme];

    // Lista de opciones de apuesta
    const betOptions = [25, 50, 75, 100, 125];

    return (
        <div className="game-controls">
            <div className="credits-display">
                <span>Créditos: {credits.toFixed(2)}</span>
            </div>

            <div className="bet-controls">
                <label htmlFor="bet-select">Apuesta:</label>
                <select
                    id="bet-select"
                    value={bet}
                    onChange={(e) => onBetChange(Number(e.target.value))}
                    disabled={isSpinning}
                >
                    {betOptions.map(option => (
                        <option key={option} value={option}>
                            {option} ({option / 25} por línea)
                        </option>
                    ))}
                </select>
            </div>

            <div className="theme-controls">
                <label htmlFor="theme-select">Tema:</label>
                <select
                    id="theme-select"
                    onChange={(e) => {
                        const selectedTheme = availableThemes.find(theme => theme.name === e.target.value);
                        if (selectedTheme) onThemeChange(selectedTheme);
                    }}
                    disabled={isSpinning}
                >
                    {availableThemes.map(theme => (
                        <option key={theme.name} value={theme.name}>
                            {theme.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                className="spin-button"
                onClick={onSpin}
                disabled={isSpinning || credits < bet}
            >
                {isSpinning ? 'Girando...' : 'GIRAR'}
            </button>
        </div>
    );
};

export default GameControls;