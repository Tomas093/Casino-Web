import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '@context/AuthContext';
import '@css/NavBarStyle.css';
import {useUser} from "@context/UserContext.tsx";
import {useAdmin} from "@context/AdminContext.tsx";
import NotificationDropdown from '@components/Notification.tsx';
import notificationApi from "@api/notificationApi.ts";

interface NavLink {
    label: string;
    href: string;
    isAnchor?: boolean; // Si es true, es un enlace interno con #
}

// Props para nuestro componente NavBar configurable
interface NavBarProps {
    navLinks?: NavLink[];
    logo?: string;
    logoText?: string;
    className?: string;
    showBalance?: boolean;
    variant?: 'light' | 'dark'; // Para diferentes estilos de navegación
    playButtonLabel?: string;
    loginButtonLabel?: string;
    registerButtonLabel?: string;
    onPlayClick?: () => void;
    homeSectionId?: string; // ID de la sección de juegos en Home para scroll
    targetSection?: string; // Nueva prop para especificar la sección destino
}

interface NotificationProps {
    count?: number;
    refreshCount?: () => void;
}

const NotificationBell: React.FC<NotificationProps> = ({count = 0, refreshCount}) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);


    // Close notifications when clicking outside and refresh count
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
                // Refresh count when closing as notifications may have been read
                if (refreshCount) {
                    refreshCount();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [refreshCount]);

    const toggleNotifications = () => {
        setNotificationsOpen(prev => !prev);
    };

    return (
        <div className="navbar-notification-container" ref={notificationRef}>
            <div className="navbar-notification-bell" onClick={toggleNotifications}>
                <span className="bell-icon">🔔</span>
                {count > 0 && <span className="notification-count">{count}</span>}
            </div>

            {notificationsOpen && (
                <div className="navbar-notification-dropdown">
                    <NotificationDropdown/>
                </div>
            )}
        </div>
    );
};

const NavBar: React.FC<NavBarProps> = ({
                                           navLinks = [
                                               {label: "Juegos", href: "#games", isAnchor: true},
                                               {label: "Promociones", href: "#promos", isAnchor: true},
                                               {label: "Nosotros", href: "/aboutUs", isAnchor: true}
                                           ],
                                           logo = "",
                                           logoText = "Australis Casino",
                                           className = "",
                                           showBalance = true,
                                           variant = 'dark',
                                           playButtonLabel = "Jugar",
                                           loginButtonLabel = "Iniciar Sesión",
                                           registerButtonLabel = "Registrarse",
                                           onPlayClick,
                                           homeSectionId = "games-section-home",
                                           targetSection = ""
                                       }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const {user, logout} = useAuth();
    const {client} = useUser();
    const {isSuperAdmin, isAdmin} = useAdmin();
    const location = useLocation();
    const navigate = useNavigate();
    const [superAdminStatus, setSuperAdminStatus] = useState(false);
    const [adminStatus, setAdminStatus] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [notificationCount, setNotificationCount] = useState(0);

    // Force component to re-render when client changes
    const [clientBalance, setClientBalance] = useState(0);

    useEffect(() => {
        if (client) {
            setClientBalance(client.balance);
        }
    }, [client]);

    useEffect(() => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location]);

    // Fetch notification count with polling
    useEffect(() => {
        const fetchNotificationCount = async () => {
            if (user) {
                try {
                    const count = await notificationApi.countUnreadNotificationsByUserId(user.usuarioid);
                    setNotificationCount(count);
                } catch (error) {
                    console.error("Error fetching notification count:", error);
                }
            }
        };

        // Initial fetch
        fetchNotificationCount();

        // Set up polling interval (check every 30 seconds)
        const intervalId = setInterval(fetchNotificationCount, 30000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [user]);

    // Function to refresh notification count
    const refreshNotificationCount = async () => {
        if (user) {
            try {
                const count = await notificationApi.countUnreadNotificationsByUserId(user.usuarioid);
                setNotificationCount(count);
            } catch (error) {
                console.error("Error refreshing notification count:", error);
            }
        }
    };

    // Efecto para manejar el scroll a la sección después de la navegación
    useEffect(() => {
        // Verificar si estamos en la página Home y tenemos un hash en la URL
        if (location.pathname === '/home' && location.hash) {
            // Intentar encontrar el elemento con el ID del hash (sin el #)
            const sectionId = location.hash.substring(1);
            const element = document.getElementById(sectionId);

            if (element) {
                // Dar un pequeño tiempo para que la página se renderice completamente
                setTimeout(() => {
                    element.scrollIntoView({behavior: 'smooth'});
                }, 100);
            }
        }
    }, [location.pathname, location.hash]);

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

    useEffect(() => {
        // Cerrar dropdown al hacer clic fuera de él
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

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleLogout = async () => {
        try {
            await logout();
            setMobileMenuOpen(false);
            setDropdownOpen(false);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const handlePlayButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setMobileMenuOpen(false);

        // Si se proporciona una función onPlayClick personalizada, ejecútala
        if (onPlayClick) {
            onPlayClick();
            return;
        }

        // Si ya estamos en la página Home
        if (location.pathname === '/home') {
            // Si hay una sección específica, desplazarse hacia ella
            if (targetSection) {
                const element = document.getElementById(targetSection);
                if (element) {
                    element.scrollIntoView({behavior: 'smooth'});
                }
            } else if (homeSectionId) {
                // Usar la sección predeterminada
                const element = document.getElementById(homeSectionId);
                if (element) {
                    element.scrollIntoView({behavior: 'smooth'});
                }
            }
        } else {
            // Si no estamos en Home, navegar a Home con un hash para la sección si está definida
            const path = targetSection ? `/home#${targetSection}` : '/home';
            navigate(path);
        }
    };

    // Generar la clase basada en la variante
    const navbarClass = `main-navbar main-navbar-${variant} ${className}`.trim();

    return (
        <nav className={navbarClass} role="navigation" aria-label="Menú principal">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    {logo && <img src={logo} alt="Logo" className="navbar-logo-image"/>}
                    <span role="img" aria-label="casino icon" className="navbar-logo-icon"></span>
                    {logoText}
                </Link>

                <button
                    className={`navbar-hamburger ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Abrir menú"
                    aria-expanded={mobileMenuOpen}>

                    <span className="navbar-bar"></span>
                    <span className="navbar-bar"></span>
                    <span className="navbar-bar"></span>
                </button>

                <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                    {navLinks.map((link, index) => (
                        link.isAnchor ? (
                            <a
                                key={index}
                                href={link.href}
                                className="navbar-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={index}
                                to={link.href}
                                className="navbar-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}

                    {user ? (
                        <>
                            <button
                                className="navbar-btn navbar-play-btn"
                                onClick={handlePlayButtonClick}
                            >
                                {playButtonLabel}
                            </button>

                            {/* Notification Bell with refresh function */}
                            <NotificationBell
                                count={notificationCount}
                                refreshCount={refreshNotificationCount}
                            />

                            <div className="navbar-user-dropdown" ref={dropdownRef}>
                                <div
                                    className="navbar-user-info"
                                    onClick={toggleDropdown}
                                    aria-expanded={dropdownOpen}
                                    aria-haspopup="true"
                                >
                                    <img
                                        src={user.img ? `http://localhost:3001${user.img}` : '/default-avatar.jpg'}
                                        alt="Avatar del usuario"
                                        className="navbar-user-avatar"
                                    />
                                    <span className="navbar-username">{user.nombre}</span>
                                    {showBalance && <span className="navbar-user-coins">🪙 {clientBalance}</span>}
                                </div>
                                {dropdownOpen && (
                                    <div className="navbar-dropdown-content">
                                        <Link to="/profile" className="navbar-dropdown-link"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Mi Perfil
                                        </Link>
                                        {(adminStatus || superAdminStatus) && (
                                            <Link to="/tickets" className="navbar-dropdown-link"
                                                  onClick={() => setMobileMenuOpen(false)}>
                                                Tickets
                                            </Link>
                                        )}
                                        {superAdminStatus && (
                                            <Link to="/admin" className="navbar-dropdown-link"
                                                  onClick={() => setMobileMenuOpen(false)}>
                                                Panel Admin
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="navbar-logout-btn">
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-btn navbar-login-btn"
                                  onClick={() => setMobileMenuOpen(false)}>
                                {loginButtonLabel}
                            </Link>
                            <Link to="/register" className="navbar-btn navbar-register-btn"
                                  onClick={() => setMobileMenuOpen(false)}>
                                {registerButtonLabel}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;