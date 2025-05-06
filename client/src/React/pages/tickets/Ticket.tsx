import {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import {AlertCircle, CheckCircle, ChevronDown, ChevronUp, Circle} from 'lucide-react';
import {useAuth} from '@context/AuthContext';
import {useMessageContext} from '@context/MessageContext';
import {useAdmin} from '@context/AdminContext'; // Import AdminContext
import NavBar from '@components/NavBar';
import '@css/TicketStyle.css';
import {useTicket} from "@context/TicketContext.tsx";

type TicketStatus = 'open' | 'closed';
type TicketPriority = 'baja' | 'media' | 'alta';

const formatTicketDetails = (ticket: any) => {
    if (!ticket) return '';
    const fechaCreacion = new Date(ticket.fechacreacion).toLocaleString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const estado = ticket.resuelto ? 'Cerrado' : 'Abierto';
    return `Ticket #${ticket.ticketid}
Id De Cliente: ${ticket.clienteid}
Categoría: ${ticket.categoria.charAt(0).toUpperCase() + ticket.categoria.slice(1)}
Prioridad: ${ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1)}
Creado el: ${fechaCreacion}
Estado: ${estado}`;
};

const Ticket = () => {
    const {ticketId} = useParams<{ ticketId: string }>();
    const [status, setStatus] = useState<TicketStatus>('open');
    const [priority, setPriority] = useState<TicketPriority>('baja');
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [ticket, setTicket] = useState<any>(null); // Local state for ticket data
    const [isAdminUser, setIsAdminUser] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {user} = useAuth();
    const {isAdmin} = useAdmin(); // Use isAdmin to check admin privileges
    const {messages, getMessagesByTicketId, createMessage} = useMessageContext();
    const {getTicketById, editTicket} = useTicket();

    // Fetch ticket data when component mounts
    useEffect(() => {
        const fetchTicket = async () => {
            if (ticketId) {
                const fetchedTicket = await getTicketById(Number(ticketId));
                setTicket(fetchedTicket); // Store ticket data in local state
            }
        };
        fetchTicket();
    }, [ticketId, getTicketById]);

    // Fetch messages when component mounts
    useEffect(() => {
        if (ticketId) {
            getMessagesByTicketId(Number(ticketId));
        }
    }, [ticketId, getMessagesByTicketId]);

    // Check admin status
    useEffect(() => {
        const checkAdmin = async () => {
            const adminStatus = await isAdmin();
            setIsAdminUser(adminStatus);
        };
        checkAdmin();
    }, [isAdmin]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !ticketId) return;

        await createMessage({
            ticketid: Number(ticketId),
            contenido: newMessage,
            emisorid: user.usuarioid,
        });

        setNewMessage('');
    };

    const handleStatusChange = async (newStatus: TicketStatus) => {
        if (!ticket || !ticketId) return;

        const isResolved = newStatus === 'closed';
        const ticketData = {
            resuelto: isResolved,
            fechacierre: isResolved ? new Date() : null
        };

        await editTicket(Number(ticketId), ticketData);
        setStatus(newStatus);

        setTicket({
            ...ticket,
            resuelto: isResolved,
            fechacierre: isResolved ? new Date() : null
        });
    };

    const getStatusIcon = (statusType: TicketStatus) => {
        switch (statusType) {
            case 'open':
                return <Circle className="status-icon status-open"/>;
            case 'closed':
                return <CheckCircle className="status-icon status-closed"/>;
        }
    };

    const getStatusLabel = (statusType: TicketStatus) => {
        return statusType === 'open' ? 'Abierto' : 'Cerrado';
    };

    const getPriorityIcon = (priorityType: TicketPriority) => {
        switch (priorityType) {
            case 'baja':
                return <AlertCircle className="priority-icon priority-baja"/>;
            case 'media':
                return <AlertCircle className="priority-icon priority-media"/>;
            case 'alta':
                return <AlertCircle className="priority-icon priority-alta"/>;
        }
    };

    return (
        <>
            {/* Add NavBar at the top of the component */}
            <NavBar
                navLinks={[
                    {label: "Tickets", href: "/tickets"},
                    {label: "Support", href: "/support"}
                ]}
                variant="dark"
                showBalance={true}
            />
            <div className="ticket-container">
                <div className="ticket-wrapper">
                    <h1 className="ticket-title">Ticket #{ticketId}</h1>

                    <div className="ticket-header">
                        {/* Status Dropdown - Visible only to admins */}
                        {isAdminUser && (
                            <div className="dropdown-container">
                                <div
                                    className="dropdown-header"
                                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                >
                                    <div className="dropdown-selected">
                                        {getStatusIcon(status)}
                                        <span className="dropdown-text">{getStatusLabel(status)}</span>
                                    </div>
                                    {statusDropdownOpen ?
                                        <ChevronUp className="dropdown-arrow"/> :
                                        <ChevronDown className="dropdown-arrow"/>}
                                </div>

                                {statusDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div
                                            className="dropdown-item"
                                            onClick={() => {
                                                handleStatusChange('open');
                                                setStatusDropdownOpen(false);
                                            }}
                                        >
                                            <Circle className="status-icon status-open"/>
                                            <span>Abierto</span>
                                        </div>
                                        <div
                                            className="dropdown-item"
                                            onClick={() => {
                                                handleStatusChange('closed');
                                                setStatusDropdownOpen(false);
                                            }}
                                        >
                                            <CheckCircle className="status-icon status-closed"/>
                                            <span>Cerrado</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Priority Dropdown - Visible only to admins */}
                        {isAdminUser && (
                            <div className="dropdown-container">
                                <div
                                    className="dropdown-header"
                                    onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
                                >
                                    <div className="dropdown-selected">
                                        {getPriorityIcon(priority)}
                                        <span className="dropdown-text">{priority}</span>
                                    </div>
                                    {priorityDropdownOpen ?
                                        <ChevronUp className="dropdown-arrow"/> :
                                        <ChevronDown className="dropdown-arrow"/>}
                                </div>

                                {priorityDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div
                                            className="dropdown-item"
                                            onClick={() => {
                                                setPriority('baja');
                                                setPriorityDropdownOpen(false);
                                            }}
                                        >
                                            <AlertCircle className="priority-icon priority-baja"/>
                                            <span>Baja</span>
                                        </div>
                                        <div
                                            className="dropdown-item"
                                            onClick={() => {
                                                setPriority('media');
                                                setPriorityDropdownOpen(false);
                                            }}
                                        >
                                            <AlertCircle className="priority-icon priority-media"/>
                                            <span>Media</span>
                                        </div>
                                        <div
                                            className="dropdown-item"
                                            onClick={() => {
                                                setPriority('alta');
                                                setPriorityDropdownOpen(false);
                                            }}
                                        >
                                            <AlertCircle className="priority-icon priority-alta"/>
                                            <span>Alta</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="ticket-section">
                        <div className="section-header">
                            <span className="section-label">Detalles del Ticket</span>
                        </div>
                        <div className="section-content">
                            <pre
                                className="description-text">{ticket ? formatTicketDetails(ticket) : 'Cargando...'}</pre>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="ticket-section">
                        <div className="section-header">
                            <span className="section-label">Messages <span
                                className="message-count">({messages.length})</span></span>
                        </div>
                        <div className="messages-container">
                            {messages.map((message) => {
                                const isCurrentUser = message.usuarioid === user?.usuarioid;
                                const userName = message.tickets?.cliente?.usuario?.nombre || 'Desconocido';
                                const userLastName = message.tickets?.cliente?.usuario?.apellido || 'Usuario';
                                const userImg = message.tickets?.cliente?.usuario?.img || '';

                                return (
                                    <div
                                        key={message.mensajeid}
                                        className={`message-item ${isCurrentUser ? 'message-sent' : 'message-received'}`}
                                    >
                                        <div className="message-header">
                                            {!isCurrentUser && (
                                                <div className="avatar">
                                                    {userImg ? (
                                                        <img
                                                            src={`http://localhost:3001${userImg}`}
                                                            alt={`${userName} ${userLastName}'s avatar`}
                                                            className="user-avatar"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const parent = target.parentElement;
                                                                if (parent) {
                                                                    const div = document.createElement('div');
                                                                    div.textContent = `${userName.charAt(0).toUpperCase()}${userLastName.charAt(0).toUpperCase()}`;
                                                                    parent.appendChild(div);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <>
                                                            {userName.charAt(0).toUpperCase() || ''}
                                                            {userLastName.charAt(0).toUpperCase() || ''}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            <div className="message-info">
                                                <span className="author-name">
                                                    {isCurrentUser ? 'Tu' : `${userName} ${userLastName}`}
                                                </span>
                                                <span className="message-time">
                                                    • {new Date(message.fechaenvio).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="message-content">{message.contenido}</p>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* Reply box */}
                        <div className="reply-container">
                            <textarea
                                className="reply-textarea"
                                placeholder="Type your message here..."
                                rows={3}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <div className="reply-actions">
                                <button
                                    className="send-button"
                                    onClick={handleSendMessage}
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Ticket;
