import React, {useEffect, useState} from 'react';
import "@css/FriendStyle.css"; // Mantenemos la referencia al CSS existente
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

// Componente mejorado para avatar de usuario con animación de hover
const UserAvatar: React.FC<{ user: User | any, className?: string }> = ({ user, className = "friends-avatar" }) => {
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

// Componente para mostrar tarjetas de usuario individuales
const UserCard: React.FC<{
    user: User | any,
    type: 'search' | 'friend' | 'pending' | 'sent',
    onAction: (id: number) => void,
    onSecondaryAction?: (id: number) => void,
    date?: string
}> = ({ user, type, onAction, onSecondaryAction, date }) => {
    const getActionButtons = () => {
        switch (type) {
            case 'search':
                return (
                    <button onClick={() => onAction(user.usuarioid)} className="friends-add-button">
                        <i className="fas fa-user-plus"></i> Agregar
                    </button>
                );
            case 'friend':
                return (
                    <button onClick={() => onAction(user.usuarioid)} className="friends-delete-button">
                        <i className="fas fa-user-minus"></i> Eliminar
                    </button>
                );
            case 'pending':
                return (
                    <div className="friends-action-group">
                        <button onClick={() => onAction(user.id_remitente)} className="friends-accept-button">
                            <i className="fas fa-check"></i> Aceptar
                        </button>
                        <button onClick={() => onSecondaryAction && onSecondaryAction(user.id_remitente)} className="friends-reject-button">
                            <i className="fas fa-times"></i> Rechazar
                        </button>
                    </div>
                );
            case 'sent':
                return (
                    <button onClick={() => onAction(user.id_receptor)} className="friends-cancel-button">
                        <i className="fas fa-ban"></i> Cancelar
                    </button>
                );
            default:
                return null;
        }
    };

    const userData = type === 'pending'
        ? user.usuario_solicitudesamistad_id_remitenteTousuario
        : type === 'sent'
            ? user.usuario_solicitudesamistad_id_receptorTousuario
            : user;

    return (
        <div className="friend-card">
            <div className="friend-card-avatar">
                <UserAvatar user={userData || { nombre: '', apellido: '' }} />
            </div>
            <div className="friend-card-content">
                <h3 className="friend-card-name">
                    {userData?.nombre || ''} {userData?.apellido || ''}
                </h3>
                {userData?.email && (
                    <p className="friend-card-email">{userData.email}</p>
                )}
                {date && (
                    <p className="friend-card-date">
                        {type === 'pending' ? 'Solicitud recibida el ' : 'Solicitud enviada el '}
                        {date}
                    </p>
                )}
            </div>
            <div className="friend-card-actions">
                {getActionButtons()}
            </div>
        </div>
    );
};

// Componente de estado vacío mejorado
const EmptyState: React.FC<{ type: string }> = ({ type }) => {
    const messages: { [key: string]: { icon: string, message: string } } = {
        search: {
            icon: 'fa-search',
            message: 'Usa el buscador para encontrar nuevos amigos'
        },
        friends: {
            icon: 'fa-user-friends',
            message: 'No tienes amigos aún. ¡Busca usuarios para agregar!'
        },
        pending: {
            icon: 'fa-inbox',
            message: 'No tienes solicitudes de amistad pendientes'
        },
        sent: {
            icon: 'fa-paper-plane',
            message: 'No has enviado solicitudes de amistad'
        }
    };

    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <i className={`fas ${messages[type].icon}`}></i>
            </div>
            <p className="empty-state-message">{messages[type].message}</p>
        </div>
    );
};

// Componente principal mejorado
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

    const { user } = useAuth();
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

    const renderTabContent = () => {
        if (isLoading) {
            return <div className="loading-spinner"><div className="spinner"></div><span>Cargando...</span></div>;
        }

        switch (activeTab) {
            case 'search':
                return (
                    <>
                        <div className="search-container">
                            <form onSubmit={handleSearchSubmit} className="search-form">
                                <div className="search-input-wrapper">
                                    <i className="fas fa-search search-icon"></i>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o email..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="search-input"
                                    />
                                </div>
                                <button type="submit" className="search-button" disabled={isSearching}>
                                    {isSearching ? <i className="fas fa-spinner fa-spin"></i> : 'Buscar'}
                                </button>
                            </form>
                        </div>
                        <div className="friends-cards-container">
                            {searchResults.length > 0 ? (
                                searchResults.map((user) => (
                                    <UserCard
                                        key={`search-${user.usuarioid}`}
                                        user={user}
                                        type="search"
                                        onAction={handleSendRequest}
                                    />
                                ))
                            ) : searchQuery && !isSearching ? (
                                <EmptyState type="search" />
                            ) : null}
                        </div>
                    </>
                );
            case 'friends':
                return (
                    <div className="friends-cards-container">
                        {friends.length > 0 ? (
                            friends.map((friend) => (
                                <UserCard
                                    key={`friend-${friend.usuarioid}`}
                                    user={friend}
                                    type="friend"
                                    onAction={handleDeleteFriend}
                                />
                            ))
                        ) : (
                            <EmptyState type="friends" />
                        )}
                    </div>
                );
            case 'pending':
                return (
                    <div className="friends-cards-container">
                        {pendingRequests.length > 0 ? (
                            pendingRequests.map((request) => (
                                <UserCard
                                    key={`pending-${request.id_solicitud}`}
                                    user={request}
                                    type="pending"
                                    onAction={handleAcceptRequest}
                                    onSecondaryAction={handleRejectRequest}
                                    date={formatDate(request.fecha_creacion)}
                                />
                            ))
                        ) : (
                            <EmptyState type="pending" />
                        )}
                    </div>
                );
            case 'sent':
                return (
                    <div className="friends-cards-container">
                        {sentRequests.length > 0 ? (
                            sentRequests.map((request) => (
                                <UserCard
                                    key={`sent-${request.id_solicitud}`}
                                    user={request}
                                    type="sent"
                                    onAction={handleCancelRequest}
                                    date={formatDate(request.fecha_creacion)}
                                />
                            ))
                        ) : (
                            <EmptyState type="sent" />
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container">
            <SideBar />
            <main className="main-content">
                <div className="friends-page">
                    <header className="friends-header">
                        <h1 className="friends-title">Amigos</h1>
                        {error && <Message type="error" message={error} />}
                    </header>

                    <div className="friends-container">
                        <div className="friends-navigation">
                            <nav className="tab-navigation">
                                <button
                                    className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('search')}
                                >
                                    <i className="fas fa-search"></i>
                                    <span>Buscar</span>
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('friends')}
                                >
                                    <i className="fas fa-user-friends"></i>
                                    <span>Amigos</span>
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    <i className="fas fa-inbox"></i>
                                    <span>Recibidas</span>
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('sent')}
                                >
                                    <i className="fas fa-paper-plane"></i>
                                    <span>Enviadas</span>
                                </button>
                            </nav>
                        </div>

                        <div className="friends-content">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FriendsPage;