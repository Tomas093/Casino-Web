import {BoardType, PaylineType, WinResultType, WinningLineType} from '../types';

// Número total de símbolos diferentes en el juego
const TOTAL_SYMBOLS = 8;

// Tabla de pagos: multiplicadores para cada combinación ganadora
// Por ejemplo: 3 símbolos iguales = apuesta x3, 4 símbolos = apuesta x10, 5 símbolos = apuesta x50
const PAYTABLE = {
    3: 3,  // 3 símbolos iguales consecutivos = 3x la apuesta por línea
    4: 10, // 4 símbolos iguales consecutivos = 10x la apuesta por línea
    5: 50  // 5 símbolos iguales consecutivos = 50x la apuesta por línea
};

export function generateRandomBoard(client?: any): BoardType {
    const board: BoardType = [];

    // Comprobar si el cliente es influencer
    const isInfluencer = client && client.influencer === true;

    // Para cada columna
    for (let col = 0; col < 5; col++) {
        const column: number[] = [];

        // Para cada fila en la columna actual
        for (let row = 0; row < 3; row++) {
            let randomNumber;

            if (isInfluencer) {
                // Para influencers: aumentar probabilidad de generar símbolos iguales
                // Especialmente en las primeras 3 columnas para aumentar chances de ganar
                if (col < 3) {
                    // Para las primeras 3 columnas, hay más probabilidad de que salga el mismo símbolo
                    // Si ya hay un símbolo en la primera columna, hay 65% de probabilidad de que sea el mismo
                    if (col > 0 && board[0].length > 0) {
                        // Si estamos en columna > 0, intentar usar el mismo símbolo de la posición correspondiente
                        // en la primera columna con 65% de probabilidad
                        if (Math.random() < 0.6) {
                            randomNumber = board[0][row];
                        } else {
                            randomNumber = Math.floor(Math.random() * TOTAL_SYMBOLS);
                        }
                    } else {
                        // Para la primera columna o como fallback, generamos un número aleatorio normal
                        randomNumber = Math.floor(Math.random() * TOTAL_SYMBOLS);
                    }
                } else {
                    // Para las columnas 4 y 5, reducimos ligeramente la probabilidad para no hacer
                    // el truco demasiado obvio pero seguimos favoreciendo secuencias
                    if (Math.random() < 0.55 && board[col-1].length > row) {
                        randomNumber = board[col-1][row]; // 40% de probabilidad de seguir la secuencia
                    } else {
                        randomNumber = Math.floor(Math.random() * TOTAL_SYMBOLS);
                    }
                }
            } else {
                // Para usuarios normales: generación completamente aleatoria
                randomNumber = Math.floor(Math.random() * TOTAL_SYMBOLS);
            }

            column.push(randomNumber);
        }

        board.push(column);
    }

    return board;
}

export function checkWinningLines(
    board: BoardType,
    paylines: PaylineType[],
    bet: number
): WinResultType {
    const winningLines: WinningLineType[] = [];
    let totalWin = 0;

    // Apuesta por línea (total de apuesta dividido por el número de líneas)
    const betPerLine = bet / paylines.length;

    // Verificar cada línea de pago
    paylines.forEach(payline => {
        // Obtener el símbolo en la primera posición de la línea
        const firstSymbol = board[0][payline.positions[0]];
        let count = 1;

        // Verificar cuántos símbolos consecutivos iguales hay desde izquierda a derecha
        for (let col = 1; col < 5; col++) {
            const currentSymbol = board[col][payline.positions[col]];

            if (currentSymbol === firstSymbol) {
                count++;
            } else {
                break; // Si encuentra un símbolo diferente, termina la secuencia
            }
        }

        // Si hay al menos 3 símbolos iguales consecutivos, es una combinación ganadora
        if (count >= 3) {
            const win = betPerLine * PAYTABLE[count as keyof typeof PAYTABLE];

            winningLines.push({
                paylineId: payline.id,
                symbolId: firstSymbol,
                count,
                win
            });

            totalWin += win;
        }
    });

    return {winningLines, totalWin};
}

export function getPaylinePositions(payline: PaylineType): { row: number; col: number }[] {
    return payline.positions.map((row, col) => ({row, col}));
}