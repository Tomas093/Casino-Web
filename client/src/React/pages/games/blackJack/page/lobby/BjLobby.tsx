import React, {useState, useEffect} from 'react';
import './BjLobbyStyle.css';
import Footer from '@components/Footer';
import NavBar from "@components/NavBar.tsx";
import {useLobbyContext} from '@context/LobbyContext.tsx';
import lobbyApi from '@api/lobbyApi.ts';
import {useNavigate} from 'react-router-dom';
import userApi from "@api/userApi.ts";

// Fetch cliente by usuarioId and return clienteid
const getClienteIdByUsuarioId = async (usuarioId: string): Promise<string> => {
    try {
        const client = await userApi.getClientByUserId(usuarioId);
        if (!client || !client.clienteid) {
            throw new Error(`Cliente not found for usuarioId: ${usuarioId}`);
        }
        return client.clienteid.toString();
    } catch (error) {
        console.error("Error fetching client by usuarioId:", error);
        throw error;
    }
};

interface RoomData {
    id: number;
    name: string;
    description: string;
    players: number;
    minBet: string;
    maxBet: string;
    icon: string;
    status: 'active' | 'vip' | 'premium' | 'exclusive';
}

const roomTemplates: Omit<RoomData, 'players'>[] = [
    {
        id: 1,
        name: 'Sala Clásica',
        description: 'La experiencia tradicional de ruleta europea con las mejores probabilidades.',
        minBet: '$5',
        maxBet: '$500',
        icon: '🎯',
        status: 'active'
    },
    {
        id: 2,
        name: 'Sala VIP',
        description: 'Mesa exclusiva para jugadores premium con límites elevados.',
        minBet: '$50',
        maxBet: '$5,000',
        icon: '👑',
        status: 'vip'
    },
    {
        id: 3,
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
    const [onlinePlayers, setOnlinePlayers] = useState<number>(0);
    const [dailyPrizes, setDailyPrizes] = useState<string>('$0');
    const {isLoading} = useLobbyContext();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLobbies = async () => {
            try {
                const playerCounts = await Promise.all(
                    roomTemplates.map(template => lobbyApi.getPlayerCount(template.id))
                );

                const updatedRooms = roomTemplates.map((template, index) => ({
                    ...template,
                    players: playerCounts[index].count,
                }));
                setRooms(updatedRooms);
            } catch (error) {
                console.error("Failed to fetch lobby data:", error);
                setRooms(roomTemplates.map(t => ({...t, players: 0})));
            }
        };

        fetchLobbies();
        const interval = setInterval(fetchLobbies, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const randomizeStats = () => {
            setOnlinePlayers(Math.floor(Math.random() * 500) + 100);
            setDailyPrizes(`$${(Math.random() * 5 + 1).toFixed(1)}M`);
        };

        randomizeStats();
        const interval = setInterval(randomizeStats, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleRoomSelect = (roomId: number) => {
        setSelectedRoom(roomId);
    };

    const handleJoinRoom = async (roomId: number) => {
        try {
            const user = localStorage.getItem("user");
            let usuarioid;
            if (user) {
                const userObj = JSON.parse(user);
                usuarioid = userObj.usuarioid;
            }
            if (!usuarioid) {
                alert("You must be logged in to join a room.");
                return;
            }
            const clientId = await getClienteIdByUsuarioId(usuarioid);
            await lobbyApi.joinLobby(roomId, clientId);
            navigate(`/BlackJack/${roomId}`);
        } catch (error) {
            console.error("Failed to join room:", error);
        }
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
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await handleJoinRoom(room.id);
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
                            <div className="stat-number">{onlinePlayers}</div>
                            <div className="stat-label">Jugadores Online</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{dailyPrizes}</div>
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