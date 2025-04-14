import axios from 'axios';

const API_URL = 'http://localhost:3001/auth';

// Configurar axios para enviar cookies en todas las peticiones
axios.defaults.withCredentials = true;

export interface RegisterData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    edad: number;
    dni: string;
}

export interface LoginData {
    email: string;
    password: string;
}

const authApi = {
    login: async (loginData: LoginData) => {
        try {
            const response = await axios.post(`${API_URL}/login`, loginData);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Error en el servidor');
            } else if (error.request) {
                throw new Error('No se recibió respuesta del servidor');
            } else {
                throw new Error(error.message);
            }
        }
    },

    logout: async () => {
        try {
            const response = await axios.post(`${API_URL}/logout`);
            return response.data;
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    },

    register: async (userData: RegisterData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Error en el registro');
            } else {
                throw error;
            }
        }
    },

    checkSession: async () => {
        try {
            const response = await axios.get(`${API_URL}/check-session`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default authApi;