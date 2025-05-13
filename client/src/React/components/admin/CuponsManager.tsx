import React, {useEffect, useState} from 'react';
import {FormFieldProps} from '@components/admin/GenericABM.tsx';
import cuponApi, {CuponData} from '@api/cuponApi';
import {Button, IconButton} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Message from '@components/Error/Message.tsx';

interface Cupon extends CuponData {
    cuponid: string;
}

interface MessageInfo {
    text: string;
    type: 'error' | 'warning' | 'info' | 'success';
    visible: boolean;
}

const CuponsManager: React.FC = () => {
    const [cupones, setCupones] = useState<Cupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<CuponData>({
        beneficio: 0,
        fechainicio: '',
        fechafin: '',
        cantidadusos: 0,
        mincarga: 0,
        maxcarga: 0
    });
    const [refreshCupones, setRefreshCupones] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [messageInfo, setMessageInfo] = useState<MessageInfo>({
        text: '',
        type: 'info',
        visible: false
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [totalPages, setTotalPages] = useState(1);

    const cuponFields: FormFieldProps[] = [
        {
            id: 'beneficio',
            label: 'Beneficio (%)',
            type: 'number',
            placeholder: 'Ej: 10',
            required: true,
        },
        {
            id: 'fechainicio',
            label: 'Fecha Inicio',
            type: 'date',
            required: true
        },
        {
            id: 'fechafin',
            label: 'Fecha Fin',
            type: 'date',
            required: true
        },
        {
            id: 'cantidadusos',
            label: 'Cantidad de Usos',
            type: 'number',
            placeholder: 'Ej: 100',
            required: true,
        },
        {
            id: 'mincarga',
            label: 'Carga Mínima',
            type: 'number',
            placeholder: 'Ej: 1000',
            required: true,
        },
        {
            id: 'maxcarga',
            label: 'Carga Máxima',
            type: 'number',
            placeholder: 'Ej: 10000',
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

    // Calculate current page items
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return cupones.slice(startIndex, endIndex);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Fetch all coupons
    useEffect(() => {
        const fetchCupones = async () => {
            setLoading(true);
            try {
                const data = await cuponApi.getAllCupon();
                setCupones(data);
                setTotalPages(Math.ceil(data.length / itemsPerPage));
                // Reset to page 1 when data refreshes
                setCurrentPage(1);
            } catch (error) {
                console.error('Error al cargar cupones:', error);
                showMessage('Error al cargar cupones. Por favor, intente nuevamente.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchCupones();
    }, [refreshCupones]);

    // Handle form submission for creating new coupons
    const handleCreateCupon = async (formData: Record<string, any>) => {
        try {
            // Validate no negative values
            const beneficio = Number(formData.beneficio);
            const cantidadusos = Number(formData.cantidadusos);
            const mincarga = Number(formData.mincarga);
            const maxcarga = Number(formData.maxcarga);

            if (beneficio < 0 || cantidadusos < 0 || mincarga < 0 || maxcarga < 0) {
                showMessage('Los valores numéricos no pueden ser negativos', 'error');
                return;
            }

            await cuponApi.createCupon({
                beneficio,
                fechainicio: formData.fechainicio,
                fechafin: formData.fechafin,
                cantidadusos,
                mincarga,
                maxcarga
            });
            showMessage('Cupón creado exitosamente', 'success');
            setRefreshCupones(prev => prev + 1);
        } catch (error) {
            console.error("Error creating coupon:", error);
            showMessage(`Error al crear cupón: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        }
    };

    // Start editing a coupon
    const startEditing = (cupon: Cupon) => {
        setEditingId(cupon.cuponid);
        setEditForm({
            beneficio: cupon.beneficio,
            fechainicio: formatDateForInput(cupon.fechainicio),
            fechafin: formatDateForInput(cupon.fechafin),
            cantidadusos: cupon.cantidadusos,
            mincarga: cupon.mincarga,
            maxcarga: cupon.maxcarga
        });
    };

    // Format date for input fields
    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDateForDisplay = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Save edited coupon
    const handleSave = async (cuponid: string) => {
        try {
            // Validate no negative values
            if (editForm.beneficio < 0 || editForm.cantidadusos < 0 ||
                editForm.mincarga < 0 || editForm.maxcarga < 0) {
                showMessage('Los valores numéricos no pueden ser negativos', 'error');
                return;
            }

            await cuponApi.updateCupon(cuponid, editForm);
            setEditingId(null);
            setRefreshCupones(prev => prev + 1);
            showMessage('Cupón actualizado exitosamente', 'success');
        } catch (error) {
            console.error("Error updating coupon:", error);
            showMessage(`Error al actualizar cupón: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        }
    };

    // Delete coupon
    const handleDelete = async (cuponid: string) => {
        if (showDeleteConfirm === cuponid) {
            try {
                await cuponApi.deleteCupon(cuponid);
                setShowDeleteConfirm(null);
                setRefreshCupones(prev => prev + 1);
                showMessage('Cupón eliminado exitosamente', 'success');
            } catch (error) {
                console.error("Error deleting coupon:", error);
                showMessage(`Error al eliminar cupón: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
            }
        } else {
            setShowDeleteConfirm(cuponid);
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
    const currentCupones = getCurrentPageItems();

    return (
        <div className="users-section">
            {messageInfo.visible && (
                <Message
                    message={messageInfo.text}
                    type={messageInfo.type}
                    onClose={hideMessage}
                />
            )}

            <div className="users-table-container">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : cupones.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state-icon material-icons-round">local_offer</span>
                        <p className="empty-state-text">No hay cupones disponibles actualmente.</p>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Beneficio</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Usos</th>
                            <th>Carga Mín.</th>
                            <th>Carga Máx.</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentCupones.map(cupon => (
                            <tr key={cupon.cuponid} className="user-row">
                                <td>
                                    <div className="user-details">
                                        <div className="username">#{cupon.cuponid}</div>
                                    </div>
                                </td>
                                <td className="balance">
                                    {editingId === cupon.cuponid ? (
                                        <input
                                            type="number"
                                            value={editForm.beneficio}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                beneficio: Number(e.target.value)
                                            })}
                                            min="0"
                                            className="edit-input"
                                        />
                                    ) : (
                                        `${cupon.beneficio}%`
                                    )}
                                </td>
                                <td>
                                    {editingId === cupon.cuponid ? (
                                        <input
                                            type="date"
                                            value={editForm.fechainicio}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                fechainicio: e.target.value
                                            })}
                                            className="edit-input"
                                        />
                                    ) : (
                                        formatDateForDisplay(cupon.fechainicio)
                                    )}
                                </td>
                                <td>
                                    {editingId === cupon.cuponid ? (
                                        <input
                                            type="date"
                                            value={editForm.fechafin}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                fechafin: e.target.value
                                            })}
                                            className="edit-input"
                                        />
                                    ) : (
                                        formatDateForDisplay(cupon.fechafin)
                                    )}
                                </td>
                                <td>
                                    {editingId === cupon.cuponid ? (
                                        <input
                                            type="number"
                                            value={editForm.cantidadusos}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                cantidadusos: Number(e.target.value)
                                            })}
                                            min="0"
                                            className="edit-input"
                                        />
                                    ) : (
                                        <span className="status-badge active">{cupon.cantidadusos}</span>
                                    )}
                                </td>
                                <td>
                                    {editingId === cupon.cuponid ? (
                                        <input
                                            type="number"
                                            value={editForm.mincarga}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                mincarga: Number(e.target.value)
                                            })}
                                            min="0"
                                            className="edit-input"
                                        />
                                    ) : (
                                        <span className="balance">${cupon.mincarga}</span>
                                    )}
                                </td>
                                <td>
                                    {editingId === cupon.cuponid ? (
                                        <input
                                            type="number"
                                            value={editForm.maxcarga}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                maxcarga: Number(e.target.value)
                                            })}
                                            min="0"
                                            className="edit-input"
                                        />
                                    ) : (
                                        <span className="balance">${cupon.maxcarga}</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {editingId === cupon.cuponid ? (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<SaveIcon/>}
                                                    onClick={() => handleSave(cupon.cuponid)}
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
                                                    onClick={() => startEditing(cupon)}
                                                >
                                                    Editar
                                                </Button>
                                                {showDeleteConfirm === cupon.cuponid ? (
                                                    <div className="confirm-actions">
                                                        <IconButton
                                                            className="confirm-delete"
                                                            onClick={() => handleDelete(cupon.cuponid)}
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
                                                        onClick={() => setShowDeleteConfirm(cupon.cuponid)}
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
            {cupones.length > 0 && (
                <div className="pagination">
                    <div className="pagination-info">
                        Mostrando {currentCupones.length} de {cupones.length} cupones
                        (Página {currentPage} de {totalPages})
                    </div>
                    {renderPaginationControls()}
                </div>
            )}

            <div className="add-admin-form-container">
                <h3 className="form-title">Crear Nuevo Cupón</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = Object.fromEntries(
                        new FormData(e.currentTarget).entries()
                    );
                    handleCreateCupon(formData);
                    (e.target as HTMLFormElement).reset();
                }} className="add-admin-form">
                    <div className="form-grid">
                        {cuponFields.map((field, index) => (
                            <div className="form-group" key={index}>
                                <label htmlFor={field.id}>{field.label}</label>
                                <input
                                    type={field.type}
                                    id={field.id}
                                    name={field.id}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-button">
                            <span className="button-icon">add</span>
                            Crear Cupón
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CuponsManager;