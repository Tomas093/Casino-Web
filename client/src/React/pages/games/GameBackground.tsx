import React, { useState } from 'react';
import '@css/GameBackgroundStyle.css';

interface GameBackgroundProps {
    children: React.ReactNode;
    currentGame: string;
    userName: string;
    balance: number;
    onNavigate: (destination: string) => void;
    onDeposit: () => void;
    onExit: () => void;
    onSettings: () => void;
}

const GameBackground: React.FC<GameBackgroundProps> = ({
                                                           children,
                                                           currentGame,
                                                           userName,
                                                           balance,
                                                           onNavigate,
                                                           onDeposit,
                                                           onExit,
                                                           onSettings
                                                       }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="gb-container">
            <div className="gb-background-patterns">
                <div className="gb-pattern-radial"></div>
                <div className="gb-pattern-grid"></div>
            </div>

            <header className="gb-top-bar">
                <div className="gb-logo">
                    <span>LE</span>
                </div>
                <h1 className="gb-game-title">{currentGame}</h1>
                <div className="gb-controls">
                    <button className="gb-control-button" onClick={onSettings}>
                        <i className="gb-icon-settings"></i>
                    </button>
                    <button className="gb-control-button gb-exit-button" onClick={onExit}>
                        <i className="gb-icon-exit"></i>
                        <span>Salir</span>
                    </button>
                </div>
            </header>

            <div className={`gb-sidebar ${sidebarCollapsed ? 'gb-sidebar-collapsed' : ''}`}>
                <button className="gb-sidebar-toggle" onClick={toggleSidebar}>
                    {sidebarCollapsed ? '›' : '‹'}
                </button>

                <nav className="gb-navigation">
                    <button
                        className="gb-nav-button gb-home-button"
                        onClick={() => onNavigate('home')}
                    >
                        <i className="gb-icon-home"></i>
                        {!sidebarCollapsed && <span>Inicio</span>}
                    </button>

                    <div className="gb-game-buttons">
                        <button className="gb-nav-button" onClick={() => onNavigate('blackjack')}>
                            <i className="gb-icon-cards"></i>
                            {!sidebarCollapsed && <span>Blackjack</span>}
                        </button>
                        <button className="gb-nav-button" onClick={() => onNavigate('roulette')}>
                            <i className="gb-icon-roulette"></i>
                            {!sidebarCollapsed && <span>Ruleta</span>}
                        </button>
                        <button className="gb-nav-button" onClick={() => onNavigate('slots')}>
                            <i className="gb-icon-slots"></i>
                            {!sidebarCollapsed && <span>Slots</span>}
                        </button>
                        <button className="gb-nav-button" onClick={() => onNavigate('poker')}>
                            <i className="gb-icon-poker"></i>
                            {!sidebarCollapsed && <span>Poker</span>}
                        </button>
                    </div>
                </nav>

                {!sidebarCollapsed && (
                    <div className="gb-profile-info">
                        <div className="gb-user-info">
                            <div className="gb-user-avatar"></div>
                            <span className="gb-user-name">{userName}</span>
                        </div>
                        <div className="gb-balance-display">
                            <span className="gb-balance-label">Balance</span>
                            <span className="gb-balance-amount">${balance.toLocaleString()}</span>
                        </div>
                        <button className="gb-deposit-button" onClick={onDeposit}>
                            Depositar
                        </button>
                    </div>
                )}

                {!sidebarCollapsed && (
                    <div className="gb-promo-banner">
                        <span className="gb-promo-text">Bono VIP</span>
                        <span className="gb-promo-details">50% Cashback</span>
                    </div>
                )}
            </div>

            <main className="gb-game-slot">
                {children}
            </main>

            <footer className="gb-bottom-bar">
                <span className="gb-casino-name">Luxury Elegance Casino</span>
                <div className="gb-footer-links">
                    <a href="/contact" className="gb-footer-link">Contacto</a>
                    <a href="/terms" className="gb-footer-link">Términos</a>
                    <a href="/privacy" className="gb-footer-link">Privacidad</a>
                    <a href="/help" className="gb-footer-link">Ayuda</a>
                </div>
            </footer>
        </div>
    );
};

export default GameBackground;