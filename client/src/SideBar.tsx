// src/components/Sidebar.tsx
import React from 'react';

interface SidebarProps {
    username: string;
    coins: number;
    profileImage: string;
}

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
                    <li><a href="ProfileInfo.html">Informacion</a></li>
                    <li><a href="#">Amigos</a></li>
                    <li><a href="#">Estadísticas</a></li>
                    <li><a href="#">Límites</a></li>
                    <li><a href="#">Pausa</a></li>
                    <li><a href="#">Historial</a></li>
                    <li><a href="../Html/DeleteUser.html">Eliminar Cuenta</a></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;