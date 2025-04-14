// src/components/Sidebar.tsx
import '@css/SideBarStyle.css'
import { Link } from "react-router-dom";
import { useAuth } from '@context/AuthContext';
import { useState, useEffect } from 'react';
import {useUser} from "@context/UserContext.tsx";

interface MenuItem {
    link: string;
    text: string;
    action?: () => void;
}

const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.action) {
        return (
            <li key={index}>
                <a href="#" onClick={(e) => { e.preventDefault(); item.action!(); }}>
                    {item.text}
                </a>
            </li>
        );
    }
    return (
        <li key={index}>
            <Link to={item.link}>{item.text}</Link>
        </li>
    );
};

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const {client} = useUser();
    const [imgError, setImgError] = useState(false);
    const [imgTimestamp, setImgTimestamp] = useState(Date.now());

    // URL base del servidor
    const serverBaseUrl = 'http://localhost:3001';

    // Imagen por defecto en caso de error o si no hay imagen
    const defaultImage = '/path/to/default-avatar.jpg';

    // Actualizar el timestamp cuando cambia la imagen del usuario
    useEffect(() => {
        setImgTimestamp(Date.now());
        setImgError(false);
    }, [user?.img]);

    // Construir la URL completa de la imagen si existe (con timestamp para evitar caché)
    const profileImageUrl = user && user.img
        ? `${serverBaseUrl}${user.img}?t=${imgTimestamp}`
        : defaultImage;

    const handleImageError = () => {
        setImgError(true);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const menu: MenuItem[] = [
        { link: '/profile', text: 'Información' },
        { link: '/amigos', text: 'Amigos' },
        { link: '/estadisticas', text: 'Estadísticas' },
        { link: '/transaccion', text: 'Ingreso / Retiro' },
        { link: '/limites', text: 'Límites' },
        { link: '/pausa', text: 'Pausa' },
        { link: '/history', text: 'Historial' },
        { link: '/', text: 'Cerrar Sesión', action: handleLogout },
        { link: '/delete-account', text: 'Eliminar Cuenta' },

    ];

    return (
        <aside className="sidebar">
            <div className="profile-section">
                <img
                    src={imgError ? defaultImage : profileImageUrl}
                    alt="Foto de Perfil"
                    className="profile-img"
                    onError={handleImageError}
                />
                <h2 className="username" id="username">
                    {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
                </h2>
                <p className="coins">
                    Australcoins: <span>{client ? client.balance : 0}</span> <span className="coin-icon">🪙</span>
                </p>
            </div>
            <nav className="menu">
                <ul>
                    {menu.map((item, index) => renderMenuItem(item, index))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;