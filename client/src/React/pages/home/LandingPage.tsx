import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import '@css/LandingPageStyle.css';
import backgroundVideo from "@assets/backgroundVideo.mp4";
import {FaChevronDown} from 'react-icons/fa';
import Footer from "@components/Footer.tsx";
import NavBar from "@components/NavBar.tsx";
import {useAuth} from "@context/AuthContext.tsx";
import {useUser} from "@context/UserContext.tsx";
import { useNavigate } from 'react-router-dom';


const LandingPage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activePromo, setActivePromo] = useState(0);
    const navigate = useNavigate();

    const handlePlayClick = () => {
        // Navegamos a la página Home y específicamente a la sección de juegos
        navigate("/home#games-section-home");
    };

    const promociones = [
        {titulo: "Bono de Bienvenida", descripcion: "¡100% en tu primer depósito hasta $500!", imagen: "promo1"},
        {titulo: "Cashback Semanal", descripcion: "Recupera el 15% de tus pérdidas cada semana", imagen: "promo2"},
        {titulo: "Giros Gratis", descripcion: "20 giros gratis en nuestros juegos premium", imagen: "promo3"}
    ];

    const juegos = [
        {id: 1, nombre: "Slots", descripcion: "La emoción de los giros", imagen: "game1"},
        {id: 2, nombre: "Ruleta Premium", descripcion: "La elegancia y el azar se combinan", imagen: "game2"},
        {id: 3, nombre: "Blackjack VIP", descripcion: "Estrategia y suerte al máximo nivel", imagen: "game3"},
        {
            id: 4,
            nombre: "Dado",
            descripcion: "100 posibilidades, una sola decisión: ¡Lánzalo y deja que el destino hable!",
            imagen: "game4"
        },
    ];

    const { user } = useAuth();
    const {getUserData} = useUser()

    useEffect(() => {
        if (user?.usuarioid) {
            getUserData(user.usuarioid.toString());
        }
    }, [user?.usuarioid, getUserData]);

    useEffect(() => {
        setIsVisible(true);

        const interval = setInterval(() => {
            setActivePromo(prev => (prev + 1) % promociones.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const scrollToContent = () => {
        document.querySelector('.australis-features')?.scrollIntoView({behavior: 'smooth'});
    };

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

    // Configuración personalizada para la navbar en LandingPage
    const landingNavLinks = [
        {label: "Juegos", href: "#games", isAnchor: true},
        {label: "Promociones", href: "#promos", isAnchor: true},
        {label: "Nosotros", href: "#about", isAnchor: true}
    ];

    return (
        <>
            <NavBar
                navLinks={landingNavLinks}
                className="landing-navbar"
                variant="light"
                showBalance={false}
                playButtonLabel="Jugar"
                loginButtonLabel="Iniciar Sesión"
                registerButtonLabel="Registrarse"
                onPlayClick={handlePlayClick}
                targetSection="games-section-home"
            />
            <div className="landing-container">
                {/* Hero Section */}
                <div className="hero-section">
                    <video autoPlay loop muted className="background-video">
                        <source src={backgroundVideo} type="video/mp4"/>
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
                            <FaChevronDown className="scroll-icon"/>
                        </div>
                    </div>
                </div>

                {/* Resto del código sin cambios... */}

                {/* Características */}
                <section className="australis-features">
                    <div className="australis-container">
                        <div className="australis-features__grid">
                            <div className="australis-feature">
                                <div className="australis-feature__icon australis-feature__icon--secure">security</div>
                                <h3 className="australis-feature__title">Juegos Seguros</h3>
                                <p className="australis-feature__description">Cifrado avanzado y métodos de pago seguros
                                    para proteger tus datos y fondos.</p>
                            </div>

                            <div className="australis-feature">
                                <div
                                    className="australis-feature__icon australis-feature__icon--support">support_agent
                                </div>
                                <h3 className="australis-feature__title">Soporte 24/7</h3>
                                <p className="australis-feature__description">Nuestro equipo de soporte dedicado está
                                    disponible las 24 horas del día para ayudarte.</p>
                            </div>

                            <div className="australis-feature">
                                <div className="australis-feature__icon australis-feature__icon--payment">credit_card
                                </div>
                                <h3 className="australis-feature__title">Pagos Rapidos</h3>
                                <p className="australis-feature__description">Depósitos y retiros rápidos con múltiples
                                    opciones de pago.</p>
                            </div>

                            <div className="australis-feature">
                                <div className="australis-feature__icon australis-feature__icon--bonus">redeem</div>
                                <h3 className="australis-feature__title">Promociones Exclusivas</h3>
                                <p className="australis-feature__description">Promociones exclusivas diseñadas para
                                    brindarte ventajas únicas y recompensas increíbles.</p>
                            </div>
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
        </>
    );
};

export default LandingPage;