import React, {useState, useEffect} from "react";
import {Phone, Mail, MessageCircle, Clock, HelpCircle, Send} from "lucide-react";
import Form from "@components/Form";
import FAQAccordion from "@components/support/FAQAccordion.tsx";
import ContactCard from "@components/support/ContactCard";
import StatusIndicator from "@components/support/StatusIndicator";
import "@css/SupportStyle.css";
import Footer from "@components/Footer.tsx";
import {useTicket} from "@context/TicketContext.tsx";
import {useUser} from "@context/UserContext.tsx";

const SupportPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("contact");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showThankYou, setShowThankYou] = useState<boolean>(false);
    const [, setSubmissionError] = useState<string | null>(null);
    const {getUserData, client} = useUser();

    const {createTicket, loading} = useTicket();

    // Initialize user data from localStorage
    useEffect(() => {
        const userId = localStorage.getItem("usuarioid");
        if (userId) {
            getUserData(userId);
        }
    }, [getUserData]);

    // Función para determinar el nivel de prioridad automáticamente según el tipo de problema
    const getPriorityByProblem = (problemType: string): string => {
        switch (problemType) {
            case "Problema Técnico":
                return "Alta";
            case "Problema Con la Cuenta":
            case "Problema Algun Juego":
                return "Media";
            case "Consulta General":
            default:
                return "Baja";
        }
    };

    const handleSubmit = async (formData: Record<string, string>) => {
        try {
            // Determinar automáticamente la prioridad según el tipo de problema
            const priority = getPriorityByProblem(formData.problem);

            const ticketData = {
                clienteid: client?.clienteid || 0,
                problema: formData.message,
                categoria: formData.problem,
                prioridad: priority,
            };

            // Crear el ticket usando el contexto
            await createTicket(ticketData);

            // Mostrar mensaje de agradecimiento
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

    const faqItems = [
        {
            question: "¿Cómo puedo restablecer mi contraseña?",
            answer: "Para restablecer tu contraseña, haz clic en 'Olvidé mi contraseña' en la página de inicio de sesión. Recibirás un correo electrónico con instrucciones para crear una nueva contraseña."
        },
        {
            question: "¿Cuánto tiempo tarda en procesarse un reembolso?",
            answer: "Los reembolsos generalmente se procesan dentro de 3-5 días hábiles, pero pueden tardar hasta 10 días en aparecer en tu cuenta bancaria dependiendo de tu entidad financiera."
        },
        {
            question: "¿Cómo puedo actualizar mi información de facturación?",
            answer: "Puedes actualizar tu información de facturación en la sección 'Mi cuenta' > 'Facturación'. Allí podrás editar tus métodos de pago y dirección de facturación."
        },
        {
            question: "¿Ofrecen soporte técnico 24/7?",
            answer: "Sí, nuestro equipo de soporte técnico está disponible las 24 horas del día, los 7 días de la semana. Puedes contactarnos por chat en vivo, correo electrónico o teléfono en cualquier momento."
        },
        {
            question: "¿Cómo puedo cancelar mi suscripción?",
            answer: "Para cancelar tu suscripción, ve a 'Mi cuenta' > 'Suscripciones' y haz clic en 'Cancelar suscripción'. Seguirás teniendo acceso hasta el final del período de facturación actual."
        }
    ];

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Searching for:", searchQuery);
        // Implement search functionality here
    };

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
                                            {name: "name", placeholder: "Nombre", type: "text", required: true},
                                            {
                                                name: "email",
                                                placeholder: "Correo Electrónico",
                                                type: "email",
                                                required: true
                                            },
                                            {
                                                name: "problem",
                                                placeholder: "Tipo de Problema",
                                                type: "select",
                                                options: ["Problema Técnico", "Consulta General", "Problema Con la Cuenta", "Problema Algun Juego"],
                                                required: true
                                            },
                                            {name: "message", placeholder: "Problema", type: "textarea", required: true}
                                        ]}
                                        submitButtonText={loading ? "Enviando..." : "Enviar Mensaje"}
                                        onSubmit={handleSubmit}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "faq" && (
                        <div className="faq-section">
                            <h2 className="faq-title">Preguntas Frecuentes</h2>
                            <p className="faq-description">Encuentra respuestas rápidas a las preguntas más comunes.</p>

                            <div className="faq-categories">
                                <button className="faq-category active">Todas</button>
                                <button className="faq-category">Cuenta</button>
                                <button className="faq-category">Pagos</button>
                                <button className="faq-category">Productos</button>
                                <button className="faq-category">Técnico</button>
                            </div>

                            <div className="faq-items">
                                <FAQAccordion items={faqItems}/>
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
            <Footer></Footer>
        </div>
    );
};

export default SupportPage;