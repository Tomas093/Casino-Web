import {Link} from 'react-router-dom';
import Form from '@components/Form';
import React, {useState} from 'react';
import '@css/RegisterStyle.css';
import Message from "@components/Error/Message.tsx";

const Register: React.FC = () => {
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'error' | 'warning' | 'info' | 'success'>('warning');

    // Helper to calculate age from birthdate
    const getAge = (birthdate: string) => {
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Helper to format date as yyyy/mm/dd
    const formatDate = (dateStr: string) => {
        // dateStr is 'yyyy-mm-dd'
        const [yyyy, mm, dd] = dateStr.split('-');
        return `${yyyy}/${mm}/${dd}`;
    };

    return (
        <div className="register-page">
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                width: '100%',
                maxWidth: '500px',
                display: 'flex',
                justifyContent: 'center'
            }}>
                {showMessage && (
                    <Message
                        message={message}
                        type={messageType}
                        icon={messageType === 'error'
                            ? <span style={{fontSize: '24px'}}>⛔</span>
                            : <span style={{fontSize: '24px'}}>⚠️</span>}
                        onClose={() => setShowMessage(false)}
                    />
                )}
            </div>
            <div className="body">
                <Form
                    title="Australis"
                    subtitle="Crea tu cuenta"
                    fields={[
                        {name: 'nombre', type: 'text', placeholder: 'Nombre', required: true},
                        {name: 'apellido', type: 'text', placeholder: 'Apellido', required: true},
                        {name: 'email', type: 'email', placeholder: 'Email@domain.com', required: true},
                        {name: 'password', type: 'password', placeholder: 'Contraseña', required: true},
                        {
                            name: 'confirmPassword',
                            type: 'password',
                            placeholder: 'Ingresa nuevamente la contraseña',
                            required: true
                        },
                        {name: 'birthdate', type: 'date', placeholder: 'Fecha de nacimiento', required: true},
                        {name: 'dni', type: 'text', placeholder: 'DNI', required: true}
                    ]}
                    termsText={
                        <>
                            Al registrarme, declaro que soy mayor de 18 años, que no me encuentro incluido dentro de
                            ninguna de
                            las prohibiciones conforme la normativa vigente,
                            acepto los <Link to="/terms" className="no-link"><strong> Términos y
                            Condiciones</strong></Link>
                            y acepto recibir información promocional. Para más detalles, ver nuestra
                            <Link to="/politica-privacidad" className="no-link"><strong> Política de Privacidad</strong></Link>
                        </>
                    }
                    onSubmit={async (formData) => {
                        try {
                            //verficar que el dni tenga solo numeros
                            if (!/^\d+$/.test(formData.dni)) {
                                setMessage('El DNI solo puede contener números');
                                setMessageType('warning');
                                setShowMessage(true);
                                return;
                            }

                            // Veirficar si las contraseñas coinciden
                            if (formData.password !== formData.confirmPassword) {
                                setMessage('Las contraseñas no coinciden');
                                setMessageType('warning');
                                setShowMessage(true);
                                return;
                            }

                            // Verificar si tiene al menos 18 años
                            if (!formData.birthdate || getAge(formData.birthdate) < 18) {
                                setMessage('Debes ser mayor de 18 años para registrarte');
                                setMessageType('warning');
                                setShowMessage(true);
                                return;
                            }

                            // Enviar la fecha de nacimiento como 'edad' en formato yyyy/mm/dd
                            const dataToSend = {
                                ...formData,
                                edad: formatDate(formData.birthdate)
                            };
                            delete dataToSend.birthdate;

                            const response = await fetch('http://localhost:3001/auth/register', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(dataToSend)
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
                            }

                            console.log('Usuario registrado:', await response.json());
                            window.location.href = '/login';
                        } catch (error: any) {
                            console.error('Error al registrar:', error.message);
                            if (error.message.includes('Ya existe un usuario')) {
                                setMessage('Ya existe un usuario con ese email o DNI');
                                setMessageType('warning');
                            } else {
                                setMessage('Error al registrar usuario');
                                setMessageType('error');
                            }
                            setShowMessage(true);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Register;