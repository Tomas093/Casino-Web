import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import adminStaticsApi, {
    MethodTotal,
    RevenueStats,
    TransactionStats,
    EntityCounts,
    Activity
} from '@api/adminStaticsApi';

interface AdminStaticsContextType {
    isLoading: boolean;
    getIngresosByMethod: () => Promise<MethodTotal[]>;
    getEgresosByMethod: () => Promise<MethodTotal[]>;
    getTotalRevenue: () => Promise<RevenueStats>;
    getTransactionStatsByMethod: () => Promise<TransactionStats>;
    getEntityCounts: () => Promise<EntityCounts>;
    getRecentActivities: () => Promise<Activity[]>;
}

interface AdminStaticsProviderProps {
    children: ReactNode;
}

export const AdminStaticsContext = createContext<AdminStaticsContextType | null>(null);

export const AdminStaticsProvider = ({children}: AdminStaticsProviderProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchIngresosByMethod = useCallback(async () => {
        setIsLoading(true);
        try {
            return await adminStaticsApi.getIngresosByMethod();
        } catch (error) {
            console.error('Error fetching income by method:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchEgresosByMethod = useCallback(async () => {
        setIsLoading(true);
        try {
            return await adminStaticsApi.getEgresosByMethod();
        } catch (error) {
            console.error('Error fetching withdrawals by method:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTotalRevenue = useCallback(async () => {
        setIsLoading(true);
        try {
            return await adminStaticsApi.getTotalRevenue();
        } catch (error) {
            console.error('Error fetching total revenue:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTransactionStatsByMethod = useCallback(async () => {
        setIsLoading(true);
        try {
            return await adminStaticsApi.getTransactionStatsByMethod();
        } catch (error) {
            console.error('Error fetching transaction stats by method:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchEntityCounts = useCallback(async () => {
        setIsLoading(true);
        try {
            return await adminStaticsApi.getEntityCounts();
        } catch (error) {
            console.error('Error fetching entity counts:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRecentActivities = useCallback(async () => {
        setIsLoading(true);
        try {
            return await adminStaticsApi.getRecentActivities();
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const contextValue: AdminStaticsContextType = {
        isLoading,
        getIngresosByMethod: fetchIngresosByMethod,
        getEgresosByMethod: fetchEgresosByMethod,
        getTotalRevenue: fetchTotalRevenue,
        getTransactionStatsByMethod: fetchTransactionStatsByMethod,
        getEntityCounts: fetchEntityCounts,
        getRecentActivities: fetchRecentActivities
    };

    return (
        <AdminStaticsContext.Provider value={contextValue}>
            {children}
        </AdminStaticsContext.Provider>
    );
};

export const useAdminStatics = () => {
    const context = useContext(AdminStaticsContext);
    if (!context) {
        throw new Error('useAdminStatics must be used within an AdminStaticsProvider');
    }
    return context;
};

