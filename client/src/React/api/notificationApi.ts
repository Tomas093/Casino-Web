import axios from 'axios';

const API_URL = 'http://localhost:3001/notification';

export interface NotificationData {
    notificacion_id?: number;
    usuarioid: number;
    titulo: string;
    contenido: string;
    destino: string;
    fecha: Date;
    estado: string;
}

const notificationApi = {

    createNotification: async (notificationData: NotificationData): Promise<NotificationData> => {
        try {
            const response = await axios.post(`${API_URL}/create`, notificationData);
            return response.data;
        } catch (error: any) {
            console.error('Error al crear Notificacion:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al crear Notificacion');
            } else {
                throw error;
            }
        }
    },

    getUserNotification: async (usuarioid: number): Promise<NotificationData> => {
        try {
            const response = await axios.get(`${API_URL}/${usuarioid}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error al obtener Notificacion con el UserId ${usuarioid}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al obtener Notificacion');
            } else {
                throw error;
            }
        }
    },

    deleteNotificationById: async (notificacion_id: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/delete/${notificacion_id}`);
        } catch (error: any) {
            console.error(`Error al eliminar Notificacion con ID ${notificacion_id}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al eliminar Notificacion');
            } else {
                throw error;
            }
        }
    },

    countUnreadNotificationsByUserId: async (usuarioid: number): Promise<number> => {
        try {
            const response = await axios.get(`${API_URL}/count/${usuarioid}`);
            return response.data.count;
        } catch (error: any) {
            console.error(`Error al obtener conteo de notificaciones para el usuario ${usuarioid}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al obtener conteo de notificaciones');
            } else {
                throw error;
            }
        }
    },

    markAllNotificationsAsRead: async (usuarioid: number): Promise<void> => {
        try {
            await axios.put(`${API_URL}/mark-all-read/${usuarioid}`);
        } catch (error: any) {
            console.error(`Error al marcar notificaciones como leídas para el usuario ${usuarioid}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al marcar notificaciones como leídas');
            } else {
                throw error;
            }
        }
    },

    updateNotification: async (notificacion_id: number, estado: string): Promise<NotificationData> => {
        try {
            const response = await axios.put(`${API_URL}/update/${notificacion_id}`, {estado});
            return response.data;
        } catch (error: any) {
            console.error(`Error al actualizar Notificacion con ID ${notificacion_id}:`, error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al actualizar Notificacion');
            } else {
                throw error;
            }
        }
    }
}

export default notificationApi;



