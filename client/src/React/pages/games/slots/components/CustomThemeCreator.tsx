import { useState } from 'react';
import { SymbolsThemeType } from '../types';
import './CustomThemeCreator.css';

type CustomThemeCreatorProps = {
    onSaveTheme: (theme: SymbolsThemeType) => void;
    onCancel: () => void;
};

const CustomThemeCreator = ({ onSaveTheme, onCancel }: CustomThemeCreatorProps) => {
    const [themeName, setThemeName] = useState('Mi tema personalizado');
    const [symbols, setSymbols] = useState<string[]>([
        '🍒', '🍋', '🍊', '🍇', '🍉', '🔔', '💎', '⭐'
    ]);

    const handleSymbolChange = (index: number, value: string) => {
        const newSymbols = [...symbols];
        newSymbols[index] = value;
        setSymbols(newSymbols);
    };

    const handleSave = () => {
        onSaveTheme({
            name: themeName,
            symbols: symbols
        });
    };

    // Lista de emojis sugeridos para ayudar en la selección
    const emojiSuggestions = [
        '🍓', '🍍', '🍌', '🥝', '🍎', '🍑', '🥥', '🍈',
        '♠️', '♥️', '♦️', '♣️', '🃏', '👑', '🏆', '💰',
        '🚀', '🔥', '⚡', '💫', '🌟', '🎲', '🎯', '🎪'
    ];

    return (
        <div className="custom-theme-creator">
            <h2>Crea tu tema personalizado</h2>

            <div className="theme-form">
                <div className="form-group">
                    <label htmlFor="theme-name">Nombre del tema:</label>
                    <input
                        id="theme-name"
                        type="text"
                        value={themeName}
                        onChange={(e) => setThemeName(e.target.value)}
                    />
                </div>

                <div className="symbols-container">
                    <h3>Símbolos:</h3>
                    {symbols.map((symbol, index) => (
                        <div key={index} className="symbol-input">
                            <label htmlFor={`symbol-${index}`}>Símbolo {index + 1}:</label>
                            <input
                                id={`symbol-${index}`}
                                type="text"
                                value={symbol}
                                onChange={(e) => handleSymbolChange(index, e.target.value)}
                                maxLength={2}
                            />
                            <span className="symbol-preview">{symbol}</span>
                        </div>
                    ))}
                </div>

                <div className="emoji-suggestions">
                    <h3>Emojis sugeridos:</h3>
                    <div className="emoji-grid">
                        {emojiSuggestions.map((emoji, index) => (
                            <button
                                key={index}
                                className="emoji-button"
                                onClick={() => {
                                    // Encuentra el primer índice disponible para reemplazar
                                    const replaceIndex = symbols.findIndex(s => s === '');
                                    if (replaceIndex >= 0) {
                                        handleSymbolChange(replaceIndex, emoji);
                                    } else {
                                        // Si no hay espacios vacíos, reemplaza el último
                                        handleSymbolChange(7, emoji);
                                    }
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="theme-actions">
                    <button className="cancel-button" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className="save-button" onClick={handleSave}>
                        Guardar Tema
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomThemeCreator;