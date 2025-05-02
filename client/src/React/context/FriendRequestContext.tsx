import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import friendRequestApi from '@api/friendRequestApi';

interface FriendRequestContextType {
    isLoading: boolean;
    sendFriendRequest: (id_remitente: number, id_receptor: number) => Promise<any>;
    acceptFriendRequest: (id_remitente: number, id_receptor: number) => Promise<any>;
    rejectFriendRequest: (id_remitente: number, id_receptor: number) => Promise<any>;
    cancelFriendRequest: (id_remitente: number, id_receptor: number) => Promise<any>;
    getPendingFriendRequests: (id_usuario: number) => Promise<any>;
    getSentFriendRequests: (id_usuario: number) => Promise<any>;
}

export const FriendRequestContext = createContext<FriendRequestContextType | null>(null);

export const FriendRequestProvider = ({children}: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const sendFriendRequest = useCallback(async (id_remitente: number, id_receptor: number) => {
        if (!id_remitente || !id_receptor) {
            throw new Error('IDs de remitente o receptor no válidos');
        }

        setIsLoading(true);
        try {
            return await friendRequestApi.sendFriendRequest(id_remitente, id_receptor);
        } catch (error) {
            console.error('Error al enviar solicitud de amistad:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const acceptFriendRequest = useCallback(async (id_remitente: number, id_receptor: number) => {
        setIsLoading(true);
        try {
            return await friendRequestApi.acceptFriendRequest(id_remitente, id_receptor);
        } catch (error) {
            console.error('Error al aceptar solicitud de amistad:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const rejectFriendRequest = useCallback(async (id_remitente: number, id_receptor: number) => {
        setIsLoading(true);
        try {
            return await friendRequestApi.rejectFriendRequest(id_remitente, id_receptor);
        } catch (error) {
            console.error('Error al rechazar solicitud de amistad:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const cancelFriendRequest = useCallback(async (id_remitente: number, id_receptor: number) => {
        setIsLoading(true);
        try {
            return await friendRequestApi.cancelFriendRequest(id_remitente, id_receptor);
        } catch (error) {
            console.error('Error al cancelar solicitud de amistad:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getPendingFriendRequests = useCallback(async (id_usuario: number) => {
        setIsLoading(true);
        try {
            return await friendRequestApi.getPendingFriendRequests(id_usuario);
        } catch (error) {
            console.error('Error al obtener solicitudes de amistad pendientes:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getSentFriendRequests = useCallback(async (id_usuario: number) => {
        setIsLoading(true);
        try {
            return await friendRequestApi.getSentFriendRequests(id_usuario);
        } catch (error) {
            console.error('Error al obtener solicitudes de amistad enviadas:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value = {
        isLoading,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        getPendingFriendRequests,
        getSentFriendRequests
    };

    return (
        <FriendRequestContext.Provider value={value}>
            {children}
        </FriendRequestContext.Provider>
    );
};

export const useFriendRequestContext = () => {
    const context = useContext(FriendRequestContext);
    if (!context) {
        throw new Error('useFriendRequestContext must be used within a FriendRequestProvider');
    }
    return context;
};
