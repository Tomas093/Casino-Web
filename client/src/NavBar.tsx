import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBarStyle.css';

const NavBar: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="logo">Australis Casino</div>

            <div className={`hamburger-menu ${mobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>

            <div className="nav-links">
                <a href="#features">Características</a>
                <a href="#games">Juegos</a>
                <a href="#promos">Promociones</a>
                <Link to="/login" className="nav-btn login-btn">Iniciar Sesión</Link>
            </div>

            <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                <a href="#features" onClick={toggleMobileMenu}>Características</a>
                <a href="#games" onClick={toggleMobileMenu}>Juegos</a>
                <a href="#promos" onClick={toggleMobileMenu}>Promociones</a>
                <Link to="/login" className="nav-btn login-btn" onClick={toggleMobileMenu}>Iniciar Sesión</Link>
            </div>
        </nav>
    );
};

export default NavBar;