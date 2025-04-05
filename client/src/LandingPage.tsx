import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import './LandingPageStyle.css';
import './NavBarStyle.css';
import backgroundVideo from "./assets/backgroundVideo.mp4";
import { FaDice, FaCoins, FaTrophy, FaUserShield, FaChevronDown } from 'react-icons/fa';
import NavBar from "./NavBar.tsx";
import Footer from "./Footer.tsx";

const LandingPage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activePromo, setActivePromo] = useState(0);

    const promociones = [
        { titulo: "Bono de Bienvenida", descripcion: "¡100% en tu primer depósito hasta $500!", imagen: "promo1" },
        { titulo: "Cashback Semanal", descripcion: "Recupera el 15% de tus pérdidas cada semana", imagen: "promo2" },
        { titulo: "Giros Gratis", descripcion: "20 giros gratis en nuestros juegos premium", imagen: "promo3" }
    ];

    const juegos = [
        { id: 1, nombre: "Slots", descripcion: "La emoción de los giros", imagen: "game1" },
        { id: 2, nombre: "Ruleta Premium", descripcion: "La elegancia y el azar se combinan", imagen: "game2" },
        { id: 3, nombre: "Blackjack VIP", descripcion: "Estrategia y suerte al máximo nivel", imagen: "game3" },
        { id: 4, nombre: "Dado", descripcion: "100 posibilidades, una sola decisión: ¡Lánzalo y deja que el destino hable!", imagen: "game4" },
    ];

    useEffect(() => {
        setIsVisible(true);

        const interval = setInterval(() => {
            setActivePromo(prev => (prev + 1) % promociones.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const scrollToContent = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    /* con imagenes por las dudas
    const renderPromoCards = () => {
        return promociones.map((promo, index) => (
            <div key={index} className={`promo-card ${index === activePromo ? 'active' : ''}`}>
                <img src={`./assets/${promo.imagen}`} alt={promo.titulo} className="promo-image" />
                <h3>{promo.titulo}</h3>
                <p>{promo.descripcion}</p>
                <Link to="/register" className="promo-btn">Obtener Ahora</Link>
            </div>
        ));
    };
    */

    const renderPromoCards = () => {
        return promociones.map((promo, index) => (
            <div key={index} className={`promo-card ${promo.imagen} ${index === activePromo ? 'active' : ''}`}>
                <h3>{promo.titulo}</h3>
                <p>{promo.descripcion}</p>
                <Link to="/register" className="promo-btn">Obtener Ahora</Link>
            </div>
        ));
    };


    const renderGameCards = () => {
        return juegos.map(juego => (
            <div key={juego.id} className="game-card">
                <div className={`game-image ${juego.imagen}`}></div>
                <h3>{juego.nombre}</h3>
                <p>{juego.descripcion}</p>
            </div>
        ));
    };

    return (
        <div className="landing-container">
            <NavBar></NavBar>

            {/* Hero Section */}
            <div className="hero-section">
                <video autoPlay loop muted className="background-video">
                    <source src={backgroundVideo} type="video/mp4" />
                    Tu navegador no soporta este video.
                </video>

                <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
                    <h1 className="hero-title">Australis Casino</h1>
                    <h2 className="hero-subtitle">La Experiencia VIP del Juego Universitario</h2>
                    <p className="hero-description">
                        Disfruta de la adrenalina, las promociones exclusivas y los mejores juegos
                        en el casino líder entre universitarios.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="hero-btn primary-btn">Registrarse Ahora</Link>
                        <Link to="/login" className="hero-btn secondary-btn">Iniciar Sesión</Link>
                    </div>
                    <div className="scroll-indicator" onClick={scrollToContent}>
                        <span>Descubre más</span>
                        <FaChevronDown className="scroll-icon" />
                    </div>
                </div>
            </div>

            {/* Características */}
            <section id="features" className="features-section">
                <h2 className="section-title">¿Por qué elegir Australis Casino?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <FaDice className="feature-icon" />
                        <h3>Variedad de Juegos</h3>
                        <p>Más de 100 juegos exclusivos para la comunidad universitaria</p>
                    </div>
                    <div className="feature-card">
                        <FaCoins className="feature-icon" />
                        <p>Bonos Exclusivos</p>
                        <p>Promociones diseñadas especialmente para estudiantes</p>
                    </div>
                    <div className="feature-card">
                        <FaTrophy className="feature-icon" />
                        <h3>Torneos Semanales</h3>
                        <p>Compite y gana premios especiales entre tus compañeros</p>
                    </div>
                    <div className="feature-card">
                        <FaUserShield className="feature-icon" />
                        <h3>Juego Responsable</h3>
                        <p>Herramientas para controlar tu tiempo y gastos</p>
                    </div>
                </div>
            </section>

            {/* Juegos Populares */}
            <section id="games" className="games-section">
                <h2 className="section-title">Juegos Populares</h2>
                <div className="games-carousel">
                    {renderGameCards()}
                </div>
            </section>

            {/* Promociones */}
            <section id="promos" className="promo-section">
                <h2 className="section-title">Promociones Exclusivas</h2>
                <div className="promo-slider">
                    {renderPromoCards()}
                    <div className="promo-indicators">
                        {promociones.map((_, index) => (
                            <span
                                key={index}
                                className={`indicator ${index === activePromo ? 'active' : ''}`}
                                onClick={() => setActivePromo(index)}
                            ></span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <h2>¿Listo para la aventura?</h2>
                <p>Únete a miles de estudiantes que ya disfrutan de Australis Casino</p>
                <Link to="/register" className="cta-btn">Crear Cuenta Gratis</Link>
            </section>

            <Footer></Footer>
        </div>
    );
};

export default LandingPage;