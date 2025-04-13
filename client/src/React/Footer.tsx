import React from 'react';
import '../Css/FooterStyle.css';
import {
    FaFacebookF,
    FaInstagram,
    FaYoutube,
    FaHeadset,
    FaPhone,
    FaMapMarkerAlt,
    FaGithub
} from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-main">
                <div className="footer-section footer-aboutUs">
                    <h3>Sobre Nosotros</h3>
                    <ul>
                        <li><a href="/terminos">Términos y Condiciones</a></li>
                        <li><a href="/privacidad">Política de Privacidad</a></li>
                        <li><a href="/nosotros">Quiénes Somos</a></li>
                    </ul>
                </div>

                <div className="footer-section footer-Games">
                    <h3>Juegos</h3>
                    <ul>
                        <li><a href="/slots">Slots</a></li>
                        <li><a href="/ruleta">Ruleta</a></li>
                        <li><a href="/blackjack">Blackjack</a></li>
                        <li><a href="/poker">Poker</a></li>
                    </ul>
                </div>

                <div className="footer-section footer-Contact">
                    <h3>Contacto</h3>
                    <ul>
                        <li><a href="/soporte"><FaHeadset className="icon" />Soporte</a></li>
                        <li><a href="tel:+123456789"><FaPhone className="icon" /> +54 91130893524</a></li>
                        <li><a href="/ubicacion"><FaMapMarkerAlt className="icon" /> Buenos Aires, Argentina</a></li>
                    </ul>
                </div>

                <div className="footer-section footer-legal">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/licencia">Licencia</a></li>
                        <li><a href="/juego-responsable">Juego Responsable</a></li>
                        <li><a href="/seguridad">Seguridad y Garantías</a></li>
                    </ul>
                </div>

                <div className="footer-section footer-socialMedia">
                    <h3>Redes Sociales</h3>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://github.com/Tomas093/Casino-Web" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
                    </div>
                </div>
            </div>

            <div className="footer-divider"></div>

            <div className="footer-copyright">
                <p>&copy; 2025 Australis Casino. Todos los derechos reservados.</p>
                <p className="footer-disclaimer">Solo para mayores de 18 años. Juegue con responsabilidad.</p>
            </div>
        </footer>
    );
};

export default Footer;
