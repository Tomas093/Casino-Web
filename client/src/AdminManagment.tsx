import React, {useState} from 'react';
import './AdminManagmentStyle.css'

const AdminManager: React.FC = () => {
    // Sample data - in a real application this would come from your backend
    const [admins] = useState([
        {
            id: 1,
            name: 'Carlos Rodriguez',
            role: 'Super Admin',
            lastLogin: '2025-04-05 14:23',
            status: 'online',
            permissions: ['users', 'transactions', 'games', 'reports']
        },
        {
            id: 2,
            name: 'Elena Martinez',
            role: 'Game Admin',
            lastLogin: '2025-04-05 11:30',
            status: 'online',
            permissions: ['games', 'reports']
        },
        {
            id: 3,
            name: 'Juan Perez',
            role: 'Support Admin',
            lastLogin: '2025-04-04 22:15',
            status: 'offline',
            permissions: ['users', 'transactions']
        },
    ]);

    const [users, setUsers] = useState([
        {
            id: 101,
            username: 'lucky_player',
            email: 'lucky@example.com',
            registered: '2024-12-15',
            lastLogin: '2025-04-05',
            balance: '$1,243.50',
            status: 'active'
        },
        {
            id: 102,
            username: 'high_roller',
            email: 'highroller@example.com',
            registered: '2025-01-03',
            lastLogin: '2025-04-04',
            balance: '$5,678.25',
            status: 'active'
        },
        {
            id: 103,
            username: 'poker_ace',
            email: 'pokerace@example.com',
            registered: '2024-10-28',
            lastLogin: '2025-03-30',
            balance: '$842.75',
            status: 'inactive'
        },
        {
            id: 104,
            username: 'slot_master',
            email: 'slotmaster@example.com',
            registered: '2025-02-11',
            lastLogin: '2025-04-01',
            balance: '$3,421.90',
            status: 'active'
        },
        {
            id: 105,
            username: 'blackjack_pro',
            email: 'bjpro@example.com',
            registered: '2024-11-09',
            lastLogin: '2025-04-02',
            balance: '$967.30',
            status: 'active'
        },
    ]);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

    const handleDeleteUser = (userId: number) => {
        setUsers(users.filter(user => user.id !== userId));
        setShowDeleteConfirm(null);
    };

    const handleAddAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would make an API call
        alert('Admin would be added here in a real application');
    };

    // Casino metrics for dashboard
    const metrics = {
        totalUsers: 24367,
        activeToday: 5432,
        totalDeposits: '$145,678.50',
        totalWithdrawals: '$98,432.75',
        profitToday: '$12,543.25',
        openTickets: 18
    };

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
                        <button className="sidebar-nav-item">
                            <span className="sidebar-nav-icon">casino</span> Games
                        </button>
                        <button className="sidebar-nav-item">
                            <span className="sidebar-nav-icon">paid</span> Transactions
                        </button>
                        <button className="sidebar-nav-item">
                            <span className="sidebar-nav-icon">campaign</span> Promotions
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
                        <button className="header-btn">
                            <span className="header-btn-icon">notifications</span>
                        </button>
                        <button className="header-btn">
                            <span className="header-btn-icon">settings</span>
                        </button>
                        <div className="user-profile">
                            <img src="/api/placeholder/32/32" alt="Admin" className="user-avatar"/>
                            <span>Admin</span>
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
                                        <div className="stat-icon">
                                            <span>people</span>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Total Users</h3>
                                            <p className="stat-value">{metrics.totalUsers}</p>
                                            <p className="stat-detail">{metrics.activeToday} active today</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card-content">
                                        <div className="stat-icon">
                                            <span>payments</span>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Revenue</h3>
                                            <p className="stat-value">{metrics.profitToday}</p>
                                            <p className="stat-detail">Today's profit</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-card-content">
                                        <div className="stat-icon">
                                            <span>support_agent</span>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Support</h3>
                                            <p className="stat-value">{metrics.openTickets}</p>
                                            <p className="stat-detail">Open tickets</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-widgets">
                                <div className="dashboard-widget">
                                    <h3 className="widget-title">Recent Activities</h3>
                                    <div className="activities-list">
                                        <div className="activity-item">
                                            <div className="activity-icon login">
                                                <span>login</span>
                                            </div>
                                            <div className="activity-content">
                                                <p className="activity-title">User Login</p>
                                                <p className="activity-detail">high_roller logged in from Chile</p>
                                            </div>
                                            <span className="activity-time">5 min ago</span>
                                        </div>

                                        <div className="activity-item">
                                            <div className="activity-icon deposit">
                                                <span>paid</span>
                                            </div>
                                            <div className="activity-content">
                                                <p className="activity-title">Deposit</p>
                                                <p className="activity-detail">lucky_player deposited $500</p>
                                            </div>
                                            <span className="activity-time">12 min ago</span>
                                        </div>

                                        <div className="activity-item">
                                            <div className="activity-icon withdrawal">
                                                <span>trending_down</span>
                                            </div>
                                            <div className="activity-content">
                                                <p className="activity-title">Withdrawal</p>
                                                <p className="activity-detail">poker_ace requested withdrawal of
                                                    $1,200</p>
                                            </div>
                                            <span className="activity-time">35 min ago</span>
                                        </div>

                                        <div className="activity-item">
                                            <div className="activity-icon win">
                                                <span>casino</span>
                                            </div>
                                            <div className="activity-content">
                                                <p className="activity-title">Big Win</p>
                                                <p className="activity-detail">slot_master won $3,450 on Gold Rush</p>
                                            </div>
                                            <span className="activity-time">1 hour ago</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-widget">
                                    <h3 className="widget-title">Transaction Summary</h3>
                                    <div className="transaction-summary">
                                        <div className="transaction-total">
                                            <span>Total Deposits</span>
                                            <span className="deposit-total">{metrics.totalDeposits}</span>
                                        </div>
                                        <div className="transaction-total">
                                            <span>Total Withdrawals</span>
                                            <span className="withdrawal-total">{metrics.totalWithdrawals}</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-value" style={{width: '75%'}}></div>
                                        </div>
                                        <p className="progress-caption">75% deposit ratio</p>

                                        <h4 className="payment-methods-title">Payment Methods</h4>
                                        <div className="payment-methods">
                                            <div className="payment-method">
                                                <div className="payment-method-header">
                                                    <span>Credit Card</span>
                                                    <span>45%</span>
                                                </div>
                                                <div className="payment-progress-bar">
                                                    <div className="payment-progress-value credit-card"
                                                         style={{width: '45%'}}></div>
                                                </div>
                                            </div>

                                            <div className="payment-method">
                                                <div className="payment-method-header">
                                                    <span>Cryptocurrency</span>
                                                    <span>30%</span>
                                                </div>
                                                <div className="payment-progress-bar">
                                                    <div className="payment-progress-value crypto"
                                                         style={{width: '30%'}}></div>
                                                </div>
                                            </div>

                                            <div className="payment-method">
                                                <div className="payment-method-header">
                                                    <span>Bank Transfer</span>
                                                    <span>25%</span>
                                                </div>
                                                <div className="payment-progress-bar">
                                                    <div className="payment-progress-value bank"
                                                         style={{width: '25%'}}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Management View */}
                    {activeTab === 'admins' && (
                        <div className="admins-section">
                            <div className="section-header">
                                <h2 className="section-title">Admin Management</h2>
                                <button className="action-button add-button">
                                    <span className="button-icon">add</span> Add Admin
                                </button>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>Admin</th>
                                        <th>Role</th>
                                        <th>Last Login</th>
                                        <th>Status</th>
                                        <th>Permissions</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {admins.map(admin => (
                                        <tr key={admin.id} className="admin-row">
                                            <td>
                                                <div className="admin-info">
                                                    <div className="admin-avatar">
                                                        <span>person</span>
                                                    </div>
                                                    <div className="admin-name">
                                                        <div>{admin.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                          <span className={`role-badge ${admin.role.toLowerCase().replace(' ', '-')}`}>
                            {admin.role}
                          </span>
                                            </td>
                                            <td>{admin.lastLogin}</td>
                                            <td>
                          <span className={`status-badge ${admin.status}`}>
                            {admin.status}
                          </span>
                                            </td>
                                            <td>
                                                <div className="permission-tags">
                                                    {admin.permissions.map(perm => (
                                                        <span key={perm} className="permission-tag">{perm}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="edit-button">
                                                        <span>edit</span>
                                                    </button>
                                                    <button className="delete-button">
                                                        <span>delete</span>
                                                    </button>
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
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Role</label>
                                            <select>
                                                <option>Select Role</option>
                                                <option>Super Admin</option>
                                                <option>Game Admin</option>
                                                <option>Support Admin</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                placeholder="Create Password"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Permissions</label>
                                        <div className="permissions-grid">
                                            <div className="permission-checkbox">
                                                <input type="checkbox" id="users-perm"/>
                                                <label htmlFor="users-perm">Users</label>
                                            </div>
                                            <div className="permission-checkbox">
                                                <input type="checkbox" id="transactions-perm"/>
                                                <label htmlFor="transactions-perm">Transactions</label>
                                            </div>
                                            <div className="permission-checkbox">
                                                <input type="checkbox" id="games-perm"/>
                                                <label htmlFor="games-perm">Games</label>
                                            </div>
                                            <div className="permission-checkbox">
                                                <input type="checkbox" id="reports-perm"/>
                                                <label htmlFor="reports-perm">Reports</label>
                                            </div>
                                            <div className="permission-checkbox">
                                                <input type="checkbox" id="promotions-perm"/>
                                                <label htmlFor="promotions-perm">Promotions</label>
                                            </div>
                                            <div className="permission-checkbox">
                                                <input type="checkbox" id="settings-perm"/>
                                                <label htmlFor="settings-perm">Settings</label>
                                            </div>
                                        </div>
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

                    {/* User Management View */}
                    {activeTab === 'users' && (
                        <div className="users-section">
                            <div className="section-header">
                                <h2 className="section-title">User Management</h2>
                                <div className="header-actions">
                                    <div className="search-container">
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            className="search-input"
                                        />
                                        <span className="search-icon">search</span>
                                    </div>
                                    <button className="action-button filter-button">
                                        <span className="button-icon">filter_list</span> Filter
                                    </button>
                                </div>
                            </div>

                            <div className="users-table-container">
                                <table className="users-table">
                                    <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Registration</th>
                                        <th>Last Login</th>
                                        <th>Balance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="user-row">
                                            <td>
                                                <div className="user-info">
                                                    <div className="user-avatar">
                                                        <span>person</span>
                                                    </div>
                                                    <div className="user-details">
                                                        <div className="username">{user.username}</div>
                                                        <div className="user-id">ID: {user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>{user.registered}</td>
                                            <td>{user.lastLogin}</td>
                                            <td className="balance">{user.balance}</td>
                                            <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status}
                          </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="view-button">
                                                        <span>visibility</span>
                                                    </button>
                                                    <button className="edit-button">
                                                        <span>edit</span>
                                                    </button>
                                                    {showDeleteConfirm === user.id ? (
                                                        <div className="confirm-actions">
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="confirm-delete"
                                                            >
                                                                <span>check</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(null)}
                                                                className="cancel-delete"
                                                            >
                                                                <span>close</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(user.id)}
                                                            className="delete-button"
                                                        >
                                                            <span>close</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination">
                                <span className="pagination-info">Showing 1 to 5 of 24,367 users</span>
                                <div className="pagination-controls">
                                    <button className="pagination-btn" disabled>
                                        <span>chevron_left</span>
                                    </button>
                                    <button className="pagination-btn active">1</button>
                                    <button className="pagination-btn">2</button>
                                    <button className="pagination-btn">3</button>
                                    <span>...</span>
                                    <button className="pagination-btn">487</button>
                                    <button className="pagination-btn">
                                        <span>chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminManager;