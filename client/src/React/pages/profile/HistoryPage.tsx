// client/src/React/pages/profile/HistoryPage.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '@components/SideBar.tsx';
import { useHistory } from '@context/HistoryContext';
import { useAuth } from '@context/AuthContext';
import '@css/ProfileStyle.css';
import mineImg from '@assets/mines.jpg';
import rouletteImg from '@assets/ruleta.jpg';

interface Transaction {
    date: string;
    time: string;
    amount: number;
}

const HistoryPage: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const { userHistory, loading, error, getUserHistory } = useHistory();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.usuarioid) {
            getUserHistory(user.usuarioid).catch(error =>
                console.error("Error al cargar el historial:", error)
            );
        }
    }, [user, getUserHistory]);

    // Convertir los datos del historial al formato necesario para la visualización
    const historyItems = userHistory ? Object.entries(userHistory).map(([juegoid, data]) => {
        const transactions: Transaction[] = data.jugadas.map((jugada: any) => {
            const date = new Date(jugada.fecha);
            return {
                date: date.toLocaleDateString('es-ES'),
                time: date.toLocaleTimeString('es-ES'),
                amount: jugada.retorno - jugada.apuesta // Ganancia o pérdida
            };
        });

        // Filtrar transacciones según la selección
        const filteredTransactions = transactions.filter(t =>
            filter === 'all' ? true :
                filter === 'wins' ? t.amount > 0 :
                    t.amount < 0
        );

        // Imágenes para cada juego (puedes personalizarlas según los juegos disponibles)
        const gameImages: { [key: string]: string } = {
            '1': mineImg,
            '2': rouletteImg,
            '3': '/images/poker.png',
            '4': '/images/roulette.png',
            'default': '/images/default-game.png'
        };

        const image = gameImages[juegoid] || gameImages.default;

        return {
            juegoid: parseInt(juegoid),
            name: data.juego.nombre,
            image,
            filteredTransactions
        };
    }) : [];

    if (loading) {
        return (
            <div className="container">
                <Sidebar />
                <main className="main-content">
                    <div className="history-loading">Cargando historial...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <Sidebar />
                <main className="main-content">
                    <div className="history-error">Error: {error}</div>
                </main>
            </div>
        );
    }

    return (
        <div className="container">
            <Sidebar />

            <main className="main-content">
                <header className="content-header">
                    <h1>Historial</h1>
                    <div className="filter-controls">
                        <button
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            Todos
                        </button>
                        <button
                            className={filter === 'wins' ? 'active' : ''}
                            onClick={() => setFilter('wins')}
                        >
                            Ganancias
                        </button>
                        <button
                            className={filter === 'losses' ? 'active' : ''}
                            onClick={() => setFilter('losses')}
                        >
                            Pérdidas
                        </button>
                    </div>
                </header>

                <div className="history-section">
                    {historyItems.length > 0 ? (
                        historyItems.map(item => (
                            <div key={item.juegoid} className="game-history-section">
                                <h2 className="game-title">{item.name}</h2>
                                <div className="history-item">
                                    <div className="thumbnail-container">
                                        <img src={item.image} alt={item.name} className="game-thumbnail" />
                                    </div>
                                    <div className="transaction-list">
                                        {item.filteredTransactions.length > 0 ? (
                                            item.filteredTransactions.map((transaction, index) => (
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
                                            <div className="no-transactions">
                                                No hay transacciones que coincidan con el filtro
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-history">
                            Aún no tienes historial de juegos. ¡Juega para empezar a registrar tu actividad!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HistoryPage;