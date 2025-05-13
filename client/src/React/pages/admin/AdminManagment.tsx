import React, {useEffect, useState} from 'react';
import {useAdmin} from '@context/AdminContext.tsx'
import {useUser} from '@context/UserContext.tsx'
import {useAuth} from '@context/AuthContext.tsx';
import '@css/AdminManagmentStyle.css'
import {Button, IconButton} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {useNavigate} from "react-router-dom";
import {useTransaction} from "@context/TransactionContext.tsx";
import PaymentMethodsChart from "@components/PieChart.tsx"
import RecentActivities from "@components/admin/RecentActivities.tsx";
import CuponsManager from "@components/admin/CuponsManager.tsx";
import FAQManager from '@/React/components/admin/FAQManager';
import GameManager from "@components/admin/GameManager.tsx";
import UserManagementTable from "@components/admin/UserManagementTable.tsx";


interface Admin {
    id: number;
    name: string;
    role: string;
    balance: string;
    img: string;
    email: string;
}

interface User {
    usuarioid: number;
    nombre: string;
    apellido: string;
    email: string;
    edad: string;
    dni: string;
    img?: string;
    cliente: {
        balance: number;
        influencer: boolean;
    };
}

const AdminManager: React.FC = () => {


    const {getAdmins, editAdmin} = useAdmin();
    const {editUser, getAllUsers, getUserCount} = useUser();
    const {getTotalRevenue} = useTransaction()
    const {user} = useAuth();

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [realUsers, setRealUsers] = useState<User[]>([]);
    const [, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [imgTimestamp, setImgTimestamp] = useState(Date.now());
    const [refreshAdmins, setRefreshAdmins] = useState(0);
    const [refreshUsers, setRefreshUsers] = useState(0);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [totalGanancia, setTotalGanancia] = useState<string>("$0");
    const [totalIngreso, setTotalIngreso] = useState<string>("$0");
    const [totalEgreso, setTotalEgreso] = useState<string>("$0");
    const [currentUserPage, setCurrentUserPage] = useState(1);
    const usersPerPage = 5;
    const totalUserPages = Math.ceil(realUsers.length / usersPerPage);


    const getCurrentPageUsers = () => {
        const startIndex = (currentUserPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        return realUsers.slice(startIndex, endIndex);
    };

    const renderUserPaginationControls = () => {
        const pageButtons = [];
        const maxButtonsToShow = 3;
        let startPage = Math.max(1, currentUserPage - Math.floor(maxButtonsToShow / 2));
        let endPage = Math.min(totalUserPages, startPage + maxButtonsToShow - 1);

        if (endPage - startPage + 1 < maxButtonsToShow) {
            startPage = Math.max(1, endPage - maxButtonsToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    className={`pagination-btn ${currentUserPage === i ? 'active' : ''}`}
                    onClick={() => setCurrentUserPage(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentUserPage(currentUserPage - 1)}
                    disabled={currentUserPage === 1}
                >
                    <span className="material-icons-round">chevron_left</span>
                </button>
                {pageButtons}
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentUserPage(currentUserPage + 1)}
                    disabled={currentUserPage === totalUserPages}
                >
                    <span className="material-icons-round">chevron_right</span>
                </button>
            </div>
        );
    };


    useEffect(() => {
        const fetchTotalRevenue = async () => {
            try {
                const response = await getTotalRevenue();
                // Ensure we handle both possible response formats
                const gananciasNetas = response?.gananciasNetas ?? 0;
                const ingresosTotales = response?.totalIngresos ?? 0;
                const egresosTotales = response?.totalEgresos
                setTotalGanancia(`$${gananciasNetas}`);
                setTotalIngreso(`$${ingresosTotales}`)
                setTotalEgreso(`$${egresosTotales}`)
            } catch (error) {
                console.error('Error al obtener el total de ingresos:', error);
                // Set a default value on error
                setTotalGanancia('$0');
            }
        };

        fetchTotalRevenue();
    }, [getTotalRevenue]);

    useEffect(() => {
        const fetchAdmins = async () => {
            setLoading(true);
            try {
                const data = await getAdmins();
                // Transformar los datos si es necesario
                const formattedAdmins = data.map((admin: any) => ({
                    id: admin.administradorid || admin.usuarioid,
                    name: `${admin.usuario.nombre} ${admin.usuario.apellido}`,
                    email: admin.usuario.email || '',
                    role: admin.superadmin ? 'Super Admin' : 'Admin',
                    balance: admin.usuario.cliente ? `$${admin.usuario.cliente.balance}` : '$0',
                    img: admin.usuario.img || '',
                }));
                setAdmins(formattedAdmins);
            } catch (err) {
                console.error('Error al cargar administradores:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdmins();
    }, [getAdmins, refreshAdmins]);

    const [, setTotalUsers] = useState(0);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const count = await getUserCount();
                setTotalUsers(count);
            } catch (error) {
                console.error('Error al obtener el conteo de usuarios:', error);
            }
        };

        fetchUserCount();
    }, []);

    const realUsersCount = realUsers.length;

    // Actualiza el estado del formulario
    const [editUserForm, setEditUserForm] = useState({
        nombre: '',
        apellido: '',
        email: '',
        edad: '',
        dni: '',
        balance: '',
        influencer: false
    });

    // Cargar usuarios reales
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const data = await getAllUsers();
                setRealUsers(data);
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [getAllUsers, refreshUsers]);


    // Iniciar edición de usuario
    const startEditingUser = (user: User) => {
        setEditingUserId(user.usuarioid);
        setEditUserForm({
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            edad: user.edad,
            dni: user.dni,
            balance: user.cliente.balance.toString(),
            influencer: user.cliente.influencer
        });
    };


    // Guardar cambios del usuario
    const handleSaveUser = async (userId: number) => {
        // Ensure numeric values are properly parsed
        const updatedUser = {
            nombre: editUserForm.nombre,
            apellido: editUserForm.apellido,
            email: editUserForm.email,
            edad: parseInt(editUserForm.edad) || 0, // Use 0 as fallback if parseInt fails
            dni: editUserForm.dni,
            balance: parseFloat(editUserForm.balance) || 0, // Use 0 as fallback if parseFloat fails
            influencer: editUserForm.influencer
        };

        try {
            await editUser(userId.toString(), updatedUser);
            setEditingUserId(null);
            setRefreshUsers(prev => prev + 1);
        } catch (error) {
            console.error("Error editando usuario:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    const [editingId, setEditingId] = useState<number | null>(null);

    const [editForm, setEditForm] = useState({
        email: '',
        role: '',
        balance: ''
    });

    const handleSave = async (userId: number) => {
        const updatedAdmin = {
            email: editForm.email,
            superadmin: editForm.role === "Super Admin",
            balance: parseFloat(editForm.balance)
        };

        try {
            await editAdmin(userId.toString(), updatedAdmin);
            setEditingId(null);
            setRefreshAdmins(prev => prev + 1);
        } catch (error) {
            console.error("Error editing admin:", error);
            alert(`Error editing admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };


    const startEditing = (admin: Admin) => {
        setEditingId(admin.id);
        setEditForm({
            email: admin.email,
            role: admin.role,
            balance: admin.balance.replace('$', '')
        });
    };


    // URL base del servidor
    const serverBaseUrl = 'http://localhost:3001';

    // Imagen por defecto en caso de error o si no hay imagen
    const defaultImage = './assets/defaultprofile.png';

    useEffect(() => {
        setImgTimestamp(Date.now());
        setImgError(false);
    }, [user?.img, setImgTimestamp, setImgError]);

    const profileImageUrl = user && user.img
        ? `${serverBaseUrl}${user.img}?t=${imgTimestamp}`
        : defaultImage;

    const handleImageError = () => {
        setImgError(true);
    };

    const {createAdmin} = useAdmin();

    type FormField = {
        label: string;
        type: 'text' | 'email' | 'password' | 'select';
        placeholder?: string;
        options?: string[];
    };

    const formFields: FormField[] = [
        {label: 'Name', type: 'text', placeholder: 'Name'},
        {label: 'Apellido', type: 'text', placeholder: 'Apellido'},
        {label: 'DNI', type: 'text', placeholder: 'DNI'},
        {label: 'Email', type: 'email', placeholder: 'Email Address'},
        {label: 'Edad', type: 'text', placeholder: 'Edad'},
        {label: 'Role', type: 'select', options: ['Admin', 'Super Admin']},
        {label: 'Password', type: 'password', placeholder: 'Password'},
        {label: 'Confirm Password', type: 'password', placeholder: 'Confirm Password'},
    ];

    const [activeTab, setActiveTab] = useState('dashboard');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const navigate = useNavigate();

    const handledelteUser = (userId: number) => {
        if (showDeleteConfirm === userId) {
            navigate(`/deleteSpecificaccount/${userId}`);
            setShowDeleteConfirm(null);
        } else {
            setShowDeleteConfirm(userId);
        }
    }

    const handleAddAdmin = async (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);

        const name = formData.get('Name') as string;
        const apellido = formData.get('Apellido') as string;
        const dni = formData.get('DNI') as string;
        const email = formData.get('Email') as string;
        const edad = formData.get('Edad') as string;
        const role = formData.get('Role') as string;
        const password = formData.get('Password') as string;
        const confirmPassword = formData.get('Confirm Password') as string;

        if (!name || !apellido || !dni || !email || !edad || !role || !password || !confirmPassword) {
            alert('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const adminData = {
            nombre: name,
            apellido: apellido,
            dni: dni,
            email: email,
            edad: parseInt(edad, 10),
            password: password,
            superadmin: role === 'Super Admin'
        };

        try {
            await createAdmin(adminData);
            alert('Admin created successfully');
            form.reset(); // Clear the form after successful submission
            setRefreshAdmins(prev => prev + 1); // Refresh the admins list
        } catch (error) {
            console.error("Error creating admin:", error);
            alert(`Error creating admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    const renderFormFields = () => {
        return formFields.map((field: FormField, index: number) => (
            <div className="form-group" key={index}>
                <label htmlFor={field.label}>{field.label}</label>
                {field.type === 'select' ? (
                    <select
                        name={field.label}
                        id={field.label}
                        required
                    >
                        {field.options && field.options.map((option: string, i: number) => (
                            <option key={i} value={option}>{option}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={field.type}
                        placeholder={field.placeholder}
                        name={field.label}
                        id={field.label}
                        required
                    />
                )}
            </div>
        ));
    };

    // Casino metrics for dashboard
    const metrics = {
        openTickets: 18
    };

    const totalIngresos = parseFloat(totalIngreso.replace('$', '')) || 0;
    const totalEgresos = parseFloat(totalEgreso.replace('$', '')) || 0;
    const totalTransacciones = totalIngresos + totalEgresos;
    const porcentajeDepositos = totalTransacciones > 0
        ? Math.round((totalIngresos / totalTransacciones) * 100)
        : 0;

    return (
        <div className="admin-manager">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h1 className="logo">
                        <span className="logo-icon">A</span>
                        Australis Casino
                    </h1>
                    <p className="subtitle">Admin Control Panel</p>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <h2 className="sidebar-section-title">Main</h2>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-icon">dashboard</span> Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('admins')}
                            className={`sidebar-nav-item ${activeTab === 'admins' ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-icon">admin_panel_settings</span> Admin Management
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-icon">people</span> User Management
                        </button>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="sidebar-section-title">Casino</h2>
                        <button className="sidebar-nav-item" onClick={() => setActiveTab('game')}>
                            <span className="sidebar-nav-icon">casino</span> Games
                        </button>
                        <button className="sidebar-nav-item" onClick={() => setActiveTab('faq')}>
                            <span className="sidebar-nav-icon">help_outline</span>FAQ
                        </button>
                        <button onClick={() => setActiveTab('Creador')}
                                className={`sidebar-nav-item ${activeTab === 'Creador' ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-icon">local_offer</span> Cupones
                        </button>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="sidebar-section-title">Reports</h2>
                        <button className="sidebar-nav-item">
                            <span className="sidebar-nav-icon">analytics</span> Analytics
                        </button>
                        <button className="sidebar-nav-item">
                            <span className="sidebar-nav-icon">report</span> Reports
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main content */}
            <div className="content">
                {/* Top header */}
                <header className="top-header">
                    <div className="header-title">
                        <span className="header-icon">menu</span>
                        <h2>
                            {activeTab === 'dashboard' && 'Dashboard'}
                            {activeTab === 'admins' && 'Admin Management'}
                            {activeTab === 'users' && 'User Management'}
                        </h2>
                    </div>

                    <div className="header-actions">
                        <div className="user-profile">
                            <img
                                src={imgError ? defaultImage : profileImageUrl}
                                alt="Foto de Perfil"
                                className="admin-profile-img"
                                onError={handleImageError}
                            />
                            <span>{user ? `${user.nombre} ${user.apellido}` : 'Admin'}</span>
                        </div>
                    </div>
                </header>

                {/* Content area */}
                <main className="main-content">
                    {/* Dashboard View */}
                    {activeTab === 'dashboard' && (
                        <div className="dashboard">
                            <div className="stat-cards">
                                <div className="stat-card">
                                    <div className="stat-card-content">
                                        <div className="stat-info">
                                            <h3>Usuarios</h3>
                                            <p className="stat-value">{realUsersCount}</p>
                                            <p className="stat-detail">Total de Usuarios </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card-content">
                                        <div className="stat-info">
                                            <h3>Ganancia</h3>
                                            <p className="stat-value">{totalGanancia}</p>
                                            <p className="stat-detail">Total Ganancia</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card-content">
                                        <div className="stat-info">
                                            <h3>Soporte</h3>
                                            <p className="stat-value">{metrics.openTickets}</p>
                                            <p className="stat-detail">Tickets Abiertos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-widgets" id={"main"}>
                                <div className="dashboard-widget" id={"Recent Activity"}>
                                    <h3 className="widget-title">Recent Activities</h3>
                                    <RecentActivities/>
                                </div>

                                <div className="dashboard-widget">
                                    <h3 className="widget-title">Transaction Summary</h3>
                                    <div className="transaction-summary">
                                        <div className="transaction-total">
                                            <span>Total Deposits</span>
                                            <span className="deposit-total">{totalIngreso}</span>
                                        </div>
                                        <div className="transaction-total">
                                            <span>Total Withdrawals</span>
                                            <span className="withdrawal-total">{totalEgreso}</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-value"
                                                style={{width: `${porcentajeDepositos}%`}}
                                            ></div>
                                        </div>
                                        <p className="progress-caption">{porcentajeDepositos}% proporción de
                                            depósitos</p>

                                        <h4 className="widget-title">Metodos de ingreso</h4>
                                        <PaymentMethodsChart/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Management View */}
                    {activeTab === 'admins' && (
                        <div className="admins-section">
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>Admin</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Balance</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {admins.map(admin => (
                                        <tr key={admin.id} className="admin-row">
                                            <td>
                                                <div className="admin-info">
                                                    <div className="admin-avatar">
                                                        {admin.img ? (
                                                            <img
                                                                src={`${serverBaseUrl}${admin.img}?t=${Date.now()}`}
                                                                alt={admin.name}
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = defaultImage;
                                                                }}
                                                                className="admin-avatar-img"
                                                            />
                                                        ) : (
                                                            <span>person</span>
                                                        )}
                                                    </div>
                                                    <div className="admin-name">
                                                        <div>{admin.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="admin-email">
                                                    {editingId === admin.id ? (
                                                        <input
                                                            value={editForm.email}
                                                            onChange={(e) => setEditForm({
                                                                ...editForm,
                                                                email: e.target.value
                                                            })}
                                                            className="edit-input"
                                                        />
                                                    ) : (
                                                        <div>{admin.email}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {editingId === admin.id ? (
                                                    <select
                                                        value={editForm.role}
                                                        onChange={(e) => setEditForm({
                                                            ...editForm,
                                                            role: e.target.value
                                                        })}
                                                        className="edit-input"
                                                    >
                                                        <option value="Admin">Admin</option>
                                                        <option value="Super Admin">Super Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`${admin.role.toLowerCase().replace(' ', '-')}`}>
                                                        {admin.role}</span>
                                                )
                                                }
                                            </td>
                                            <td>
                                                <div className="permission-tags">
                                                    {editingId === admin.id ? (
                                                        <input
                                                            type="number"
                                                            value={editForm.balance}
                                                            onChange={(e) => setEditForm({
                                                                ...editForm,
                                                                balance: e.target.value
                                                            })}
                                                            className="edit-input"
                                                        />
                                                    ) : (
                                                        <span className="permission-tag">{admin.balance}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {editingId === admin.id ? (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<SaveIcon/>}
                                                                onClick={() => handleSave(admin.id)}
                                                                className="save-button-admin"
                                                            >
                                                                Guardar
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                startIcon={<CancelIcon/>}
                                                                onClick={() => setEditingId(null)}
                                                                className="cancel-button-admin"
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                startIcon={<EditIcon/>}
                                                                className="edit-button-admin"
                                                                onClick={() => startEditing(admin)}
                                                            >
                                                                Editar
                                                            </Button>
                                                            <IconButton
                                                                aria-label="Eliminar"
                                                                color="error"
                                                                className="delete-button-admin"
                                                                size="large"
                                                                onClick={() => handledelteUser(admin.id)}
                                                            >
                                                                <DeleteIcon fontSize="inherit" className="icon-large"/>
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="add-admin-form-container">
                                <h3 className="form-title">Add New Admin</h3>
                                <form onSubmit={handleAddAdmin} className="add-admin-form">
                                    <div className="form-grid form-grid-4-columns">
                                        {renderFormFields()}
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="submit-button">
                                            Create Admin
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div>
                            <UserManagementTable
                                realUsers={getCurrentPageUsers()}
                                editingUserId={editingUserId}
                                editUserForm={editUserForm}
                                setEditUserForm={setEditUserForm}
                                handleSaveUser={handleSaveUser}
                                setEditingUserId={setEditingUserId}
                                startEditingUser={startEditingUser}
                                handledelteUser={handledelteUser}
                                serverBaseUrl={serverBaseUrl}
                                defaultImage={defaultImage}
                            />
                            {realUsers.length > 0 && (
                                <div className="pagination">
                                    <div className="pagination-info">
                                        Showing {getCurrentPageUsers().length} of {realUsers.length} users
                                        (Page {currentUserPage} of {totalUserPages})
                                    </div>
                                    {renderUserPaginationControls()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cupones View */}
                    {activeTab === 'Creador' && (
                        <div className="cupones-section">
                            <h2 className="section-title">Gestión de Cupones</h2>
                            <CuponsManager/>
                        </div>
                    )}

                    {/* FAQ Management View */}
                    {activeTab === 'faq' && (
                        <div className="faq-section">
                            <h2 className="section-title">Gestión de FAQs</h2>
                            <FAQManager/>
                        </div>
                    )}

                    {/* Game Management View */}
                    {activeTab === 'game' && (
                        <div className="game-section">
                            <h2 className="section-title">Gestión de Juegos</h2>
                            <GameManager/>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};


export default AdminManager;

