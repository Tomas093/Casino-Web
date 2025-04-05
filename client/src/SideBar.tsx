// src/components/Sidebar.tsx
import React from 'react';
import './SideBarStyle.css'
import {Link} from "react-router-dom";

interface SidebarProps {
    username: string;
    coins: number;
    profileImage: string;
}


// Después
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


const Sidebar: React.FC<SidebarProps> = ({ username, coins, profileImage }) => {
    return (
        <aside className="sidebar">
            <div className="profile-section">
                <img src={profileImage} alt="Foto de Perfil" className="profile-img" />
                <h2 className="username" id="username">{username}</h2>
                <p className="coins">
                    Australcoins: <span>{coins.toLocaleString()}</span> <span className="coin-icon">🪙</span>
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