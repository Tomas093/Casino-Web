import React, { useRef, useEffect } from 'react';
import './HomeDefStyle.css';
import slotImg from './assets/slots.jpg';
import ruletaImg from './assets/ruleta.jpg';
import blackjackImg from './assets/blackjack.jpg';
import dadosImg from './assets/dados.jpg';
import AnimatedCounter from "./AnimatedCounter";
import Footer from './Footer';
// import ParallaxBackground from './ParallaxBackground';

// Componente de tarjeta de juego
// @ts-ignore
const GameCard = ({ title, image }) => {
    return (
        <div className="game-card hover-card">
            <div className="game-card-inner">
                <img src={image} alt={title} className="game-card-image" />
                <div className="game-card-overlay">
                    <h3 className="game-card-title">{title}</h3>
                    <button className="game-card-button">Jugar ahora</button>
                </div>
            </div>
        </div>
    );
};

// Componente de indicador estadístico
// @ts-ignore
const StatIndicator = ({ icon, value, label }) => {
    return (
        <div className="stat-indicator">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
};

// Componente principal de la página
const HomeDef = () => {
    // Referencias para el efecto de scroll con zoom
    const containerRef = useRef(null);
    const showcaseRef = useRef(null);

    // Lista de juegos de ejemplo
    const games = [
        { id: 1, title: "Ruleta VIP", image: ruletaImg },
        { id: 2, title: "BlackJack", image: blackjackImg },
        { id: 3, title: "Slots", image: slotImg },
        { id: 4, title: "Dados", image: dadosImg },
        { id: 5, title: "Ruleta VIP", image: ruletaImg },
        { id: 6, title: "BlackJack", image: blackjackImg },
        { id: 7, title: "Slots", image: slotImg},
        { id: 8, title: "Dados", image: dadosImg }
    ];

    // Efecto para el scroll con zoom
    useEffect(() => {
        const container = containerRef.current;
        const showcase = showcaseRef.current;

        if (!container || !showcase) return;

        const handleMouseMove = (e) => {
            const containerWidth = container.offsetWidth;
            const mouseX = e.clientX - container.getBoundingClientRect().left;
            const percent = mouseX / containerWidth;

            const maxScroll = showcase.scrollWidth - containerWidth;
            const scrollX = maxScroll * percent;

            showcase.style.transform = `translateX(${-scrollX}px)`;

            const cards = showcase.querySelectorAll('.hover-card');

            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const distance = Math.abs(centerX - e.clientX);
                const scale = Math.max(0.95, 1 - distance / 800);
                card.style.transform = `scale(${scale})`;
            });
        };

        const handleMouseLeave = () => {
            showcase.style.transform = `translateX(0)`;
            const cards = showcase.querySelectorAll('.hover-card');
            cards.forEach(card => {
                card.style.transform = `scale(1)`;
            });
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div className="homepage">
            <header className="header">
                <div className="logo">Australis Casino</div>
                <nav className="main-nav">
                    <ul>
                        <li><a href="#" className="nav-link">Inicio</a></li>
                        <li><a href="#" className="nav-link">Juegos</a></li>
                        <li><a href="#" className="nav-link">Promociones</a></li>
                        <li><a href="#" className="nav-link">VIP</a></li>
                        <li><a href="#" className="nav-link">Ayuda</a></li>
                    </ul>
                </nav>
                <div className="auth-buttons">
                    <button className="btn-login">Iniciar Sesión</button>
                    <button className="btn-register">Registrarse</button>
                </div>
            </header>

            <section className="hero-section-def">
                {/*<ParallaxBackground />*/}
                <div className="hero-content-def">

                </div>
            </section>

            {/* Sección de juegos con la funcionalidad de scroll con zoom */}
            <section className="games-section">
                <h2 className="section-title">NUESTROS JUEGOS EXCLUSIVOS</h2>
                <div ref={containerRef} className="scroll-container">
                    <div ref={showcaseRef} className="scroll-showcase">
                        {games.map(game => (
                            <GameCard key={game.id} title={game.title} image={game.image} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <h2 className="section-title">ESTADÍSTICAS</h2>
                <div className="stats-container">
                    <StatIndicator
                        icon="💰"
                        value={<AnimatedCounter end={1500000} prefix="$" />}
                        label="Pozo acumulado"
                    />
                    <StatIndicator
                        icon="👥"
                        value={<AnimatedCounter end={2345} />}
                        label="Jugadores online"
                    />
                    <StatIndicator
                        icon="🏆"
                        value={<AnimatedCounter end={250000} prefix="$" />}
                        label="Mayor premio del día"
                    />
                </div>
            </section>
            <section className="about-section">
                <h2 className="section-title">QUIENES SOMOS</h2>
                <div className="about-container">
                    <div className="about-content">
                        <h3 className="about-subtitle">EXCELENCIA EN ENTRETENIMIENTO DESDE 2010</h3>
                        <p className="about-text">
                            Australis Casino nació con una visión clara: revolucionar la experiencia de juego online combinando tecnología de vanguardia con la elegancia de los casinos tradicionales.
                        </p>
                        <p className="about-text">
                            Con más de una década de experiencia en la industria, nos hemos consolidado como líderes en el mercado de entretenimiento digital, ofreciendo a nuestros usuarios una plataforma segura, transparente y emocionante.
                        </p>
                        <p className="about-text">
                            Nuestro equipo está formado por expertos en desarrollo de software, seguridad informática y atención al cliente, comprometidos con ofrecer una experiencia de juego excepcional las 24 horas del día.
                        </p>
                    </div>
                    <div className="about-features">
                        <div className="feature-item">
                            <div className="feature-icon">🔒</div>
                            <h4 className="feature-title">Seguridad Garantizada</h4>
                            <p className="feature-text">Utilizamos tecnología de encriptación avanzada para proteger sus datos y transacciones.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏆</div>
                            <h4 className="feature-title">Juego Responsable</h4>
                            <p className="feature-text">Promovemos prácticas de juego saludables y ofrecemos herramientas de control personal.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">💎</div>
                            <h4 className="feature-title">Innovación Constante</h4>
                            <p className="feature-text">Actualizamos regularmente nuestra plataforma con los últimos avances tecnológicos.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HomeDef;