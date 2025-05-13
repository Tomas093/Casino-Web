// Tipos para la estructura del juego

// Define un símbolo como un valor de 0 a n-1 (donde n es la cantidad de símbolos diferentes)
export type SymbolId = number;

// Matriz de juego: 5 columnas x 3 filas
export type BoardType = SymbolId[][];

// Línea de pago: array de 5 índices de fila (0, 1, o 2) que representa una trayectoria a través del tablero
export type PaylineType = {
    id: number;        // Identificador único de la línea
    positions: number[]; // Posiciones de la línea [col1Row, col2Row, col3Row, col4Row, col5Row]
    name: string;      // Nombre descriptivo de la línea
};

// Tema visual para los símbolos
export type SymbolsThemeType = {
    name: string;
    symbols: React.ReactNode[]; // Permite cualquier componente React como símbolo
};

// Línea ganadora
export type WinningLineType = {
    paylineId: number;     // ID de la línea ganadora
    symbolId: SymbolId;    // Símbolo que formó la combinación
    count: number;         // Cantidad de símbolos en la combinación (3, 4 o 5)
    win: number;           // Cantidad ganada
};

// Estado del juego
export type GameStateType = {
    board: BoardType;
    isSpinning: boolean;
    credits: number;
    bet: number;
    winAmount: number;
    winningLines: WinningLineType[];
    theme: SymbolsThemeType;
};

// Resultado de verificar líneas ganadoras
export type WinResultType = {
    winningLines: WinningLineType[];
    totalWin: number;
};