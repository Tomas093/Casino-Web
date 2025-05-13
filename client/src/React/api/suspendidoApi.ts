import axios from 'axios';

const API_URL = 'http://localhost:3001/suspendidos';

export interface SuspendidosData {
    usuarioid: number;
    fechafin?: Date | null;
    adminid?: number;
    razon?: string;
}

const suspendidoApi = {
    createSuspendido: async (data: SuspendidosData) => {
        const response = await axios.post(`${API_URL}/create`, data);
        return response.data;
    },

    getSuspendidosByUserId: async (userId: number) => {
        const response = await axios.get(`${API_URL}/user/${userId}`);
        return response.data;
    },

    getAllSuspendidos: async () => {
        const response = await axios.get(`${API_URL}/all`);
        return response.data;
    },

    getSuspendidoById: async (suspendidosId: number) => {
        const response = await axios.get(`${API_URL}/${suspendidosId}`);
        return response.data;
    },

    updateSuspendido: async (suspendidosId: number, data: Partial<SuspendidosData>) => {
        const response = await axios.put(`${API_URL}/${suspendidosId}`, data);
        return response.data;
    },

    deleteSuspendido: async (suspendidosId: number) => {
        await axios.delete(`${API_URL}/${suspendidosId}`);
    },

    isUserSuspended: async (userId: number) => {
        const response = await axios.get(`${API_URL}/is-suspended/${userId}`);
        return response.data;
    }
};

export default suspendidoApi;