import axios from 'axios';

const API_URL = 'http://localhost:3001/cupon';

export interface CuponData {
    cuponid: string;
    beneficio: number;
    fechainicio: string;
    fechafin: string;
    cantidadusos: number;
    mincarga: number;
    maxcarga: number;
    vecesusadas?: number;
}

const cuponApi = {

    getAllCupon: async () => {
        try {
            const response = await axios.get(`${API_URL}/all`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener cupones');
            } else {
                throw error;
            }
        }
    },

    getCuponsById: async (cuponid: string) => {
        try {
            const response = await axios.get(`${API_URL}/${cuponid}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al obtener cupón');
            } else {
                throw error;
            }
        }
    },

    createCupon: async (cuponData: CuponData) => {
        try {
            const response = await axios.post(`${API_URL}/create`, cuponData);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al crear cupón');
            } else {
                throw error;
            }
        }
    },

    updateCupon: async (cuponid: string, cuponData: CuponData) => {
        try {
            const response = await axios.put(`${API_URL}/${cuponid}`, cuponData);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al actualizar cupón');
            } else {
                throw error;
            }
        }
    },

    updateCouponUsage: async (cuponid: string) => {
        try {
            const response = await axios.put(`${API_URL}/usage/${cuponid}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al actualizar uso del cupón');
            } else {
                throw error;
            }
        }
    },

    deleteCupon: async (cuponid: string) => {
        try {
            await axios.delete(`${API_URL}/${cuponid}`);
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error al eliminar cupón');
            } else {
                throw error;
            }
        }
    }
};

export default cuponApi;
