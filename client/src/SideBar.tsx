// src/components/Sidebar.tsx
import React, { useEffect } from 'react';
import './SideBarStyle.css'
import { Link } from "react-router-dom";
import { useAuth } from './AuthContext'; // Importar el contexto de autenticación

interface MenuItem {
    link: string;
    text: string;
}

const menu: MenuItem[] = [
    { link: '/perfil', text: 'Información' },
    { link: '/amigos', text: 'Amigos' },
    { link: '/estadisticas', text: 'Estadísticas' },
    { link: '/limites', text: 'Límites' },
    { link: '/pausa', text: 'Pausa' },
    { link: '/historial', text: 'Historial' },
    { link: '/eliminar-cuenta', text: 'Eliminar Cuenta' }
];

const rendermenu = () => {
    return menu.map((ruta: MenuItem, index: number) => (
        <li key={index}>
            <Link to={ruta.link}>{ruta.text}</Link>
        </li>
    ));
};

const Sidebar: React.FC = () => { // Eliminar SidebarProps de aquí
    const { user, client, getUserData } = useAuth(); // Obtener la información del usuario y del cliente del contexto

    useEffect(() => {
        if (user) {
            getUserData(user.id); // Obtener los datos del usuario y del cliente
        }
    }, [user, getUserData]);

    if (!user || !client) {
        return <div>Cargando...</div>; // Mostrar un mensaje de carga mientras se obtienen los datos
    }

    return (
        <aside className="sidebar">
            <div className="profile-section">
                <img src={user.profileImage} alt="Foto de Perfil" className="profile-img" />
                <h2 className="username" id="username">{user.username}</h2>
                <p className="coins">
                    Australcoins: <span>{client.balance.toLocaleString()}</span> <span className="coin-icon">🪙</span>
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

export default Sidebar;
