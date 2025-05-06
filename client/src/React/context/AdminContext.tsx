import {createContext, ReactNode, useContext, useState} from 'react';
import {adminApi} from '@api/adminApi';

interface AdminContextType {
    isLoading: boolean;
    isAdmin: () => Promise<boolean>;
    isSuperAdmin: () => Promise<boolean>;
    getAdmins: () => Promise<any>;
    createAdmin: (adminData: AdminCreateData) => Promise<any>;
    editAdmin: (userId: string, userData: EditAdminData) => Promise<any>;
    getAdminByUserId: (userId: string) => Promise<any>;
}

interface AdminCreateData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    edad: number;
    dni: string;
    superadmin: boolean;
}

interface EditAdminData {
    email: string;
    superadmin: boolean;
    balance: number;
}

interface AdminProviderProps {
    children: ReactNode;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({children}: AdminProviderProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const checkIsAdmin = async () => {
        return await adminApi.isAdmin();
    };

    const checkIsSuperAdmin = async () => {
        return await adminApi.isSuperAdmin();
    };

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            return await adminApi.getAdmins();
        } catch (error) {
            console.error('Error al obtener administradores:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const createNewAdmin = async (adminData: AdminCreateData) => {
        setIsLoading(true);
        try {
            return await adminApi.createAdmin(adminData);
        } catch (error) {
            console.error('Error al crear administrador:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateAdmin = async (userId: string, userData: EditAdminData) => {
        setIsLoading(true);
        try {
            return await adminApi.editAdmin(userId, userData);
        } catch (error) {
            console.error('Error al editar administrador:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getAdminByUserId = async (userId: string) => {
        setIsLoading(true);
        try {
            return await adminApi.getAdminByUserId(userId);
        } catch (error) {
            console.error('Error al obtener administradores por ID de usuario:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const contextValue: AdminContextType = {
        isLoading,
        isAdmin: checkIsAdmin,
        isSuperAdmin: checkIsSuperAdmin,
        getAdmins: fetchAdmins,
        createAdmin: createNewAdmin,
        editAdmin: updateAdmin,
        getAdminByUserId: getAdminByUserId
    };

    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin debe ser usado dentro de un AdminProvider');
    }
    return context;
};