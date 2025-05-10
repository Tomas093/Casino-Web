import React from 'react';
import '@css/AboutUs.css';
import { Users, Trophy, Shield, Clock, ChevronRight } from 'lucide-react';

const AboutUs: React.FC = () => {
    return (
        <div className="australis-about-container">
            <div className="australis-hero-section">
                <div className="australis-overlay"></div>
                <div className="australis-hero-content">
                    <h1>Quiénes Somos</h1>
                    <div className="australis-separator">
                        <span className="australis-diamond"></span>
                    </div>
                    <p className="australis-tagline">Excelencia y Elegancia en el Juego Online</p>
                </div>
            </div>

            <div className="australis-vision-section">
                <div className="australis-section-container">
                    <h2>Nuestra <span className="australis-accent-text">Visión</span></h2>
                    <div className="australis-separator">
                        <span className="australis-diamond"></span>
                    </div>
                    <p>
                        Australis Casino nació con una visión clara: revolucionar la experiencia de juego online
                        combinando tecnología de vanguardia con la elegancia de los casinos tradicionales.
                        Nos esforzamos día a día para ofrecer una plataforma donde la emoción, la seguridad y
                        la excelencia en el servicio confluyen para crear la mejor experiencia de juego digital.
                    </p>
                </div>
            </div>

            <div className="australis-history-section">
                <div className="australis-section-container">
                    <div className="australis-two-columns">
                        <div className="australis-column">
                            <h2>Nuestra <span className="australis-accent-text">Historia</span></h2>
                            <div className="australis-separator australis-left-aligned">
                                <span className="australis-diamond"></span>
                            </div>
                            <p>
                                Con más de una década de experiencia en la industria, nos hemos consolidado como
                                líderes en el mercado de entretenimiento digital. Desde nuestros inicios en 2013,
                                hemos evolucionado constantemente, integrando las últimas innovaciones tecnológicas
                                y ampliando nuestra oferta de juegos para satisfacer incluso a los jugadores más exigentes.
                            </p>
                            <p>
                                Nuestro compromiso con la excelencia nos ha permitido expandirnos y establecernos como
                                un referente en el mundo de los casinos online, manteniendo siempre los más altos
                                estándares de calidad y seguridad.
                            </p>
                        </div>
                        <div className="australis-column australis-image-column">
                            <div className="australis-decorative-frame">
                                <div className="australis-inner-image"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="australis-values-section">
                <div className="australis-section-container">
                    <h2>Nuestros <span className="australis-accent-text">Valores</span></h2>
                    <div className="australis-separator">
                        <span className="australis-diamond"></span>
                    </div>
                    <div className="australis-values-grid">
                        <div className="australis-value-card">
                            <div className="australis-icon-container">
                                <Shield className="australis-icon" size={36} />
                            </div>
                            <h3>Seguridad</h3>
                            <p>Implementamos los más avanzados protocolos de encriptación y medidas de seguridad para proteger la información y transacciones de nuestros usuarios.</p>
                        </div>
                        <div className="australis-value-card">
                            <div className="australis-icon-container">
                                <Trophy className="australis-icon" size={36} />
                            </div>
                            <h3>Excelencia</h3>
                            <p>Buscamos la perfección en cada detalle, desde la interfaz de usuario hasta nuestro servicio de atención al cliente, para ofrecer una experiencia excepcional.</p>
                        </div>
                        <div className="australis-value-card">
                            <div className="australis-icon-container">
                                <Users className="australis-icon" size={36} />
                            </div>
                            <h3>Comunidad</h3>
                            <p>Valoramos a cada miembro de nuestra comunidad y trabajamos constantemente para crear un ambiente acogedor, justo y entretenido para todos.</p>
                        </div>
                        <div className="australis-value-card">
                            <div className="australis-icon-container">
                                <Clock className="australis-icon" size={36} />
                            </div>
                            <h3>Disponibilidad</h3>
                            <p>Ofrecemos una plataforma operativa las 24 horas del día, con un equipo de soporte siempre disponible para asistir a nuestros usuarios en cualquier momento.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="australis-team-section">
                <div className="australis-section-container">
                    <h2>Nuestro <span className="australis-accent-text">Equipo</span></h2>
                    <div className="australis-separator">
                        <span className="australis-diamond"></span>
                    </div>
                    <p className="australis-team-intro">
                        Nuestro equipo está formado por expertos en desarrollo de software, seguridad informática
                        y atención al cliente, comprometidos con ofrecer una experiencia de juego excepcional.
                        Contamos con profesionales apasionados que comparten nuestra visión de excelencia y están
                        dedicados a llevar la experiencia de juego online a un nivel superior.
                    </p>
                    <div className="australis-departments">
                        <div className="australis-department">
                            <h3>Desarrollo Tecnológico</h3>
                            <p>Especialistas en tecnologías de vanguardia que garantizan una plataforma fluida y de alto rendimiento.</p>
                        </div>
                        <div className="australis-department">
                            <h3>Seguridad Digital</h3>
                            <p>Expertos en ciberseguridad dedicados a mantener la integridad y confidencialidad de nuestros sistemas.</p>
                        </div>
                        <div className="australis-department">
                            <h3>Atención al Cliente</h3>
                            <p>Profesionales capacitados para brindar asistencia personalizada y resolver cualquier inquietud de forma eficiente.</p>
                        </div>
                        <div className="australis-department">
                            <h3>Diseño de Experiencia</h3>
                            <p>Creativos que trabajan para hacer cada interacción con nuestra plataforma intuitiva y agradable.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="australis-cta-section">
                <div className="australis-overlay"></div>
                <div className="australis-cta-content">
                    <h2>Únete a la Experiencia Australis</h2>
                    <p>Descubre por qué miles de jugadores confían en nosotros para vivir emociones inolvidables.</p>
                    <button className="australis-cta-button">
                        Comenzar Ahora <ChevronRight size={20} className="australis-button-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;