import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import limitApi from '@api/limitApi.ts';

interface LimitUpdateData {
    limitediario: number;
    limitesemanal: number;
    limitemensual: number;
}

interface LimitContextType {
    isLoading: boolean;
    getLimitHorario: (userId: number) => Promise<any>;
    getLimitMonetario: (userId: number) => Promise<any>;
    getLimitHorarioByClienteId: (clienteId: number) => Promise<any>;
    getLimitMonetarioByClienteId: (clienteId: number) => Promise<any>;
    updateLimitHorarioByClienteId: (clienteId: number, limits: LimitUpdateData) => Promise<any>;
    updateLimitMonetarioByClienteId: (clienteId: number, limits: LimitUpdateData) => Promise<any>;
}

const LimitContext = createContext<LimitContextType | null>(null);

export const LimitProvider = ({children}: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchLimitHorario = useCallback(async (userId: number) => {
        setIsLoading(true);
        try {
            return await limitApi.getLimitHorario(userId);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLimitMonetario = useCallback(async (userId: number) => {
        setIsLoading(true);
        try {
            return await limitApi.getLimitMonetario(userId);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLimitHorarioByClienteId = useCallback(async (clienteId: number) => {
        setIsLoading(true);
        try {
            return await limitApi.getLimitHorarioByClienteId(clienteId);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLimitMonetarioByClienteId = useCallback(async (clienteId: number) => {
        setIsLoading(true);
        try {
            return await limitApi.getLimitMonetarioByClienteId(clienteId);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateLimitHorarioByClienteId = useCallback(async (clienteId: number, limits: LimitUpdateData) => {
        setIsLoading(true);
        try {
            return await limitApi.updateLimitHorarioByClienteId(clienteId, limits);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateLimitMonetarioByClienteId = useCallback(async (clienteId: number, limits: LimitUpdateData) => {
        setIsLoading(true);
        try {
            return await limitApi.updateLimitMonetarioByClienteId(clienteId, limits);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <LimitContext.Provider
            value={{
                isLoading,
                getLimitHorario: fetchLimitHorario,
                getLimitMonetario: fetchLimitMonetario,
                getLimitHorarioByClienteId: fetchLimitHorarioByClienteId,
                getLimitMonetarioByClienteId: fetchLimitMonetarioByClienteId,
                updateLimitHorarioByClienteId,
                updateLimitMonetarioByClienteId
            }}>
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