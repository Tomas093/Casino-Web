import React, { useState } from 'react';
import Sidebar from './SideBar.tsx';
import './ProfileStyle.css';

const ProfilePage: React.FC = () => {
    const userData = {
        username: "Username",
        coins: 10000,
        profileImage: "../Img/Javo.jpg",
        email: "usuario@correo.com",
        joinDate: "10/01/2023",
        stats: {
            gamesPlayed: 156,
            totalWinnings: 25000,
            totalLosses: 15000,
            favoriteGame: "Ruleta"
        }
    };

    const [activeTab, setActiveTab] = useState('stats');

    return (
        <div className="container">
            <Sidebar
                username={userData.username}
                coins={userData.coins}
                profileImage={userData.profileImage}
            />

            <main className="main-content">
                <div className="profile-container">
                    <div className="profile-header">
                        <img src={userData.profileImage} alt={userData.username} className="profile-image" />
                        <div className="profile-details">
                            <h1>{userData.username}</h1>
                            <p>Miembro desde: {userData.joinDate}</p>
                            <div className="coins">
                                <span className="coins-icon">🪙</span>
                                <span>{userData.coins} AustralCoins</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-tabs">
                        <div
                            className={`profile-tab ${activeTab === 'stats' ? 'active' : ''}`}
                            onClick={() => setActiveTab('stats')}
                        >
                            Estadísticas
                        </div>
                        <div
                            className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Configuración
                        </div>
                        <div
                            className={`profile-tab ${activeTab === 'transactions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            Transacciones
                        </div>
                    </div>

                    {activeTab === 'stats' && (
                        <div className="stats-section">
                            <div className="stats-container">
                                <div className="stat-card">
                                    <div className="stat-value">{userData.stats.gamesPlayed}</div>
                                    <div className="stat-label">Partidas jugadas</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{userData.stats.totalWinnings}</div>
                                    <div className="stat-label">Ganancias totales</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{userData.stats.totalLosses}</div>
                                    <div className="stat-label">Pérdidas totales</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{userData.stats.favoriteGame}</div>
                                    <div className="stat-label">Juego favorito</div>
                                </div>
                            </div>

                            <h2>Logros</h2>
                            <div className="achievements-container">
                                <p>No has desbloqueado ningún logro todavía.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-section">
                            <h2>Configuración de cuenta</h2>
                            <form className="settings-form">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" defaultValue={userData.email} />
                                </div>
                                <div className="form-group">
                                    <label>Nombre de usuario</label>
                                    <input type="text" defaultValue={userData.username} />
                                </div>
                                <div className="form-group">
                                    <label>Contraseña</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>
                                <button type="submit">Guardar cambios</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div className="transactions-section">
                            <h2>Historial de transacciones</h2>
                            <p>Consulta el historial detallado en la sección Historial.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;