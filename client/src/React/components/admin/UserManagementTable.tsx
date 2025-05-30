import React, {useState, useEffect} from 'react';
import {Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {useSuspendidos} from '@context/SuspendidosContext.tsx';
import Message from '../Error/Message';

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

interface EditUserForm {
    nombre: string;
    apellido: string;
    email: string;
    edad: string;
    dni: string;
    balance: string;
    influencer: boolean;
}

interface UserManagementTableProps {
    realUsers: User[];
    editingUserId: number | null;
    editUserForm: EditUserForm;
    setEditUserForm: React.Dispatch<React.SetStateAction<EditUserForm>>;
    handleSaveUser: (userId: number) => void;
    setEditingUserId: (id: number | null) => void;
    startEditingUser: (user: User) => void;
    handledelteUser: (userId: number) => void;
    serverBaseUrl: string;
    defaultImage: string;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
                                                                     realUsers,
                                                                     editingUserId,
                                                                     editUserForm,
                                                                     setEditUserForm,
                                                                     handleSaveUser,
                                                                     setEditingUserId,
                                                                     startEditingUser,
                                                                     handledelteUser,
                                                                     serverBaseUrl,
                                                                     defaultImage
                                                                 }) => {
    const {create: suspendUser, remove: removeSuspension, isUserSuspended, loading: suspending} = useSuspendidos();

    // Suspension status state
    const [suspendedUsers, setSuspendedUsers] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const checkSuspensions = async () => {
            const statuses: { [key: number]: boolean } = {};
            for (const user of realUsers) {
                statuses[user.usuarioid] = await isUserSuspended(user.usuarioid);
            }
            setSuspendedUsers(statuses);
        };
        checkSuspensions();
        // eslint-disable-next-line
    }, [realUsers]);

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [suspendUserTarget, setSuspendUserTarget] = useState<User | null>(null);
    const [suspendReason, setSuspendReason] = useState('');
    const [suspendEndDate, setSuspendEndDate] = useState<string>('');

    // Message state
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [showMessage, setShowMessage] = useState<boolean>(false);

    const handleOpenSuspendDialog = (user: User) => {
        setSuspendUserTarget(user);
        setSuspendReason('');
        setSuspendEndDate('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSuspendUserTarget(null);
        setSuspendReason('');
        setSuspendEndDate('');
    };

    const handleConfirmSuspend = async () => {
        if (!suspendUserTarget) return;
        try {
            await suspendUser({
                usuarioid: suspendUserTarget.usuarioid,
                fechainicio: new Date().toISOString(),
                fechafin: suspendEndDate ? new Date(suspendEndDate).toISOString() : null,
                razon: suspendReason || 'Suspensión manual desde panel admin'
            } as any);
            setMessage('Usuario suspendido correctamente.');
            setMessageType('success');
            setShowMessage(true);
            setSuspendedUsers(prev => ({...prev, [suspendUserTarget.usuarioid]: true}));
            handleCloseDialog();
        } catch (error) {
            setMessage('Ocurrió un error al suspender el usuario.');
            setMessageType('error');
            setShowMessage(true);
        }
    };

    const handleRemoveSuspension = async (userId: number) => {
        try {
            await removeSuspension(userId);
            setMessage('Suspensión eliminada correctamente.');
            setMessageType('success');
            setShowMessage(true);
            setSuspendedUsers(prev => ({...prev, [userId]: false}));
        } catch (error) {
            setMessage('Ocurrió un error al quitar la suspensión.');
            setMessageType('error');
            setShowMessage(true);
        }
    };

    return (
        <div className="users-section">
            {showMessage && (
                <Message
                    message={message}
                    type={messageType}
                    onClose={() => setShowMessage(false)}
                />
            )}
            <div className="section-header">
                <h2 className="section-title">Gestión de Usuarios</h2>
            </div>
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Edad</th>
                        <th>DNI</th>
                        <th>Balance</th>
                        <th>Influencer</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {realUsers.map(user => (
                        <tr key={user.usuarioid} className="user-row">
                            <td>
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {user.img ? (
                                            <img
                                                src={`${serverBaseUrl}${user.img}?t=${Date.now()}`}
                                                alt={`${user.usuarioid}`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = defaultImage;
                                                }}
                                                className="user-avatar-img"
                                            />
                                        ) : (
                                            <span>person</span>
                                        )}
                                    </div>
                                    <div className="user-details">
                                        <div className="username">{user.nombre} {user.apellido}</div>
                                        <div className="user-id">ID: {user.usuarioid}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                {editingUserId === user.usuarioid ? (
                                    <input
                                        value={editUserForm.email}
                                        onChange={(e) => setEditUserForm({
                                            ...editUserForm,
                                            email: e.target.value
                                        })}
                                        className="edit-input"
                                    />
                                ) : (
                                    user.email
                                )}
                            </td>
                            <td>
                                {editingUserId === user.usuarioid ? (
                                    <input
                                        value={editUserForm.edad}
                                        onChange={(e) => setEditUserForm({
                                            ...editUserForm,
                                            edad: e.target.value
                                        })}
                                        className="edit-input"
                                    />
                                ) : (
                                    user.edad
                                )}
                            </td>
                            <td>
                                {editingUserId === user.usuarioid ? (
                                    <input
                                        value={editUserForm.dni}
                                        onChange={(e) => setEditUserForm({
                                            ...editUserForm,
                                            dni: e.target.value
                                        })}
                                        className="edit-input"
                                    />
                                ) : (
                                    user.dni
                                )}
                            </td>
                            <td className="balance">
                                {editingUserId === user.usuarioid ? (
                                    <input
                                        type="number"
                                        value={editUserForm.balance}
                                        onChange={(e) => setEditUserForm({
                                            ...editUserForm,
                                            balance: e.target.value
                                        })}
                                        className="edit-input"
                                    />
                                ) : (
                                    `$${user.cliente?.balance || 0}`
                                )}
                            </td>
                            <td>
                                {editingUserId === user.usuarioid ? (
                                    <select
                                        value={editUserForm.influencer.toString()}
                                        onChange={(e) => setEditUserForm({
                                            ...editUserForm,
                                            influencer: e.target.value === 'true'
                                        })}
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Sí</option>
                                    </select>
                                ) : (
                                    <span
                                        className={`status-badge ${user.cliente?.influencer ? 'active' : 'inactive'}`}>
                                                                                                   {user.cliente?.influencer ? 'Sí' : 'No'}
                                                                                               </span>
                                )}
                            </td>
                            <td>
                                <div className="action-buttons">
                                    {editingUserId === user.usuarioid ? (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<SaveIcon/>}
                                                onClick={() => handleSaveUser(user.usuarioid)}
                                                className="save-button-admin"
                                            >
                                                Guardar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                startIcon={<CancelIcon/>}
                                                onClick={() => setEditingUserId(null)}
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
                                                onClick={() => startEditingUser(user)}
                                            >
                                                Editar
                                            </Button>
                                            <IconButton
                                                aria-label="Eliminar"
                                                color="error"
                                                className="delete-button-admin"
                                                size="large"
                                                onClick={() => handledelteUser(user.usuarioid)}
                                            >
                                                <DeleteIcon fontSize="inherit" className="icon-large"/>
                                            </IconButton>
                                            <IconButton
                                                aria-label={suspendedUsers[user.usuarioid] ? "Quitar suspensión" : "Suspender"}
                                                color={suspendedUsers[user.usuarioid] ? "success" : "warning"}
                                                onClick={async () => {
                                                    if (suspendedUsers[user.usuarioid]) {
                                                        await handleRemoveSuspension(user.usuarioid);
                                                    } else {
                                                        handleOpenSuspendDialog(user);
                                                    }
                                                }}
                                                disabled={suspending}
                                                style={{marginLeft: 4}}
                                            >
                                                {suspendedUsers[user.usuarioid] ? <LockIcon/> : <LockOpenIcon/>}
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
            {/* Suspension Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        backgroundColor: '#121212',
                        color: '#f5f5f5',
                        border: '2px solid #d4af37',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: '#121212',
                        color: '#d4af37',
                        fontWeight: 700,
                        fontSize: 22,
                    }}
                >
                    Suspend User
                </DialogTitle>
                <DialogContent sx={{backgroundColor: '#121212'}}>
                    <TextField
                        label="Reason"
                        value={suspendReason}
                        onChange={e => setSuspendReason(e.target.value)}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{style: {color: '#d4af37'}}}
                        sx={{
                            '& .MuiInputBase-root': {color: '#f5f5f5'},
                            '& .MuiOutlinedInput-notchedOutline': {borderColor: '#1a9e5c'},
                            '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: '#d4af37'},
                            '& .MuiInputLabel-root': {color: '#d4af37'}
                        }}
                    />
                    <TextField
                        label="End Date (optional)"
                        type="datetime-local"
                        value={suspendEndDate}
                        onChange={e => setSuspendEndDate(e.target.value)}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{shrink: true, style: {color: '#d4af37'}}}
                        sx={{
                            '& .MuiInputBase-root': {color: '#f5f5f5'},
                            '& .MuiOutlinedInput-notchedOutline': {borderColor: '#1a9e5c'},
                            '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: '#d4af37'},
                            '& .MuiInputLabel-root': {color: '#d4af37'}
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{backgroundColor: '#121212'}}>
                    <Button onClick={handleCloseDialog} sx={{color: '#d4af37'}}>Cancel</Button>
                    <Button
                        onClick={handleConfirmSuspend}
                        sx={{
                            backgroundColor: '#1a9e5c',
                            color: '#fff',
                            '&:hover': {backgroundColor: '#d4af37', color: '#121212'}
                        }}
                        disabled={suspending}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UserManagementTable;