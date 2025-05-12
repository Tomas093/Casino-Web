import React, {useEffect, useState} from 'react';
import {useLimitContext} from '@context/LimitContext';
import {usetiempodesesion} from '@context/TiempoDeSesionContext';
import {useSuspendidos} from '@context/SupendidosContext';
import {useAuth} from '@context/AuthContext';
import Message from '../components/Error/Message';

interface TimeLimit {
    limiteDiario?: number;
    limiteSemanal?: number;
    limiteMensual?: number;
}

const calculateTimeRemaining = (totalMinutes: number, limitMinutes: number): number => {
    return Math.max(0, limitMinutes - totalMinutes);
};

const LimitMonitor: React.FC = () => {
    const {user, logout} = useAuth();
    const {getLimitHorario} = useLimitContext();
    const {
        tiempodesesionDiario,
        tiempodesesionSemanal,
        tiempodesesionMensual,
        fetchAllStats
    } = usetiempodesesion();
    const {create: createSuspension, isUserSuspended} = useSuspendidos();

    const [limits, setLimits] = useState<TimeLimit>({});
    const [isSuspended, setIsSuspended] = useState<boolean>(false);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [warningType, setWarningType] = useState<'error' | 'warning' | 'info'>('warning');

    useEffect(() => {
        if (user?.usuarioid) {
            fetchAllStats(user.usuarioid);

            const loadLimits = async () => {
                try {
                    const limitData = await getLimitHorario(user.usuarioid);
                    if (Array.isArray(limitData) && limitData.length > 0) {
                        const rawLimit = limitData[0];
                        setLimits({
                            limiteDiario: rawLimit.limitediario,
                            limiteSemanal: rawLimit.limitesemanal,
                            limiteMensual: rawLimit.limitemensual
                        });
                    }
                } catch (error) {
                    // Error loading time limits
                }
            };

            const checkSuspension = async () => {
                try {
                    const suspended = await isUserSuspended(user.usuarioid);
                    setIsSuspended(suspended);
                } catch (error) {
                    // Error checking suspension status
                }
            };

            loadLimits();
            checkSuspension();
        }
    }, [user, fetchAllStats, getLimitHorario, isUserSuspended]);

    useEffect(() => {
        if (
            !user?.usuarioid ||
            isSuspended ||
            !tiempodesesionDiario ||
            !tiempodesesionSemanal ||
            !tiempodesesionMensual ||
            !limits
        ) {
            return;
        }

        const checkAndHandleLimits = async () => {
            const {limiteDiario = 0, limiteSemanal = 0, limiteMensual = 0} = limits;

            const dailyMinutes = tiempodesesionDiario.totalDurationMinutes;
            const weeklyMinutes = tiempodesesionSemanal.totalDurationMinutes;
            const monthlyMinutes = tiempodesesionMensual.totalDurationMinutes;

            if (limiteDiario > 0 && dailyMinutes >= limiteDiario) {
                await suspendUser('daily');
                return;
            } else if (limiteSemanal > 0 && weeklyMinutes >= limiteSemanal) {
                await suspendUser('weekly');
                return;
            } else if (limiteMensual > 0 && monthlyMinutes >= limiteMensual) {
                await suspendUser('monthly');
                return;
            }

            if (limiteDiario > 0) {
                const dailyRemaining = calculateTimeRemaining(dailyMinutes, limiteDiario);
                const warningThreshold = limiteDiario * 0.1;

                if (dailyRemaining > 0 && dailyRemaining <= warningThreshold) {
                    setWarningMessage(`¡Atención! Te quedan ${dailyRemaining} minutos de tu límite diario de juego.`);
                    setWarningType('warning');
                    return;
                }
            }

            if (limiteSemanal > 0) {
                const weeklyRemaining = calculateTimeRemaining(weeklyMinutes, limiteSemanal);
                const warningThreshold = limiteSemanal * 0.1;

                if (weeklyRemaining > 0 && weeklyRemaining <= warningThreshold) {
                    setWarningMessage(`¡Atención! Te quedan ${weeklyRemaining} minutos de tu límite semanal de juego.`);
                    setWarningType('warning');
                    return;
                }
            }

            if (limiteMensual > 0) {
                const monthlyRemaining = calculateTimeRemaining(monthlyMinutes, limiteMensual);
                const warningThreshold = limiteMensual * 0.1;

                if (monthlyRemaining > 0 && monthlyRemaining <= warningThreshold) {
                    setWarningMessage(`¡Atención! Te quedan ${monthlyRemaining} minutos de tu límite mensual de juego.`);
                    setWarningType('warning');
                    return;
                }
            }

            setWarningMessage(null);
        };

        checkAndHandleLimits();

        const intervalId = setInterval(checkAndHandleLimits, 60000); // revisar cada 1 minuto
        return () => clearInterval(intervalId);
    }, [
        user,
        isSuspended,
        limits,
        tiempodesesionDiario,
        tiempodesesionSemanal,
        tiempodesesionMensual,
        createSuspension
    ]);

    const suspendUser = async (limitType: 'daily' | 'weekly' | 'monthly') => {
        if (!user?.usuarioid) return;

        const today = new Date();
        let endDate = new Date();

        switch (limitType) {
            case 'daily':
                endDate.setUTCDate(today.getUTCDate() + 1);
                endDate.setUTCHours(3, 0, 0, 0); // UTC-3: 00:00
                break;
            case 'weekly':
                endDate.setUTCDate(today.getUTCDate() + (7 - today.getUTCDay() + 1));
                endDate.setUTCHours(3, 0, 0, 0); // UTC-3: 00:00
                break;
            case 'monthly':
                endDate.setUTCMonth(today.getUTCMonth() + 1);
                endDate.setUTCDate(1);
                endDate.setUTCHours(3, 0, 0, 0); // UTC-3: 00:00
                break;
        }

        try {
            await createSuspension({
                usuarioid: user.usuarioid,
                fechafin: endDate,
                razon: `Límite de tiempo ${limitType === 'daily' ? 'diario' : limitType === 'weekly' ? 'semanal' : 'mensual'} excedido`
            });

            setIsSuspended(true);
            setWarningMessage(`Has excedido tu límite de tiempo ${limitType === 'daily' ? 'diario' : limitType === 'weekly' ? 'semanal' : 'mensual'}. Tu cuenta ha sido suspendida hasta ${endDate.toLocaleDateString()}.`);
            setWarningType('error');

            logout();
        } catch (error) {
            // Error creating suspension
        }
    };

    if (!warningMessage) return null;

    return (
        <Message
            message={warningMessage}
            type={warningType}
            onClose={() => setWarningMessage(null)}
        />
    );
};

export default LimitMonitor;