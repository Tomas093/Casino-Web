import React, { useState } from 'react';
import '@css/PrivacyPolicyStyle.css';
import { ChevronDown, ChevronUp, Shield, Lock, Eye, Database, Mail, FileWarning } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    const [expandedSection, setExpandedSection] = useState<string | null>('introduction');

    const toggleSection = (section: string) => {
        if (expandedSection === section) {
            setExpandedSection(null);
        } else {
            setExpandedSection(section);
        }
    };

    const renderAccordionSection = (title: string, id: string, content: React.ReactNode, icon?: React.ReactNode) => {
        const isExpanded = expandedSection === id;

        return (
            <div className="privacy-section">
                <div
                    className={`privacy-header ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleSection(id)}
                >
                    {icon && <span className="header-icon">{icon}</span>}
                    <h3>{title}</h3>
                    <span className="icon-container">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </span>
                </div>
                {isExpanded && (
                    <div className="privacy-content">
                        {content}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="privacy-container">
            <div className="privacy-header-main">
                <div className="gold-accent"></div>
                <h1>Políticas de Privacidad</h1>
                <div className="gold-accent"></div>
            </div>

            <div className="privacy-intro-container">
                <p className="privacy-intro">
                    En Australis Casino, nos comprometemos a proteger su privacidad y garantizar la seguridad de su información personal.
                    Esta Política de Privacidad explica cómo recopilamos, utilizamos, compartimos y protegemos su información cuando utiliza nuestra plataforma.
                </p>
                <div className="privacy-badge">
                    <Shield size={24} />
                    <span>Su privacidad es nuestra prioridad</span>
                </div>
            </div>

            {renderAccordionSection('1. Introducción', 'introduction', (
                <>
                    <p>1.1 Esta Política de Privacidad se aplica a todos los usuarios de Australis Casino, ya sea a través de nuestro sitio web, aplicaciones móviles o cualquier otro medio de acceso.</p>
                    <p>1.2 Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta Política de Privacidad.</p>
                    <p>1.3 Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en nuestra plataforma.</p>
                    <p>1.4 Le recomendamos revisar periódicamente esta Política de Privacidad para mantenerse informado sobre cómo protegemos su información.</p>
                </>
            ), <Shield size={18} />)}

            {renderAccordionSection('2. Información que Recopilamos', 'collected-info', (
                <>
                    <p>2.1 <strong>Información Personal:</strong> Nombre completo, fecha de nacimiento, dirección, correo electrónico, número de teléfono, documentos de identidad y cualquier otra información necesaria para verificar su identidad.</p>
                    <p>2.2 <strong>Información Financiera:</strong> Detalles de pago, historial de transacciones, métodos de pago utilizados y otra información relacionada con sus actividades financieras en nuestra plataforma.</p>
                    <p>2.3 <strong>Información de Actividad:</strong> Historial de juego, apuestas realizadas, preferencias de juego, patrones de comportamiento en la plataforma y estadísticas de juego.</p>
                    <p>2.4 <strong>Información Técnica:</strong> Dirección IP, tipo de dispositivo, sistema operativo, navegador web, identificadores únicos de dispositivo y datos de cookies.</p>
                    <p>2.5 <strong>Comunicaciones:</strong> Contenido de sus comunicaciones con nuestro servicio de atención al cliente, incluyendo grabaciones de llamadas telefónicas, correos electrónicos y chats en vivo.</p>
                </>
            ), <Database size={18} />)}

            {renderAccordionSection('3. Cómo Utilizamos su Información', 'use-of-info', (
                <>
                    <p>3.1 <strong>Proporcionar y Mejorar Nuestros Servicios:</strong> Para procesar transacciones, gestionar su cuenta, personalizar su experiencia, mejorar nuestros servicios y desarrollar nuevas características.</p>
                    <p>3.2 <strong>Seguridad y Verificación:</strong> Para verificar su identidad, prevenir fraudes, actividades ilegales y garantizar la seguridad de su cuenta.</p>
                    <p>3.3 <strong>Cumplimiento Legal:</strong> Para cumplir con obligaciones legales, incluyendo la verificación de edad, prevención de lavado de dinero y requisitos de juego responsable.</p>
                    <p>3.4 <strong>Comunicaciones:</strong> Para enviarle información importante sobre su cuenta, actualizaciones de servicios, ofertas promocionales y responder a sus consultas.</p>
                    <p>3.5 <strong>Análisis y Mejora:</strong> Para analizar tendencias de uso, comportamiento de usuarios y mejorar continuamente nuestros servicios y seguridad.</p>
                </>
            ), <Eye size={18} />)}

            {renderAccordionSection('4. Compartir Información', 'sharing-info', (
                <>
                    <p>4.1 <strong>Proveedores de Servicios:</strong> Podemos compartir su información con terceros que nos ayudan a operar nuestro negocio, como procesadores de pago, proveedores de verificación de identidad, servicios de atención al cliente y proveedores de servicios técnicos.</p>
                    <p>4.2 <strong>Cumplimiento Legal:</strong> Podemos divulgar su información cuando sea requerido por ley, orden judicial, o para proteger nuestros derechos legales.</p>
                    <p>4.3 <strong>Socios Comerciales:</strong> Podemos compartir información con nuestros socios comerciales para mejorar nuestros servicios, siempre de acuerdo con esta Política de Privacidad.</p>
                    <p>4.4 <strong>Transferencias Corporativas:</strong> En caso de fusión, adquisición o venta de activos, su información personal puede ser transferida como parte de los activos comerciales.</p>
                    <p>4.5 <strong>Con Su Consentimiento:</strong> Compartiremos su información personal con terceros cuando nos haya dado su consentimiento para hacerlo.</p>
                </>
            ), <Mail size={18} />)}

            {renderAccordionSection('5. Seguridad de Datos', 'data-security', (
                <>
                    <p>5.1 Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para proteger la información personal contra acceso no autorizado, pérdida, mal uso o alteración.</p>
                    <p>5.2 Utilizamos encriptación de nivel bancario para proteger la transmisión de datos sensibles, como información de pago.</p>
                    <p>5.3 Limitamos el acceso a su información personal a aquellos empleados y terceros que necesitan conocerla para procesar dicha información en nuestro nombre.</p>
                    <p>5.4 A pesar de nuestros esfuerzos, ningún sistema de seguridad es completamente impenetrable. No podemos garantizar la seguridad absoluta de su información.</p>
                </>
            ), <Lock size={18} />)}

            {renderAccordionSection('6. Sus Derechos de Privacidad', 'privacy-rights', (
                <>
                    <p>6.1 <strong>Acceso:</strong> Puede solicitar acceso a la información personal que mantenemos sobre usted.</p>
                    <p>6.2 <strong>Corrección:</strong> Puede solicitar que corrijamos información personal inexacta o incompleta.</p>
                    <p>6.3 <strong>Eliminación:</strong> En ciertas circunstancias, puede solicitar la eliminación de su información personal.</p>
                    <p>6.4 <strong>Restricción:</strong> Puede solicitar que limitemos el procesamiento de su información personal.</p>
                    <p>6.5 <strong>Portabilidad:</strong> Puede solicitar una copia de su información personal en un formato estructurado y legible por máquina.</p>
                    <p>6.6 <strong>Oposición:</strong> Puede oponerse al procesamiento de su información personal para marketing directo.</p>
                    <p>6.7 Para ejercer cualquiera de estos derechos, por favor contáctenos utilizando la información proporcionada en la sección "Contáctenos".</p>
                </>
            ), <FileWarning size={18} />)}

            {renderAccordionSection('7. Cookies y Tecnologías Similares', 'cookies', (
                <>
                    <p>7.1 Utilizamos cookies y tecnologías similares para recopilar información sobre su uso de nuestra plataforma, personalizar su experiencia y mejorar nuestros servicios.</p>
                    <p>7.2 Nuestras cookies pueden ser esenciales para el funcionamiento del sitio, analíticas para entender el comportamiento del usuario, o publicitarias para mostrar contenido relevante.</p>
                    <p>7.3 Puede gestionar sus preferencias de cookies a través de la configuración de su navegador, aunque esto puede afectar la funcionalidad de nuestros servicios.</p>
                </>
            ))}

            {renderAccordionSection('8. Transferencias Internacionales de Datos', 'international-transfers', (
                <>
                    <p>8.1 Su información puede ser transferida y procesada en países distintos a su país de residencia, que pueden tener leyes de protección de datos diferentes.</p>
                    <p>8.2 Cuando transferimos información personal fuera de su jurisdicción, tomamos medidas para garantizar que su información reciba un nivel adecuado de protección.</p>
                </>
            ))}

            {renderAccordionSection('9. Retención de Datos', 'data-retention', (
                <>
                    <p>9.1 Conservamos su información personal mientras mantenga una cuenta activa en nuestra plataforma y por un período razonable después para cumplir con nuestras obligaciones legales.</p>
                    <p>9.2 Después de este período, su información será eliminada o anonimizada de manera que ya no pueda ser identificada.</p>
                </>
            ))}

            {renderAccordionSection('10. Protección de Menores', 'minors', (
                <>
                    <p>10.1 Nuestros servicios están estrictamente destinados a personas mayores de 18 años o la edad legal para jugar en su jurisdicción, la que sea mayor.</p>
                    <p>10.2 No recopilamos intencionalmente información personal de menores. Si descubrimos que se ha recopilado información personal de un menor, tomaremos medidas para eliminarla lo antes posible.</p>
                </>
            ))}

            {renderAccordionSection('11. Cambios a Esta Política', 'changes', (
                <>
                    <p>11.1 Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por otros motivos operativos, legales o regulatorios.</p>
                    <p>11.2 La fecha de la última actualización se indicará al final de esta Política.</p>
                    <p>11.3 Le notificaremos sobre cambios materiales a través de un aviso destacado en nuestra plataforma o por otros medios antes de que los cambios entren en vigor.</p>
                </>
            ))}

            {renderAccordionSection('12. Contáctenos', 'contact', (
                <>
                    <p>12.1 Si tiene preguntas, preocupaciones o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de sus datos personales, puede contactarnos a través de:</p>
                    <ul className="contact-list">
                        <li><strong>Teléfono:</strong> +54 91130893524</li>
                        <li><strong>Dirección postal:</strong> Australis Casino, Avenida Siempreviva 742, Springfield</li>
                    </ul>
                    <p>12.2 Nuestro Delegado de Protección de Datos puede ser contactado en: dpo@royalfortunecasino.com</p>
                </>
            ))}

            <div className="privacy-footer">
                <p>Última actualización: 6 de Mayo, 2025</p>
                <div className="gold-accent-footer"></div>
                <p>© 2025 Australis Casino. Todos los derechos reservados.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;