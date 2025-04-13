import React from 'react';

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

export default HistoryItem;