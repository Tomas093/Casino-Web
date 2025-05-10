import React, { useState, useEffect } from 'react';
import '@css/GameBackgroundStyle.css';
import { useUser } from "@context/UserContext.tsx";
import { useAuth } from '@context/AuthContext';

// Define los tipos para los juegos de navegación
interface GameLink {
    label: string;
    id: string;
    icon: string;
}

// Define los tipos para los enlaces del footer
interface FooterLink {
    label: string;
    href: string;
}

// Props para nuestro componente GameBackground configurable
interface GameBackgroundProps {
    children: React.ReactNode;
    currentGame?: string;
    userName?: string;
    // Este balance ahora es opcional y se puede obtener del contexto
    onNavigate?: (destination: string) => void;
    onDeposit?: () => void;
    onExit?: () => void;
    onSettings?: () => void;

    // Nuevas props configurables
    gameLinks?: GameLink[];
    footerLinks?: FooterLink[];
    showBalance?: boolean;
    showProfile?: boolean;
    showSidebar?: boolean;
    initialSidebarState?: 'expanded' | 'collapsed';
    showLogo?: boolean;
    logoText?: string;
    casinoName?: string;
    depositButtonLabel?: string;
    exitButtonLabel?: string;
    balanceLabel?: string;
    homeButtonLabel?: string;
    defaultUserAvatar?: string;
    variant?: 'dark' | 'light';
    className?: string;
    // Nueva prop para determinar si usar el balance del contexto
}

const GameBackground: React.FC<GameBackgroundProps> = ({
                                                           children,
                                                           currentGame = "Casino Game",
                                                           userName,
                                                           onNavigate = () => {},
                                                           onDeposit = () => {},
                                                           onExit = () => {},
                                                           onSettings = () => {},

                                                           // Valores por defecto para las nuevas props
                                                           gameLinks = [
                                                               { label: "Blackjack", id: "blackjack", icon: "gb-icon-cards" },
                                                               { label: "Ruleta", id: "roulette", icon: "gb-icon-roulette" },
                                                               { label: "Slots", id: "slots", icon: "gb-icon-slots" },
                                                               { label: "Poker", id: "poker", icon: "gb-icon-poker" }
                                                           ],
                                                           footerLinks = [
                                                               { label: "Contacto", href: "/legal" },
                                                               { label: "Términos", href: "/terms" },
                                                               { label: "Privacidad", href: "/privacy-policy" },
                                                               { label: "Ayuda", href: "/help" }
                                                           ],
                                                           showBalance = true,
                                                           showProfile = true,
                                                           showSidebar = true,
                                                           initialSidebarState = 'expanded',
                                                           showLogo = true,
                                                           logoText = "LE",
                                                           casinoName = "Australis Casino",
                                                           depositButtonLabel = "Depositar",
                                                           exitButtonLabel = "Salir",
                                                           balanceLabel = "Balance",
                                                           homeButtonLabel = "Inicio",
                                                           defaultUserAvatar = '', // URL para avatar por defecto
                                                           variant = 'dark',
                                                           className = '',
                                                       }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarState === 'collapsed');
    const { user } = useAuth();
    const { client } = useUser();
    const [clientBalance, setClientBalance] = useState(0);
    const [displayName, setDisplayName] = useState(userName || "Usuario");

    // Actualiza el balance cuando cambia el cliente (igual que en NavBar)
    useEffect(() => {
        if (client) {
            setClientBalance(client.balance);
        }
    }, [client]);

    // Actualiza el nombre de usuario cuando cambia el usuario
    useEffect(() => {
        if (user && !userName) {
            setDisplayName(user.nombre);
        } else if (userName) {
            setDisplayName(userName);
        }
    }, [user, userName]);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Generar la clase basada en la variante
    const containerClass = `gb-container gb-${variant} ${className}`.trim();

    return (
        <div className={containerClass}>
            <div className="gb-background-patterns">
                <div className="gb-pattern-radial"></div>
                <div className="gb-pattern-grid"></div>
            </div>

            <header className="gb-top-bar">
                {showLogo && (
                    <div className="gb-logo">
                        <span>{logoText}</span>
                    </div>
                )}
                <h1 className="gb-game-title">{currentGame}</h1>
                <div className="gb-controls">
                    <button className="gb-control-button" onClick={onSettings} aria-label="Configuración">
                        <i className="gb-icon-settings"></i>
                    </button>
                    <button className="gb-control-button gb-exit-button" onClick={onExit} aria-label="Salir del juego">
                        <i className="gb-icon-exit"></i>
                        <span>{exitButtonLabel}</span>
                    </button>
                </div>
            </header>

            {showSidebar && (
                <div className={`gb-sidebar ${sidebarCollapsed ? 'gb-sidebar-collapsed' : ''}`}>
                    <button
                        className="gb-sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
                        aria-expanded={!sidebarCollapsed}
                    >
                        {sidebarCollapsed ? '›' : '‹'}
                    </button>

                    <nav className="gb-navigation" role="navigation" aria-label="Navegación de juegos">
                        <button
                            className="gb-nav-button gb-home-button"
                            onClick={() => onNavigate('home')}
                            aria-label={homeButtonLabel}
                        >
                            <i className="gb-icon-home"></i>
                            {!sidebarCollapsed && <span>{homeButtonLabel}</span>}
                        </button>

                        <div className="gb-game-buttons">
                            {gameLinks.map((game, index) => (
                                <button
                                    key={index}
                                    className="gb-nav-button"
                                    onClick={() => onNavigate(game.id)}
                                    aria-label={game.label}
                                >
                                    <i className={game.icon}></i>
                                    {!sidebarCollapsed && <span>{game.label}</span>}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {!sidebarCollapsed && showProfile && (
                        <div className="gb-profile-info">
                            <div className="gb-user-info">
                                <div
                                    className="gb-user-avatar"
                                    style={
                                        user && user.img
                                            ? { backgroundImage: `url(http://localhost:3001${user.img})` }
                                            : defaultUserAvatar
                                                ? { backgroundImage: `url(${defaultUserAvatar})` }
                                                : undefined
                                    }
                                ></div>
                                <span className="gb-user-name">{displayName}</span>
                            </div>
                            {showBalance && (
                                <div className="gb-balance-display">
                                    <span className="gb-balance-label">{balanceLabel}</span>
                                    <span className="gb-balance-amount">🪙 {clientBalance}</span>
                                </div>
                            )}
                            <button
                                className="gb-deposit-button"
                                onClick={onDeposit}
                                aria-label={depositButtonLabel}
                            >
                                {depositButtonLabel}
                            </button>
                        </div>
                    )}

                </div>
            )}

            <main className="gb-game-slot">
                {children}
            </main>

            <footer className="gb-bottom-bar">
                <span className="gb-casino-name">{casinoName}</span>
                <div className="gb-footer-links">
                    {footerLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            className="gb-footer-link"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default GameBackground;