import React from 'react';
import Notification from './Notification';

const NotificationDemo: React.FC = () => {
    // Sample notification data
    const sampleNotifications = [
        {
            usuarioId: "user123",
            titulo: "Nueva mensajería",
            contenido: "Tienes un nuevo mensaje de María en tu bandeja de entrada.",
            destino: "/mensajes/inbox",
            fecha: "2023-05-15",
            estado: "no_leido" as const
        },
        {
            usuarioId: "user123",
            titulo: "Recordatorio de cita",
            contenido: "Tu cita con Dr. García está programada para mañana a las 10:00 AM.",
            destino: "/citas/details/15",
            fecha: new Date(),
            estado: "leido" as const
        },
        {
            usuarioId: "user123",
            titulo: "Actualización del sistema",
            contenido: "El sistema estará en mantenimiento este domingo de 2:00 AM a 4:00 AM.",
            destino: "/notificaciones/sistema",
            fecha: "2023-05-10",
            estado: "leido" as const
        }
    ];

    return (
        <div className="notification-container" style={{maxWidth: '400px', margin: '20px auto'}}>
            <h2>Tus Notificaciones</h2>
            {sampleNotifications.map((notification, index) => (
                <Notification
                    key={index}
                    {...notification}
                />
            ))}
        </div>
    );
};

export default NotificationDemo;