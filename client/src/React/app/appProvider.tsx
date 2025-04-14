import { ReactNode } from 'react';
import { AuthProvider } from '@context/AuthContext';
import { UserProvider } from '@context/UserContext';
import { AdminProvider } from '@context/AdminContext';
import { TransactionProvider } from '@context/TransactionContext';

interface AppProviderProps {
    children: ReactNode;
}

// Este componente combina todos los providers para simplificar el árbol de componentes
export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <AuthProvider>
            <UserProvider>
                <AdminProvider>
                    <TransactionProvider>
                        {children}
                    </TransactionProvider>
                </AdminProvider>
            </UserProvider>
        </AuthProvider>
    );
};