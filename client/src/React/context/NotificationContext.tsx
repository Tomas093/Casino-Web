import React, {createContext, ReactNode, useContext, useState} from 'react';
import notificationApi, {NotificationData} from '../api/notificationApi';

// Define the context interface
interface NotificationContextType {
    notifications: NotificationData[];
    loading: boolean;
    error: string | null;
    fetchUserNotifications: (userId: number) => Promise<void>;
    createNotification: (notification: NotificationData) => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    countUnreadNotificationsByUserId: (usuarioid: number) => Promise<number>;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Props for the context provider
interface NotificationProviderProps {
    children: ReactNode;
}

// Context provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({children}) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch notifications for a user
    const fetchUserNotifications = async (userId: number): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const data = await notificationApi.getUserNotification(userId);
            setNotifications(Array.isArray(data) ? data : [data]);
        } catch (err: any) {
            setError(err.message || 'Error al cargar notificaciones');
            console.error('Error al cargar notificaciones:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create a new notification
    const createNotification = async (notification: NotificationData): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const newNotification = await notificationApi.createNotification(notification);
            setNotifications(prev => [...prev, newNotification]);
        } catch (err: any) {
            setError(err.message || 'Error al crear la notificación');
            console.error('Error al crear la notificación:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete a notification
    const deleteNotification = async (id: number): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await notificationApi.deleteNotificationById(id);
            setNotifications(notifications.filter(notification =>
                notification.notificacion_id !== id));
        } catch (err: any) {
            setError(err.message || 'Error al eliminar la notificación');
            console.error('Error al eliminar la notificación:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Count unread notifications for a user
    const countUnreadNotificationsByUserId = async (usuarioid: number): Promise<number> => {
        setLoading(true);
        setError(null);
        try {
            const count = await notificationApi.countUnreadNotificationsByUserId(usuarioid);
            return count;
        } catch (err: any) {
            setError(err.message || 'Error al contar notificaciones no leídas');
            console.error('Error al contar notificaciones no leídas:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            loading,
            error,
            fetchUserNotifications,
            createNotification,
            deleteNotification,
            countUnreadNotificationsByUserId
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use the context
export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext debe ser usado dentro de un NotificationProvider');
    }
    return context;
};