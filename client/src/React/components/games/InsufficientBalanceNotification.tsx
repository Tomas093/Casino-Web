import React, {useEffect} from 'react';

interface InsufficientBalanceNotificationProps {
    show: boolean;
    onClose: () => void;
}

const InsufficientBalanceNotification: React.FC<InsufficientBalanceNotificationProps> = ({show, onClose}) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="result-notification-backdrop">
            <div className="result-notification insufficient-balance">
                <div className="notification-icon">💰</div>
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

export default InsufficientBalanceNotification;