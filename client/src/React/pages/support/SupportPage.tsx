import React, {useState, useEffect} from "react";
import {Phone, Mail, MessageCircle, Clock, HelpCircle, Send} from "lucide-react";
import Form from "@components/Form";
import FAQAccordion from "@components/support/FAQAccordion";
import ContactCard from "@components/support/ContactCard";
import StatusIndicator from "@components/support/StatusIndicator";
import "@css/SupportStyle.css";
import Footer from "@components/Footer";
import {useTicket} from "@context/TicketContext";
import {useUser} from "@context/UserContext";
import {useFaq} from "@context/FAQContext";

const SupportPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("contact");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showThankYou, setShowThankYou] = useState<boolean>(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const {getUserData, client} = useUser();

    const {getAllFAQs, getFAQByQuestion, getFAQsByCategory, isLoading} = useFaq();

    const [faqItems, setFaqItems] = useState<Array<{ question: string; answer: string; type?: string }>>([]);
    const [activeCategory, setActiveCategory] = useState<string>("Todas");
    const [originalFaqItems, setOriginalFaqItems] = useState<Array<{
        question: string;
        answer: string;
        type?: string
    }>>([]);

    const {createTicket, loading} = useTicket();

    // Initialize user data from localStorage
    useEffect(() => {
        const userId = localStorage.getItem("usuarioid");
        if (userId) {
            getUserData(userId);
        }
    }, [getUserData]);

    // Load FAQs when component mounts with data transformation
    useEffect(() => {
        const loadFAQs = async () => {
            try {
                const allFaqs = await getAllFAQs();
                // Transform data to match FAQAccordion's expected format
                const transformedFaqs = allFaqs.map((faq: {
                    pregunta: string;
                    respuesta: string;
                    categoria: string
                }) => ({
                    question: faq.pregunta,
                    answer: faq.respuesta,
                    type: faq.categoria
                }));
                setFaqItems(transformedFaqs);
                setOriginalFaqItems(transformedFaqs);
            } catch (error) {
                console.error("Error loading FAQs:", error);
            }
        };

        loadFAQs();
    }, [getAllFAQs]);

    const getPriorityByProblem = (problemType: string): string => {
        switch (problemType) {
            case "Problema Técnico":
                return "alta";
            case "Problema Con la Cuenta":
            case "Problema Algun Juego":
                return "media";
            case "Consulta General":
            default:
                return "baja";
        }
    };

    const handleSubmit = async (formData: Record<string, string>) => {
        try {
            const priority = getPriorityByProblem(formData.problem);

            const ticketData = {
                clienteid: client?.clienteid || 0,
                problema: formData.message,
                categoria: formData.problem,
                prioridad: priority,
            };

            await createTicket(ticketData);
            setShowThankYou(true);
            setSubmissionError(null);

            setTimeout(() => {
                setShowThankYou(false);
            }, 5000);

        } catch (err) {
            setSubmissionError("No se pudo enviar tu solicitud. Por favor, inténtalo de nuevo.");
            console.error("Error submitting support request:", err);
        }
    };

    // Filter FAQs by category with data transformation
    const handleCategoryClick = async (category: string) => {
        setActiveCategory(category);

        try {
            if (category === "Todas") {
                setFaqItems(originalFaqItems);
            } else {
                const categoryFaqs = await getFAQsByCategory(category);
                const transformedFaqs = categoryFaqs.map((faq: {
                    pregunta: string;
                    respuesta: string;
                    categoria: string
                }) => ({
                    question: faq.pregunta,
                    answer: faq.respuesta,
                    type: faq.categoria
                }));
                setFaqItems(transformedFaqs);
            }
        } catch (error) {
            console.error(`Error loading FAQs for category ${category}:`, error);
        }
    };

    // Search functionality with data transformation
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        // Automatically switch to the FAQ tab when searching
        setActiveTab("faq");

        if (!searchQuery.trim()) {
            setFaqItems(originalFaqItems);
            return;
        }

        try {
            const searchResults = await getFAQByQuestion(searchQuery);
            const resultsArray = Array.isArray(searchResults) ? searchResults : [searchResults];
            const transformedResults = resultsArray.map((faq: {
                pregunta: string;
                respuesta: string;
                categoria: string
            }) => ({
                question: faq.pregunta,
                answer: faq.respuesta,
                type: faq.categoria
            }));
            setFaqItems(transformedResults);
        } catch (error) {
            console.error("Error searching FAQs:", error);
            setFaqItems([]);
        }
    };

    const contactInfo = [
        {
            title: "Soporte Telefónico",
            icon: <Phone size={24}/>,
            content: "+1 (800) 123-4567",
            description: "Disponible 24/7",
            action: "Llamar ahora"
        },
        {
            title: "Correo Electrónico",
            icon: <Mail size={24}/>,
            content: "soporte@empresa.com",
            description: "Respuesta en 24 horas",
            action: "Enviar email"
        },
        {
            title: "Chat en Vivo",
            icon: <MessageCircle size={24}/>,
            content: "Soporte instantáneo",
            description: "Tiempo de espera: ~2 min",
            action: "Iniciar chat"
        }
    ];

    return (
        <div className="support-page">
            <div className="support-container">
                <div className="support-header">
                    <h1 className="support-title">Centro de Soporte</h1>
                    <p className="support-description">
                        Estamos aquí para ayudarte con cualquier pregunta o problema que puedas tener.
                    </p>

                    <div className="support-search-container">
                        <form className="support-search-form" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Busca en nuestra base de conocimiento..."
                                className="support-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="search-button">Buscar</button>
                        </form>
                    </div>
                </div>

                <div className="support-status-bar">
                    <StatusIndicator status="online" label="BlackJack"/>
                    <StatusIndicator status="online" label="Dados"/>
                    <StatusIndicator status="maintenance" label="Mines"/>
                    <StatusIndicator status="online" label="Slots"/>
                    <div className="support-hours">
                        <Clock size={16}/>
                        <span>Soporte disponible 24/7</span>
                    </div>
                </div>

                <div className="support-tabs">
                    <button
                        className={`tab-button ${activeTab === "contact" ? "active" : ""}`}
                        onClick={() => setActiveTab("contact")}
                    >
                        Contacto
                    </button>
                    <button
                        className={`tab-button ${activeTab === "faq" ? "active" : ""}`}
                        onClick={() => setActiveTab("faq")}
                    >
                        Preguntas Frecuentes
                    </button>
                </div>

                <div className="support-content">
                    {activeTab === "contact" && (
                        <div className="contact-section">
                            <div className="contact-cards">
                                {contactInfo.map((info, index) => (
                                    <ContactCard
                                        key={index}
                                        title={info.title}
                                        icon={info.icon}
                                        content={info.content}
                                        description={info.description}
                                        actionText={info.action}
                                    />
                                ))}
                            </div>

                            <div className="support-form-container">
                                {showThankYou ? (
                                    <div className="thank-you-message">
                                        <div className="thank-you-icon">
                                            <Send size={40}/>
                                        </div>
                                        <h3>¡Gracias por contactarnos!</h3>
                                        <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
                                    </div>
                                ) : (
                                    <Form
                                        title="Envíanos un Mensaje"
                                        subtitle="Nuestro equipo te responderá en menos de 24 horas"
                                        fields={[
                                            {name: "name", placeholder: "Nombre", type: "text", required: false},
                                            {
                                                name: "email",
                                                placeholder: "Correo Electrónico",
                                                type: "email",
                                                required: false
                                            },
                                            {
                                                name: "problem",
                                                placeholder: "Tipo de Problema",
                                                type: "select",
                                                options: ["Problema Técnico", "Consulta General", "Problema Con la Cuenta", "Problema Algun Juego"],
                                                required: true
                                            },
                                            {name: "message", placeholder: "Problema", type: "text", required: true}
                                        ]}
                                        submitButtonText={loading ? "Enviando..." : "Enviar Mensaje"}
                                        onSubmit={handleSubmit}
                                    />
                                )}
                                {submissionError && <div className="error-message">{submissionError}</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === "faq" && (
                        <div className="faq-section">
                            <h2 className="faq-title">Preguntas Frecuentes</h2>
                            <p className="faq-description">Encuentra respuestas rápidas a las preguntas más comunes.</p>

                            <div className="faq-categories">
                                <button
                                    className={`faq-category ${activeCategory === "Todas" ? "active" : ""}`}
                                    onClick={() => handleCategoryClick("Todas")}
                                >
                                    Todas
                                </button>
                                <button
                                    className={`faq-category ${activeCategory === "Cuenta" ? "active" : ""}`}
                                    onClick={() => handleCategoryClick("cuenta")}
                                >
                                    Cuenta
                                </button>
                                <button
                                    className={`faq-category ${activeCategory === "Pagos" ? "active" : ""}`}
                                    onClick={() => handleCategoryClick("pagos")}
                                >
                                    Pagos
                                </button>
                                <button
                                    className={`faq-category ${activeCategory === "Juegos" ? "active" : ""}`}
                                    onClick={() => handleCategoryClick("juego")}
                                >
                                    Juegos
                                </button>
                                <button
                                    className={`faq-category ${activeCategory === "Tecnicos" ? "active" : ""}`}
                                    onClick={() => handleCategoryClick("tecnico")}
                                >
                                    Técnicos
                                </button>
                                <button
                                    className={`faq-category ${activeCategory === "Otros" ? "active" : ""}`}
                                    onClick={() => handleCategoryClick("otros")}
                                >
                                    Otros
                                </button>
                            </div>

                            <div className="faq-items">
                                {isLoading ? (
                                    <div className="loading-state">Cargando preguntas frecuentes...</div>
                                ) : faqItems.length > 0 ? (
                                    <FAQAccordion items={faqItems}/>
                                ) : (
                                    <div className="no-results">No se encontraron preguntas que coincidan con tu
                                        búsqueda.</div>
                                )}
                            </div>

                            <div className="faq-more-help">
                                <HelpCircle size={32}/>
                                <h3>¿No encuentras lo que buscas?</h3>
                                <p>Nuestro equipo está listo para ayudarte con preguntas más específicas.</p>
                                <button className="btn btn-secondary" onClick={() => setActiveTab("contact")}>
                                    Contactar Soporte
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="support-footer">
                <Footer></Footer>
            </div>
        </div>
    );
};

export default SupportPage;