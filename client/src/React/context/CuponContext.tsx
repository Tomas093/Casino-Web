import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import cuponApi, {CuponData} from '@api/cuponApi';

interface CuponContextType {
    isLoading: boolean;
    getCuponsById: (cuponId: string) => Promise<any>;
    getAllCupons: () => Promise<any>;
    createCupon: (cuponData: CuponData) => Promise<any>;
    deleteCupon: (cuponId: string) => Promise<any>;
    updateCupon: (cuponId: string, cuponData: CuponData) => Promise<any>;
    updateCouponUsage: (cuponId: string) => Promise<any>;
}

interface CuponProviderProps {
    children: ReactNode;
}

const CuponContext = createContext<CuponContextType | null>(null);

export const CuponProvider = ({children}: CuponProviderProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getCuponById = useCallback(async (userId: string) => {
        setIsLoading(true);
        try {
            return await cuponApi.getCuponsById(userId);
        } catch (error) {
            console.error('Error al obtener cupón:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    const getAllCupons = useCallback(async () => {
        setIsLoading(true);
        try {
            return await cuponApi.getAllCupon();
        } catch (error) {
            console.error('Error al obtener todos los cupones:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    const addCupon = useCallback(async (cuponData: CuponData) => {
        setIsLoading(true);
        try {
            return await cuponApi.createCupon(cuponData);
        } catch (error) {
            console.error('Error al crear cupón:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateCouponUsage = useCallback(async (cuponId: string) => {
        setIsLoading(true);
        try {
            return await cuponApi.updateCouponUsage(cuponId);
        } catch (error) {
            console.error('Error al actualizar uso del cupón:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeCupon = useCallback(async (cuponId: string) => {
        setIsLoading(true);
        try {
            return await cuponApi.deleteCupon(cuponId);
        } catch (error) {
            console.error('Error al eliminar cupón:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const modifyCupon = useCallback(async (cuponId: string, cuponData: CuponData) => {
        setIsLoading(true);
        try {
            return await cuponApi.updateCupon(cuponId, cuponData);
        } catch (error) {
            console.error('Error al actualizar cupón:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <CuponContext.Provider value={{
            isLoading,
            getCuponsById: getCuponById,
            getAllCupons: getAllCupons,
            createCupon: addCupon,
            deleteCupon: removeCupon,
            updateCupon: modifyCupon,
            updateCouponUsage: updateCouponUsage
        }}>
            {children}
        </CuponContext.Provider>
    );
};

export const useCupon = () => {
    const context = useContext(CuponContext);
    if (!context) {
        throw new Error('useCuponContext must be used within a CuponProvider');
    }
    return context;
};