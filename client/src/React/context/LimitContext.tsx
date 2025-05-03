import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import limitApi from '@api/limitApi.ts';

interface LimitContextType {
    isLoading: boolean;
    getLimitHorario: (userId: number) => Promise<any>;
    getLimitMonetario: (userId: number) => Promise<any>;
}

const LimitContext = createContext<LimitContextType | null>(null);

export const LimitProvider = ({children}: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchLimitHorario = useCallback(async (userId: number) => {
        setIsLoading(true);
        try {
            return await limitApi.getLimitHorario(userId);
        } catch (error) {
            console.error('Error al obtener limite horario:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLimitMonetario = useCallback(async (userId: number) => {
        setIsLoading(true);
        try {
            return await limitApi.getLimitMonetario(userId);
        } catch (error) {
            console.error('Error al obtener limite monetario:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <LimitContext.Provider
            value={{isLoading, getLimitHorario: fetchLimitHorario, getLimitMonetario: fetchLimitMonetario}}>
            {children}
        </LimitContext.Provider>
    );
}

export const useLimitContext = () => {
    const context = useContext(LimitContext);
    if (!context) {
        throw new Error('useLimitContext must be used within a LimitProvider');
    }
    return context;
};
