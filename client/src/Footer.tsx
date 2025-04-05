import React from 'react';
import { Link } from 'react-router-dom';
import './FooterStyle.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy;Australis Casino - Solo para mayores de 18 años - Juegue responsablemente.</p>
                <div className="footer-links">
                    <Link to="/terms">Términos y Condiciones</Link>
                    <Link to="/privacy">Política de Privacidad</Link>
                    <Link to="/contact">Contacto</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
