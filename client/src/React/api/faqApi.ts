import axios from 'axios';

const API_URL = 'http://localhost:3001/faq';

const faqApi = {
    getAllFAQs: async () => {
        try {
            const response = await axios.get(`${API_URL}/all`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener las preguntas frecuentes:', error);
            throw error;
        }
    },

    createFAQ: async (faqData: { pregunta: string; respuesta: string }) => {
        try {
            const response = await axios.post(`${API_URL}/`, faqData);
            return response.data;
        } catch (error) {
            console.error('Error al crear la pregunta frecuente:', error);
            throw error;
        }
    },

    updateFAQ: async (faqId: string, faqData: { pregunta: string; respuesta: string }) => {
        try {
            const response = await axios.put(`${API_URL}/${faqId}`, faqData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la pregunta frecuente:', error);
            throw error;
        }
    },

    deleteFAQ: async (faqId: string) => {
        try {
            const response = await axios.delete(`${API_URL}/${faqId}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar la pregunta frecuente:', error);
            throw error;
        }
    },

    getFAQsByCategory: async (category: string) => {
        try {
            const response = await axios.get(`${API_URL}/category/${category}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener las preguntas frecuentes por categoría:', error);
            throw error;
        }
    },

    getFAQByQuestion: async (question: string) => {
        try {
            const response = await axios.get(`${API_URL}/question/${question}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener la pregunta frecuente por pregunta:', error);
            throw error;
        }
    }
}
export default faqApi;
