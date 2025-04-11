import React, { useState, useEffect, useRef } from 'react';
import SidebarExtra from './SidebarExtra.tsx';
import './HomeStyle.css';
import slotImg from './assets/slots.jpg';
import ruletaImg from './assets/ruleta.jpg';
import blackjackImg from './assets/blackjack.jpg';
import dadosImg from './assets/dados.jpg';
import Footer from './Footer';
import AnimatedCounter from './AnimatedCounter';

// Imágenes y frases promocionales
const images = [slotImg, ruletaImg, blackjackImg, dadosImg];
const promoPhrases = [
    "🎰 ¡La suerte está echada!",
    "🤑 Ganá grande o volvé a intentarlo.",
    "♠️ Tu juego comienza ahora.",
    "🔥 ¡Jackpots cada hora!",
    "💰 El premio mayor te espera",
    "🎲 Apuesta, gana, celebra"
];

const Home: React.FC = () => {
    const [activeImage, setActiveImage] = useState(0);
    const [,setCurrentPhrase] = useState(0);
    const [showBanner, setShowBanner] = useState(true);

    // Referencias para el efecto de scroll con zoom
    const containerRef = useRef<HTMLDivElement>(null);
    const showcaseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Intervalo para cambiar la imagen activa
        const imageInterval = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % images.length);
        }, 5000);

        // Intervalo para cambiar la frase promocional
        const phraseInterval = setInterval(() => {
            setCurrentPhrase((prev) => (prev + 1) % promoPhrases.length);
        }, 3500);

        // Temporizador para cerrar el banner automáticamente
        const bannerTimeout = setTimeout(() => {
            setShowBanner(false);
        }, 8000);

        return () => {
            clearInterval(imageInterval);
            clearInterval(phraseInterval);
            clearTimeout(bannerTimeout);
        };
    }, []);

    // Efecto para el scroll con zoom
    useEffect(() => {
        const container = containerRef.current;
        const showcase = showcaseRef.current;

        if (!container || !showcase) return;

        const handleMouseMove = (e: MouseEvent) => {
            const containerWidth = container.offsetWidth;
            const mouseX = e.clientX - container.getBoundingClientRect().left;
            const percent = mouseX / containerWidth;

            const maxScroll = showcase.scrollWidth - containerWidth;
            const scrollX = maxScroll * percent;

            showcase.style.transform = `translateX(${-scrollX}px)`;

            const cards = showcase.querySelectorAll('.hover-card') as NodeListOf<HTMLDivElement>;

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
            const cards = showcase.querySelectorAll('.hover-card') as NodeListOf<HTMLDivElement>;
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
        <div className="casino-app">
            {showBanner && (
                <div className="promo-banner">
                    <div className="banner-content">
                        <span className="banner-text">¡BONO DE BIENVENIDA! 200% EN TU PRIMER DEPÓSITO</span>
                        <button className="banner-btn">RECLAMAR</button>
                    </div>
                    <button className="banner-close" onClick={() => setShowBanner(false)}>×</button>
                </div>
            )}

            <div className="container">
                <SidebarExtra />

                <main className="main-content">
                    <header className="content-header">
                        <div className="title-container">
                            <h1 className="page-title">Australis Casino</h1>
                            <h2 className="page-subtitle">Donde tus sueños se hacen realidad</h2>
                        </div>

                        <div className="user-actions">
                            <button className="action-btn deposit-btn">Depositar</button>
                            <button className="action-btn withdraw-btn">Retirar</button>
                        </div>
                    </header>

                    <section className="hero-section">
                        <div className="carousel-container">
                            <div className="carousel-wrapper">
                                {images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`carousel-slide ${index === activeImage ? 'active' : ''}`}
                                        style={{ backgroundImage: `url(${img})` }}
                                    >
                                        <div className="slide-content">
                                            <h3 className="slide-title">{promoPhrases[index % promoPhrases.length]}</h3>
                                            <button className="slide-btn">JUGAR AHORA</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="carousel-dots">
                                {images.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`dot ${index === activeImage ? 'active' : ''}`}
                                        onClick={() => setActiveImage(index)}
                                    ></span>
                                ))}
                            </div>
                            <button className="carousel-arrow prev" onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}>❮</button>
                            <button className="carousel-arrow next" onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}>❯</button>
                        </div>
                    </section>

                    <section className="quick-stats">
                        <div className="stat-item">
                            <span className="stat-value">
                                <AnimatedCounter end={1289540} prefix="$" />
                            </span>
                            <span className="stat-label">Jackpot Total</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                <AnimatedCounter end={8432} />
                            </span>
                            <span className="stat-label">Jugadores Online</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                <AnimatedCounter end={86219} prefix="$" />
                            </span>
                            <span className="stat-label">Ganado Hoy</span>
                        </div>
                    </section>


                    <section className="scroll-zoom-games">
                        <h2 className="section-title">✨ Juegos Exclusivos</h2>
                        <div ref={containerRef} className="scroll-container">
                            <div ref={showcaseRef} className="scroll-showcase">
                                {[slotImg, ruletaImg, blackjackImg, dadosImg, slotImg, ruletaImg, blackjackImg, dadosImg, slotImg, ruletaImg].map((img, i) => (
                                    <div key={i} className="hover-card relative">
                                        <img
                                            src={img}
                                            alt={`Juego ${i + 1}`}
                                            className="hover-card-img"
                                        />
                                        <div className="game-overlay">
                                            <button className="play-now">JUGAR</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>



                    <section className="advantage-section">
                        <div className="advantage-card">
                            <div className="advantage-icon">🔒</div>
                            <h3>Seguridad Garantizada</h3>
                            <p>Tus datos y dinero siempre protegidos</p>
                        </div>
                        <div className="advantage-card">
                            <div className="advantage-icon">💸</div>
                            <h3>Retiros Rápidos</h3>
                            <p>Recibe tus ganancias en 24 horas</p>
                        </div>
                        <div className="advantage-card">
                            <div className="advantage-icon">🎁</div>
                            <h3>Bonos Diarios</h3>
                            <p>Nuevas promociones todos los días</p>
                        </div>
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Home;