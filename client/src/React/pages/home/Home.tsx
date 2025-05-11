import React, {useEffect, useRef, useState} from 'react';
import '@css/HomeStyle.css';
import slotImg from '@assets/slots.jpg';
import ruletaImg from '@assets/ruleta.jpg';
import blackjackImg from '@assets/blackjack.jpg';
import dadosImg from '@assets/dados.jpg';
import AnimatedCounter from "../../animations/AnimatedCounter";
import Footer from '@components/Footer';
import NavBar from "@components/NavBar.tsx";
import {useUser} from "@context/UserContext.tsx";
import {useAuth} from "@context/AuthContext.tsx";
import LeaderBoard from "@components/LeaderBoard";
import { Link } from 'react-router-dom';

interface GameCardProps {
    title: string;
    image: string;
    page: string;
}



const GameCard: React.FC<GameCardProps> = ({title, image, page}) => {
    return (
        <div className="game-card hover-card">
            <div className="game-card-inner">
                <img src={image} alt={title} className="game-card-image"/>
                <div className="game-card-overlay">
                    <h3 className="game-card-title">{title}</h3>
                    <Link to={page} className="game-card-button">Jugar ahora</Link>
                </div>
            </div>
        </div>
    );
};

// Statistical Indicator Component
interface StatIndicatorProps {
    icon: React.ReactNode;
    value: React.ReactNode;
    label: string;
}

const StatIndicator: React.FC<StatIndicatorProps> = ({icon, value, label}) => {
    return (
        <div className="stat-indicator">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
};

// FAQ Item Component
interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({question, answer, isOpen, onClick}) => {
    return (
        <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={onClick}>
            <div className="faq-question">
                <h4>{question}</h4>
                <div className="faq-toggle">{isOpen ? '−' : '+'}</div>
            </div>
            <div className="faq-answer">
                <p>{answer}</p>
            </div>
        </div>
    );
};

// Main Component
const HomeDef = () => {
    // References for scroll with zoom effect
    const containerRef = useRef(null);
    const showcaseRef = useRef(null);

    // State for FAQ open/closed status
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    // State for animated hero text
    const [typedText, setTypedText] = useState('');
    const fullText = 'La mejor experiencia de casino en línea';

    // Clean games array - only unique items
    const games = [
        {id: 1, title: "Ruleta VIP", image: ruletaImg, page: "/roulette"},
        {id: 2, title: "BlackJack", image: blackjackImg, page: "/blackjack"},
        {id: 3, title: "Slots", image: slotImg, page: "/slots"},
        {id: 4, title: "Dados", image: dadosImg, page: "/dados"},
    ];

    // Create a function to generate the infinite scroll effect
    const createInfiniteGames = () => {
        const multiplier = 5;
        return Array(multiplier).fill(null).flatMap((_, index) =>
            games.map(game => ({
                ...game,
                id: `${game.id}-${index}`
            }))
        );
    };

    // FAQ data
    const faqData = [
        {
            id: 1,
            question: "¿Cómo puedo registrarme en Australis Casino?",
            answer: "El registro es simple y rápido. Haga clic en el botón 'Registrarse' en la parte superior de la página, complete el formulario con sus datos personales y siga las instrucciones para verificar su cuenta."
        },
        {
            id: 2,
            question: "¿Cuáles son los métodos de pago disponibles?",
            answer: "Aceptamos múltiples métodos de pago incluyendo tarjetas de crédito/débito, transferencias bancarias, billeteras electrónicas como PayPal, Skrill y Neteller, y criptomonedas como Bitcoin y Ethereum."
        },
        {
            id: 3,
            question: "¿Cómo funciona el bono de bienvenida?",
            answer: "Nuestro bono de bienvenida ofrece un 100% de su primer depósito hasta $500, más 100 giros gratis. Los bonos están sujetos a requisitos de apuesta de 30x y deben utilizarse dentro de los 30 días posteriores a la activación."
        },
        {
            id: 4,
            question: "¿Es seguro jugar en Australis Casino?",
            answer: "Absolutamente. Utilizamos encriptación SSL de 256 bits para proteger sus datos y transacciones. Además, todos nuestros juegos son auditados regularmente por entidades independientes para garantizar un juego justo."
        },
        {
            id: 5,
            question: "¿Cuánto tiempo toman los retiros?",
            answer: "Los tiempos de procesamiento varían según el método de pago elegido. Las billeteras electrónicas suelen procesarse en 24 horas, las tarjetas de crédito/débito en 2-5 días hábiles, y las transferencias bancarias en 3-7 días hábiles."
        }
    ];

    // Handle FAQ toggle
    const handleFAQToggle = (id: number) => {
        setOpenFAQ((prev: number | null) => (prev === id ? null : id));
    };

    const {user} = useAuth();
    const {getUserData} = useUser()

    useEffect(() => {
        if (user?.usuarioid) {
            getUserData(user.usuarioid.toString());
        }
    }, [user?.usuarioid, getUserData]);

    // Typing effect for hero text
    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setTypedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, []);

    // Updated scroll effect for infinite scrolling
    useEffect(() => {
        const container = containerRef.current;
        const showcase = showcaseRef.current;

        if (!container || !showcase) return;

        const containerElement = container as HTMLDivElement;
        const showcaseElement = showcase as HTMLDivElement;

        // Auto scrolling animation variables
        let scrollPosition = 0;
        let scrollDirection = 1;
        let animationId: number;
        let isMouseOver = false;

        const resetScroll = () => {
            const gameWidth = showcaseElement.children[0]?.clientWidth || 0;
            const totalGames = games.length;

            // When reaching the end of the first set, jump back to start position
            if (scrollPosition >= gameWidth * totalGames) {
                scrollPosition = 0;
                showcaseElement.style.transition = 'none';
                showcaseElement.style.transform = `translateX(0px)`;
                // Force reflow to make the transition reset work
                void showcaseElement.offsetWidth;
                showcaseElement.style.transition = 'transform 0.5s ease-out';
            }
        };

        const animate = () => {
            if (!isMouseOver) {
                scrollPosition += 0.5 * scrollDirection;
                showcaseElement.style.transform = `translateX(${-scrollPosition}px)`;
                resetScroll();
            }
            animationId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            isMouseOver = true;

            const containerWidth = containerElement.offsetWidth;
            const mouseX = e.clientX - containerElement.getBoundingClientRect().left;
            const percent = mouseX / containerWidth;

            const maxScroll = showcaseElement.scrollWidth - containerWidth;
            const scrollX = maxScroll * percent;

            showcaseElement.style.transform = `translateX(${-scrollX}px)`;

            const cards = showcaseElement.querySelectorAll<HTMLDivElement>('.hover-card');

            cards.forEach((card: HTMLDivElement) => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const distance = Math.abs(centerX - e.clientX);
                const scale = Math.max(0.95, 1 - distance / 800);
                card.style.transform = `scale(${scale})`;
            });
        };

        const handleMouseLeave = () => {
            isMouseOver = false;
            const cards = showcaseElement.querySelectorAll<HTMLDivElement>('.hover-card');
            cards.forEach((card: HTMLDivElement) => {
                card.style.transform = `scale(1)`;
            });
        };

        containerElement.addEventListener('mousemove', handleMouseMove);
        containerElement.addEventListener('mouseleave', handleMouseLeave);

        // Start animation
        animationId = requestAnimationFrame(animate);

        return () => {
            containerElement.removeEventListener('mousemove', handleMouseMove);
            containerElement.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationId);
        };
    }, [games.length]);

    return (
        <div className="homepage">
            <NavBar/>
            <section className="hero-section">
                <div className="hero-background">
                    <img alt="Casino Background" className="hero-image"/>
                    <div className="overlay"></div>
                </div>
                <div className="hero-content">
                    <h1 className="main-title">Australis Casino</h1>
                    <div className="typing-container">
                        <p className="subtitle">{typedText}<span className="typing-cursor">|</span></p>
                    </div>
                    <div className="cta-container">
                        <button className="cta-button">Jugar Ahora</button>
                        <button className="cta-button secondary">Conocer más</button>
                    </div>
                    <div className="hero-features">
                        <div className="hero-feature">
                            <div className="feature-icon">🎁</div>
                            <span>Bono de bienvenida de $500</span>
                        </div>
                        <div className="hero-feature">
                            <div className="feature-icon">🔒</div>
                            <span>100% Seguro</span>
                        </div>
                        <div className="hero-feature">
                            <div className="feature-icon">🎮</div>
                            <span>+300 Juegos</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="games-section">
                <h2 className="section-title">NUESTROS JUEGOS EXCLUSIVOS</h2>
                <div ref={containerRef} className="scroll-container">
                    <div ref={showcaseRef} className="scroll-showcase">
                        {createInfiniteGames().map(game => (
                            <GameCard key={game.id} title={game.title} image={game.image} page={game.page}/>
                        ))}
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <h2 className="section-title">ESTADÍSTICAS</h2>
                <div className="stats-container">
                    <StatIndicator
                        icon="💰"
                        value={<AnimatedCounter end={1500000} prefix="$"/>}
                        label="Pozo acumulado"
                    />
                    <StatIndicator
                        icon="👥"
                        value={<AnimatedCounter end={2345}/>}
                        label="Jugadores online"
                    />
                    <StatIndicator
                        icon="🏆"
                        value={<AnimatedCounter end={250000} prefix="$"/>}
                        label="Mayor premio del día"
                    />
                </div>
            </section>

            <section className="leaderboard-section">
                <h2 className="section-title">TABLA DE CLASIFICACIÓN</h2>
                <div className="leaderboard-wrapper">
                    <LeaderBoard limit={5} compact={false}/>
                </div>
            </section>

            <section className="about-section">
                <h2 className="section-title">QUIENES SOMOS</h2>
                <div className="about-container">
                    <div className="about-content">
                        <h3 className="about-subtitle">EXCELENCIA EN ENTRETENIMIENTO DESDE 2004 </h3>
                        <p className="about-text">
                            Australis Casino nació con una visión clara: revolucionar la experiencia de juego online
                            combinando tecnología de vanguardia con la elegancia de los casinos tradicionales.
                        </p>
                        <p className="about-text">
                            Con más de una década de experiencia en la industria, nos hemos consolidado como líderes en
                            el mercado de entretenimiento digital, ofreciendo a nuestros usuarios una plataforma segura,
                            transparente y emocionante.
                        </p>
                        <p className="about-text">
                            Nuestro equipo está formado por expertos en desarrollo de software, seguridad informática y
                            atención al cliente, comprometidos con ofrecer una experiencia de juego excepcional las 24
                            horas del día.
                        </p>
                    </div>
                    <div className="about-features">
                        <div className="feature-item">
                            <div className="feature-icon">🔒</div>
                            <h4 className="feature-title">Seguridad Garantizada</h4>
                            <p className="feature-text">Utilizamos tecnología de encriptación avanzada para proteger sus
                                datos y transacciones.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏆</div>
                            <h4 className="feature-title">Juego Responsable</h4>
                            <p className="feature-text">Promovemos prácticas de juego saludables y ofrecemos
                                herramientas de control personal.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">💎</div>
                            <h4 className="feature-title">Innovación Constante</h4>
                            <p className="feature-text">Actualizamos regularmente nuestra plataforma con los últimos
                                avances tecnológicos.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="faq-section">
                <h2 className="section-title">PREGUNTAS FRECUENTES</h2>
                <div className="faq-container">
                    {faqData.map(faq => (
                        <FAQItem
                            key={faq.id}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openFAQ === faq.id}
                            onClick={() => handleFAQToggle(faq.id)}
                        />
                    ))}
                </div>
            </section>

            <Footer/>
        </div>
    );
};

export default HomeDef;