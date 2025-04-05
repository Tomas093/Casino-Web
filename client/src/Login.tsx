// pages/Login/Login.tsx
import { Link, useNavigate } from 'react-router-dom';
import Form from './Form';
import { useAuth } from './AuthContext.tsx';
import './LoginStyle.css';

const Login = () => {
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (data: any) => {
        await login(data);
        if (!error) {
            navigate('/history');
        }
    };

    return (
        <div className="login-page">
            <Form
                title="Australis"
                subtitle="Ingresa a tu cuenta"
                submitButtonText="Ingresar"
                fields={[
                    { name: 'email', type: 'email', placeholder: 'Email@domain.com', required: true },
                    { name: 'password', type: 'password', placeholder: 'Contraseña', required: true },
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