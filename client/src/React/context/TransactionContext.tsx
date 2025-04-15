import {createContext, useContext, ReactNode, useState, useCallback} from 'react';
import transactionApi from '@api/transactionApi';

interface TransactionContextType {
    isLoading: boolean;
    getTransactions: (userId: string) => Promise<any>;
    createIngreso: (transactionData: TransactionData) => Promise<any>;
    createEgreso: (transactionData: TransactionData) => Promise<any>;
    getTotalRevenue: () => Promise<any>;
    getTransactionStatsByMethod: () => Promise<any>;
}

interface TransactionData {
    usuarioid: number;
    monto: number;
    metodo: string;
    fecha: string;
}

interface TransactionProviderProps {
    children: ReactNode;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export const TransactionProvider = ({children}: TransactionProviderProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchTransactions = useCallback(async (userId: string) => {
        setIsLoading(true);
        try {
            return await transactionApi.getUserTransactions(userId);
        } catch (error) {
            console.error('Error al obtener transacciones:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addIngreso = useCallback(async (transactionData: TransactionData) => {
        setIsLoading(true);
        try {
            return await transactionApi.createIngreso(transactionData);
        } catch (error) {
            console.error('Error al crear ingreso:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addEgreso = useCallback(async (transactionData: TransactionData) => {
        setIsLoading(true);
        try {
            return await transactionApi.createEgreso(transactionData);
        } catch (error) {
            console.error('Error al crear retiro:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getTotalRevenue = useCallback(async () => {
        setIsLoading(true);
        try {
            return await transactionApi.getTotalRevenue();
        } catch (error) {
            console.error('Error al obtener ingresos totales:', error);
            return { gananciasNetas: 0 };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getTransactionStatsByMethod = useCallback(async () => {
        setIsLoading(true);
        try {
            return await transactionApi.getTransactionStatsByMethod();
        } catch (error) {
            console.error('Error al obtener conteo por metodo:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    } , []);

    const contextValue: TransactionContextType = {
        isLoading,
        getTransactions: fetchTransactions,
        createIngreso: addIngreso,
        createEgreso: addEgreso,
        getTotalRevenue,
        getTransactionStatsByMethod
    };

    return (
        <TransactionContext.Provider value={contextValue}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransaction = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction debe ser usado dentro de un TransactionProvider');
    }
    return context;
};