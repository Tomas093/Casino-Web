import React, { useState } from 'react';
import '@css/Terminos.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
    const [expandedSection, setExpandedSection] = useState<string | null>('general');

    const toggleSection = (section: string) => {
        if (expandedSection === section) {
            setExpandedSection(null);
        } else {
            setExpandedSection(section);
        }
    };

    const renderAccordionSection = (title: string, id: string, content: React.ReactNode) => {
        const isExpanded = expandedSection === id;

        return (
            <div className="terms-section">
                <div
                    className={`terms-header ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleSection(id)}
                >
                    <h3>{title}</h3>
                    <span className="icon-container">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </span>
                </div>
                {isExpanded && (
                    <div className="terms-content">
                        {content}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="terms-container">
            <div className="terms-header-main">
                <div className="gold-accent"></div>
                <h1>Términos y Condiciones</h1>
                <div className="gold-accent"></div>
            </div>
            <p className="terms-intro">
                Le damos la bienvenida a Australis Casino. Antes de disfrutar de nuestros servicios, le pedimos que lea detenidamente los siguientes términos y condiciones que rigen el uso de nuestra plataforma.
            </p>

            {renderAccordionSection('1. Disposiciones Generales', 'general', (
                <>
                    <p>1.1 Estos Términos y Condiciones constituyen un acuerdo legal vinculante entre usted (el "Usuario") y Australis Casino (la "Compañía", "nosotros" o "nuestro").</p>
                    <p>1.2 Al registrarse en nuestra plataforma y/o utilizar cualquiera de nuestros servicios, usted confirma que ha leído, entendido y aceptado estos Términos y Condiciones en su totalidad.</p>
                    <p>1.3 Australis Casino se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
                    <p>1.4 Es responsabilidad del Usuario revisar periódicamente los Términos y Condiciones para mantenerse informado sobre posibles cambios.</p>
                </>
            ))}

            {renderAccordionSection('2. Elegibilidad', 'eligibility', (
                <>
                    <p>2.1 Para registrarse y utilizar los servicios de Australis Casino, el Usuario debe tener al menos 18 años de edad o la edad mínima legal para participar en juegos de azar en su jurisdicción, la que sea mayor.</p>
                    <p>2.2 El Usuario no debe residir en una jurisdicción donde los juegos de azar en línea estén prohibidos por ley.</p>
                    <p>2.3 La Compañía se reserva el derecho de solicitar prueba de identidad y verificar la edad y residencia del Usuario en cualquier momento.</p>
                    <p>2.4 El Usuario garantiza que los fondos utilizados para jugar en Australis Casino provienen de fuentes legítimas y no están relacionados con actividades ilegales.</p>
                </>
            ))}

            {renderAccordionSection('3. Registro y Cuenta', 'account', (
                <>
                    <p>3.1 Para acceder a los servicios de juego, el Usuario debe registrarse y crear una cuenta personal.</p>
                    <p>3.2 Durante el proceso de registro, el Usuario debe proporcionar información personal precisa y completa.</p>
                    <p>3.3 Cada Usuario puede mantener solo una cuenta. La creación de múltiples cuentas está estrictamente prohibida y puede resultar en la suspensión o terminación de todas las cuentas asociadas.</p>
                    <p>3.4 El Usuario es responsable de mantener la confidencialidad de sus credenciales de inicio de sesión.</p>
                    <p>3.5 El Usuario debe notificar inmediatamente a Australis Casino si sospecha de cualquier uso no autorizado de su cuenta.</p>
                </>
            ))}

            {renderAccordionSection('4. Depósitos y Retiros', 'payments', (
                <>
                    <p>4.1 Australis Casino ofrece varios métodos de pago para depósitos y retiros.</p>
                    <p>4.2 Los depósitos mínimos y máximos pueden variar según el método de pago elegido.</p>
                    <p>4.3 Las solicitudes de retiro están sujetas a verificación de identidad y pueden requerir documentación adicional.</p>
                    <p>4.4 Los retiros se procesarán dentro de los plazos establecidos, que pueden variar según el método de pago seleccionado.</p>
                    <p>4.5 Australis Casino se reserva el derecho de cobrar comisiones por procesamiento de pagos, según lo indicado en la sección de pagos del sitio web.</p>
                </>
            ))}

            {renderAccordionSection('5. Bonos y Promociones', 'bonuses', (
                <>
                    <p>5.1 Australis Casino ofrece diversos bonos y promociones sujetos a sus propios términos y condiciones específicos.</p>
                    <p>5.2 Los bonos de bienvenida solo están disponibles para nuevos usuarios y no pueden combinarse con otras ofertas, a menos que se especifique lo contrario.</p>
                    <p>5.3 Todos los bonos están sujetos a requisitos de apuesta antes de que cualquier ganancia asociada pueda ser retirada.</p>
                    <p>5.4 La Compañía se reserva el derecho de modificar o cancelar cualquier bono o promoción sin previo aviso.</p>
                    <p>5.5 El abuso de bonos, incluyendo pero no limitado a la apertura de múltiples cuentas para recibir bonos adicionales, resultará en la cancelación de bonos y posible suspensión de la cuenta.</p>
                </>
            ))}

            {renderAccordionSection('6. Juego Responsable', 'responsible', (
                <>
                    <p>6.1 Australis Casino promueve el juego responsable y ofrece herramientas para ayudar a los usuarios a controlar su actividad de juego.</p>
                    <p>6.2 Los usuarios pueden establecer límites de depósito, pérdida y tiempo de sesión a través de la sección de "Juego Responsable" de su cuenta.</p>
                    <p>6.3 Si un usuario cree que puede estar desarrollando un problema con el juego, debe contactar inmediatamente con nuestro equipo de soporte para recibir asistencia.</p>
                    <p>6.4 Australis Casino se reserva el derecho de cerrar la cuenta de cualquier usuario que muestre signos de comportamiento problemático con el juego.</p>
                </>
            ))}

            {renderAccordionSection('7. Propiedad Intelectual', 'intellectual', (
                <>
                    <p>7.1 Todo el contenido disponible en Australis Casino, incluyendo pero no limitado a logotipos, marcas comerciales, software, juegos, gráficos y texto, está protegido por derechos de propiedad intelectual.</p>
                    {/*<p>7.2 El Usuario no puede copiar, modificar, distribuir o reproducir ningún contenido del sitio sin el permiso expreso de Australis Casino o del propietario correspondiente.</p>*/}
                </>
            ))}

            {renderAccordionSection('8. Limitación de Responsabilidad', 'liability', (
                <>
                    <p>8.1 Australis Casino no será responsable por pérdidas o daños derivados del uso de nuestros servicios, incluyendo pero no limitado a pérdidas financieras resultantes de actividades de juego.</p>
                    <p>8.2 La Compañía no garantiza la disponibilidad ininterrumpida de los servicios y no será responsable por interrupciones o fallos técnicos.</p>
                    <p>8.3 El Usuario reconoce que el juego implica el riesgo de pérdida financiera y acepta este riesgo voluntariamente.</p>
                </>
            ))}

            {renderAccordionSection('9. Terminación', 'termination', (
                <>
                    <p>9.1 Australis Casino se reserva el derecho de suspender o terminar la cuenta de un Usuario en cualquier momento y por cualquier razón, incluyendo pero no limitado a violaciones de estos Términos y Condiciones.</p>
                    <p>9.2 Tras la terminación de una cuenta, la Compañía devolverá cualquier saldo disponible al Usuario, sujeto a verificaciones de seguridad.</p>
                    <p>9.3 El Usuario puede cerrar su cuenta en cualquier momento contactando con el servicio de atención al cliente.</p>
                </>
            ))}

            {renderAccordionSection('10. Ley Aplicable', 'law', (
                <>
                    <p>10.1 Estos Términos y Condiciones se rigen por las leyes de [Jurisdicción].</p>
                    <p>10.2 Cualquier disputa derivada de estos Términos y Condiciones será sometida a la jurisdicción exclusiva de los tribunales de [Jurisdicción].</p>
                </>
            ))}

            <div className="terms-footer">
                <p>Última actualización: 6 de Mayo, 2025</p>
                <div className="gold-accent-footer"></div>
                <p>© 2025 Australis Casino. Todos los derechos reservados.</p>
            </div>
        </div>
    );
};

export default TermsAndConditions;