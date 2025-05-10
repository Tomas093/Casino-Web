import axios from 'axios';

const API_URL = 'http://localhost:3001/transaction';

export interface TransactionData {
    usuarioid: number;
    fecha: string;
    metodo: string;
    monto: number;
    cuponid?: number;
}

const transactionApi = {
    createIngreso: async (transactionData: TransactionData) => {
        try {
            const response = await axios.post(`${API_URL}/ingreso`, transactionData);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al crear ingreso');
            } else {
                throw error;
            }
        }
    },

    createEgreso: async (transactionData: TransactionData) => {
        try {
            const response = await axios.post(`${API_URL}/retiro`, transactionData);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al crear egreso');
            } else {
                throw error;
            }
        }
    },

    getUserTransactions: async (userId: string) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener transacciones:', error);
            throw error;
        }
    },

    getTotalRevenue: async () => {
        try {
            const response = await axios.get(`${API_URL}/totalRevenue`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener ingresos totales:', error);
            return { gananciasNetas: 0 };
        }
    },

    getTransactionStatsByMethod: async () => {
        try {
            const response = await axios.get(`${API_URL}/methodCount`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener conteo por metodo:', error);
            throw error;
        }
    }

};

export default transactionApi;