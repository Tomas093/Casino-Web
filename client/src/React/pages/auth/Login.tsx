import {Link, useNavigate} from 'react-router-dom';
import Form from '@components/Form';
import {useAuth} from '@context/AuthContext.tsx';
import '@css/LoginStyle.css';
import {useState} from 'react';

const Login = () => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (data: any) => {
        try {
            const success = await login(data.email, data.password);
            if (success) {
                navigate('/home');
            } else {
                setErrorMessage('Email o contraseña incorrectos. Por favor intente nuevamente.');
                setShowErrorPopup(true);
            }
        } catch (error) {
            setErrorMessage('Email o contraseña incorrectos. Por favor intente nuevamente.');
            setShowErrorPopup(true);
        }
    };

    const closePopup = () => {
        setShowErrorPopup(false);
    };

    return (
        <div className="login-page">
            {showErrorPopup && (
                <div className="error-popup" style={{
                    position: 'fixed',
                    top: '25%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    padding: '15px 25px',
                    borderRadius: '5px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    maxWidth: '80%',
                    textAlign: 'center'
                }}>
                    <span>{errorMessage}</span>
                    <button
                        onClick={closePopup}
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
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