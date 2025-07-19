import {useAuth} from '@context/AuthContext.tsx';
import {useSuspendidos} from '@context/SuspendidosContext.tsx';
import '@css/LoginStyle.css';
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Message from '@components/Error/Message.tsx';
import Form from '../../components/Form.tsx';
import tiempodesesionApi from '@api/tiempodesesionApi.ts';
import {CredentialResponse} from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";


interface LoginProps {
    footerText?: React.ReactNode;
}

const Login: React.FC<LoginProps> = () => {
    const {login, getUserByEmail} = useAuth();
    const {getSuspendidosByUserId} = useSuspendidos();
    const navigate = useNavigate();
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'error' | 'warning' | 'info' | 'success'>('warning');

    const handleSubmit = async (data: any) => {
        try {
            const user = await getUserByEmail(data.email);
            if (!user) {
                setMessage('Email o contraseña incorrectos. Por favor intente nuevamente.');
                setMessageType('error');
                setShowMessage(true);
                return;
            }

            const suspensions = await getSuspendidosByUserId(user.usuarioid);

            let activeSuspension = null;
            if (Array.isArray(suspensions)) {
                activeSuspension = suspensions.find(
                    (s: any) => !s.fechafin || new Date(s.fechafin) > new Date()
                );
            } else if (suspensions && (!suspensions.fechafin || new Date(suspensions.fechafin) > new Date())) {
                activeSuspension = suspensions;
            }

            if (activeSuspension) {
                const endDate = activeSuspension.fechafin
                    ? new Date(activeSuspension.fechafin).toLocaleDateString()
                    : 'indefinida';
                setMessage(`Tu cuenta está suspendida hasta el ${endDate}.`);
                setMessageType('error');
                setShowMessage(true);
                return;
            }

            const success = await login(data.email, data.password);
            if (success) {
                const tiempoDeJuego = await tiempodesesionApi.createtiempodesesion({
                    usuarioid: user.usuarioid,
                    final: null
                });
                localStorage.setItem('timepodesesionid', tiempoDeJuego.tiempodesesionid);
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

    const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
        try {
            const {credential} = credentialResponse;

            if (!credential) {
                setMessage('Error al iniciar sesión con Google. Por favor intente nuevamente.');
                setMessageType('error');
                setShowMessage(true);
                return;
            }

            // Decodificar el JWT de Google para obtener la información del usuario
            const decodedToken = jwtDecode(credential) as any;
            const googleEmail = decodedToken.email;

            if (!googleEmail) {
                setMessage('No se pudo obtener el email de Google. Por favor intente nuevamente.');
                setMessageType('error');
                setShowMessage(true);
                return;
            }

            // Buscar el usuario en la base de datos por email
            const user = await getUserByEmail(googleEmail);
            if (!user) {
                setMessage('No existe una cuenta asociada a este email de Google. Por favor regístrese primero.');
                setMessageType('error');
                setShowMessage(true);
                return;
            }

            // Verificar suspensiones del usuario
            const suspensions = await getSuspendidosByUserId(user.usuarioid);

            let activeSuspension = null;
            if (Array.isArray(suspensions)) {
                activeSuspension = suspensions.find(
                    (s: any) => !s.fechafin || new Date(s.fechafin) > new Date()
                );
            } else if (suspensions && (!suspensions.fechafin || new Date(suspensions.fechafin) > new Date())) {
                activeSuspension = suspensions;
            }

            if (activeSuspension) {
                const endDate = activeSuspension.fechafin
                    ? new Date(activeSuspension.fechafin).toLocaleDateString()
                    : 'indefinida';
                setMessage(`Tu cuenta está suspendida hasta el ${endDate}.`);
                setMessageType('error');
                setShowMessage(true);
                return;
            }

            // Si llegamos aquí, el usuario existe y no está suspendido
            const success = await login(decodedToken.email, null);
            if (success) {
                const tiempoDeJuego = await tiempodesesionApi.createtiempodesesion({
                    usuarioid: user.usuarioid,
                    final: null
                });
                localStorage.setItem('timepodesesionid', tiempoDeJuego.tiempodesesionid);
                navigate('/home');
            } else {
                setMessage('Email o contraseña incorrectos. Por favor intente nuevamente.');
                setMessageType('warning');
                setShowMessage(true);
            }

        } catch (error) {
            console.error('Error en Google Login:', error);
            setMessage('Error al iniciar sesión con Google. Por favor intente nuevamente.');
            setMessageType('error');
            setShowMessage(true);
        }
    };


    const handleGoogleLoginError = async () => {
        setMessage("Error al iniciar sesión con Google. Intente nuevamente.");
        setMessageType('error');
        setShowMessage(true);
    }

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
                showGoogleButton={true}
                onGoogleError={handleGoogleLoginError}
                onGoogleSuccess={handleGoogleLogin}
                googleButtonText="Continuar con Google"
                fields={[
                    {name: 'email', type: 'email', placeholder: 'Email@domain.com', required: true},
                    {name: 'password', type: 'password', placeholder: 'Contraseña', required: true},
                ]}
                termsText={
                    <>
                        Al Ingresar, declaro que soy mayor de 18 años y acepto los{' '}
                        <Link to="/terms" className="terms-link">
                            <strong>Términos y Condiciones</strong>
                        </Link>
                    </>
                }
                onSubmit={handleSubmit}
                footerText={
                    <span>
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="register-link">
                            Regístrate aquí
                        </Link>
                    </span>
                }
            />
        </div>
    );
};

export default Login;