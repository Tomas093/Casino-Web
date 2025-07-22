import {SymbolsThemeType} from '../types';
import {
    animalsTheme,
    argentinaTheme,
    cardsTheme,
    countriesTheme,
    defaultTheme,
    foodTheme,
    fruitTheme,
    sportsTheme,
    travelTheme
} from '../themes/deafultThemes.tsx';
import '../css/GameControlsStyle.css';


type GameControlsProps = {
    onSpin: () => void; onBetChange: (bet: number) => void;
    onThemeChange: (theme: SymbolsThemeType) => void;
    onAutoSpinToggle: () => void; // Nuevo prop
    credits: number;
    bet: number;
    isSpinning: boolean;
    isAutoSpinActive: boolean; // Nuevo prop
};

const GameControls = ({
                          onSpin,
                          onBetChange,
                          onThemeChange,
                          onAutoSpinToggle,
                          credits,
                          bet,
                          isSpinning,
                          isAutoSpinActive
                      }: GameControlsProps) => {
    // Lista de temas disponibles
    const availableThemes = [defaultTheme, fruitTheme, cardsTheme,
        animalsTheme, argentinaTheme, countriesTheme, foodTheme, sportsTheme, travelTheme];

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
                    disabled={isSpinning || isAutoSpinActive}
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
                    disabled={isSpinning || isAutoSpinActive}
                >
                    {availableThemes.map(theme => (
                        <option key={theme.name} value={theme.name}>
                            {theme.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="spin-controls">
                <button
                    className="spin-button"
                    onClick={onSpin}
                    disabled={isSpinning || isAutoSpinActive}
                >
                    {isSpinning ? 'Girando...' : 'GIRAR'}
                </button>

                <button
                    className={`auto-spin-button ${isAutoSpinActive ? 'active' : ''}`}
                    onClick={onAutoSpinToggle}
                    disabled={isSpinning || credits < bet}
                >
                    {isAutoSpinActive ? 'DETENER AUTO' : 'AUTO SPIN'}
                </button>
            </div>
        </div>
    );
};

export default GameControls;