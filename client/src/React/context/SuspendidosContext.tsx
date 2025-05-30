import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import suspendidoApi, {SuspendidosData} from '../api/suspendidoApi';

interface SuspendidosContextType {
    suspendidos: SuspendidosData[];
    loading: boolean;
    error: string | null;
    fetchAll: () => Promise<void>;
    create: (data: SuspendidosData) => Promise<void>;
    update: (id: number, data: Partial<SuspendidosData>) => Promise<void>;
    remove: (id: number) => Promise<void>;
    isUserSuspended: (userId: number) => Promise<boolean>;
    getSuspendidosByUserId: (userId: number) => Promise<SuspendidosData | null>;
}

const SuspendidosContext = createContext<SuspendidosContextType | undefined>(undefined);

export const useSuspendidos = () => {
    const context = useContext(SuspendidosContext);
    if (!context) throw new Error('useSuspendidos must be used within SuspendidosProvider');
    return context;
};

export const SuspendidosProvider = ({ children }: { children: ReactNode }) => {
    const [suspendidos, setSuspendidos] = useState<SuspendidosData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await suspendidoApi.getAllSuspendidos();
            setSuspendidos(data);
        } catch (err: any) {
            setError(err.message || 'Error fetching suspendidos');
        } finally {
            setLoading(false);
        }
    };

    const create = async (data: SuspendidosData) => {
        setLoading(true);
        setError(null);
        try {
            await suspendidoApi.createSuspendido(data);
            await fetchAll();
        } catch (err: any) {
            setError(err.message || 'Error creating suspendido');
        } finally {
            setLoading(false);
        }
    };

    const update = async (id: number, data: Partial<SuspendidosData>) => {
        setLoading(true);
        setError(null);
        try {
            await suspendidoApi.updateSuspendido(id, data);
            await fetchAll();
        } catch (err: any) {
            setError(err.message || 'Error updating suspendido');
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await suspendidoApi.deleteSuspendido(id);
            await fetchAll();
        } catch (err: any) {
            setError(err.message || 'Error deleting suspendido');
        } finally {
            setLoading(false);
        }
    };

    const isUserSuspended = async (userId: number) => {
        try {
            return await suspendidoApi.isUserSuspended(userId);
        } catch {
            return false;
        }
    };

    const getSuspendidosByUserId = async (userId: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await suspendidoApi.getSuspendidosByUserId(userId);
            return data;
        } catch (err: any) {
            setError(err.message || 'Error fetching suspendidos by user ID');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return (
        <SuspendidosContext.Provider value={{ suspendidos,getSuspendidosByUserId ,loading, error, fetchAll, create, update, remove, isUserSuspended }}>
            {children}
        </SuspendidosContext.Provider>
    );
};

