import React, {useState} from 'react';
import {Button, IconButton} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Message from '@components/Error/Message.tsx';
import {useGameContext} from '@context/GameContext';

interface MessageInfo {
    text: string;
    type: 'error' | 'warning' | 'info' | 'success';
    visible: boolean;
}

const GameManager: React.FC = () => {
    const {games, loading, error, createGame, updateGame, deleteGame, fetchGames} = useGameContext();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{ nombre: string, estado: boolean }>({
        nombre: '',
        estado: true
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [messageInfo, setMessageInfo] = useState<MessageInfo>({
        text: '',
        type: 'info',
        visible: false
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(games.length / itemsPerPage);

    const gameFields = [
        {
            id: 'nombre',
            label: 'Nombre del Juego',
            type: 'text',
            placeholder: 'Ej: Poker',
            required: true,
        },
        {
            id: 'estado',
            label: 'Estado',
            type: 'select',
            options: ['Activo', 'Inactivo'],
            required: true,
        }
    ];

    const showMessage = (text: string, type: 'error' | 'warning' | 'info' | 'success') => {
        setMessageInfo({
            text,
            type,
            visible: true
        });
    };

    const hideMessage = () => {
        setMessageInfo(prev => ({...prev, visible: false}));
    };

    // Get current page items
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return games.slice(startIndex, endIndex);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle form submission for creating new game
    const handleCreateGame = async (formData: Record<string, any>) => {
        try {
            await createGame({
                nombre: formData.nombre,
                estado: formData.estado === 'Activo'
            });
            showMessage('Juego creado exitosamente', 'success');
            fetchGames(); // Refresh the games list
        } catch (error) {
            console.error("Error creating game:", error);
            showMessage(`Error al crear juego: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        }
    };

    // Start editing a game
    const startEditing = (game: typeof games[0]) => {
        setEditingId(game.juegoid);
        setEditForm({
            nombre: game.nombre,
            estado: game.estado === true
        });
    };

    // Save edited game
    const handleSave = async (gameId: number) => {
        try {
            await updateGame(gameId, {
                nombre: editForm.nombre,
                estado: editForm.estado
            });
            setEditingId(null);
            fetchGames(); // Refresh the games list
            showMessage('Juego actualizado exitosamente', 'success');
        } catch (error) {
            console.error("Error updating game:", error);
            showMessage(`Error al actualizar juego: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        }
    };

    // Delete game
    const handleDelete = async (gameId: number) => {
        if (showDeleteConfirm === gameId) {
            try {
                await deleteGame(gameId);
                setShowDeleteConfirm(null);
                showMessage('Juego eliminado exitosamente', 'success');
            } catch (error) {
                console.error("Error deleting game:", error);
                showMessage(`Error al eliminar juego: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
            }
        } else {
            setShowDeleteConfirm(gameId);
        }
    };

    // Generate pagination controls
    const renderPaginationControls = () => {
        const pageButtons = [];
        const maxButtonsToShow = 3;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

        if (endPage - startPage + 1 < maxButtonsToShow) {
            startPage = Math.max(1, endPage - maxButtonsToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <span className="material-icons-round">chevron_left</span>
                </button>
                {pageButtons}
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <span className="material-icons-round">chevron_right</span>
                </button>
            </div>
        );
    };

    // Get current page items
    const currentGames = getCurrentPageItems();

    return (
        <div className="users-section">
            {messageInfo.visible && (
                <Message
                    message={messageInfo.text}
                    type={messageInfo.type}
                    onClose={hideMessage}
                />
            )}

            {error && !messageInfo.visible && (
                <Message
                    message={`Error: ${error}`}
                    type="error"
                    onClose={() => {
                    }}
                />
            )}

            <div className="users-table-container">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : games.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state-icon material-icons-round">casino</span>
                        <p className="empty-state-text">No hay juegos disponibles actualmente.</p>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentGames.map(game => (
                            <tr key={game.juegoid} className="user-row">
                                <td>
                                    <div className="user-details">
                                        <div className="username">#{game.juegoid}</div>
                                    </div>
                                </td>
                                <td>
                                    {editingId === game.juegoid ? (
                                        <input
                                            type="text"
                                            value={editForm.nombre}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                nombre: e.target.value
                                            })}
                                            className="edit-input"
                                        />
                                    ) : (
                                        game.nombre
                                    )}
                                </td>
                                <td>
                                    {editingId === game.juegoid ? (
                                        <select
                                            value={editForm.estado ? 'Activo' : 'Inactivo'}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                estado: e.target.value === 'Activo'
                                            })}
                                            className="edit-input"
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    ) : (
                                        <span className={`status-badge ${game.estado ? 'active' : 'inactive'}`}>
                                            {game.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {editingId === game.juegoid ? (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<SaveIcon/>}
                                                    onClick={() => handleSave(game.juegoid)}
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
                                                    onClick={() => startEditing(game)}
                                                >
                                                    Editar
                                                </Button>
                                                {showDeleteConfirm === game.juegoid ? (
                                                    <div className="confirm-actions">
                                                        <IconButton
                                                            className="confirm-delete"
                                                            onClick={() => handleDelete(game.juegoid)}
                                                        >
                                                            <span className="material-icons-round">check</span>
                                                        </IconButton>
                                                        <IconButton
                                                            className="cancel-delete"
                                                            onClick={() => setShowDeleteConfirm(null)}
                                                        >
                                                            <span className="material-icons-round">close</span>
                                                        </IconButton>
                                                    </div>
                                                ) : (
                                                    <IconButton
                                                        aria-label="Eliminar"
                                                        color="error"
                                                        className="delete-button-admin"
                                                        onClick={() => setShowDeleteConfirm(game.juegoid)}
                                                    >
                                                        <DeleteIcon className="icon-large"/>
                                                    </IconButton>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {games.length > 0 && (
                <div className="pagination">
                    <div className="pagination-info">
                        Mostrando {currentGames.length} de {games.length} juegos (Página {currentPage} de {totalPages})
                    </div>
                    {renderPaginationControls()}
                </div>
            )}

            <div className="add-admin-form-container">
                <h3 className="form-title">Crear Nuevo Juego</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = Object.fromEntries(
                        new FormData(e.currentTarget).entries()
                    );
                    handleCreateGame(formData);
                    (e.target as HTMLFormElement).reset();
                }} className="add-admin-form">
                    <div className="form-grid">
                        {gameFields.map((field, index) => (
                            <div className="form-group" key={index}>
                                <label htmlFor={field.id}>{field.label}</label>
                                {field.type === 'select' ? (
                                    <select
                                        id={field.id}
                                        name={field.id}
                                        required={field.required}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Seleccione un estado</option>
                                        {field.options?.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        id={field.id}
                                        name={field.id}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-button">
                            <span className="button-icon">add</span>
                            Crear Juego
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GameManager;