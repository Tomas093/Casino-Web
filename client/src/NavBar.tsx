import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './NavBarStyle.css';

const NavBar: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, client, logout, isSuperadmin } = useAuth();
    const location = useLocation();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location]);

    useEffect(() => {
        const checkSuperAdmin = async () => {
            if (user) {
                const superadminStatus = await isSuperadmin();
                setIsSuperAdmin(superadminStatus);
            } else {
                setIsSuperAdmin(false);
            }
        };
        checkSuperAdmin();
    }, [user, isSuperadmin]);

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

    return (
        <nav className="main-navbar" role="navigation" aria-label="Menú principal">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span role="img" aria-label="casino icon" className="navbar-logo-icon">🎰</span>
                    Australis Casino
                </Link>

                <button
                    className={`navbar-hamburger ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Abrir menú"
                    aria-expanded={mobileMenuOpen}
                >
                    <span className="navbar-bar"></span>
                    <span className="navbar-bar"></span>
                    <span className="navbar-bar"></span>
                </button>

                <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <a href="#games" className="navbar-link">Juegos</a>
                    <a href="#promos" className="navbar-link">Promociones</a>
                    <a href="#about" className="navbar-link">Nosotros</a>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="navbar-btn navbar-play-btn">Jugar</Link>
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
                                    <span className="navbar-user-coins">🪙 {client?.balance || 0}</span>
                                </div>
                                {dropdownOpen && (
                                    <div className="navbar-dropdown-content">
                                        <Link to="/profile" className="navbar-dropdown-link">Mi Perfil</Link>
                                        {isSuperAdmin && (
                                            <Link to="/admin" className="navbar-dropdown-link">Panel Admin</Link>
                                        )}
                                        <button onClick={handleLogout} className="navbar-logout-btn">Cerrar Sesión</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-btn navbar-login-btn">Iniciar Sesión</Link>
                            <Link to="/register" className="navbar-btn navbar-register-btn">Registrarse</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;