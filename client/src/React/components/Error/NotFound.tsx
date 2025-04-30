import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from "@components/NavBar";
import Footer from '@components/Footer';
import { motion } from 'framer-motion';
import '@css/LandingPageStyle.css';

const NotFound: React.FC = () => {
    const [rollResult, setRollResult] = useState<number>(0);
    const [isRolling, setIsRolling] = useState<boolean>(false);

    const rollDice = () => {
        setIsRolling(true);

        // Animate the dice roll
        let rollCount = 0;
        const maxRolls = 10;
        const rollInterval = setInterval(() => {
            setRollResult(Math.floor(Math.random() * 6) + 1);
            rollCount++;

            if (rollCount >= maxRolls) {
                clearInterval(rollInterval);
                setIsRolling(false);
                setRollResult(4);  // Always end on 4 for "404"
            }
        }, 150);
    };

    useEffect(() => {
        // Roll the dice when component mounts
        rollDice();
    }, []);

    return (
        <div className="landing-container">
            <NavBar />

            <section className="hero-section" style={{ minHeight: '80vh' }}>
                <div className="hero-background">
                    <div className="overlay"></div>
                </div>

                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-title">404</h1>
                    <h2 className="hero-subtitle">Página no encontrada</h2>

                    <div className="error-container" style={{ margin: '30px 0' }}>
                        <motion.div
                            className="dice"
                            style={{
                                width: '100px',
                                height: '100px',
                                backgroundColor: '#ffd700',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                color: '#000',
                                margin: '0 auto',
                                cursor: 'pointer',
                                boxShadow: '0 5px 15px rgba(255, 215, 0, 0.5)'
                            }}
                            onClick={rollDice}
                            animate={{
                                rotate: isRolling ? [0, 90, 180, 270, 360] : 0,
                                scale: isRolling ? [1, 1.1, 1] : 1
                            }}
                            transition={{
                                duration: isRolling ? 0.5 : 0,
                                repeat: isRolling ? 3 : 0
                            }}
                        >
                            {rollResult}
                        </motion.div>
                    </div>

                    <p className="hero-description">
                        Lo sentimos, parece que has apostado por una página que no existe.
                        <br />La suerte no está de tu lado esta vez, pero siempre puedes volver a intentarlo.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/" className="hero-btn primary-btn">
                            Volver al Casino
                        </Link>
                        <button onClick={rollDice} className="hero-btn secondary-btn">
                            Tirar de nuevo
                        </button>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
};

export default NotFound;