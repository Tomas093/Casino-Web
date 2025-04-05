import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

interface User {
    usuarioid: number;
    nombre: string;
    apellido: string;
    email: string;
    edad: string;
    dni: string;
    img?: string;
}

interface Client {
    usuarioid: number;
    balance: number;
    influencer: boolean;
}

interface AuthContextType {
    user: User | null;
    client: Client | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<any>;
    getUserData: (userId: string) => Promise<void>;
    updateProfileImage: (imageUrl: string) => void;
}

interface RegisterData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    edad: number;
    dni: string;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = 'http://localhost:3001';

axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getUserData = async (userId: string) => {
        try {
            const response = await axios.get(`${API_URL}/auth/user/${userId}`);
            if (response.data) {
                setUser(response.data);
                if (response.data.cliente) {
                    setClient(response.data.cliente);
                }
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
        }
    };

    const updateProfileImage = (imageUrl: string) => {
        if (user) {
            const updatedUser = { ...user, img: imageUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const storedUser = localStorage.getItem('user');

            try {
                const response = await axios.get(`${API_URL}/auth/check-session`);
                setUser(response.data);

                if (response.data?.usuarioid) {
                    await getUserData(response.data.usuarioid.toString());
                }

                localStorage.setItem('user', JSON.stringify(response.data));
            } catch (error) {
                // Línea eliminada para no mostrar "No hay sesión activa en el servidor"
                if (storedUser) {
                    localStorage.removeItem('user');
                }
                setUser(null);
                setClient(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });

            if (response.data && response.data.usuario) {
                const userData = response.data.usuario;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

                if (userData?.usuarioid) {
                    await getUserData(userData.usuarioid.toString());
                }

                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Error al iniciar sesión:', error);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.data);
                throw new Error(error.response.data.message || 'Error en el servidor');
            } else if (error.request) {
                throw new Error('No se recibió respuesta del servidor');
            } else {
                throw new Error(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`);
            setUser(null);
            setClient(null);
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setUser(null);
            setClient(null);
            localStorage.removeItem('user');
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            return response.data;
        } catch (error: any) {
            console.error('Error al registrar usuario:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Error en el registro');
            } else {
                throw error;
            }
        }
    };

    const contextValue: AuthContextType = {
        user,
        client,
        isLoading,
        login,
        logout,
        register,
        getUserData,
        updateProfileImage
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};