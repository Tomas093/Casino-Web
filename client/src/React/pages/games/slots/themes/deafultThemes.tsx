import {SymbolsThemeType} from '../types';
import ReactCountryFlag from "react-country-flag";
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

// Tema de animales
export const animalsTheme: SymbolsThemeType = {
    name: "Animales",
    symbols: [
        "🐶", // Perro (0)
        "🐱", // Gato (1)
        "🐻", // Oso (2)
        "🦁", // León (3)
        "🐯", // Tigre (4)
        "🐸", // Rana (5)
        "🐘", // Elefante (6)
        "🦒", // Jirafa (7)
    ]
};

// Tema de deportes
export const sportsTheme: SymbolsThemeType = {
    name: "Deportes",
    symbols: [
        "⚽", // Fútbol (0)
        "🏀", // Baloncesto (1)
        "🏈", // Fútbol americano (2)
        "🎾", // Tenis (3)
        "🏐", // Voleibol (4)
        "🏉", // Rugby (5)
        "🥊", // Boxeo (6)
        "🏓", // Ping pong (7)
    ]
};

// Tema de viajes
export const travelTheme: SymbolsThemeType = {
    name: "Viajes",
    symbols: [
        "✈️", // Avión (0)
        "🚗", // Coche (1)
        "🚢", // Barco (2)
        "🏖️", // Playa (3)
        "🏔️", // Montaña (4)
        "🗺️", // Mapa (5)
        "🧳", // Maleta (6)
        "🌍", // Tierra (7)
    ]
};

// Tema de comida
export const foodTheme: SymbolsThemeType = {
    name: "Comida",
    symbols: [
        "🍕", // Pizza (0)
        "🍔", // Hamburguesa (1)
        "🍟", // Papas fritas (2)
        "🌭", // Hot dog (3)
        "🍣", // Sushi (4)
        "🥗", // Ensalada (5)
        "🍰", // Pastel (6)
        "🍩", // Dona (7)
    ]
};


// Tema de Argentina
export const argentinaTheme: SymbolsThemeType = {
    name: "Argentina",
    symbols: [
        <ReactCountryFlag countryCode="AR" svg title="Argentina"/>, // Bandera (0)
        "🥩", // Asado (1)
        "🍷", // Vino (2)
        "⚽", // Fútbol (3)
        "🍷", // Vino (4)
        "🧉", // Mate (5)
        "🏞️", // Paisaje argentino (6)
        "💃", // Tango (7)
    ]
};

// Tema de Paises con sus banderas
export const countriesTheme: SymbolsThemeType = {
    name: "Países",
    symbols: [
        <ReactCountryFlag countryCode="AR" svg title="Argentina"/>, // Argentina (0)
        <ReactCountryFlag countryCode="FR" svg title="Francia"/>, // Francia (2)
        <ReactCountryFlag countryCode="AR" svg title="Estados Unidos"/>, // Estados Unidos (2)
        <ReactCountryFlag countryCode="ES" svg title="España"/>, // España (3)
        <ReactCountryFlag countryCode="DE" svg title="Alemania"/>, // Alemania (4)
        <ReactCountryFlag countryCode="IT" svg title="Italia"/>, // Italia (5)
        <ReactCountryFlag countryCode="JP" svg title="Japón"/>, // Japón (6)
        <ReactCountryFlag countryCode="BR" svg title="Brasil"/> // Brasil (7)
    ]
}