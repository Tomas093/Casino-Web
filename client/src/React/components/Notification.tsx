import '@css/NotificationStyle.css';
import React, {useEffect, useState, useRef} from 'react';
import {useNotificationContext} from '../context/NotificationContext';
import {useAuth} from '@context/AuthContext';
import notificationApi from "@api/notificationApi.ts";
import {useNavigate} from 'react-router-dom';

interface NotificationDropdownProps {
    userId?: number;
    onClose?: () => void;
    isOpen?: boolean; // Nueva prop para controlar visibilidad
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({userId, onClose, isOpen = true}) => {
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
    const [isVisible, setIsVisible] = useState(isOpen); // Estado interno para controlar visibilidad
    const dropdownRef = useRef<HTMLDivElement>(null);

    const effectiveUserId = userId || user?.usuarioid;
    const navigate = useNavigate();

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

    const manejarClickNotificacion = async (notificacion: any): Promise<void> => {
        if (notificacion.destino) {
            if (notificacion.notificacion_id && notificacion.estado !== 'leida') {
                try {
                    await notificationApi.updateNotification(notificacion.notificacion_id, "leida");
                    if (effectiveUserId) {
                        fetchUserNotifications(effectiveUserId);
                    }
                } catch (error) {
                    console.error('Error al marcar notificación como leída:', error);
                }
            }
            navigate(notificacion.destino);
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

    // Función para cerrar el dropdown - SIN DOBLE CLICK
    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if (onClose) {
            onClose();
        } else {
            setIsVisible(false);
        }
    };

    // Efecto para sincronizar con prop isOpen
    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    // Si no es visible, no renderizar nada
    if (!isVisible) {
        return null;
    }

    if (!effectiveUserId) {
        return (
            <div className="notif-dropdown">
                <div className="notif-header">
                    <h3 className="notif-title">Notificaciones</h3>
                    <button
                        className="notif-close-btn"
                        onClick={handleClose}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        aria-label="Cerrar notificaciones"
                        type="button"
                    >
                        <span
                            className="notif-close-icon"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                            }}
                        >
                            ×
                        </span>
                    </button>
                </div>
                <div className="notif-list">
                    <div className="notif-empty">
                        Inicia sesión para ver notificaciones
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="notif-dropdown">
                <div className="notif-header">
                    <h3 className="notif-title">Notificaciones</h3>
                    <button
                        className="notif-close-btn"
                        onClick={handleClose}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        aria-label="Cerrar notificaciones"
                        type="button"
                    >
                        <span
                            className="notif-close-icon"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                            }}
                        >
                            ×
                        </span>
                    </button>
                </div>
                <div className="notif-list">
                    <div className="notif-empty">
                        Cargando notificaciones...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notif-dropdown">
                <div className="notif-header">
                    <h3 className="notif-title">Notificaciones</h3>
                    <button
                        className="notif-close-btn"
                        onClick={handleClose}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        aria-label="Cerrar notificaciones"
                        type="button"
                    >
                        <span
                            className="notif-close-icon"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                            }}
                        >
                            ×
                        </span>
                    </button>
                </div>
                <div className="notif-list">
                    <div className="notif-empty">
                        Error al cargar notificaciones: {error}
                    </div>
                </div>
            </div>
        );
    }

    // Contar notificaciones no leídas
    const unreadCount = notifications.filter(n => n.estado === 'no_leida').length;

    return (
        <div className="notif-dropdown">
            <div className="notif-header">
                <h3 className="notif-title">
                    Notificaciones {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <button
                    className="notif-close-btn"
                    onClick={handleClose}
                    aria-label="Cerrar notificaciones"
                    type="button"
                >
                    <span className="notif-close-icon">×</span>
                </button>
            </div>
            <div className="notif-list">
                {notifications.length === 0 ? (
                    <div className="notif-empty">
                        No tienes notificaciones
                    </div>
                ) : (
                    notifications.map((notificacion, index) => (
                        <div
                            key={notificacion.notificacion_id || index}
                            onClick={() => manejarClickNotificacion(notificacion)}
                            className={`notif-item ${
                                notificacion.estado === 'no_leida' ? 'notif-unread' : ''
                            }`}
                        >
                            <div className="notif-item-header">
                                <h4 className={`notif-item-title ${
                                    notificacion.estado === 'no_leida' ? 'notif-title-unread' : 'notif-title-read'
                                }`}>
                                    {notificacion.titulo}
                                </h4>
                                <div className="notif-item-actions">
                                    {notificacion.estado === 'no_leida' && (
                                        <span className="notif-dot" title="No leída"></span>
                                    )}
                                    {notificacion.destino && (
                                        <span className="notif-external-link-icon" title="Ir al destino"></span>
                                    )}
                                    {notificacion.notificacion_id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                eliminarNotificacion(notificacion.notificacion_id!);
                                            }}
                                            className="notif-delete-btn"
                                            title="Eliminar notificación"
                                            aria-label="Eliminar notificación"
                                            type="button"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="notif-content">
                                {notificacion.contenido}
                            </p>
                            <div className="notif-meta">
                                <span className="notif-date">
                                    {formatearFecha(notificacion.fecha)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
                <div className="notif-footer">
                    <button
                        className="notif-mark-all-btn"
                        onClick={marcarTodasComoLeidas}
                        disabled={isMarkingAllAsRead}
                        type="button"
                    >
                        {isMarkingAllAsRead ? 'Marcando...' : `Marcar todas como leídas (${unreadCount})`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;