import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import userApi, {EditUserData} from '@api/userApi';
import {useAuth} from '@context/AuthContext.tsx';

// Tipo para cliente
    interface Client {
        usuarioid: number;
        balance: number;
        influencer: boolean;
    }

    // Tipo para el contexto de usuario
    interface UserContextType {
        client: Client | null;
        isLoading: boolean;
        getUserData: (userId: string) => Promise<void>;
        editUser: (userId: string, userData: EditUserData) => Promise<void>;
        deleteUser: (userId: string) => Promise<void>;
        getAllUsers: () => Promise<any>;
        getUserCount: () => Promise<any>;
    }

    // Props para UserProvider
    interface UserProviderProps {
        children: ReactNode;
    }

    // Crear el contexto
    const UserContext = createContext<UserContextType | null>(null);

    // Provider del contexto
    export const UserProvider = ({ children }: UserProviderProps) => {
        const [client, setClient] = useState<Client | null>(null);
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const { user } = useAuth();

        // Obtener datos del usuario
        const getUserData = useCallback(async (userId: string) => {
            try {
                setIsLoading(true);
                const userData = await userApi.getUserById(userId);
                if (userData && userData.cliente) {
                    setClient(userData.cliente);
                }
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
            } finally {
                setIsLoading(false);
            }
        }, []);

        // Efecto para cargar los datos del usuario cuando cambia el usuario autenticado
        useEffect(() => {
            if (user && user.usuarioid) {
                getUserData(user.usuarioid.toString());
            } else {
                // Reset client si no hay usuario autenticado
                setClient(null);
            }
        }, [user?.usuarioid, getUserData]);

        // Actualizar usuario
        const editUser = useCallback(async (userId: string, userData: EditUserData) => {
            try {
                setIsLoading(true);
                const response = await userApi.editUser(userId, userData);

                // Actualizar datos del cliente si es el usuario actual
                if (user && user.usuarioid === Number(userId)) {
                    await getUserData(userId);
                }

                return response;
            } catch (error) {
                console.error('Error al actualizar usuario:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        }, [user, getUserData]);

        const getUserCount = useCallback(async () => {
            try {
                setIsLoading(true);
                const response = await userApi.getUserCount();
                return response;
            } catch (error) {
                console.error('Error al obtener el conteo de usuarios:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        }, []);

        // Eliminar usuario
        const deleteUser = useCallback(async (userId: string) => {
            try {
                setIsLoading(true);

                // Verificar primero que el usuario existe
                try {
                    await userApi.getUserById(userId);
                } catch (error: any) {
                    if (error?.response?.status === 404) {
                        console.error("El usuario no existe en la base de datos");
                        throw new Error("Usuario no encontrado");
                    }
                    throw error;
                }

                // Intentar eliminar el usuario
                const result = await userApi.deleteUser(userId);
                console.log("Usuario eliminado correctamente:", result);
                return result;
            } catch (error: any) {
                console.error('Error al eliminar usuario:', error);

                // Crear un mensaje de error más descriptivo
                const errorMessage = error?.response?.data?.message ||
                    error?.message ||
                    'Error desconocido al eliminar usuario';

                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }, []);

        // Obtener todos los usuarios
        const getAllUsers = useCallback(async () => {
            try {
                setIsLoading(true);
                return await userApi.getAllUsers();
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        }, []);

        const contextValue: UserContextType = {
            client,
            isLoading,
            getUserData,
            editUser,
            deleteUser,
            getAllUsers,
            getUserCount
        };

        return (
            <UserContext.Provider value={contextValue}>
                {children}
            </UserContext.Provider>
        );
    };

    // Hook para usar el contexto
    export const useUser = () => {
        const context = useContext(UserContext);
        if (!context) {
            throw new Error('useUser debe ser usado dentro de un UserProvider');
        }
        return context;
    };