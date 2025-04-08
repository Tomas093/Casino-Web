import React, { useState, useEffect } from 'react';
import SidebarExtra from './SidebarExtra.tsx';
import './HomeStyle.css';
import slotImg from './assets/slots.jpg';
import ruletaImg from './assets/ruleta.jpg';
import blackjackImg from './assets/blackjack.jpg';
import dadosImg from './assets/dados.jpg';
import Footer from './Footer';

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

                <section className="games-section-home">
                    <h2 className="section-title-home">🎮 Nuestros Juegos</h2>
                    <div className="games-grid-home">
                        {/*slotImg, ruletaImg, blackjackImg, dadosImg*/}
                        <div className="game-card-home game-1">
                            <div className="game-image-container">
                                <img src={ruletaImg} alt="Ruleta" />
                                <button className="play-button">Jugar</button>
                            </div>
                            <h3>Ruleta</h3>
                        </div>

                        <div className="game-card-home game-2">
                            <div className="game-image-container">
                                <img src={slotImg} alt="Slots" />
                                <button className="play-button">Jugar</button>
                            </div>
                            <h3>Slots</h3>
                        </div>

                        <div className="game-card-home game-3">
                            <div className="game-image-container">
                                <img src={blackjackImg} alt="BlackJack" />
                                <button className="play-button">Jugar</button>
                            </div>
                            <h3>BlackJack</h3>
                        </div>

                        <div className="game-card-home game-4">
                            <div className="game-image-container">
                                <img src={dadosImg} alt="Dados" />
                                <button className="play-button">Jugar</button>
                            </div>
                            <h3>Dados</h3>
                        </div>

                        <div className="game-card-home game-5">
                            <div className="game-image-container">
                                <img src={blackjackImg} alt="Buscaminas" />
                                <button className="play-button">Jugar</button>
                            </div>
                            <h3>Buscaminas</h3>
                        </div>

                    </div>
                </section>
            </main>
            <Footer />

        </div>

);
};

export default Home;
