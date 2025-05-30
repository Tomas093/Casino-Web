import React, {useState} from 'react';
import {
    AlertCircle,
    Award,
    BookOpen,
    Briefcase,
    Building,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    Globe,
    Scale
} from 'lucide-react';
import '@css/LegalStyle.css'

const LegalPage = () => {
    const [expandedSection, setExpandedSection] = useState<string | null>('licencia');

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
                <h1>Información Legal</h1>
                <div className="gold-accent"></div>
            </div>

            <div className="privacy-intro-container">
                <p className="privacy-intro">
                    Australis Casino opera de acuerdo con todas las leyes y regulaciones aplicables al juego en línea.
                    A continuación, encontrará toda la información legal relevante relacionada con nuestros servicios,
                    licencias y cumplimiento normativo. Le recomendamos leer detenidamente esta información para
                    comprender mejor nuestro marco legal y operativo.
                </p>
                <div className="privacy-badge">
                    <Scale size={24} />
                    <span>Operamos con transparencia y legalidad</span>
                </div>
            </div>

            {renderAccordionSection('1. Licencia y Regulación', 'licencia', (
                <>
                    <p>1.1 Australis Casino está operado por Australis Gaming Group Ltd., una empresa registrada y autorizada bajo las leyes de Malta.</p>
                    <p>1.2 Poseemos una licencia de juego remoto otorgada por la Autoridad de Juegos de Malta (MGA) con el número de licencia MGA/B2C/123/4567.</p>
                    <p>1.3 También estamos autorizados por la Dirección General de Ordenación del Juego de España (DGOJ) con el número de licencia ES/2025/001.</p>
                    <p>1.4 Todas nuestras actividades están sujetas a auditorías regulares por parte de organismos independientes para garantizar el cumplimiento de los estándares de juego justo y responsable.</p>
                    <p>1.5 La información sobre nuestras licencias está disponible para verificación pública a través de los sitios web oficiales de los reguladores mencionados.</p>
                </>
            ), <Award size={18} />)}

            {renderAccordionSection('2. Términos y Condiciones Generales', 'terminos', (
                <>
                    <p>2.1 Los presentes Términos y Condiciones constituyen un acuerdo legalmente vinculante entre usted y Australis Casino.</p>
                    <p>2.2 Al registrarse y utilizar nuestros servicios, usted acepta cumplir con estos términos en su totalidad.</p>
                    <p>2.3 Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en nuestra plataforma.</p>
                    <p>2.4 Es su responsabilidad revisar periódicamente los Términos y Condiciones para mantenerse informado sobre cualquier cambio.</p>
                    <p>2.5 El uso continuado de nuestros servicios después de cualquier modificación constituye su aceptación de los términos modificados.</p>
                    <p>2.6 Si no está de acuerdo con alguna parte de estos términos, debe dejar de utilizar inmediatamente nuestros servicios.</p>
                </>
            ), <FileText size={18} />)}

            {renderAccordionSection('3. Requisitos de Elegibilidad', 'elegibilidad', (
                <>
                    <p>3.1 Para utilizar nuestros servicios, usted debe tener al menos 18 años de edad o la edad legal mínima para participar en actividades de juego en su jurisdicción, la que sea mayor.</p>
                    <p>3.2 El acceso a nuestros servicios está prohibido para residentes de jurisdicciones donde el juego en línea es ilegal.</p>
                    <p>3.3 Entre los territorios restringidos se incluyen, pero no se limitan a: Estados Unidos, Francia, Turquía, Israel, y otros países donde el juego en línea está prohibido por la legislación local.</p>
                    <p>3.4 Es su responsabilidad verificar si el uso de nuestros servicios cumple con las leyes aplicables en su jurisdicción.</p>
                    <p>3.5 Nos reservamos el derecho de solicitar prueba de edad y verificar su identidad en cualquier momento.</p>
                </>
            ), <CheckCircle size={18} />)}

            {renderAccordionSection('4. Política de Juego Responsable', 'juego-responsable', (
                <>
                    <p>4.1 Australis Casino promueve el juego responsable y se compromete a proporcionar herramientas y recursos para ayudar a nuestros usuarios a mantener el control sobre sus hábitos de juego.</p>
                    <p>4.2 Ofrecemos opciones para establecer límites de depósito, pérdida y tiempo de juego, así como la posibilidad de autoexclusión temporal o permanente.</p>
                    <p>4.3 Colaboramos con organizaciones especializadas en la prevención y tratamiento de la ludopatía.</p>
                    <p>4.4 Si usted o alguien que conoce tiene problemas con el juego, le recomendamos contactar con organizaciones de ayuda como:</p>
                    <ul className="contact-list">
                        <li><strong>Jugadores Anónimos:</strong> www.jugadoresanonimos.org</li>
                        <li><strong>FEJAR:</strong> www.fejar.org</li>
                        <li><strong>Línea de Ayuda:</strong> +34 900 XXX XXX</li>
                    </ul>
                </>
            ), <AlertCircle size={18} />)}

            {renderAccordionSection('5. Política de Pagos y Transacciones', 'pagos', (
                <>
                    <p>5.1 Todas las transacciones realizadas en Australis Casino están sujetas a verificaciones de seguridad para prevenir el fraude y el lavado de dinero.</p>
                    <p>5.2 Los métodos de pago disponibles pueden variar según su ubicación geográfica y están sujetos a los términos y condiciones de los proveedores de servicios de pago correspondientes.</p>
                    <p>5.3 Los tiempos de procesamiento para retiros dependen del método de pago seleccionado y pueden estar sujetos a revisiones adicionales según nuestra política de KYC (Conozca a su Cliente).</p>
                    <p>5.4 Nos reservamos el derecho de solicitar documentación adicional para verificar la fuente de los fondos utilizados en las transacciones.</p>
                    <p>5.5 Las ganancias están sujetas a impuestos según la legislación aplicable en su jurisdicción. Es su responsabilidad declarar y pagar los impuestos correspondientes.</p>
                </>
            ), <Briefcase size={18} />)}

            {renderAccordionSection('6. Propiedad Intelectual', 'propiedad-intelectual', (
                <>
                    <p>6.1 Todo el contenido disponible en Australis Casino, incluyendo pero no limitado a logotipos, imágenes, gráficos, textos, juegos, software y otros materiales, está protegido por derechos de autor, marcas registradas y otras leyes de propiedad intelectual.</p>
                    <p>6.2 Australis Casino y sus licenciantes son los propietarios exclusivos de todos estos derechos de propiedad intelectual.</p>
                    <p>6.3 Se le concede una licencia limitada, no exclusiva, no transferible y revocable para utilizar nuestra plataforma con fines personales y no comerciales.</p>
                    <p>6.4 No se permite reproducir, distribuir, modificar, exhibir públicamente, transmitir o crear trabajos derivados de cualquier contenido disponible en nuestra plataforma sin autorización previa por escrito.</p>
                </>
            ), <BookOpen size={18} />)}

            {renderAccordionSection('7. Jurisdicción y Ley Aplicable', 'jurisdiccion', (
                <>
                    <p>7.1 Este acuerdo se rige e interpreta de acuerdo con las leyes de Malta, sin consideración a sus disposiciones sobre conflictos de leyes.</p>
                    <p>7.2 Cualquier disputa que surja en relación con nuestros servicios estará sujeta a la jurisdicción exclusiva de los tribunales de Malta.</p>
                    <p>7.3 Sin perjuicio de lo anterior, nos reservamos el derecho de iniciar procedimientos legales en cualquier jurisdicción que consideremos apropiada para proteger nuestros intereses.</p>
                    <p>7.4 Si alguna disposición de estos términos se considera inválida o inaplicable, dicha disposición se interpretará de manera consistente con la ley aplicable, y las disposiciones restantes permanecerán en pleno vigor y efecto.</p>
                </>
            ), <Globe size={18} />)}

            {renderAccordionSection('8. Impuestos y Obligaciones Fiscales', 'impuestos', (
                <>
                    <p>8.1 Es su responsabilidad conocer y cumplir con todas las obligaciones fiscales aplicables relacionadas con sus ganancias en Australis Casino.</p>
                    <p>8.2 En algunas jurisdicciones, podemos estar obligados a retener impuestos sobre sus ganancias o a informar sobre las mismas a las autoridades fiscales correspondientes.</p>
                    <p>8.3 No proporcionamos asesoramiento fiscal y le recomendamos consultar con un profesional en materia fiscal para obtener orientación específica sobre sus obligaciones.</p>
                    <p>8.4 En cumplimiento con las regulaciones aplicables, podemos emitir documentación fiscal relacionada con sus actividades en nuestra plataforma.</p>
                </>
            ))}

            {renderAccordionSection('9. Resolución de Disputas', 'disputas', (
                <>
                    <p>9.1 En caso de disputa relacionada con cualquier aspecto de nuestros servicios, nos comprometemos a resolverla de manera justa y eficiente.</p>
                    <p>9.2 Para iniciar un proceso de resolución de disputas, debe contactar a nuestro servicio de atención al cliente con todos los detalles relevantes.</p>
                    <p>9.3 Si no podemos resolver la disputa internamente, y usted es residente de la Unión Europea, puede utilizar la plataforma de Resolución de Litigios en Línea de la Comisión Europea disponible en: http://ec.europa.eu/consumers/odr/</p>
                    <p>9.4 También puede presentar quejas ante la autoridad reguladora correspondiente, como la Autoridad de Juegos de Malta o la DGOJ de España.</p>
                </>
            ))}

            {renderAccordionSection('10. Estructura Corporativa', 'corporativa', (
                <>
                    <p>10.1 Australis Casino es una marca comercial de Australis Gaming Group Ltd., una sociedad constituida bajo las leyes de Malta con número de registro C12345.</p>
                    <p>10.2 Nuestra sede principal está ubicada en: Business Centre, Level 3, Triq Dun Karm, Birkirkara, BKR 9033, Malta.</p>
                    <p>10.3 Mantenemos oficinas adicionales en España y otros países europeos para servir mejor a nuestros clientes internacionales.</p>
                    <p>10.4 Nuestra estructura corporativa cumple con todas las regulaciones aplicables en materia de transparencia empresarial y gobierno corporativo.</p>
                </>
            ), <Building size={18} />)}

            <div className="privacy-footer">
                <p>Última actualización: 6 de Mayo, 2025</p>
                <div className="gold-accent-footer"></div>
                <p>© 2025 Australis Casino. Todos los derechos reservados.</p>
            </div>
        </div>
    );
};

export default LegalPage;