import React, {useState, useEffect} from 'react';
import './BjLobbyStyle.css';
import Footer from '@components/Footer';
import NavBar from "@components/NavBar.tsx";
import {useLobbyContext} from '@context/LobbyContext.tsx';
import lobbyApi, {Lobby} from '@api/lobbyApi.ts';

// This interface combines static room data with dynamic data from the API
interface RoomData {
    id: number; // Using numeric ID to match the API's lobby_id
    name: string;
    description: string;
    players: number;
    minBet: string;
    maxBet: string;
    icon: string;
    status: 'active' | 'vip' | 'premium' | 'exclusive';
}

// Base template for rooms. The ID should correspond to lobby_id from the database.
const roomTemplates: Omit<RoomData, 'players'>[] = [
    {
        id: 1, // Corresponds to lobby_id 1
        name: 'Sala Clásica',
        description: 'La experiencia tradicional de ruleta europea con las mejores probabilidades.',
        minBet: '$5',
        maxBet: '$500',
        icon: '🎯',
        status: 'active'
    },
    {
        id: 2, // Corresponds to lobby_id 2
        name: 'Sala VIP',
        description: 'Mesa exclusiva para jugadores premium con límites elevados.',
        minBet: '$50',
        maxBet: '$5,000',
        icon: '👑',
        status: 'vip'
    },
    {
        id: 3, // Corresponds to lobby_id 3
        name: 'Ruleta Rápida',
        description: 'Partidas aceleradas cada 30 segundos para máxima adrenalina.',
        minBet: '$10',
        maxBet: '$1,000',
        icon: '⚡',
        status: 'premium'
    },
];


const BjLobby: React.FC = () => {
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const {isLoading} = useLobbyContext();

    useEffect(() => {
        const fetchLobbies = async () => {
            try {
                const playerCounts = await Promise.all(
                    roomTemplates.map(template => lobbyApi.getPlayerCount(template.id))
                );

                const updatedRooms = roomTemplates.map((template, index) => {
                    return {
                        ...template,
                        players: playerCounts[index].count,
                    };
                });
                setRooms(updatedRooms);
            } catch (error) {
                console.error("Failed to fetch lobby data:", error);
                // Fallback to templates with 0 players if API fails
                setRooms(roomTemplates.map(t => ({...t, players: 0})));
            }
        };

        fetchLobbies();
        const interval = setInterval(fetchLobbies, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    const handleRoomSelect = (roomId: number) => {
        setSelectedRoom(roomId);
        // Logic to join the room will be added later
        console.log(`Selected room ID: ${roomId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'vip':
                return '#ffd700';
            case 'premium':
                return '#228b22';
            case 'exclusive':
                return '#ff6b6b';
            default:
                return '#ffd700';
        }
    };

    return (
        <div className="casino-lobby">
            <NavBar/>
            <main className="main-content">
                <section className="roulette-section">
                    <h2 className="section-title">Salas de BlackJack</h2>
                    <p className="section-subtitle">
                        Selecciona tu mesa preferida y experimenta la emoción del juego más elegante
                    </p>

                    <div className="rooms-grid">
                        {isLoading ? <p>Cargando salas...</p> : rooms.map((room) => (
                            <div
                                key={room.id}
                                className={`room-card ${selectedRoom === room.id ? 'selected' : ''}`}
                                onClick={() => handleRoomSelect(room.id)}
                                style={{
                                    borderColor: selectedRoom === room.id ? getStatusColor(room.status) : 'transparent'
                                }}
                            >
                                <div className="room-icon">
                                    <span>{room.icon}</span>
                                </div>

                                <h3 className="room-name">{room.name}</h3>
                                <p className="room-description">{room.description}</p>

                                <div className="room-info">
                                    <div className="info-item">
                                        <div className="info-label">Jugadores</div>
                                        <div className="info-value">{room.players} / 3</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Mín. Apuesta</div>
                                        <div className="info-value">{room.minBet}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Máx. Apuesta</div>
                                        <div className="info-value">{room.maxBet}</div>
                                    </div>
                                </div>

                                <button
                                    className="join-button"
                                    disabled={room.players >= 3}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoomSelect(room.id);
                                    }}
                                >
                                    {room.players >= 3 ? 'Mesa Llena' : 'Unirse a la Mesa'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="stats-bar">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-number">154</div>
                            <div className="stat-label">Jugadores Online</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">$2.4M</div>
                            <div className="stat-label">Premios Hoy</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">98.7%</div>
                            <div className="stat-label">RTP Promedio</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Soporte</div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    );
};

export default BjLobby;