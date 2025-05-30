import {useAuth} from '@context/AuthContext.tsx';
                import {useSuspendidos} from '@context/SupendidosContext.tsx';
                import '@css/LoginStyle.css';
                import {useState} from 'react';
                import {Link, useNavigate} from 'react-router-dom';
                import Message from '@components/Error/Message.tsx';
                import Form from '../../components/Form.tsx';
                import tiempodesesionApi from '@api/tiempodesesionApi.ts';

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
                                setMessageType('warning');
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