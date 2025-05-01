import {Link, useNavigate} from 'react-router-dom';
import Form from '@components/Form';
import {useAuth} from '@context/AuthContext.tsx';
import '@css/LoginStyle.css';
import {useState} from 'react';
import Message from "@components/Error/Message.tsx";

const Login = () => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'error' | 'warning' | 'info' | 'success'>('warning');

    const handleSubmit = async (data: any) => {
        try {
            const success = await login(data.email, data.password);
            if (success) {
                navigate('/home');
            } else {
                setMessage('Email o contraseña incorrectos. Por favor intente nuevamente.');
                setMessageType('warning');
                setShowMessage(true);
            }
        } catch (error) {
            setMessage('Email o contraseña incorrectos. Por favor intente nuevamente.');
            setMessageType('warning');
            setShowMessage(true);
        }
    };

    return (
        <div className="login-page">
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
                        icon={<span style={{fontSize: '24px'}}>⚠️</span>}
                        onClose={() => setShowMessage(false)}
                    />
                )}
            </div>
            <Form
                title="Australis"
                subtitle="Ingresa a tu cuenta"
                submitButtonText="Ingresar"
                fields={[
                    {name: 'email', type: 'email', placeholder: 'Email@domain.com', required: true},
                    {name: 'password', type: 'password', placeholder: 'Contraseña', required: true},
                ]}
                termsText={
                    <>
                        Al Ingresar, declaro que soy mayor de 18 años y acepto los{' '}
                        <Link to="/TerminosyCondiciones" className="terms-link">
                            <strong>Términos y Condiciones</strong>
                        </Link>
                    </>
                }
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default Login;
