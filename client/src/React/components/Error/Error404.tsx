import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@css/Error404Style.css';

const Error404: React.FC = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/home#games');
    };

    const handleGoLanding = () => {
        navigate('/');
    }

    useEffect(() => {
        const diceElements = document.querySelectorAll('.error404-dice');
        diceElements.forEach(dice => {
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            const randomDuration = 15 + Math.random() * 10;

            const element = dice as HTMLElement;
            element.style.animation = `error404-float ${randomDuration}s ease-in-out infinite`;
            element.style.transform = `translate(${randomX}px, ${randomY}px)`;
        });
    }, []);

    return (
        <div className="error404-page">
            <div className="error404-animated-dice">
                <div className="error404-dice error404-dice-1">🎲</div>
                <div className="error404-dice error404-dice-2">🎲</div>
                <div className="error404-dice error404-dice-3">🎲</div>
                <div className="error404-dice error404-dice-4">🎲</div>
                <div className="error404-dice error404-dice-5">🎲</div>
                <div className="error404-dice error404-dice-6">🎲</div>

                <div className="error404-casino-chip error404-chip-1"></div>
                <div className="error404-casino-chip error404-chip-2"></div>
                <div className="error404-casino-chip error404-chip-3"></div>

                <div className="error404-card error404-card-1">♠️</div>
                <div className="error404-card error404-card-2">♥️</div>

                <div className="error404-roulette"></div>
                <div className="error404-glow"></div>
            </div>

            <div className="error404-container">
                <h1 className="error404-code">404</h1>
                <h2 className="error404-title">¡Oops! Mesa cerrada</h2>
                <p className="error404-message">
                    Parece que has intentado acceder a una mesa que no existe.
                    La suerte no está de tu lado esta vez, pero siempre puedes
                    intentarlo en otras mesas.
                </p>

                <button className="error404-home-button" onClick={handleGoLanding}>
                    <span className="error404-button-icon material-icons-round">casino</span>
                    Volver al Casino
                </button>
                <div className="error404-try-luck" onClick={handleGoHome}>
                    ¿Quieres probar tu suerte?
                </div>

            </div>
        </div>
    );
};

export default Error404;
