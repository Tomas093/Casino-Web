import React, { useState } from 'react';
import { RouletteWheel, RouletteTable, useRoulette, ChipList } from 'react-casino-roulette';
import 'react-casino-roulette/dist/index.css';
import '@css/NavBarStyle.css';

import whiteChip from '@assets/Javo.jpg';
import blueChip from '@assets/Javo.jpg';
import blackChip from '@assets/Javo.jpg';
import cyanChip from '@assets/Javo.jpg';
import { useAuth } from "@context/AuthContext.tsx";
import { usePlay } from '@context/PlayContext.tsx';
import { useUser } from '@context/UserContext';
import NavBar from "@components/NavBar.tsx";

// Definición de números rojos y negros en la ruleta
const RED_NUMBERS = ['1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36'];
const BLACK_NUMBERS = ['2', '4', '6', '8', '10', '11', '13', '15', '17', '20', '22', '24', '26', '28', '29', '31', '33', '35'];

// Definición de los chips
const chips = {
    '1': whiteChip,
    '10': blueChip,
    '100': blackChip,
    '500': cyanChip,
};

// ID del juego de ruleta
const ROULETTE_GAME_ID = 2;

interface BetResult {
    betId: string;
    amount: number;
    win: number;
    isWin: boolean;
}

const RouletteGame: React.FC = () => {
    const [selectedChip, setSelectedChip] = useState('1');
    const [winningBet, setWinningBet] = useState('-1');
    const [wheelStart, setWheelStart] = useState(false);
    const [lastResults, setLastResults] = useState<string[]>([]);
    const [betResults, setBetResults] = useState<BetResult[]>([]);
    const { user } = useAuth();
    const { createPlay, isLoading } = usePlay();
    const { client, getUserData } = useUser();

    const { bets, onBet, clearBets, total: totalBet, hasBets } = useRoulette();


    // Función para determinar si un número es rojo o negro
    const getNumberColor = (number: string): 'red' | 'black' | 'green' => {
        if (number === '0' || number === '00') return 'green';
        if (RED_NUMBERS.includes(number)) return 'red';
        return 'black';
    };

    const handleSpin = async () => {
        if (!hasBets) {
            alert('¡Debes hacer al menos una apuesta para girar!');
            return;
        }

        if (!client) {
            alert('No se puede acceder a los datos del cliente');
            return;
        }

        if (totalBet > client.balance) {
            alert('No tienes suficiente saldo para realizar estas apuestas');
            return;
        }

        // Generar número aleatorio entre 0 y 36
        const randomNumber = String(Math.floor(Math.random() * 37));
        setWinningBet(randomNumber);
        setWheelStart(true);
    };

    const calculateWinnings = (winner: string) => {
        const results: BetResult[] = [];
        let totalWinnings = 0;

        // Procesar cada apuesta
        Object.entries(bets).forEach(([betId, bet]) => {
            let isWin = false;
            let winAmount = 0;

            // Comprobar apuestas por color
            if (betId === 'RED') {
                isWin = RED_NUMBERS.includes(winner);
            } else if (betId === 'BLACK') {
                isWin = BLACK_NUMBERS.includes(winner);
            } else if (betId === winner) {
                // Apuesta directa a un número
                isWin = true;
            } else if (bet.payload.includes(winner)) {
                // Otras apuestas que incluyen el número ganador
                isWin = true;
            }

            if (isWin) {
                // Calcular ganancias basadas en la escala de pago
                winAmount = bet.amount * bet.payoutScale;
                totalWinnings += winAmount;
            }

            results.push({
                betId,
                amount: bet.amount,
                win: winAmount,
                isWin
            });
        });

        setBetResults(results);
        return totalWinnings;
    };

    const registerPlay = async (betAmount: number, winAmount: number) => {
        if (!user || !user.usuarioid) {
            console.error('No hay usuario autenticado para registrar la jugada');
            return;
        }

        try {
            // Crear objeto de datos para la jugada
            const playData = {
                usuarioid: user.usuarioid,
                juegoid: ROULETTE_GAME_ID,
                fecha: new Date().toISOString(),
                retorno: winAmount,
                apuesta: betAmount
            };

            console.log('Registrando jugada:', playData);
            // Enviar la jugada al servidor
            await createPlay(playData);
            console.log('Jugada registrada con éxito');

            // Actualizar los datos del cliente para refrescar el balance
            if (user.usuarioid) {
                await getUserData(user.usuarioid.toString());
            }
        } catch (error) {
            console.error('Error al registrar la jugada:', error);
            alert('Hubo un error al registrar tu jugada. La ruleta funcionó correctamente, pero es posible que los datos no se hayan guardado.');
        }
    };

    const handleEndSpin = async (winner: string) => {
        // Agregar el resultado al historial
        setLastResults(prev => {
            const updated = [winner, ...prev];
            return updated.slice(0, 10); // Mantener solo los últimos 10 resultados
        });

        // Calcular ganancias
        const winnings = calculateWinnings(winner);

        // Registrar la jugada en el backend
        await registerPlay(totalBet, winnings);

        if (winnings > 0) {
            alert(`¡La bola cayó en ${winner}! Has ganado ${winnings}!`);
        } else {
            alert(`La bola cayó en ${winner}. No has ganado en esta ronda.`);
        }

        setWheelStart(false);
        clearBets();
        setBetResults([]);
    };

    // Componente para mostrar el historial de resultados con colores
    const ResultHistory = () => (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            {lastResults.map((num, idx) => {
                const color = getNumberColor(num);
                return (
                    <div key={idx} style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: color === 'green' ? 'white' : 'white',
                        fontWeight: 'bold'
                    }}>
                        {num}
                    </div>
                );
            })}
        </div>
    );

    // Componente para los botones de apuesta rápida por color
    const QuickColorBets = () => (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>


        </div>
    );
    const landingNavLinks = [
        {label: "Home", href: "/home", isAnchor: true},
        {label: "Depositar", href: "/Transaccion", isAnchor: true}
    ];
    return (
        <>

        <NavBar
            navLinks={landingNavLinks}
            className="landing-navbar"
            variant="light"
            showBalance={true}
            playButtonLabel="Jugar"
            loginButtonLabel="Iniciar Sesión"
            registerButtonLabel="Registrarse"
        />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '20px' }}>

                {lastResults.length > 0 && (
                    <div>
                        <h3>Últimos resultados</h3>
                        <ResultHistory />
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <h3>        c          </h3>
                    <ChipList
                        chips={chips}
                        selectedChip={selectedChip}
                        onChipPressed={setSelectedChip}
                        budget={client ? client.balance : 0}
                    />
                </div>

                <QuickColorBets />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <RouletteTable
                        chips={chips}
                        bets={bets}
                        onBet={onBet(Number(selectedChip), 'add')}
                        readOnly={wheelStart}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <RouletteWheel
                                start={wheelStart}
                                winningBet={winningBet}
                                onSpinningEnd={handleEndSpin}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={handleSpin}
                                disabled={wheelStart || !hasBets || isLoading}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: wheelStart || !hasBets || isLoading ? 'not-allowed' : 'pointer',
                                    opacity: wheelStart || !hasBets || isLoading ? 0.7 : 1
                                }}
                            >
                                {isLoading ? 'Procesando...' : 'Girar Ruleta'}
                            </button>
                            <button
                                onClick={clearBets}
                                disabled={wheelStart || !hasBets || isLoading}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: wheelStart || !hasBets || isLoading ? 'not-allowed' : 'pointer',
                                    opacity: wheelStart || !hasBets || isLoading ? 0.7 : 1
                                }}
                            >
                                Limpiar Apuestas
                            </button>
                        </div>
                    </div>
                </div>

                {betResults.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3>Resultados de las apuestas</h3>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: '10px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '5px'
                        }}>
                            {betResults.map((result, idx) => (
                                <div key={idx} style={{
                                    padding: '8px',
                                    backgroundColor: result.isWin ? '#d4edda' : '#f8d7da',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>Apuesta: {result.betId}</span>
                                    <span>Monto: ${result.amount}</span>
                                    <span>{result.isWin ? `Ganancia: $${result.win}` : 'Perdida'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default RouletteGame;