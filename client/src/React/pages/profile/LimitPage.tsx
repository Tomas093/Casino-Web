import React, {useEffect, useState} from 'react';
import Sidebar from '@components/SideBar.tsx';
import {useAuth} from '@context/AuthContext';
import {useUser} from '@context/UserContext.tsx';
import {useLimitContext} from '@context/LimitContext';
import limitApi from '@api/limitApi.ts';
import '@css/ProfileStyle.css';
import '@css/LimitStyle.css';
import {useNavigate} from 'react-router-dom';

interface Limits {
    time: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    money: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

const LimitPage: React.FC = () => {
    const {user} = useAuth();
    const {getUserData} = useUser();
    const {getLimitHorario, getLimitMonetario, isLoading} = useLimitContext();
    const navigate = useNavigate();

    const [limits, setLimits] = useState<Limits>({
        time: {
            daily: 0,
            weekly: 0,
            monthly: 0,
        },
        money: {
            daily: 0,
            weekly: 0,
            monthly: 0,
        }
    });

    const [hasLoadedLimits, setHasLoadedLimits] = useState(false);
    const [activeTab, setActiveTab] = useState<'time' | 'money'>('time');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchLimits = async () => {
            try {
                if (user?.usuarioid) {
                    const timeLimitsArray = await getLimitHorario(user.usuarioid);
                    const moneyLimitsArray = await getLimitMonetario(user.usuarioid);

                    // Check if we have actual data
                    const timeLimits = timeLimitsArray.length > 0 ? timeLimitsArray[0] : null;
                    const moneyLimits = moneyLimitsArray.length > 0 ? moneyLimitsArray[0] : null;

                    setLimits({
                        time: {
                            daily: timeLimits?.limitediario ?? 0,
                            weekly: timeLimits?.limitesemanal ?? 0,
                            monthly: timeLimits?.limitemensual ?? 0,
                        },
                        money: {
                            daily: moneyLimits?.limitediario ? Number(moneyLimits.limitediario) : 0,
                            weekly: moneyLimits?.limitesemanal ? Number(moneyLimits.limitesemanal) : 0,
                            monthly: moneyLimits?.limitemensual ? Number(moneyLimits.limitemensual) : 0,
                        }
                    });

                    setHasLoadedLimits(true);
                }
            } catch (error) {
                console.error('Error fetching limits:', error);
                setMessage({type: 'error', text: 'Error al cargar los límites'});
            }
        };

        fetchLimits();
    }, [user, getLimitHorario, getLimitMonetario]);

    const updateUserLimits = async (userId: string, limits: Limits) => {
        try {
            await limitApi.updateLimitHorario(parseInt(userId), {
                limitediario: limits.time.daily,
                limitesemanal: limits.time.weekly,
                limitemensual: limits.time.monthly
            });

            await limitApi.updateLimitMonetario(parseInt(userId), {
                limitediario: limits.money.daily,
                limitesemanal: limits.money.weekly,
                limitemensual: limits.money.monthly
            });

            return true;
        } catch (error) {
            console.error('Error updating limits:', error);
            throw new Error('Failed to update limits');
        }
    };

    const handleIncrement = (category: 'time' | 'money', period: 'daily' | 'weekly' | 'monthly', amount: number) => {
        // Navigate to the ticket page instead of directly incrementing
        navigate('/monLimitTicket', {
            state: {
                category,
                period,
                currentValue: limits[category][period],
                increment: amount
            }
        });
    };

    const handleDecrement = (category: 'time' | 'money', period: 'daily' | 'weekly' | 'monthly', amount: number) => {
        setLimits(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [period]: Math.max(0, prev[category][period] - amount)
            }
        }));
    };

    const handleSaveLimits = async () => {
        if (!user?.usuarioid) {
            setMessage({type: 'error', text: 'No se pudo identificar al usuario'});
            return;
        }

        setIsSaving(true);

        try {
            await updateUserLimits(user.usuarioid.toString(), limits);
            setMessage({type: 'success', text: 'Límites actualizados correctamente'});

            // Refresh user data
            await getUserData(user.usuarioid.toString());
        } catch (err: any) {
            setMessage({type: 'error', text: err.message || 'Error al actualizar los límites'});
        } finally {
            setIsSaving(false);

            // Clear the message after 5 seconds
            setTimeout(() => {
                setMessage(null);
            }, 5000);
        }
    };

    const getLimitIncrement = (category: 'time' | 'money', period: 'daily' | 'weekly' | 'monthly') => {
        if (category === 'time') {
            return period === 'daily' ? 15 : period === 'weekly' ? 60 : 120; // 15 min, 1 hour, 2 hours
        } else {
            return period === 'daily' ? 50 : period === 'weekly' ? 100 : 500; // 50, 100 or 500 AC
        }
    };

    const formatValue = (category: 'time' | 'money', value: number) => {
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

    if (isLoading || !hasLoadedLimits) {
        return (
            <div className="container">
                <Sidebar/>
                <main className="main-content">
                    <div className="loading-indicator">Cargando límites...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="container">
            <Sidebar/>

            <main className="main-content">
                <div className="profile-container">
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>Límites de juego</h2>
                        </div>

                        {message && (
                            <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="limit-tabs">
                            <button
                                className={`tab-button ${activeTab === 'time' ? 'active' : ''}`}
                                onClick={() => setActiveTab('time')}
                            >
                                Límites de tiempo
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'money' ? 'active' : ''}`}
                                onClick={() => setActiveTab('money')}
                            >
                                Límites de dinero
                            </button>
                        </div>

                        <div className="limit-container">
                            <div className="limit-description">
                                {activeTab === 'time' ? (
                                    <p>Establece un límite de tiempo para tus sesiones de juego. Te ayudará a mantener
                                        un hábito de juego saludable.</p>
                                ) : (
                                    <p>Establece un límite de dinero para tus apuestas. Te ayudará a mantener el control
                                        de tus gastos.</p>
                                )}
                            </div>

                            <div className="limits-grid">
                                {/* Daily limit */}
                                <div className="limit-card">
                                    <h3>Límite diario</h3>
                                    <div className="limit-value-container">
                                        <button
                                            className="limit-button decrease"
                                            onClick={() => handleDecrement(activeTab, 'daily', getLimitIncrement(activeTab, 'daily'))}
                                        >
                                            -
                                        </button>
                                        <div className="limit-value">
                                            {formatValue(activeTab, limits[activeTab].daily)}
                                        </div>
                                        <button
                                            className="limit-button increase"
                                            onClick={() => handleIncrement(activeTab, 'daily', getLimitIncrement(activeTab, 'daily'))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Weekly limit */}
                                <div className="limit-card">
                                    <h3>Límite semanal</h3>
                                    <div className="limit-value-container">
                                        <button
                                            className="limit-button decrease"
                                            onClick={() => handleDecrement(activeTab, 'weekly', getLimitIncrement(activeTab, 'weekly'))}
                                        >
                                            -
                                        </button>
                                        <div className="limit-value">
                                            {formatValue(activeTab, limits[activeTab].weekly)}
                                        </div>
                                        <button
                                            className="limit-button increase"
                                            onClick={() => handleIncrement(activeTab, 'weekly', getLimitIncrement(activeTab, 'weekly'))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Monthly limit */}
                                <div className="limit-card">
                                    <h3>Límite mensual</h3>
                                    <div className="limit-value-container">
                                        <button
                                            className="limit-button decrease"
                                            onClick={() => handleDecrement(activeTab, 'monthly', getLimitIncrement(activeTab, 'monthly'))}
                                        >
                                            -
                                        </button>
                                        <div className="limit-value">
                                            {formatValue(activeTab, limits[activeTab].monthly)}
                                        </div>
                                        <button
                                            className="limit-button increase"
                                            onClick={() => handleIncrement(activeTab, 'monthly', getLimitIncrement(activeTab, 'monthly'))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="limit-info">
                                {activeTab === 'time' ? (
                                    <p>Cuando alcances tu límite de tiempo, se te notificará y no podrás seguir jugando
                                        hasta que el período termine.</p>
                                ) : (
                                    <p>Cuando alcances tu límite de dinero, no podrás realizar más apuestas hasta que el
                                        período termine.</p>
                                )}
                            </div>

                            <div className="button-group">
                                <button
                                    className="save-btn"
                                    onClick={handleSaveLimits}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LimitPage;
