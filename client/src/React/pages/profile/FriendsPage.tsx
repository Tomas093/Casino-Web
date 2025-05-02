import React, {useState, useEffect} from 'react';
import "@css/FriendStyle.css";
import SideBar from "@components/SideBar.tsx";
import Message from "@components/Error/Message.tsx";
import {useFriendRequestContext} from "@context/FriendRequestContext.tsx";
import {useAuth} from "@context/AuthContext.tsx";

interface User {
    usuarioid: number;
    nombre: string;
    apellido: string;
    img?: string;
    email?: string;
}

interface FriendRequest {
    id_solicitud: number;
    id_remitente: number;
    id_receptor: number;
    estado: string;
    fecha_creacion: string;
    usuario_solicitudesamistad_id_remitenteTousuario?: User;
    usuario_solicitudesamistad_id_receptorTousuario?: User;
}

// Reusable UserAvatar component
const UserAvatar: React.FC<{ user: User | any, className?: string }> = ({user, className = "friends-avatar"}) => {
    return (
        <div className={`${className}-container`}>
            {user.img ? (
                <img
                    src={`http://localhost:3001${user.img}`}
                    alt={`${user.nombre || ''} ${user.apellido || ''}`}
                    className={className}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                            const div = document.createElement('div');
                            div.className = `${className}-fallback`;
                            div.textContent = `${user.nombre?.charAt(0) || ''}${user.apellido?.charAt(0) || ''}`;
                            parent.appendChild(div);
                        }
                    }}
                />
            ) : (
                <div className={`${className}-fallback`}>
                    {user.nombre?.charAt(0) || ''}
                    {user.apellido?.charAt(0) || ''}
                </div>
            )}
        </div>
    );
};

const FriendsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('search');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [friends, setFriends] = useState<User[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const {user} = useAuth();
    const {
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        getPendingFriendRequests,
        getSentFriendRequests,
        getFriends,
        getUserSearch,
        deleteFriend
    } = useFriendRequestContext();

    const isUserAuthenticated = () => user && user.usuarioid;

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "Sin fecha";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Fecha inválida";
            }
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Error de formato";
        }
    };

    useEffect(() => {
        if (isUserAuthenticated()) {
            if (activeTab === 'friends') {
                loadFriends();
            } else if (activeTab === 'pending') {
                loadPendingRequests();
            } else if (activeTab === 'sent') {
                loadSentRequests();
            }
        }
    }, [user, activeTab]);

    const loadFriends = async () => {
        if (!isUserAuthenticated()) return;
        setIsLoading(true);
        setError(null);
        try {
            const friendshipData = await getFriends(user!.usuarioid);
            const transformedFriends = friendshipData.map((friendship: any) => {
                const isFriendUser1 = friendship.usuario1_id !== user!.usuarioid;
                const friendData = isFriendUser1
                    ? friendship.usuario_amistad_usuario1_idTousuario
                    : friendship.usuario_amistad_usuario2_idTousuario;

                return {
                    usuarioid: isFriendUser1 ? friendship.usuario1_id : friendship.usuario2_id,
                    nombre: friendData.nombre,
                    apellido: friendData.apellido,
                    email: friendData.email,
                    img: friendData.img
                };
            });
            setFriends(transformedFriends);
        } catch (err) {
            console.error("Error loading friends:", err);
            setError("Error al cargar los amigos");
        } finally {
            setIsLoading(false);
        }
    };

    const loadPendingRequests = async () => {
        if (!isUserAuthenticated()) return;
        setIsLoading(true);
        setError(null);
        try {
            const requests = await getPendingFriendRequests(user!.usuarioid);
            setPendingRequests(requests);
        } catch (err) {
            console.error("Error loading pending requests:", err);
            setError("Error al cargar solicitudes pendientes");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSentRequests = async () => {
        if (!isUserAuthenticated()) return;
        setIsLoading(true);
        setError(null);
        try {
            const requests = await getSentFriendRequests(user!.usuarioid);
            setSentRequests(requests);
        } catch (err) {
            console.error("Error loading sent requests:", err);
            setError("Error al cargar solicitudes enviadas");
        } finally {
            setIsLoading(false);
        }
    };

    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        if (!isUserAuthenticated()) {
            setError("Usuario no autenticado");
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        setError(null);
        try {
            const allUsers = await getUserSearch(user!.usuarioid);
            const filteredUsers = allUsers.filter((u: User) =>
                u.usuarioid !== user!.usuarioid &&
                (u.nombre.toLowerCase().includes(query.toLowerCase()) ||
                    u.apellido.toLowerCase().includes(query.toLowerCase()) ||
                    (u.email && u.email.toLowerCase().includes(query.toLowerCase())))
            );
            setSearchResults(filteredUsers);
        } catch (error) {
            console.error("Error searching users:", error);
            setError("Error al buscar usuarios. Inténtalo de nuevo.");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        searchUsers(searchQuery);
    };

    const handleSendRequest = async (userId: number) => {
        if (!isUserAuthenticated()) return;
        try {
            await sendFriendRequest(user!.usuarioid, userId);
            setSearchResults(searchResults.filter(u => u.usuarioid !== userId));
        } catch (error: any) {
            console.error("Error sending friend request:", error);

            if (error.message?.includes('already exists') ||
                error.message?.includes('ya existe') ||
                error.response?.status === 409) {
                setError("Ya has enviado una solicitud de amistad a este usuario");
            } else {
                setError("Error al enviar solicitud de amistad");
            }
        }
    };

    const handleAcceptRequest = async (senderId: number) => {
        if (!isUserAuthenticated()) return;
        try {
            await acceptFriendRequest(senderId, user!.usuarioid);
            setPendingRequests(pendingRequests.filter(req => req.id_remitente !== senderId));
            await loadFriends();
        } catch (error) {
            console.error("Error accepting friend request:", error);
            setError("Error al aceptar solicitud de amistad");
        }
    };

    const handleRejectRequest = async (senderId: number) => {
        if (!isUserAuthenticated()) return;
        try {
            await rejectFriendRequest(senderId, user!.usuarioid);
            setPendingRequests(pendingRequests.filter(req => req.id_remitente !== senderId));
        } catch (error) {
            console.error("Error rejecting friend request:", error);
            setError("Error al rechazar solicitud de amistad");
        }
    };

    const handleCancelRequest = async (receiverId: number) => {
        if (!isUserAuthenticated()) return;
        try {
            await cancelFriendRequest(user!.usuarioid, receiverId);
            setSentRequests(sentRequests.filter(req => req.id_receptor !== receiverId));
        } catch (error) {
            console.error("Error canceling friend request:", error);
            setError("Error al cancelar solicitud de amistad");
        }
    };

    const handleDeleteFriend = async (friendId: number) => {
        if (!isUserAuthenticated()) return;
        try {
            await deleteFriend(user!.usuarioid, friendId);
            setFriends(friends.filter(friend => friend.usuarioid !== friendId));
        } catch (error) {
            console.error("Error deleting friend:", error);
            setError("Error al eliminar amigo");
        }
    };

    return (
        <div className="container">
            <SideBar/>
            <main className="main-content">
                <header className="content-header">
                    <h1>Amigos</h1>
                </header>
                {error && <Message type="error" message={error}/>}
                <div className="friends-section">
                    <div className="friends-content-paper">
                        <div className="friends-tabs">
                            <div
                                className={activeTab === 'search' ? 'friends-tab Mui-selected' : 'friends-tab'}
                                onClick={() => setActiveTab('search')}>
                                Buscar
                            </div>
                            <div
                                className={activeTab === 'friends' ? 'friends-tab Mui-selected' : 'friends-tab'}
                                onClick={() => setActiveTab('friends')}>
                                Amigos
                            </div>
                            <div
                                className={activeTab === 'pending' ? 'friends-tab Mui-selected' : 'friends-tab'}
                                onClick={() => setActiveTab('pending')}>
                                Solicitudes Recibidas
                            </div>
                            <div
                                className={activeTab === 'sent' ? 'friends-tab Mui-selected' : 'friends-tab'}
                                onClick={() => setActiveTab('sent')}>
                                Solicitudes Enviadas
                            </div>
                        </div>
                        <div className="friends-tab-content">
                            {activeTab === 'search' && (
                                <>
                                    <div className="friends-search-box">
                                        <form onSubmit={handleSearchSubmit} style={{width: '100%'}}>
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre o email..."
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                className="friends-search-input"
                                            />
                                            <button type="submit" className="friends-search-button"
                                                    disabled={isSearching}>
                                                {isSearching ? 'Buscando...' : 'Buscar'}
                                            </button>
                                        </form>
                                    </div>
                                    <div className="friends-search-results">
                                        {searchResults.length > 0 ? (
                                            <ul className="friends-list">
                                                {searchResults.map((user) => (
                                                    <li key={`search-${user.usuarioid}`} className="friends-list-item">
                                                        <div className="friends-user-text">
                                                            <UserAvatar user={user}/>
                                                            <div className="friends-user-name">
                                                                <h3>{user.nombre} {user.apellido}</h3>
                                                                {user.email &&
                                                                    <p className="friends-last-active">{user.email}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="friends-action-buttons">
                                                            <button
                                                                onClick={() => handleSendRequest(user.usuarioid)}
                                                                className="friends-add-button"
                                                            >
                                                                Agregar
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : searchQuery && !isSearching ? (
                                            <div className="friends-empty-container">
                                                <p className="friends-empty-message">No se encontraron usuarios.</p>
                                            </div>
                                        ) : null}
                                    </div>
                                </>
                            )}
                            {activeTab === 'friends' && (
                                <div className="friends-search-results">
                                    {isLoading ? (
                                        <div className="friends-loading">Cargando amigos...</div>
                                    ) : friends.length > 0 ? (
                                        <ul className="friends-list">
                                            {friends.map((friend) => (
                                                <li key={`friend-${friend.usuarioid}`} className="friends-list-item">
                                                    <div className="friends-user-text">
                                                        <UserAvatar user={friend}/>
                                                        <div className="friends-user-name">
                                                            <h3>{friend.nombre} {friend.apellido}</h3>
                                                            {friend.email &&
                                                                <p className="friends-last-active">{friend.email}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="friends-action-buttons">
                                                        <button
                                                            onClick={() => handleDeleteFriend(friend.usuarioid)}
                                                            className="friends-reject-button"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="friends-empty-container">
                                            <p className="friends-empty-message">No tienes amigos aún. ¡Busca usuarios
                                                para agregar!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'pending' && (
                                <div className="friends-search-results">
                                    {isLoading ? (
                                        <div className="friends-loading">Cargando solicitudes...</div>
                                    ) : pendingRequests.length > 0 ? (
                                        <ul className="friends-list">
                                            {pendingRequests.map((request) => (
                                                <li key={`pending-${request.id_solicitud}`}
                                                    className="friends-list-item">
                                                    <div className="friends-user-text">
                                                        <UserAvatar
                                                            user={request.usuario_solicitudesamistad_id_remitenteTousuario || {
                                                                nombre: '',
                                                                apellido: ''
                                                            }}/>
                                                        <div className="friends-user-name">
                                                            <h3>
                                                                {request.usuario_solicitudesamistad_id_remitenteTousuario?.nombre || ''} {request.usuario_solicitudesamistad_id_remitenteTousuario?.apellido || ''}
                                                            </h3>
                                                            <p className="friends-last-active">
                                                                Solicitud recibida
                                                                el {formatDate(request.fecha_creacion)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="friends-action-buttons">
                                                        <button
                                                            onClick={() => handleAcceptRequest(request.id_remitente)}
                                                            className="friends-accept-button"
                                                        >
                                                            Aceptar
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectRequest(request.id_remitente)}
                                                            className="friends-reject-button"
                                                        >
                                                            Rechazar
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="friends-empty-container">
                                            <p className="friends-empty-message">No tienes solicitudes de amistad
                                                pendientes.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'sent' && (
                                <div className="friends-search-results">
                                    {isLoading ? (
                                        <div className="friends-loading">Cargando solicitudes...</div>
                                    ) : sentRequests.length > 0 ? (
                                        <ul className="friends-list">
                                            {sentRequests.map((request) => (
                                                <li key={`sent-${request.id_solicitud}`} className="friends-list-item">
                                                    <div className="friends-user-text">
                                                        <UserAvatar
                                                            user={request.usuario_solicitudesamistad_id_receptorTousuario || {
                                                                nombre: '',
                                                                apellido: ''
                                                            }}/>
                                                        <div className="friends-user-name">
                                                            <h3>
                                                                {request.usuario_solicitudesamistad_id_receptorTousuario?.nombre || ''} {request.usuario_solicitudesamistad_id_receptorTousuario?.apellido || ''}
                                                            </h3>
                                                            <p className="friends-last-active">
                                                                Solicitud enviada
                                                                el {formatDate(request.fecha_creacion)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="friends-action-buttons">
                                                        <button
                                                            onClick={() => handleCancelRequest(request.id_receptor)}
                                                            className="friends-reject-button"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="friends-empty-container">
                                            <p className="friends-empty-message">No has enviado solicitudes de
                                                amistad.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FriendsPage;