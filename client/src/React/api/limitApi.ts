import axios from 'axios';

const API_URL = 'http://localhost:3001/limit';

export interface LimitData {
    clienteid: number;
    limitediario: number;
    limitesemanal: number;
    limitemensual: number;
}

interface LimitUpdateData {
    limitediario: number;
    limitesemanal: number;
    limitemensual: number;
}

const limitApi = {
    getLimitHorario: async (userId: number) => {
        const response = await axios.get(`${API_URL}/limitehorario/${userId}`);
        return response.data;
    },

    getLimitMonetario: async (userId: number) => {
        const response = await axios.get(`${API_URL}/limitemonetario/${userId}`);
        return response.data;
    },

    updateLimitHorario: async (userId: number, limits: LimitUpdateData) => {
        const response = await axios.put(`${API_URL}/limitehorario/${userId}`, limits);
        return response.data;
    },

    updateLimitMonetario: async (userId: number, limits: LimitUpdateData) => {
        const response = await axios.put(`${API_URL}/limitemonetario/${userId}`, limits);
        return response.data;
    },

    getLimitHorarioByClienteId: async (clienteId: number) => {
        const response = await axios.get(`${API_URL}/limitehorario/cliente/${clienteId}`);
        return response.data;
    },

    getLimitMonetarioByClienteId: async (clienteId: number) => {
        const response = await axios.get(`${API_URL}/limitemonetario/cliente/${clienteId}`);
        return response.data;
    },

    updateLimitHorarioByClienteId: async (clienteId: number, limits: LimitUpdateData) => {
        const response = await axios.put(`${API_URL}/limitehorario/cliente/${clienteId}`, limits);
        return response.data;
    },

    updateLimitMonetarioByClienteId: async (clienteId: number, limits: LimitUpdateData) => {
        const response = await axios.put(`${API_URL}/limitemonetario/cliente/${clienteId}`, limits);
        return response.data;
    }
};

export default limitApi;