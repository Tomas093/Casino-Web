import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '@context/AuthContext';
import {useTicket} from '@context/TicketContext';
import {useUser} from '@context/UserContext.tsx';
import Sidebar from '@components/SideBar.tsx';
import '@css/ProfileStyle.css';
import '@css/LimitStyle.css';

interface LocationState {
    category: 'time' | 'money';
    period: 'daily' | 'weekly' | 'monthly';
    currentValue: number;
    increment: number;
}

const MonLimitTicketPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {user} = useAuth();
    const {createTicket} = useTicket();
    const {client} = useUser();

    const [email, setEmail] = useState('');
    const [newLimit, setNewLimit] = useState<number>(0);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Get the state passed from the LimitPage
    const state = location.state as LocationState | null;

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }

        if (state?.currentValue) {
            setNewLimit(state.currentValue + (state.increment || 0));
        }
    }, [user, state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.usuarioid || !state) {
            setMessage({type: 'error', text: 'Información de usuario o límite no disponible'});
            return;
        }

        setIsSubmitting(true);

        try {

            await createTicket({
                clienteid: client?.clienteid || 0, // Use clienteid, not usuarioid
                problema: `Solicitud de aumento de limite (${formatCategory(state.category)} ${formatPeriod(state.period)}):\nLímite actual: ${formatValue(state.category, state.currentValue)}\nNuevo límite: ${formatValue(state.category, newLimit)}\nMotivo: ${reason}`,
                categoria: 'Aumento de limite',
                prioridad: 'media'
            });

            setTimeout(() => {
                navigate('/limit');
            }, 2000);
        } catch (error) {
            console.error('Error updating limit or creating ticket:', error);
            setMessage({type: 'error', text: 'Error al actualizar el límite o crear el ticket'});
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCategory = (category?: 'time' | 'money') => {
        return category === 'time' ? 'tiempo' : 'dinero';
    };

    const formatPeriod = (period?: 'daily' | 'weekly' | 'monthly') => {
        switch (period) {
            case 'daily':
                return 'diario';
            case 'weekly':
                return 'semanal';
            case 'monthly':
                return 'mensual';
            default:
                return '';
        }
    };

    const formatValue = (category?: 'time' | 'money', value: number = 0) => {
        if (category === 'time') {
            if (value >= 60) {
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
            }
            return `${value}m`;
        } else {
            return `${value} AC`;
        }
    };

    const handleNumericInput = (value: string): number => {
        if (value === '') {
            return state?.currentValue || 0;
        }
        const parsedValue = parseInt(value);
        return !isNaN(parsedValue) ? parsedValue : state?.currentValue || 0;
    };

    return (
        <div className="container">
            <Sidebar/>
            <main className="main-content">
                <div className="profile-container">
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>Solicitud de aumento de límite</h2>
                        </div>

                        {message && (
                            <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="limit-container">
                            <form onSubmit={handleSubmit} className="limit-form">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={!!user?.email}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="limitType">Tipo de límite</label>
                                    <input
                                        type="text"
                                        id="limitType"
                                        value={`${formatCategory(state?.category)} ${formatPeriod(state?.period)}`}
                                        disabled
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="currentLimit">Límite actual</label>
                                    <input
                                        type="text"
                                        id="currentLimit"
                                        value={formatValue(state?.category, state?.currentValue)}
                                        disabled
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="newLimit">Nuevo límite</label>
                                    <input
                                        type="number"
                                        id="newLimit"
                                        value={newLimit}
                                        onChange={(e) => setNewLimit(handleNumericInput(e.target.value))}
                                        min={state?.currentValue || 0}
                                        required
                                        className="form-input"
                                    />
                                    <small className="form-hint">*El nuevo límite debe ser mayor que el límite
                                        actual</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reason">¿Por qué quieres aumentar el límite?</label>
                                    <textarea
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        rows={4}
                                        className="form-textarea"
                                    />
                                </div>

                                <div className="button-group">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => navigate('/limit')}
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="save-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MonLimitTicketPage;