// context/AuthContext.tsx
import React, { createContext, useState, useContext } from 'react';

interface AuthContextType {
    user: any | null;
    client: any | null; // Nueva propiedad para el cliente
    login: (credentials: any) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
    getUserData: (userId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [client, setClient] = useState<any | null>(null); // Nuevo estado para el cliente
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUserData = async (userId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/auth/user/${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const userData = await response.json();
            if (response.ok) {
                setUser(userData);
                setClient(userData.cliente); // Asignar la información del cliente
                return userData;
            } else {
                throw new Error(userData.message || 'Error al obtener datos del usuario');
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: any): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            if (response.ok) {
                setUser(data.usuario); // Recuerda que en el backend se devuelve 'usuario'
                setError(null);
                return true;
            } else {
                throw new Error(data.message || 'Error al iniciar sesión');
            }
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        // Podrías agregar también la llamada al endpoint /logout para destruir la sesión en el servidor
    };

    return (
        <AuthContext.Provider value={{ user, client, login, logout, isLoading, error, getUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
