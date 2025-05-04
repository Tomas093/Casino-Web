import {useState, useEffect} from 'react';
import {ChevronRight, SortAsc, SortDesc, Filter} from 'lucide-react';
import {useAdmin} from '@context/AdminContext.tsx';
import {useTicket} from '@context/TicketContext.tsx';
import '@css/TicketViewStyle.css';
import NavBar from '@components/NavBar';

// Modern styling with gold, black and green palette - Updated for dark background
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
    const {isAdmin, isLoading: adminLoading, getAdminByUserId} = useAdmin();
    const {tickets, loading: ticketLoading, error, getTicketsByAdminId} = useTicket();

    const [formattedTickets, setFormattedTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

    // Function to get current user ID from localStorage
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

    // Function to determine avatar color based on name
    const getAvatarColor = (name: string): string => {
        const sumChars = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const colors = ['bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-blue-500', 'bg-gray-500'];
        return colors[sumChars % colors.length];
    };

    // Convert API tickets to the format needed for display
    const mapApiTicketsToViewFormat = (apiTickets: any[]): Ticket[] => {
        return apiTickets.map(ticket => {
            // Format full name from cliente.usuario if available
            const clientName = ticket.cliente && ticket.cliente.usuario
                ? `${ticket.cliente.usuario.nombre || ''} ${ticket.cliente.usuario.apellido || ''}`.trim()
                : `Cliente #${ticket.clienteid || ''}`;

            // Get client image if available
            const clientImg = ticket.cliente && ticket.cliente.usuario && ticket.cliente.usuario.img
                ? ticket.cliente.usuario.img
                : null;

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

    useEffect(() => {
        const loadAdminTickets = async () => {
            setIsLoading(true);
            try {
                const isUserAdmin = await isAdmin();
                console.log("Is user admin:", isUserAdmin);

                if (isUserAdmin) {
                    const userId = getCurrentUserId();
                    console.log("Current user ID:", userId);

                    if (userId) {
                        try {
                            const admin = await getAdminByUserId(userId);
                            console.log("Admin data received:", admin);

                            if (admin && admin.adminid) {
                                console.log("Fetching tickets for admin ID:", admin.adminid);
                                await getTicketsByAdminId(Number(admin.adminid));
                            } else {
                                console.error("No admin data or admin ID returned");
                            }
                        } catch (err) {
                            console.error("Error fetching admin data:", err);
                        }
                    } else {
                        console.error("No user ID found in localStorage");
                    }
                } else {
                    console.log("User is not an admin");
                }
            } catch (error) {
                console.error("Error loading admin tickets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAdminTickets();
    }, []);

    // Update formatted tickets when API tickets change
    useEffect(() => {
        if (tickets && tickets.length > 0) {
            console.log("Received tickets:", tickets);
            const formatted = mapApiTicketsToViewFormat(tickets);
            setFormattedTickets(formatted);
            setFilteredTickets(formatted);
        } else {
            setFormattedTickets([]);
            setFilteredTickets([]);
        }
    }, [tickets]);

    if (isLoading || adminLoading || ticketLoading) {
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
                    {label: "Tickets", href: "/tickets"},
                    {label: "Perfil", href: "/profile"}
                ]}
                logoText="Australis Casino"
                variant="dark"
            />
            <div className={`${styles.pageWrapper} page-content`}>
                <div className={styles.container}>
                    {formattedTickets.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-green-900 bg-black">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="tickets-header">Tickets Recientes</h1>
                                <div className="flex items-center">
                                    <div className="relative mr-4">
                                        <button
                                            className={`priority-filter-button ${priorityFilter ? 'active-priority-filter' : ''}`}
                                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        >
                                            <Filter size={18}/>
                                            <span className="ml-2">Filtrar</span>
                                            {priorityFilter && (
                                                <span
                                                    className={`priority-filter-badge ${
                                                        priorityFilter === 'High' ? 'priority-high-badge' :
                                                            priorityFilter === 'Low' ? 'priority-low-badge' : ''
                                                    }`}
                                                >
                                                    {priorityFilter}
                                                </span>
                                            )}
                                        </button>

                                        {showFilterDropdown && (
                                            <div className="priority-filter-dropdown">
                                                <div
                                                    className="priority-filter-item"
                                                    onClick={() => filterByPriority(null)}
                                                >
                                                    <span className="priority-dot priority-all"></span>
                                                    Todas
                                                </div>
                                                <div
                                                    className="priority-filter-item"
                                                    onClick={() => filterByPriority('High')}
                                                >
                                                    <span className="priority-dot priority-high"></span>
                                                    Alta
                                                </div>
                                                <div
                                                    className="priority-filter-item"
                                                    onClick={() => filterByPriority('Medium')}
                                                >
                                                    <span className="priority-dot priority-medium"></span>
                                                    Media
                                                </div>
                                                <div
                                                    className="priority-filter-item"
                                                    onClick={() => filterByPriority('Low')}
                                                >
                                                    <span className="priority-dot priority-low"></span>
                                                    Baja
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className={`sort-button ${sortDirection ? 'active-filter' : ''}`}
                                        onClick={toggleSort}
                                    >
                                        {sortDirection === 'asc' ? (
                                            <SortAsc size={18}/>
                                        ) : sortDirection === 'desc' ? (
                                            <SortDesc size={18}/>
                                        ) : (
                                            <SortAsc size={18} className="opacity-70"/>
                                        )}
                                        <span className="ml-2">Ordenar</span>
                                    </button>
                                </div>
                            </div>

                            <table className={styles.table}>
                                <thead>
                                <tr className={styles.tableHeader}>
                                    <th className={styles.tableHeaderCell}>Id</th>
                                    <th className={styles.tableHeaderCell}>Cliente</th>
                                    <th className={styles.tableHeaderCell}>Asunto</th>
                                    <th className={styles.tableHeaderCell}>Estado</th>
                                    <th className={styles.tableHeaderCell}>Prioridad</th>
                                    <th className={styles.tableHeaderCell}>Creado</th>
                                    <th className={styles.tableHeaderCell}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className={styles.tableRow}>
                                        <td className={styles.idCell} title={`ID completo: ${ticket.id}`}>
                                            <span className={styles.idBadge}>{ticket.id.substring(0, 6)}</span>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <div className={styles.avatarContainer}>
                                                <Avatar name={ticket.name} color={ticket.avatar} img={ticket.img}/>
                                                <span className={styles.avatarText}>{ticket.name}</span>
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <span className={styles.subjectText}>{ticket.subject}</span>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <StatusBadge status={ticket.status}/>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <PriorityIndicator priority={ticket.priority}/>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <span className={styles.dateText}>{ticket.created}</span>
                                        </td>
                                        <td className={`${styles.tableCell} text-right`}>
                                            <button className={styles.actionButton}>
                                                <ChevronRight size={20}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.emptyContainer}>No hay tickets asignados.</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TicketsView;

