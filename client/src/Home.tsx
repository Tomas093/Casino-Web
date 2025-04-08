import React, { useState, useEffect } from 'react';
import SidebarExtra from './SidebarExtra.tsx';
import './HomeStyle.css';
import slotImg from './assets/slots.jpg';
import ruletaImg from './assets/ruleta.jpg';
import blackjackImg from './assets/blackjack.jpg';
import dadosImg from './assets/dados.jpg';

const images = [slotImg, ruletaImg, blackjackImg, dadosImg];
const promoPhrases = [
    "🎰 ¡La suerte está echada!",
    "🤑 Ganá grande o volvé a intentarlo.",
    "♠️ Tu juego comienza ahora.",
    "🔥 ¡Jackpots cada hora!",
];

const Home: React.FC = () => {
    //const [filter, setFilter] = useState('all');
    const [activeImage, setActiveImage] = useState(0);
    const [currentPhrase, setCurrentPhrase] = useState(0);

    useEffect(() => {
        const imageInterval = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % images.length);
        }, 5000);

        const phraseInterval = setInterval(() => {
            setCurrentPhrase((prev) => (prev + 1) % promoPhrases.length);
        }, 5000);

        return () => {
            clearInterval(imageInterval);
            clearInterval(phraseInterval);
        };
    }, []);

    return (
        <div className="container">
            <SidebarExtra />

            <main className="main-content">
                <header className="content-header">
                    <h1 className="page-title">Australis Casino</h1>
                </header>

                {/* Reemplazo de Slideshow con carrusel estilo promo-card */}
                <section className="promo-section">
                    <div className="promo-slider">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className={`promo-card promo-img-only ${index === activeImage ? 'active' : ''}`}
                                style={{ backgroundImage: `url(${img})` }}
                            />
                        ))}
                        <div className="promo-indicators">
                            {images.map((_, index) => (
                                <span
                                    key={index}
                                    className={`indicator ${index === activeImage ? 'active' : ''}`}
                                    onClick={() => setActiveImage(index)}
                                ></span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="promo-text-below">{promoPhrases[currentPhrase]}</div>

                <section className="games-section">
                    <h2 className="section-title">🎮 Nuestros Juegos</h2>
                    <div className="games-grid">
                        <div className="game-card">
                            <img src={slotImg} alt="Slots" />
                            <h3>Slots</h3>
                        </div>
                        <div className="game-card">
                            <img src={ruletaImg} alt="Ruleta" />
                            <h3>Ruleta</h3>
                        </div>
                        <div className="game-card">
                            <img src={blackjackImg} alt="Blackjack" />
                            <h3>Blackjack</h3>
                        </div>
                        <div className="game-card">
                            <img src={dadosImg} alt="Dados" />
                            <h3>Dados</h3>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
