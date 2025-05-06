import {useState, useEffect} from 'react';
import {ChevronRight, SortAsc, SortDesc, Filter} from 'lucide-react';
import {useAdmin} from '@context/AdminContext.tsx';
import {useTicket} from '@context/TicketContext.tsx';
import {useUser} from '@context/UserContext.tsx';
import {useAuth} from '@context/AuthContext.tsx';
import '@css/TicketViewStyle.css';
import NavBar from '@components/NavBar';
import {useNavigate} from "react-router-dom";

// Modern styling with gold, black and green palette - Updated for a dark background
const styles = {
    container: 'ticket-view-container',
    header: 'header',
    table: 'table',
    tableHeader: 'table-header',
    tableHeaderCell: 'table-header-cell',
    tableRow: 'table-row',
    tableCell: 'table-cell',
    idCell: 'id-cell',
    idIcon: 'id-icon',
    idText: 'id-text',
    idBadge: 'id-badge',
    avatarContainer: 'avatar-container',
    avatarText: 'avatar-text',
    subjectText: 'subject-text',
    dateText: 'date-text',
    actionButton: 'action-button',
    loadingContainer: 'loading-container',
    loadingText: 'loading-text',
    errorContainer: 'error-container',
    errorText: 'error-text',
    emptyContainer: 'empty-container',
    pageWrapper: 'page-wrapper',
    filterContainer: 'filter-container',
    filterButton: 'filter-button',
    filterDropdown: 'filter-dropdown',
    filterItem: 'filter-item',
    sortButton: 'sort-button',
    activeFilter: 'active-filter'
};

// Ticket interface for the component
interface Ticket {
    id: string;
    name: string;
    subject: string;
    status: 'Open' | 'Pending' | 'Closed';
    priority: 'Low' | 'Medium' | 'High';
    created: string;
    avatar: string;
    img?: string | null;
}

// StatusBadge component with updated styling
const StatusBadge = ({status}: { status: string }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'Open':
                return 'status-open';
            case 'Pending':
                return 'status-pending';
            case 'Closed':
                return 'status-closed';
            default:
                return 'status-closed';
        }
    };

    return (
        <span className={`status-badge ${getStatusClass()}`}>
                        {status}
                    </span>
    );
};

// PriorityIndicator component with updated styling
const PriorityIndicator = ({priority}: { priority: string }) => {
    const getColorClass = () => {
        switch (priority) {
            case 'High':
                return 'priority-high';
            case 'Medium':
                return 'priority-medium';
            case 'Low':
                return 'priority-low';
            default:
                return 'priority-medium';
        }
    };

    return (
        <div className="priority-indicator">
            <div className={`priority-dot ${getColorClass()}`}></div>
            <span>{priority}</span>
        </div>
    );
};

// Updated Avatar component with image handling
const Avatar = ({name, color, img}: { name: string; color: string; img?: string | null }) => {
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2);

    const getAvatarColor = () => {
        switch (color) {
            case 'bg-purple-500':
            case 'bg-yellow-500':
                return 'avatar bg-amber-600';
            case 'bg-red-500':
                return 'avatar bg-green-700';
            case 'bg-blue-500':
                return 'avatar bg-amber-400';
            case 'bg-gray-500':
            default:
                return 'avatar bg-green-500';
        }
    };

    if (img) {
        return (
            <div className="avatar">
                <img
                    src={`http://localhost:3001${img}`}
                    alt={`${name}`}
                    className="avatar"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                            const div = document.createElement('div');
                            div.className = getAvatarColor();
                            div.textContent = initials;
                            parent.appendChild(div);
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div className={getAvatarColor()}>
            {initials}
        </div>
    );
};

const TicketsView = () => {
    const {isAdmin, isSuperAdmin, isLoading: adminLoading, getAdminByUserId} = useAdmin();
    const {tickets, loading: ticketLoading, error, getTicketsByAdminId, getTicketsByClientId} = useTicket();
    const {client, isLoading: userLoading} = useUser();
    const {user} = useAuth(); // Add AuthContext to get current user info
    const navigate = useNavigate();
    const [formattedTickets, setFormattedTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [, setIsSuperUser] = useState(false);

    // Check admin permissions
    useEffect(() => {
        const checkAdminPermissions = async () => {
            try {
                const adminStatus = await isAdmin();
                const superAdminStatus = await isSuperAdmin();
                setIsUserAdmin(adminStatus);
                setIsSuperUser(superAdminStatus);
            } catch (error) {
                console.error("Error checking admin permissions:", error);
                setIsUserAdmin(false);
                setIsSuperUser(false);
            }
        };

        checkAdminPermissions();
    }, [isAdmin, isSuperAdmin]);

    // Function to determine avatar color based on name
    const getAvatarColor = (name: string): string => {
        const sumChars = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const colors = ['bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-blue-500', 'bg-gray-500'];
        return colors[sumChars % colors.length];
    };

    // Convert API tickets to the format needed for display
    const mapApiTicketsToViewFormat = (apiTickets: any[]): Ticket[] => {
        return apiTickets.map(ticket => {
            let clientName;
            let clientImg = null;

            if (!isUserAdmin && user) {
                // For client view - use the logged-in user's info
                clientName = `${user.nombre || ''} ${user.apellido || ''}`.trim();
                clientImg = user.img || null;
            } else {
                // For admin view - use the client info from the ticket
                clientName = ticket.cliente && ticket.cliente.usuario
                    ? `${ticket.cliente.usuario.nombre || ''} ${ticket.cliente.usuario.apellido || ''}`.trim()
                    : `Cliente #${ticket.clienteid || ''}`;

                clientImg = ticket.cliente && ticket.cliente.usuario && ticket.cliente.usuario.img
                    ? ticket.cliente.usuario.img
                    : null;
            }

            return {
                id: ticket.ticketid?.toString() || ticket.id?.toString() || '0',
                name: clientName,
                subject: ticket.asunto || ticket.problema || 'Sin asunto',
                status: mapStatus(ticket.resuelto !== undefined ? (ticket.resuelto ? 'cerrado' : 'abierto') : ticket.estado),
                priority: mapPriority(ticket.prioridad),
                created: new Date(ticket.fechacreacion || ticket.fecha_creacion).toLocaleDateString() || '',
                avatar: getAvatarColor(clientName),
                img: clientImg
            };
        });
    };

    // Map status values from API to component format
    const mapStatus = (status: string | boolean): 'Open' | 'Pending' | 'Closed' => {
        if (status === undefined || status === null) return 'Open';

        if (typeof status === 'boolean') {
            return status ? 'Closed' : 'Open';
        }

        switch (status.toString().toLowerCase()) {
            case 'abierto':
            case 'false':
                return 'Open';
            case 'pendiente':
                return 'Pending';
            case 'cerrado':
            case 'true':
                return 'Closed';
            default:
                return 'Open';
        }
    };

    // Map priority values from API to component format
    const mapPriority = (priority: string): 'Low' | 'Medium' | 'High' => {
        switch (priority?.toLowerCase()) {
            case 'baja':
                return 'Low';
            case 'media':
                return 'Medium';
            case 'alta':
                return 'High';
            default:
                return 'Medium';
        }
    };

    // Toggle sort direction
    const toggleSort = () => {
        if (sortDirection === null) {
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else {
            setSortDirection(null);
        }
    };

    // Filter tickets by priority
    const filterByPriority = (priority: string | null) => {
        setPriorityFilter(priority);
        setShowFilterDropdown(false);
    };

    // Apply filters and sorting
    useEffect(() => {
        let result = [...formattedTickets];

        // Apply priority filter if selected
        if (priorityFilter) {
            result = result.filter(ticket => ticket.priority === priorityFilter);
        }

        // Apply sorting if selected
        if (sortDirection) {
            const priorityOrder = {'High': 3, 'Medium': 2, 'Low': 1};

            result.sort((a, b) => {
                const valueA = priorityOrder[a.priority as keyof typeof priorityOrder];
                const valueB = priorityOrder[b.priority as keyof typeof priorityOrder];

                return sortDirection === 'asc'
                    ? valueA - valueB
                    : valueB - valueA;
            });
        }

        setFilteredTickets(result);
    }, [formattedTickets, priorityFilter, sortDirection]);

    // Load tickets for the user based on their role
    useEffect(() => {
        const loadTickets = async () => {
            setIsLoading(true);
            try {
                // Check if user is admin
                const adminStatus = await isAdmin();
                setIsUserAdmin(adminStatus);
                const superAdminStatus = await isSuperAdmin();
                setIsSuperUser(superAdminStatus);

                if (adminStatus) {
                    // Admin flow - Get admin ID and load tickets
                    const userId = getCurrentUserId();
                    if (userId) {
                        try {
                            const admin = await getAdminByUserId(userId);
                            if (admin && admin.adminid) {
                                await getTicketsByAdminId(Number(admin.adminid));
                            }
                        } catch (err) {
                            console.error("Error fetching admin tickets:", err);
                        }
                    }
                } else {
                    // Regular user flow - Get client ID and load tickets using context
                    if (client && client.clienteid) {
                        await getTicketsByClientId(client.clienteid);
                    } else {
                        console.error("No client ID found in user context");
                    }
                }
            } catch (error) {
                console.error("Error loading tickets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!userLoading) {
            loadTickets();
        }
    }, [client, userLoading]);

    // Function to get current user ID from localStorage - still needed for admin flow
    const getCurrentUserId = () => {
        // Try to get userId directly
        const directUserId = localStorage.getItem('userId');
        if (directUserId) return directUserId;

        // Try to parse user object if it exists
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                return userData.usuarioid?.toString() || userData.userId?.toString() || userData.id?.toString();
            } catch (e) {
                console.error("Error parsing user data from localStorage:", e);
            }
        }

        // Check other possible keys
        return localStorage.getItem('usuarioid') ||
            localStorage.getItem('user_id') ||
            null;
    };

    // Update formatted tickets when API tickets change
    useEffect(() => {
        if (tickets && tickets.length > 0) {
            const formatted = mapApiTicketsToViewFormat(tickets);
            setFormattedTickets(formatted);
            setFilteredTickets(formatted);
        } else {
            setFormattedTickets([]);
            setFilteredTickets([]);
        }
    }, [tickets]);

    if (isLoading || adminLoading || ticketLoading || userLoading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingText}>Cargando tickets...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorText}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <NavBar
                navLinks={[
                    {label: "Inicio", href: "/home"},
                    {label: "Soporte", href: "/support"}
                ]}
                logoText="Australis Casino"
                variant="dark"
            />
            <div className={`${styles.pageWrapper} page-content`}>
                <div className={styles.container}>
                    {filteredTickets.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-amber-500">Tickets</h2>

                                {/* Show filter and sort controls only for admins */}
                                {isUserAdmin && (
                                    <div className={styles.filterContainer}>
                                        <div className="relative">
                                            <button
                                                className={`${styles.filterButton} ${priorityFilter ? styles.activeFilter : ''}`}
                                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                            >
                                                <Filter size={16}/>
                                                <span>{priorityFilter || 'Filter'}</span>
                                            </button>
                                            {showFilterDropdown && (
                                                <div className={styles.filterDropdown}>
                                                    <div className={styles.filterItem}
                                                         onClick={() => filterByPriority(null)}>
                                                        All
                                                    </div>
                                                    <div className={styles.filterItem}
                                                         onClick={() => filterByPriority('High')}>
                                                        High
                                                    </div>
                                                    <div className={styles.filterItem}
                                                         onClick={() => filterByPriority('Medium')}>
                                                        Medium
                                                    </div>
                                                    <div className={styles.filterItem}
                                                         onClick={() => filterByPriority('Low')}>
                                                        Low
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button className={styles.sortButton} onClick={toggleSort}>
                                            {sortDirection === 'asc' ? <SortAsc size={16}/> :
                                                sortDirection === 'desc' ? <SortDesc size={16}/> : <SortAsc size={16}/>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <table className={styles.table}>
                                <thead className={styles.tableHeader}>
                                <tr>
                                    <th className={styles.tableHeaderCell}>ID</th>
                                    <th className={styles.tableHeaderCell}>Cliente</th>
                                    <th className={styles.tableHeaderCell}>Asunto</th>
                                    <th className={styles.tableHeaderCell}>Estado</th>
                                    {isUserAdmin && <th className={styles.tableHeaderCell}>Prioridad</th>}
                                    <th className={styles.tableHeaderCell}>Fecha</th>
                                    <th className={styles.tableHeaderCell}>Acción</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className={styles.tableRow}>
                                        <td className={styles.idCell}>
                                            <div className={styles.idText}>#{ticket.id}</div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <div className="flex items-center">
                                                <Avatar name={ticket.name} color={ticket.avatar} img={ticket.img}/>
                                                <span className="ml-2 font-medium">{ticket.name}</span>
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <div className={styles.subjectText}>{ticket.subject}</div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <StatusBadge status={ticket.status}/>
                                        </td>
                                        {isUserAdmin && (
                                            <td className={styles.tableCell}>
                                                <PriorityIndicator priority={ticket.priority}/>
                                            </td>
                                        )}
                                        <td className={styles.tableCell}>
                                            <div className={styles.dateText}>{ticket.created}</div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => navigate(`/ticket/${ticket.id}`)}
                                            >
                                                <ChevronRight size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <div className={styles.emptyContainer}>
                            <p>No hay tickets disponibles</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TicketsView;