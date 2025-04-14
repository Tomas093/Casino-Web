// client/src/HistoryPage.tsx
import React, { useState } from 'react';
import Sidebar from '@components//SideBar.tsx';
import HistoryItem from '@components/HistoryItems.tsx';
import '@css/ProfileStyle.css';

const HistoryPage: React.FC = () => {
    const [filter, setFilter] = useState('all');

    const transactions = {
        ruleta: [
            { date: "18/03", time: "21:00", amount: 100 },
            { date: "17/03", time: "21:00", amount: -50 },
            { date: "16/03", time: "21:00", amount: 100 },
            { date: "15/03", time: "21:00", amount: 200 },
            { date: "14/03", time: "21:00", amount: -75 },
            { date: "13/03", time: "21:00", amount: 100 }
        ],
        poker: [
            { date: "18/03", time: "21:00", amount: 150 },
            { date: "17/03", time: "21:00", amount: -120 },
            { date: "16/03", time: "21:00", amount: 300 },
            { date: "15/03", time: "21:00", amount: -200 },
            { date: "14/03", time: "21:00", amount: 180 },
            { date: "13/03", time: "21:00", amount: 100 }
        ]
    };

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
                    <h2 className="game-title">Ruleta</h2>
                    <HistoryItem
                        image="../Img/JavoRuleta.jpg"
                        imageAlt="Ruleta"
                        transactions={transactions.ruleta.filter(t =>
                            filter === 'all' ? true :
                                filter === 'wins' ? t.amount > 0 :
                                    t.amount < 0
                        )}
                    />

                    <h2 className="game-title">Poker</h2>
                    <HistoryItem
                        image="../Img/JavierPlata.jpg"
                        imageAlt="Poker"
                        transactions={transactions.poker.filter(t =>
                            filter === 'all' ? true :
                                filter === 'wins' ? t.amount > 0 :
                                    t.amount < 0
                        )}
                    />
                </div>
            </main>
        </div>
    );
};

export default HistoryPage;