import axios from 'axios';

const API_URL = 'http://localhost:3001/admin-statics';

// Interface definitions based on server responses
export interface MethodTotal {
    metodo: string;
    total: number;
}

export interface RevenueStats {
    totalIngresos: number;
    totalEgresos: number;
    gananciasNetas: number;
}

export interface TransactionStats {
    ingresos: { metodo: string; total_ingresos: number; }[];
    egresos: { metodo: string; total_egresos: number; }[];
}

export interface EntityCounts {
    totalUsers: number;
    totalAdmins: number;
    totalSuperAdmins: number;
    totalTickets: number;
    totalGames: number;
    totalIngresos: number;
    totalEgresos: number;
    totalPromocion: number;
    totalIngresosWithPromocion: number;
}

export interface Activity {
    id: number;
    tipo: 'big-win' | 'high-deposit' | 'high-withdrawal';
    monto: number;
    fecha: Date | null;
    juego?: string;
    metodo?: string;
    usuario: string;
    usuarioid?: number;
}

const adminStaticsApi = {
    getIngresosByMethod: async (): Promise<MethodTotal[]> => {
        try {
            const response = await axios.get(`${API_URL}/ingresos-by-method`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error fetching income by method');
            }
            throw error;
        }
    },

    getEgresosByMethod: async (): Promise<MethodTotal[]> => {
        try {
            const response = await axios.get(`${API_URL}/egresos-by-method`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error fetching withdrawals by method');
            }
            throw error;
        }
    },

    getTotalRevenue: async (): Promise<RevenueStats> => {
        try {
            const response = await axios.get(`${API_URL}/total-revenue`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error fetching total revenue');
            }
            throw error;
        }
    },

    getTransactionStatsByMethod: async (): Promise<TransactionStats> => {
        try {
            const response = await axios.get(`${API_URL}/transaction-stats`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error fetching transaction stats');
            }
            throw error;
        }
    },

    getEntityCounts: async (): Promise<EntityCounts> => {
        try {
            const response = await axios.get(`${API_URL}/counts`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error fetching entity counts');
            }
            throw error;
        }
    },

    getRecentActivities: async (): Promise<Activity[]> => {
        try {
            const response = await axios.get(`${API_URL}/recent-activities`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Error fetching recent activities');
            }
            throw error;
        }
    }
};

export default adminStaticsApi;