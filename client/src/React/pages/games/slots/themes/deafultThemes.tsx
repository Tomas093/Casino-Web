import {SymbolsThemeType} from '../types';

// Tema predeterminado usando emojis como símbolos
export const defaultTheme: SymbolsThemeType = {
    name: "Emoji",
    symbols: [
        "🍒", // Cereza (0)
        "🍋", // Limón (1)
        "🍊", // Naranja (2)
        "🍇", // Uvas (3)
        "🍉", // Sandía (4)
        "🔔", // Campana (5)
        "💎", // Diamante (6)
        "⭐", // Estrella (7)
    ]
};

// Tema alternativo con diferentes emojis
export const fruitTheme: SymbolsThemeType = {
    name: "Frutas",
    symbols: [
        "🍓", // Fresa (0)
        "🍍", // Piña (1)
        "🍌", // Banana (2)
        "🥝", // Kiwi (3)
        "🍎", // Manzana (4)
        "🍑", // Durazno (5)
        "🥥", // Coco (6)
        "🍈", // Melón (7)
    ]
};

// Tema de cartas
export const cardsTheme: SymbolsThemeType = {
    name: "Cartas",
    symbols: [
        "♠️", // Espadas (0)
        "♥️", // Corazones (1)
        "♦️", // Diamantes (2)
        "♣️", // Tréboles (3)
        "🃏", // Joker (4)
        "👑", // Corona (5)
        "🏆", // Trofeo (6)
        "💰", // Bolsa de dinero (7)
    ]
};