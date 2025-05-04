import axios from 'axios';

const API_URL = 'http://localhost:3001/message';

export const messageApi = {
    createMessage: async (messageData: any) => {
        try {
            const response = await axios.post(`${API_URL}/create`, messageData);
            return response.data;
        } catch (error) {
            console.error('Error al crear mensaje:', error);
            throw error;
        }
    },

    getMessagesByTicketId: async (ticketId: number) => {
        try {
            const response = await axios.get(`${API_URL}/${ticketId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            throw error;
        }
    },

    editMessage: async (messageId: number, messageData: any) => {
        try {
            const response = await axios.put(`${API_URL}/edit/${messageId}`, messageData);
            return response.data;
        } catch (error) {
            console.error('Error al editar mensaje:', error);
            throw error;
        }
    }
}