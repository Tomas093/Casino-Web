import React, {useEffect, useState} from 'react';
import '@css/RecentActivitiesStyle.css';
import {useAdminStatics} from '@context/AdminStaticsContext.tsx';
import {Activity as ApiActivity} from '@api/adminStaticsApi';

interface Activity {
    id: number;
    type: string;
    title: string;
    detail: string;
    timestamp: string;
}

const RecentActivities: React.FC = () => {
    const {getRecentActivities, isLoading} = useAdminStatics();
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const apiData = await getRecentActivities();

                if (apiData && Array.isArray(apiData)) {
                    const mappedActivities: Activity[] = apiData.map((item: ApiActivity) => ({
                        id: item.id,
                        type: mapActivityTypeFromApi(item.tipo),
                        title: getActivityTitle(item.tipo),
                        detail: generateActivityDetail(item),
                        timestamp: formatTimestamp(item.fecha)
                    }));

                    setActivities(mappedActivities);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };

        fetchActivities();
    }, [getRecentActivities]);

    const mapActivityTypeFromApi = (tipo: string | undefined): string => {
        switch (tipo) {
            case 'big-win':
                return 'win';
            case 'high-deposit':
                return 'deposit';
            case 'high-withdrawal':
                return 'withdrawal';
            default:
                return 'default';
        }
    };

    const getActivityTitle = (tipo: string | undefined): string => {
        switch (tipo) {
            case 'big-win':
                return 'Big Win';
            case 'high-deposit':
                return 'Deposit';
            case 'high-withdrawal':
                return 'Withdrawal';
            default:
                return 'Activity';
        }
    };

    const generateActivityDetail = (item: ApiActivity): string => {
        switch (item.tipo) {
            case 'big-win':
                return `${item.usuario} won $${item.monto} ${item.juego ? `on ${item.juego}` : ''}`;
            case 'high-deposit':
                return `${item.usuario} deposited $${item.monto} ${item.metodo ? `via ${item.metodo}` : ''}`;
            case 'high-withdrawal':
                return `${item.usuario} withdrew $${item.monto} ${item.metodo ? `via ${item.metodo}` : ''}`;
            default:
                return `Activity by ${item.usuario}`;
        }
    };

    const formatTimestamp = (rawDate: Date | string | null): string => {
        if (!rawDate) return 'Fecha desconocida';

        try {
            // Para fechas en formato string (como "2025-05-09T13:49:58.000Z")
            if (typeof rawDate === 'string') {
                // Extraer directamente los componentes de la fecha y hora de la cadena UTC
                const match = rawDate.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

                if (match) {
                    const [_, year, month, day, hours, minutes, seconds] = match;
                    // Mostrar exactamente la hora que viene del backend (en UTC)
                    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
                }
            }

            // Si no es una cadena con formato UTC o no se pudo parsear, usar el enfoque anterior
            const activityDate = rawDate instanceof Date ? rawDate : new Date(rawDate);

            if (isNaN(activityDate.getTime())) return 'Fecha inválida';

            // Obtener componentes de la fecha en UTC
            const utcYear = activityDate.getUTCFullYear();
            const utcMonth = String(activityDate.getUTCMonth() + 1).padStart(2, '0');
            const utcDay = String(activityDate.getUTCDate()).padStart(2, '0');
            const utcHours = String(activityDate.getUTCHours()).padStart(2, '0');
            const utcMinutes = String(activityDate.getUTCMinutes()).padStart(2, '0');
            const utcSeconds = String(activityDate.getUTCSeconds()).padStart(2, '0');

            // Formatear la fecha en UTC directamente
            return `${utcDay}/${utcMonth}/${utcYear}, ${utcHours}:${utcMinutes}:${utcSeconds}`;
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return 'Error de fecha';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'login':
                return <div className="ra-activity-icon ra-icon-login"></div>;
            case 'deposit':
                return <div className="ra-activity-icon ra-icon-deposit"></div>;
            case 'withdrawal':
                return <div className="ra-activity-icon ra-icon-withdrawal"></div>;
            case 'win':
                return <div className="ra-activity-icon ra-icon-win"></div>;
            case 'loss':
                return <div className="ra-activity-icon ra-icon-loss"></div>;
            case 'registration':
                return <div className="ra-activity-icon ra-icon-registration"></div>;
            default:
                return <div className="ra-activity-icon ra-icon-default"></div>;
        }
    };

    return (
        <div className="ra-container">
            <h3 className="ra-widget-title">Recent Activities</h3>

            {isLoading ? (
                <div className="ra-loading">Loading activities...</div>
            ) : (
                <div className="ra-activities-list">
                    {activities.map((activity) => (
                        <div key={activity.id} className="ra-activity-item">
                            {getActivityIcon(activity.type)}
                            <div className="ra-activity-content">
                                <p className="ra-activity-title">{activity.title}</p>
                                <p className="ra-activity-detail">{activity.detail}</p>
                            </div>
                            <span className="ra-activity-time">{activity.timestamp}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentActivities;