import '@css/NotificationStyle.css';
import React, {useEffect, useState} from 'react';
import {useNotificationContext} from '../context/NotificationContext';
import {useAuth} from '@context/AuthContext';
import notificationApi from "@api/notificationApi.ts";
import {useNavigate} from 'react-router-dom';

interface NotificationDropdownProps {
    userId?: number;
    onClose?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({userId, onClose}) => {
    const {user} = useAuth();
    const {
        notifications,
        loading,
        error,
        fetchUserNotifications,
        deleteNotification
    } = useNotificationContext();

    const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

    const effectiveUserId = userId || user?.usuarioid;

    useEffect(() => {
        if (effectiveUserId && !hasAttemptedFetch) {
            setHasAttemptedFetch(true);
            fetchUserNotifications(effectiveUserId);
        }
    }, [effectiveUserId, fetchUserNotifications, hasAttemptedFetch]);

    const formatearFecha = (fecha: Date | string): string => {
        const now = new Date();
        const notifDate = new Date(fecha);
        const diffHours = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Hace unos minutos';
        if (diffHours < 24) return `Hace ${diffHours}h`;
        return notifDate.toLocaleDateString();
    };


    // Inside the component:
    const navigate = useNavigate();

    const manejarClickNotificacion = async (notificacion: any): void => {
        if (notificacion.destino) {
            // Mark notification as read if it has an ID and isn't already read
            if (notificacion.notificacion_id && notificacion.estado !== 'leida') {
                try {
                    await notificationApi.updateNotification(notificacion.notificacion_id, "leida");
                    // Refresh notifications
                    if (effectiveUserId) {
                        fetchUserNotifications(effectiveUserId);
                    }
                } catch (error) {
                    console.error('Error al marcar notificación como leída:', error);
                }
            }

            // Navigate to the destination
            navigate(notificacion.destino);

            // Close dropdown if onClose exists
            if (onClose) {
                onClose();
            }
        }
    };

    const marcarTodasComoLeidas = async (): Promise<void> => {
        if (!effectiveUserId) return;

        try {
            setIsMarkingAllAsRead(true);
            await notificationApi.markAllNotificationsAsRead(effectiveUserId);
            await fetchUserNotifications(effectiveUserId);
        } catch (error) {
            console.error('Error al marcar notificaciones como leídas:', error);
        } finally {
            setIsMarkingAllAsRead(false);
        }
    };

    const eliminarNotificacion = async (notificacionId: number): Promise<void> => {
        try {
            await deleteNotification(notificacionId);
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
        }
    };

    // If no user ID is available, show a message
    if (!effectiveUserId) {
        return (
            <div className="notification-dropdown">
                <div className="notification-header">
                    <h3 className="notification-title">Notificaciones</h3>
                    <button className="notification-close-btn" onClick={onClose}>
                        <span className="close-icon">×</span>
                    </button>
                </div>
                <div className="notification-list">
                    <div className="notification-empty">
                        Inicia sesión para ver notificaciones
                    </div>
                </div>
            </div>
        );
    }

    // Showing loading state
    if (loading) {
        return (
            <div className="notification-dropdown">
                <div className="notification-header">
                    <h3 className="notification-title">Notificaciones</h3>
                    <button className="notification-close-btn" onClick={onClose}>
                        <span className="close-icon">×</span>
                    </button>
                </div>
                <div className="notification-list">
                    <div className="notification-empty">
                        Cargando notificaciones...
                    </div>
                </div>
            </div>
        );
    }

    // Show error if exists
    if (error) {
        return (
            <div className="notification-dropdown">
                <div className="notification-header">
                    <h3 className="notification-title">Notificaciones</h3>
                    <button className="notification-close-btn" onClick={onClose}>
                        <span className="close-icon">×</span>
                    </button>
                </div>
                <div className="notification-list">
                    <div className="notification-empty">
                        Error al cargar notificaciones: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-dropdown">
            {/* Header */}
            <div className="notification-header">
                <h3 className="notification-title">Notificaciones</h3>
                <button className="notification-close-btn" onClick={onClose}>
                    <span className="close-icon">×</span>
                </button>
            </div>

            {/* Lista de notificaciones */}
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="notification-empty">
                        No tienes notificaciones
                    </div>
                ) : (
                    notifications.map((notificacion, index) => (
                        <div
                            key={notificacion.notificacion_id || index}
                            onClick={() => manejarClickNotificacion(notificacion)}
                            className={`notification-item ${
                                notificacion.estado === 'no_leida' ? 'notification-unread' : ''
                            }`}
                        >
                            <div className="notification-item-header">
                                <h4 className={`notification-item-title ${
                                    notificacion.estado === 'no_leida' ? 'title-unread' : 'title-read'
                                }`}>
                                    {notificacion.titulo}
                                </h4>
                                <div className="notification-item-actions">
                                    {notificacion.estado === 'no_leida' && (
                                        <span className="notification-dot"></span>
                                    )}
                                    <span className="external-link-icon">🔗</span>
                                    {notificacion.notificacion_id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                eliminarNotificacion(notificacion.notificacion_id!);
                                            }}
                                            className="delete-notification-btn"
                                            title="Eliminar notificación"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="notification-content">
                                {notificacion.contenido}
                            </p>

                            <div className="notification-meta">
                                    <span className="notification-date">
                                        {formatearFecha(notificacion.fecha)}
                                    </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="notification-footer">
                    <button
                        className="mark-all-read-btn"
                        onClick={marcarTodasComoLeidas}
                        disabled={isMarkingAllAsRead}
                    >
                        {isMarkingAllAsRead ? 'Marcando...' : 'Marcar todas como leídas'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;