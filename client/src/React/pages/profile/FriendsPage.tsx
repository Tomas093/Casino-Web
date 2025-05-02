import React, {useState} from 'react';
import "@css/FriendStyle.css";
import SideBar from "@components/SideBar.tsx";
import Message from "@components/Error/Message.tsx";
import {useFriendRequestContext} from "@context/FriendRequestContext.tsx";
import {useUser} from "@context/UserContext.tsx";
import {useAuth} from "@context/AuthContext.tsx";

// Types for our data
interface User {
    usuarioid: number;
    nombre: string;
    apellido: string;
    img?: string;
    email?: string;
}

const FriendsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const {getAllUsers} = useUser();
    const {user} = useAuth();
    const {sendFriendRequest} = useFriendRequestContext();

    // Search users function
    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const allUsers = await getAllUsers();
            // Filter out current user and filter by search terms
            const filteredUsers = allUsers.filter((u: User) =>
                u.usuarioid !== user?.usuarioid &&
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

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Handle search form submission
    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        searchUsers(searchQuery);
    };

    // Handle send friend request
    const handleSendRequest = async (userId: number) => {
        if (user?.usuarioid !== undefined) {
            try {
                await sendFriendRequest(user.usuarioid, userId);
                setSearchResults(searchResults.filter(user => user.usuarioid !== userId));
            } catch (error) {
                console.error("Error sending friend request:", error);
                setError("Error al enviar solicitud de amistad");
            }
        }
    };

    // Handle accept friend request
    const handleAcceptRequest = async (userId: number) => {
        if (user?.usuarioid !== undefined) {
            try {
                await sendFriendRequest(user.usuarioid, userId);
                setSearchResults(searchResults.filter(user => user.usuarioid !== userId));
            } catch (error) {
                console.error("Error accepting friend request:", error);
                setError("Error al aceptar solicitud de amistad");
            }
        }
    };

    // Handle reject friend request
    const handleRejectRequest = async (userId: number) => {
        if (user?.usuarioid !== undefined) {
            try {
                await sendFriendRequest(user.usuarioid, userId);
                setSearchResults(searchResults.filter(user => user.usuarioid !== userId));
            } catch (error) {
                console.error("Error rejecting friend request:", error);
                setError("Error al rechazar solicitud de amistad");
            }
        }
    };

    // Handle cancel friend request
    const handleCancelRequest = async (userId: number) => {
        if (user?.usuarioid !== undefined) {
            try {
                await sendFriendRequest(user.usuarioid, userId);
                setSearchResults(searchResults.filter(user => user.usuarioid !== userId));
            } catch (error) {
                console.error("Error canceling friend request:", error);
                setError("Error al cancelar solicitud de amistad");
            }
        }
    };

    return (
        <div className="container">
            <SideBar/>

            <main className="main-content">
                <header className="content-header">
                    <h1>Buscar Amigos</h1>
                </header>

                {error && <Message type="error" message={error}/>}

                <div className="friends-section">
                    <div className="friends-content-paper">
                        <div className="friends-search-box">
                            <form onSubmit={handleSearchSubmit} style={{width: '100%'}}>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="friends-search-input"
                                />
                                <button type="submit" className="friends-search-button" disabled={isSearching}>
                                    {isSearching ? 'Buscando...' : 'Buscar'}
                                </button>
                            </form>
                        </div>

                        <div className="friends-search-results">
                            {searchResults.length > 0 ? (
                                <ul className="friends-list">
                                    {searchResults.map((user) => (
                                        <li key={user.usuarioid} className="friends-list-item">
                                            <div className="friends-user-text">
                                                <img
                                                    src={user.img || '/default-avatar.png'}
                                                    alt={`${user.nombre} ${user.apellido}`}
                                                    className="friends-avatar"
                                                />
                                                <div className="friends-user-name">
                                                    <h3>{user.nombre} {user.apellido}</h3>
                                                    {user.email && <p className="friends-last-active">{user.email}</p>}
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
                    </div>
                </div>
            </main>
        </div>
    );
};



export default FriendsPage;