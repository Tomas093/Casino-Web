import React, { useEffect } from 'react';
import { useHistory } from '../context/HistoryContext';
import { useAuth } from '../context/AuthContext';

interface Transaction {
    date: string;
    time: string;
    amount: number;
}

interface HistoryItemProps {
    image: string;
    imageAlt: string;
    transactions: Transaction[];
}

interface Jugada {
    fecha: string;
    retorno: number;
    apuesta: number;
}

// Imágenes para cada tipo de juego (agregar las rutas correctas)
const gameImages: { [key: number]: string; default: string } = {
    1: '/images/slot.png',
    2: '/images/blackjack.png',
    3: '/images/poker.png',
    4: '/images/roulette.png',
    default: '/images/default-game.png'
};

const HistoryItem: React.FC<HistoryItemProps> = ({ image, imageAlt, transactions }) => {
    return (
        <div className="history-item">
            <div className="thumbnail-container">
                <img src={image} alt={imageAlt} className="game-thumbnail" />
            </div>
            <div className="transaction-list">
                {transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                        <div
                            key={index}
                            className={`transaction ${transaction.amount > 0 ? 'positive' : 'negative'}`}
                        >
                            <span className="transaction-date">{transaction.date}</span>
                            <span className="transaction-time">{transaction.time}</span>
                            <span className="transaction-amount">
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount} AC
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="no-transactions">No hay transacciones que mostrar</div>
                )}
            </div>
        </div>
    );
};

const HistoryItems: React.FC = () => {
    const { userHistory, loading, error, getUserHistory } = useHistory();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.usuarioid) {
            getUserHistory(user.usuarioid).catch(error =>
                console.error("Error al cargar el historial:", error)
            );
        }
    }, [user, getUserHistory]);

    if (loading) {
        return <div className="history-loading">Cargando historial...</div>;
    }

    if (error) {
        return <div className="history-error">Error: {error}</div>;
    }

    if (!userHistory) {
        return <div className="no-history">No hay historial disponible</div>;
    }

    // Convertir los datos del historial al formato esperado por HistoryItem
    const historyItems = Object.entries(userHistory).map(([juegoid, data]) => {
        const transactions: Transaction[] = data.jugadas.map((jugada: Jugada) => {
            const date = new Date(jugada.fecha);
            return {
                date: date.toLocaleDateString('es-ES'),
                time: date.toLocaleTimeString('es-ES'),
                amount: jugada.retorno - jugada.apuesta // Ganancia o pérdida
            };
        });

        const gameId = parseInt(juegoid);
        const image = gameImages[gameId] || gameImages.default;

        return {
            juegoid: gameId,
            name: data.juego.nombre,
            image,
            transactions
        };
    });

    return (
        <div className="history-container">
            <h2>Tu Historial de Juegos</h2>
            {historyItems.length > 0 ? (
                historyItems.map(item => (
                    <div key={item.juegoid} className="game-history-section">
                        <h3 className="game-title">{item.name}</h3>
                        <HistoryItem
                            image={item.image}
                            imageAlt={`${item.name} thumbnail`}
                            transactions={item.transactions}
                        />
                    </div>
                ))
            ) : (
                <div className="empty-history">
                    Aún no tienes historial de juegos. ¡Juega para empezar a registrar tu actividad!
                </div>
            )}
        </div>
    );
};

export default HistoryItems;