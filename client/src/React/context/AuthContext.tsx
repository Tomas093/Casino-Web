import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import authApi, {RegisterData} from '@api/authApi';

// Tipo para el usuario autenticado
interface User {
    usuarioid: number;
    nombre: string;
    apellido: string;
    email: string;
    edad: string;
    dni: string;
    img?: string;
}

// Tipo para el contexto de autenticación
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<any>;
    updateProfileImage: (imageUrl: string) => void;
    updateUserData: (userData: Partial<User>) => void; // Nuevo método para actualizar datos del usuario
}

// Props para el AuthProvider
interface AuthProviderProps {
    children: ReactNode;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Provider del contexto
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Actualizar imagen de perfil (en local)
    const updateProfileImage = (imageUrl: string) => {
        if (user) {
            const updatedUser = { ...user, img: imageUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    // Nuevo método para actualizar los datos del usuario
    const updateUserData = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    // Verificar si hay una sesión activa al cargar
    useEffect(() => {
        const checkSession = async () => {
            const storedUser = localStorage.getItem('user');

            try {
                const userData = await authApi.checkSession();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
                if (storedUser) {
                    localStorage.removeItem('user');
                }
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    // Iniciar sesión
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authApi.login({ email, password });

            if (response && response.usuario) {
                setUser(response.usuario);
                localStorage.setItem('user', JSON.stringify(response.usuario));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Cerrar sesión
    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    // Registrar usuario
    const register = async (userData: RegisterData) => {
        try {
            const response = await authApi.register(userData);
            return response;
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw error;
        }
    };

    // Valor del contexto
    const contextValue: AuthContextType = {
        user,
        isLoading,
        login,
        logout,
        register,
        updateProfileImage,
        updateUserData // Agregamos el nuevo método al contexto
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};