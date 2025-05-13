import React from 'react';
import '@css/FooterStyle.css';
import {FaFacebookF, FaGithub, FaHeadset, FaInstagram, FaMapMarkerAlt, FaPhone, FaYoutube} from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-main">
                <div className="footer-section footer-aboutUs">
                    <h3>Sobre Nosotros</h3>
                    <ul>
                        <li><a href="/terms">Términos y Condiciones</a></li>
                        <li><a href="/privacy-policy">Política de Privacidad</a></li>
                        <li><a href="/aboutUs">Quiénes Somos</a></li>
                    </ul>
                </div>

                <div className="footer-section footer-Games">
                    <h3>Juegos</h3>
                    <ul>
                        <li><a href="/slots">Slots</a></li>
                        <li><a href="/ruleta">Ruleta</a></li>
                        <li><a href="/blackjack">Blackjack</a></li>
                        <li><a href="/mines">Mines</a></li>
                    </ul>
                </div>

                <div className="footer-section footer-Contact">
                    <h3>Contacto</h3>
                    <ul>
                        <li><a href="/support"><FaHeadset className="icon" />Soporte</a></li>
                        <li><a href="tel:+123456789"><FaPhone className="icon" /> +54 91130893524</a></li>
                        <li><a href="https://www.google.com/maps/place/X5113+Salsipuedes,+C%C3%B3rdoba/@-31.1368955,-64.3067547,15z/data=!3m1!4b1!4m6!3m5!1s0x943281c901c86055:0xd2bd0375d8425052!8m2!3d-31.1368964!4d-64.2964335!16s%2Fg%2F11bx5q1ddj?hl=es&entry=ttu&g_ep=EgoyMDI1MDQzMC4xIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer"><FaMapMarkerAlt className="icon" /> Argentina, Córdoba</a></li>
                    </ul>
                </div>

                <div className="footer-section footer-legal">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/legal">Licencia</a></li>
                        <li><a href="/legal">Juego Responsable</a></li>
                        <li><a href="/legal">Seguridad y Garantías</a></li>
                    </ul>
                </div>

                <div className="footer-section footer-socialMedia">
                    <h3>Redes Sociales</h3>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        <a href="https://www.instagram.com/tomasmonteiro._/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://github.com/Tomas093/Casino-Web" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                        <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
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
