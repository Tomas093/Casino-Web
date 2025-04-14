import axios from 'axios';

const API_URL = 'http://localhost:3001';

interface EditAdminData {
    email: string,
    superadmin: boolean,
    balance: number
}

interface AdminCreateData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    edad: number;
    dni: string;
    superadmin: boolean;
}

export const adminApi = {
    getAdmins: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/getAdmins`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener administradores:', error);
            throw error;
        }
    },

    isAdmin: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/check-admin`);
            return response.status === 200;
        } catch (error) {
            console.error('Error al verificar si es admin:', error);
            return false;
        }
    },

    isSuperAdmin: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/check-superadmin`);
            return response.status === 200;
        } catch (error) {
            console.error('Error al verificar si es superadmin:', error);
            return false;
        }
    },

    createAdmin: async (adminData: AdminCreateData) => {
        try {
            const response = await axios.post(`${API_URL}/admin/create`, adminData);
            return response.data;
        } catch (error: any) {
            console.error('Error al crear administrador:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al crear administrador');
            }
            throw error;
        }
    },

    editAdmin: async (userId: string, userData: EditAdminData) => {
        try {
            const response = await axios.put(`${API_URL}/admin/edit/${userId}`, userData);
            return response.data;
        } catch (error: any) {
            console.error('Error al editar administrador:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error al editar administrador');
            }
            throw error;
        }
    }
};