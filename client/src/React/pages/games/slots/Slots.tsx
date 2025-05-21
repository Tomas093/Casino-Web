import React, {useCallback, useEffect, useState} from 'react';
import SlotMachine from './components/SlotMachine';
import GameControls from './components/GameControls';
import WinDisplay from './components/WinDisplay';
import {generateRandomBoard, checkWinningLines} from './utils/gamelogic.ts';
import {defaultTheme} from './themes/deafultThemes.tsx';
import {PAYLINES} from './constants/paylines';
import {GameStateType} from './types';
import './css/SlotsStyle.css';
import GameBackground from '@components/GameBackground.tsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@context/AuthContext.tsx";
import { usePlay } from '@context/PlayContext.tsx';
import { useUser } from '@context/UserContext';

// ID del juego de slots
const SLOTS_GAME_ID = 4;

// Componente de notificación de saldo insuficiente
const InsufficientBalanceNotification = ({ show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Cerrar automáticamente después de 5 segundos

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="result-notification-backdrop">
            <div className="result-notification insufficient-balance">
                <div className="notification-icon">
                    💰
                </div>
                <div className="notification-content">
                    <h3 className="notification-title">SALDO INSUFICIENTE</h3>
                    <p className="notification-message">
                        No tienes suficiente saldo para realizar esta apuesta.
                    </p>
                    <p className="notification-result">
                        Por favor, realiza un depósito para continuar jugando.
                    </p>
                </div>
                <button className="notification-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

function Slots() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { createPlay, isLoading } = usePlay();
    const { client, getUserData } = useUser();

    // Notificación de saldo insuficiente
    const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

    // Estado del juego - inicialización básica para evitar problemas
    const [gameState, setGameState] = useState<GameStateType>({
        board: generateRandomBoard(),
        isSpinning: false,
        bet: 25,
        winAmount: 0,
        winningLines: [],
        theme: defaultTheme,
    });

    // Estado para Auto Spin
    const [isAutoSpinActive, setIsAutoSpinActive] = useState(false);

    // Actualizar los datos del usuario cuando el componente se monta
    useEffect(() => {
        if (user && user.usuarioid) {
            getUserData(user.usuarioid.toString())
                .catch(error => console.error('Error al obtener datos del usuario:', error));
        }
    }, [user, getUserData]);

    const handleBetChange = (newBet: number) => {
        if (newBet <= 0) return; // Evitar apuestas negativas o cero

        setGameState(prev => ({
            ...prev,
            bet: newBet,
        }));
    };

    const handleThemeChange = (newTheme: typeof defaultTheme) => {
        if (!newTheme) return; // Evitar temas undefined

        setGameState(prev => ({
            ...prev,
            theme: newTheme,
        }));
    };

    // Función para registrar la jugada en el backend
    const registerPlay = async (betAmount: number, winAmount: number) => {
        if (!user || !user.usuarioid) {
            console.error('No hay usuario autenticado para registrar la jugada');
            return;
        }

        try {
            // Crear objeto de datos para la jugada
            const playData = {
                usuarioid: user.usuarioid,
                juegoid: SLOTS_GAME_ID,
                fecha: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
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
        }
    };

    // Manejar el giro
    const handleSpin = useCallback(async () => {
        // Verificar si hay un giro en progreso
        if (gameState.isSpinning || isLoading) {
            return;
        }

        // Verificar si el cliente existe
        if (!client) {
            setShowInsufficientBalance(true);
            return;
        }

        // Verificar si hay suficiente saldo
        const currentBalance = Number(client.balance || 0);
        if (currentBalance < gameState.bet) {
            setShowInsufficientBalance(true);
            if (isAutoSpinActive) {
                setIsAutoSpinActive(false);
            }
            return;
        }

        // Iniciar el giro
        setGameState(prev => ({
            ...prev,
            isSpinning: true,
            winAmount: 0,
            winningLines: [],
        }));

        // Simular el tiempo de giro
        try {
            // Esperar a que termine la animación
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Generar nuevo tablero y calcular resultados
            // Pasamos el objeto client para que la función de generación
            // pueda determinar si el usuario es influencer
            const newBoard = generateRandomBoard(client);
            const results = checkWinningLines(newBoard, PAYLINES, gameState.bet);

            // Registrar la jugada
            await registerPlay(gameState.bet, results.totalWin);

            // Actualizar el estado con los resultados
            setGameState(prev => ({
                ...prev,
                board: newBoard,
                isSpinning: false,
                winAmount: results.totalWin,
                winningLines: results.winningLines,
            }));
        } catch (error) {
            console.error('Error durante el giro:', error);
            // Asegurar que el giro termina incluso si hay un error
            setGameState(prev => ({
                ...prev,
                isSpinning: false
            }));
        }
    }, [gameState.bet, gameState.isSpinning, isAutoSpinActive, client, createPlay, user, isLoading]);

    // Efecto para el auto-spin
    useEffect(() => {
        let timeout: NodeJS.Timeout | null = null;

        if (!gameState.isSpinning && isAutoSpinActive && client) {
            const currentBalance = Number(client.balance || 0);
            if (currentBalance >= gameState.bet) {
                const baseDelay = 700;
                const additionalDelayPerLine = 2000;
                const winningLinesCount = gameState.winningLines.length;
                const delayTime = baseDelay + (winningLinesCount * additionalDelayPerLine);

                timeout = setTimeout(() => {
                    handleSpin();
                }, delayTime);
            } else {
                // Si no hay suficiente saldo, desactivar auto-spin
                setIsAutoSpinActive(false);
            }
        }

        return () => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
        };
    }, [gameState.isSpinning, isAutoSpinActive, gameState.bet, handleSpin, gameState.winningLines, client]);

    // Función para activar/desactivar Auto Spin
    const handleAutoSpinToggle = () => {
        setIsAutoSpinActive(prev => {
            const newState = !prev;
            // Si estamos activando auto-spin y no estamos girando, iniciamos inmediatamente
            if (newState && !gameState.isSpinning && client) {
                const currentBalance = Number(client.balance || 0);
                if (currentBalance >= gameState.bet) {
                    handleSpin();
                } else {
                    // Si no hay suficiente saldo, mostrar notificación
                    setShowInsufficientBalance(true);
                    return false; // No activar auto-spin
                }
            }
            return newState;
        });
    };

    // Determinar si los controles deben estar deshabilitados
    const isControlDisabled = gameState.isSpinning || isLoading;

    return (
        <GameBackground
            currentGame="Slots"
            userName="Usuario"
            onDeposit={() => navigate('/Transaccion')}
            onExit={() => navigate('/home')}
            onNavigate={(destination) => navigate(`/${destination}`)}
        >
            {/* Notificación de saldo insuficiente */}
            <InsufficientBalanceNotification
                show={showInsufficientBalance}
                onClose={() => setShowInsufficientBalance(false)}
            />

            <div className="slot-game">

                <SlotMachine
                    board={gameState.board}
                    isSpinning={gameState.isSpinning}
                    winningLines={gameState.winningLines}
                    paylines={PAYLINES}
                    theme={gameState.theme}
                    showConnectedLines={true}
                />

                <WinDisplay
                    winAmount={gameState.winAmount}
                    winningLines={gameState.winningLines}
                />

                <GameControls
                    onSpin={handleSpin}
                    onBetChange={handleBetChange}
                    onThemeChange={handleThemeChange}
                    onAutoSpinToggle={handleAutoSpinToggle}
                    // Asegurarnos de que credits sea siempre un número
                    credits={Number(client?.balance || 0)}
                    bet={gameState.bet}
                    isSpinning={isControlDisabled}
                    isAutoSpinActive={isAutoSpinActive}
                />
            </div>
        </GameBackground>
    );
}

export default Slots;