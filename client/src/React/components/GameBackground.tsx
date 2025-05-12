import React, { useState, useEffect, useRef } from 'react';
import '@css/GameBackgroundStyle.css';
import { useUser } from "@context/UserContext.tsx";
import { useAuth } from '@context/AuthContext';
import { Link } from 'react-router-dom';
import { useAdmin } from "@context/AdminContext.tsx";

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
                                                               { label: "Ruleta", id: "roulette", icon: "gb-icon-roulette" },
                                                               { label: "Slots", id: "slots", icon: "gb-icon-slots" },
                                                               { label: "Mines", id: "mines", icon: "gb-icon-poker" }
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
    const { user, logout } = useAuth();
    const { client } = useUser();
    const { isSuperAdmin, isAdmin } = useAdmin();
    const [clientBalance, setClientBalance] = useState(0);
    const [displayName, setDisplayName] = useState(userName || "Usuario");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [superAdminStatus, setSuperAdminStatus] = useState(false);
    const [adminStatus, setAdminStatus] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            setDisplayName(user.nombre);
        }
    }, [user, userName]);

    // Verifica el estado de admin/superadmin
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (user) {
                const superadminStatus = await isSuperAdmin();
                const adminStatus = await isAdmin();
                setSuperAdminStatus(superadminStatus);
                setAdminStatus(adminStatus);
            } else {
                setSuperAdminStatus(false);
                setAdminStatus(false);
            }
        };
        checkAdminStatus();
    }, [user, isSuperAdmin, isAdmin]);

    // Cerrar dropdown al hacer clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
            setDropdownOpen(false);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
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
                <h1 className="gb-game-title">{currentGame}</h1>
                <div className="gb-controls">

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
                            <div className="gb-user-dropdown" ref={dropdownRef}>
                                <div
                                    className="gb-user-info"
                                    onClick={toggleDropdown}
                                    aria-expanded={dropdownOpen}
                                    aria-haspopup="true"
                                >
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

                                    {/* Icono para indicar dropdown */}
                                    <i className={`gb-dropdown-arrow ${dropdownOpen ? 'gb-dropdown-arrow-up' : 'gb-dropdown-arrow-down'}`}></i>
                                </div>

                                {dropdownOpen && (
                                    <div className="gb-dropdown-content gb-dropdown-side">
                                        <Link to="/profile" className="gb-dropdown-link">
                                            Mi Perfil
                                        </Link>
                                        {(adminStatus || superAdminStatus) && (
                                            <Link to="/tickets" className="gb-dropdown-link">
                                                Tickets
                                            </Link>
                                        )}
                                        {superAdminStatus && (
                                            <Link to="/admin" className="gb-dropdown-link">
                                                Panel Admin
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="gb-logout-btn">
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
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