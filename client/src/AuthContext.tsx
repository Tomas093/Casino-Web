// context/AuthContext.tsx
import React, {createContext, useState, useContext} from 'react';

interface AuthContextType {
    user: any | null;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
    userData: any | null;
    fetchUserData: (userId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<any | null>(null);

    const fetchUserData = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:3001/auth/user/${userId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al obtener datos del usuario');
            }

            const data = await response.json();
            setUserData(data);
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };

    const login = async (credentials: any) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                setError(null);
            } else {
                throw new Error(data.message || 'Error al iniciar sesión');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, login, logout, error, isLoading, userData, fetchUserData}}>
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