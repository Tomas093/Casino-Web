import '@css/NotificationStyle.css';

const NotificationDropdown = () => {
    // Datos de ejemplo para las notificaciones
    const notifications = [
        {
            usuarioId: 'usr_001',
            titulo: 'Nueva mensaje recibido',
            contenido: 'Tienes un nuevo mensaje de María González sobre el proyecto.',
            destino: '/mensajes/123',
            fecha: '2025-07-14T10:30:00Z',
            estado: 'no_leida'
        },
        {
            usuarioId: 'usr_001',
            titulo: 'Recordatorio de reunión',
            contenido: 'Tu reunión con el equipo de desarrollo comienza en 15 minutos.',
            destino: '/calendario/reunion-456',
            fecha: '2025-07-14T09:45:00Z',
            estado: 'leida'
        },
        {
            usuarioId: 'usr_001',
            titulo: 'Actualización del sistema',
            contenido: 'El sistema se actualizará esta noche a las 2:00 AM.',
            destino: '/configuracion/actualizaciones',
            fecha: '2025-07-14T08:20:00Z',
            estado: 'no_leida'
        },
        {
            usuarioId: 'usr_001',
            titulo: 'Tarea completada',
            contenido: 'La tarea "Revisar documentos" ha sido marcada como completada.',
            destino: '/tareas/789',
            fecha: '2025-07-13T16:15:00Z',
            estado: 'leida'
        }
    ];

    const formatearFecha = (fecha: string): string => {
        const now = new Date();
        const notifDate = new Date(fecha);
        const diffHours = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Hace unos minutos';
        if (diffHours < 24) return `Hace ${diffHours}h`;
        return notifDate.toLocaleDateString();
    };

    const manejarClickNotificacion = (notificacion: { destino: string }): void => {
        console.log(`Navegando a: ${notificacion.destino}`);
        alert(`TODO: Navegar a ${notificacion.destino}`);
    };

    return (
        <div className="notification-dropdown">
            {/* Header */}
            <div className="notification-header">
                <h3 className="notification-title">Notificaciones</h3>
                <button className="notification-close-btn">
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
                            key={index}
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
                    <button className="mark-all-read-btn">
                        Marcar todas como leídas
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;