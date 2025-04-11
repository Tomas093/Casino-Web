// src/components/Sidebar.tsx
import './SidebarExtraStyle.css'
import { Link } from "react-router-dom";
import { useAuth } from './AuthContext';
import { useState, useEffect } from 'react';

interface MenuItem {
    link: string;
    text: string;
}

const menu: MenuItem[] = [
    { link: '/history', text: 'Cuenta' },
    { link: '/amigos', text: 'Amigos' },
    { link: '/Leaderboard', text: 'LeaderBoard' },
    { link: '/Soporte', text: 'Ayuda' },
    { link: '/IngresoDinero', text: 'Depositar' },
    { link: '/TerminosyCondiciones', text: 'TerminosYCondiciones' },
];

const rendermenu = () => {
    return menu.map((ruta: MenuItem, index: number) => (
        <li key={index}>
            <Link to={ruta.link}>{ruta.text}</Link>
        </li>
    ));
};

const SidebarExtra: React.FC = () => {
    const { user, client } = useAuth();
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
                    {rendermenu()}
                </ul>
            </nav>
        </aside>
    );
};

export default SidebarExtra;