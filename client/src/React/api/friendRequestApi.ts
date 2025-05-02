import axios from 'axios';

const API_URL = 'http://localhost:3001/friendRequest';


const friendRequestApi = {


    getFriends: async (id_usuario: number) => {
        try {
            const response = await axios.get(`${API_URL}/friends/${id_usuario}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener amigos');
            } else {
                throw error;
            }
        }
    },

    deleteFriend: async (id_remitente: number, id_receptor: number) => {
        try {
            const response = await axios.post(`${API_URL}/delete`, { id_remitente, id_receptor });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al eliminar amigo');
            } else {
                throw error;
            }
        }
    },

    getUserSearch: async (id_usuario: number) => {
        try {
            const response = await axios.get(`${API_URL}/getUsers/${id_usuario}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener usuarios');
            } else {
                throw error;
            }
        }
    },

    sendFriendRequest: async (id_remitente: number, id_receptor: number) => {
        try {
            const response = await axios.post(`${API_URL}/send`, { id_remitente, id_receptor });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al enviar solicitud de amistad');
            } else {
                throw error;
            }
        }
    },

    acceptFriendRequest: async (id_remitente: number, id_receptor: number) => {
        try {
            const response = await axios.post(`${API_URL}/accept`, { id_remitente, id_receptor });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al aceptar solicitud de amistad');
            } else {
                throw error;
            }
        }
    },

    rejectFriendRequest: async (id_remitente: number, id_receptor: number) => {
        try {
            const response = await axios.post(`${API_URL}/reject`, { id_remitente, id_receptor });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al rechazar solicitud de amistad');
            } else {
                throw error;
            }
        }
    },

    cancelFriendRequest: async (id_remitente: number, id_receptor: number) => {
        try {
            const response = await axios.post(`${API_URL}/cancel`, { id_remitente, id_receptor });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al cancelar solicitud de amistad');
            } else {
                throw error;
            }
        }
    },

    getPendingFriendRequests: async (id_usuario: number) => {
        try {
            const response = await axios.get(`${API_URL}/pending/${id_usuario}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener solicitudes de amistad pendientes');
            } else {
                throw error;
            }
        }
    },

    getSentFriendRequests: async (id_usuario: number) => {
        try {
            const response = await axios.get(`${API_URL}/sent/${id_usuario}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener solicitudes de amistad enviadas');
            } else {
                throw error;
            }
        }
    },
}

export default friendRequestApi;