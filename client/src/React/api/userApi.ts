import axios from 'axios';

const API_URL = 'http://localhost:3001/user';

export interface EditUserData {
    nombre: string;
    apellido: string;
    email: string;
    edad: Date | string; // Puede ser una fecha ISO o un objeto Date
    dni: string;
    balance: number;
    influencer: boolean;
}

const userApi = {
    getUserById: async (userId: string) => {
        try {
            const response = await axios.get(`${API_URL}/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error al obtener usuario ID ${userId}:`, error.response?.status || error.message);

            if (error.response && error.response.status === 404) {
                throw new Error(`Usuario con ID ${userId} no encontrado`);
            }

            throw error;
        }
    },

    editUser: async (userId: string, userData: EditUserData) => {
        try {
            const response = await axios.put(`${API_URL}/${userId}`, userData);
            return response.data;
        } catch (error: any) {
            console.error(`Error al editar usuario ID ${userId}:`, error.response?.status || error.message);

            if (error.response && error.response.status === 404) {
                throw new Error(`Usuario con ID ${userId} no encontrado`);
            }

            if (error.response) {
                throw new Error(error.response.data.message || 'Error al editar usuario');
            } else {
                throw error;
            }
        }
    },

    deleteUser: async (userId: string) => {
        try {
            console.log(`Intentando eliminar usuario con ID: ${userId}`);
            const response = await axios.delete(`${API_URL}/${userId}`);
            console.log(`Usuario con ID ${userId} eliminado con éxito`);
            return response.data;
        } catch (error: any) {
            console.error(`Error al eliminar usuario ID ${userId}:`, error.response?.status || error.message);

            if (error.response && error.response.status === 404) {
                throw new Error(`Usuario con ID ${userId} no encontrado o ya eliminado`);
            }

            throw error;
        }
    },

    // En un archivo de API (por ejemplo, userApi.ts)
    getUserCount: async () => {
        try {
            const response = await axios.get(`${API_URL}/count/total`);
            return response.data.total;
        } catch (error) {
            console.error('Error al obtener el conteo de usuarios:', error);
            throw error;
        }
    },

    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }
};

export default userApi;