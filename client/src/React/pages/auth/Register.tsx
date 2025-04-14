import {Link} from 'react-router-dom';
import Form from '@components/Form';
import React from 'react';
import '@css/RegisterStyle.css';

const Register: React.FC = () => {
    return (
        <div className="register-page">
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
                        {name: 'edad', type: 'number', placeholder: 'Edad', required: true, min: 18},
                        {name: 'dni', type: 'text', placeholder: 'DNI', required: true}
                    ]}
                    termsText={
                        <>
                            Al registrarme, declaro que soy mayor de 18 años, que no me encuentro incluido dentro de ninguna de
                            las prohibiciones conforme la normativa vigente,
                            acepto los <Link to="/TerminosyCondiciones" className="no-link"><strong> Términos y
                            Condiciones</strong></Link>
                            y acepto recibir información promocional. Para más detalles, ver nuestra
                            <Link to="/politica-privacidad" className="no-link"><strong> Política de Privacidad</strong></Link>
                        </>
                    }
                    onSubmit={async (formData) => {
                        try {
                            //verficar que el dni tenga solo numeros
                            if (!/^\d+$/.test(formData.dni)) {
                                alert('El DNI solo puede contener números');
                                return;
                            }

                            // Veirficar si las contraseñas coinciden
                            if (formData.password !== formData.confirmPassword) {
                                alert('Las contraseñas no coinciden');
                                return;
                            }

                            const response = await fetch('http://localhost:3001/auth/register', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(formData)
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
                            }

                            console.log('Usuario registrado:', await response.json());
                            alert('Usuario registrado correctamente');
                            window.location.href = '/login';
                        } catch (error: any) {
                            console.error('Error al registrar:', error.message);
                            if (error.message.includes('Ya existe un usuario')) {
                                alert('Ya existe un usuario con ese email o DNI');
                            } else {
                                alert('Error al registrar usuario');
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Register;