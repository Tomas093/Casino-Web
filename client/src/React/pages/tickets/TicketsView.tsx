import {useState, useEffect} from 'react';
import {ChevronRight, AlertCircle} from 'lucide-react';
import {useAdmin} from '@context/AdminContext.tsx';
import {useTicket} from '@context/TicketContext.tsx';

// Modern styling with gold, black and green palette
const styles = {
    container: 'bg-dark-gray rounded-lg shadow-lg p-6 max-w-6xl mx-auto mt-8 text-white border border-gold-dark',
    header: 'text-2xl font-bold mb-6 text-gold-light',
    table: 'min-w-full',
    tableHeader: 'text-left text-text-light border-b border-gold-dark',
    tableHeaderCell: 'pb-3 font-medium',
    tableRow: 'border-b border-light-gray hover:bg-light-gray transition-colors',
    tableCell: 'py-4',
    idCell: 'py-4 flex items-center text-text-light',
    idIcon: 'mr-2 text-gold',
    idText: 'text-sm',
    avatarContainer: 'flex items-center',
    avatarText: 'ml-2 text-gold-light',
    subjectText: 'text-sm text-text-muted',
    dateText: 'text-sm text-green-light',
    actionButton: 'text-gold hover:text-gold-light transition-colors',
    loadingContainer: 'flex justify-center items-center my-12',
    loadingText: 'text-gold text-lg',
    errorContainer: 'bg-red-dark/30 border border-red rounded-lg p-4 my-8 text-center',
    errorText: 'text-red',
    emptyContainer: 'text-center py-12 text-text-muted border border-light-gray rounded-lg mt-4',
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
                return 'bg-green-900 text-green-300 border-green-600';
            case 'Pending':
                return 'bg-amber-900 text-amber-300 border-amber-600';
            case 'Closed':
                return 'bg-gray-800 text-gray-400 border-gray-600';
            default:
                return 'bg-gray-800 text-gray-400 border-gray-600';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass()}`}>
          {status}
        </span>
    );
};

// PriorityIndicator component with updated styling
const PriorityIndicator = ({priority}: { priority: string }) => {
    const getColorClass = () => {
        switch (priority) {
            case 'High':
                return 'text-green-400 bg-green-900';
            case 'Medium':
                return 'text-amber-400 bg-amber-900';
            case 'Low':
                return 'text-amber-300 bg-amber-900/50';
            default:
                return 'text-gray-400 bg-gray-800';
        }
    };

    return (
        <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${getColorClass()}`}></div>
            <span className={getColorClass().split(' ')[0]}>{priority}</span>
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

    // Map old colors to new gold-black-green palette
    const getAvatarColor = () => {
        switch (color) {
            case 'bg-purple-500':
            case 'bg-yellow-500':
                return 'bg-amber-600 text-black';
            case 'bg-red-500':
                return 'bg-green-700 text-black';
            case 'bg-blue-500':
                return 'bg-amber-400 text-black';
            case 'bg-gray-500':
            default:
                return 'bg-green-500 text-black';
        }
    };

    if (img) {
        return (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-green-400">
                <img
                    src={`http://localhost:3001${img}`}
                    alt={`${name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                            const div = document.createElement('div');
                            div.className = `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border border-green-400 ${getAvatarColor()}`;
                            div.textContent = initials;
                            parent.appendChild(div);
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border border-green-400 ${getAvatarColor()}`}
        >
            {initials}
        </div>
    );
};

const TicketsView = () => {
    const {isAdmin, isLoading: adminLoading, getAdminByUserId} = useAdmin();
    const {tickets, loading: ticketLoading, error, getTicketsByAdminId} = useTicket();

    // Removed unused state variable to fix TS6133 warning
    const [formattedTickets, setFormattedTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        return apiTickets.map(ticket => ({
            id: ticket.ticketid?.toString() || ticket.id?.toString() || '0',
            name: ticket.clienteNombre || `Cliente #${ticket.clienteid || ''}`,
            subject: ticket.asunto || ticket.problema || 'Sin asunto',
            status: mapStatus(ticket.resuelto !== undefined ? (ticket.resuelto ? 'cerrado' : 'abierto') : ticket.estado),
            priority: mapPriority(ticket.prioridad),
            created: new Date(ticket.fechacreacion || ticket.fecha_creacion).toLocaleDateString() || '',
            avatar: getAvatarColor(ticket.clienteNombre || `Cliente #${ticket.clienteid || ''}`),
            img: ticket.clienteImg || null
        }));
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
            setFormattedTickets(mapApiTicketsToViewFormat(tickets));
        } else {
            setFormattedTickets([]);
        }
    }, [tickets]);

    if (isLoading || adminLoading || ticketLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingText}>Cargando tickets...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorText}>{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Tickets Recientes</h1>

            {formattedTickets.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-green-900">
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
                        {formattedTickets.map((ticket) => (
                            <tr key={ticket.id} className={styles.tableRow}>
                                <td className={styles.idCell}>
                                    <AlertCircle size={16} className={styles.idIcon}/>
                                    <span className={styles.idText}>{ticket.id.substring(0, 8)}...</span>
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
    );
};

export default TicketsView;

