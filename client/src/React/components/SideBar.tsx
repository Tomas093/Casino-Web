// src/components/Sidebar.tsx
import '@css/SideBarStyle.css'
import {Link} from "react-router-dom";
import {useAuth} from '@context/AuthContext';
import React, {useCallback, useEffect, useState} from 'react';
import {useUser} from "@context/UserContext.tsx";
import {useAdmin} from "@context/AdminContext.tsx";

interface MenuItem {
    link: string;
    text: string;
    action?: () => void;
}

const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.action) {
        return (
            <li key={index}>
                <a href="#" onClick={(e) => {
                    e.preventDefault();
                    item.action!();
                }}>
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
    const {user, logout} = useAuth();
    const {isSuperAdmin} = useAdmin();
    const {client} = useUser();
    const [imgError, setImgError] = useState(false);
    const [imgTimestamp, setImgTimestamp] = useState(Date.now());
    const [superAdminStatus, setSuperAdminStatus] = useState(false);

    // URL base del servidor
    const serverBaseUrl = 'http://localhost:3001';

    // Imagen por defecto en caso de error o si no hay imagen
    const defaultImage = '/path/to/default-avatar.jpg';

    // Actualizar la imagen cuando cambie user, client o la imagen del usuario
    useEffect(() => {
        console.log("Actualizando imagen en Sidebar", Date.now());
        setImgTimestamp(Date.now());
        setImgError(false);
    }, [user, client, user?.img]);

    // Construir la URL completa de la imagen con timestamp para evitar caché
    const profileImageUrl = user && user.img
        ? `${serverBaseUrl}${user.img}?t=${imgTimestamp}`
        : defaultImage;

    const handleImageError = () => {
        console.log("Error al cargar la imagen de perfil");
        setImgError(true);
    };

    const handleLogout = useCallback(async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    }, [logout]);

    // Verificar el estado de superadmin cuando cambia el usuario
    useEffect(() => {
        const checkSuperAdmin = async () => {
            if (user) {
                try {
                    const superadminStatus = await isSuperAdmin();
                    setSuperAdminStatus(superadminStatus);
                } catch (error) {
                    console.error("Error al verificar estado de superadmin:", error);
                    setSuperAdminStatus(false);
                }
            } else {
                setSuperAdminStatus(false);
            }
        };

        checkSuperAdmin();
    }, [user, isSuperAdmin]);

    // Elementos del menú
    const baseMenu: MenuItem[] = [
        {link: '/home', text: 'Inicio'},
        {link: '/profile', text: 'Información'},
        {link: '/friends', text: 'Amigos'},
        {link: '/statistics', text: 'Estadísticas'},
        {link: '/transaccion', text: 'Ingreso / Retiro'},
        {link: '/limit', text: 'Límites'},
        {link: '/pausa', text: 'Pausa'},
        {link: '/history', text: 'Historial'},
        {link: '/tickets', text: 'Mis Tickets'},
        {link: '/', text: 'Cerrar Sesión', action: handleLogout},
        {link: '/delete-account', text: 'Eliminar Cuenta'},
    ];

    // Añadir la opción de panel admin si el usuario es superadmin
    const menu = superAdminStatus
        ? [...baseMenu, {link: '/admin', text: 'Panel Admin'}]
        : baseMenu;

    return (
        <aside className="sidebar">
            <div className="profile-section">
                <img
                    key={imgTimestamp} // Clave para forzar la recreación cuando cambia la URL
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
