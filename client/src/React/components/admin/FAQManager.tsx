import React, {useEffect, useState} from 'react';
import {Button, IconButton} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Message from '@components/Error/Message.tsx';
import {useFaq} from '@context/FAQContext.tsx';

interface FAQ {
    preguntaid: string;
    pregunta: string;
    respuesta: string;
    categoria: string;
}

interface MessageInfo {
    text: string;
    type: 'error' | 'warning' | 'info' | 'success';
    visible: boolean;
}

const FAQManager: React.FC = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ pregunta: string, respuesta: string, categoria: string }>({
        pregunta: '',
        respuesta: '',
        categoria: ''
    });
    const [refreshFaqs, setRefreshFaqs] = useState(0);
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

    const faqContext = useFaq();

    const categories = ["Cuenta","Pagos","Juegos","Tecnico","Otros"];

    const faqFields = [
        {
            id: 'pregunta',
            label: 'Pregunta',
            type: 'text',
            placeholder: 'Ej: ¿Cómo puedo cambiar mi contraseña?',
            required: true,
        },
        {
            id: 'respuesta',
            label: 'Respuesta',
            type: 'textarea',
            placeholder: 'Escriba la respuesta aquí...',
            required: true,
        },
        {
            id: 'categoria',
            label: 'Categoría',
            type: 'select',
            options: categories,
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
        return faqs.slice(startIndex, endIndex);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Fetch all FAQs
    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            try {
                const data = await faqContext.getAllFAQs();
                setFaqs(data);
                setTotalPages(Math.ceil(data.length / itemsPerPage));
                // Reset to page 1 when data refreshes
                setCurrentPage(1);
            } catch (error) {
                console.error('Error al cargar FAQs:', error);
                showMessage('Error al cargar FAQs. Por favor, intente nuevamente.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, [refreshFaqs]);

    // Handle form submission for creating new FAQ
    // Handle form submission for creating new FAQ
    const handleCreateFaq = async (formData: Record<string, any>) => {
        try {
            await faqContext.createFAQ({
                pregunta: formData.pregunta,
                respuesta: formData.respuesta,
                categoria: formData.categoria // Adding the missing categoria field
            });
            showMessage('FAQ creada exitosamente', 'success');
            setRefreshFaqs(prev => prev + 1);
        } catch (error) {
            console.error("Error creating FAQ:", error);
            showMessage(`Error al crear FAQ: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        }
    };

    // Save edited FAQ
    const handleSave = async (faqId: string) => {
        try {
            await faqContext.updateFAQ(faqId, {
                pregunta: editForm.pregunta,
                respuesta: editForm.respuesta,
                categoria: editForm.categoria
            });
            setEditingId(null);
            setRefreshFaqs(prev => prev + 1);
            showMessage('FAQ actualizada exitosamente', 'success');
        } catch (error) {
            console.error("Error updating FAQ:", error);
            showMessage(`Error al actualizar FAQ: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        }
    };

    // Start editing a FAQ
    const startEditing = (faq: FAQ) => {
        setEditingId(faq.preguntaid);
        setEditForm({
            pregunta: faq.pregunta,
            respuesta: faq.respuesta,
            categoria: faq.categoria
        });
    };

    // Delete FAQ
    const handleDelete = async (faqId: string) => {
        if (showDeleteConfirm === faqId) {
            try {
                await faqContext.deleteFAQ(faqId);
                setShowDeleteConfirm(null);
                setRefreshFaqs(prev => prev + 1);
                showMessage('FAQ eliminada exitosamente', 'success');
            } catch (error) {
                console.error("Error deleting FAQ:", error);
                showMessage(`Error al eliminar FAQ: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
            }
        } else {
            setShowDeleteConfirm(faqId);
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
    const currentFaqs = getCurrentPageItems();

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
                ) : faqs.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state-icon material-icons-round">help_outline</span>
                        <p className="empty-state-text">No hay preguntas frecuentes disponibles actualmente.</p>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pregunta</th>
                            <th>Respuesta</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentFaqs.map(faq => (
                            <tr key={faq.preguntaid} className="user-row">
                                <td>
                                    <div className="user-details">
                                        <div className="username">#{faq.preguntaid}</div>
                                    </div>
                                </td>
                                <td>
                                    {editingId === faq.preguntaid ? (
                                        <input
                                            type="text"
                                            value={editForm.pregunta}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                pregunta: e.target.value
                                            })}
                                            className="edit-input"
                                        />
                                    ) : (
                                        faq.pregunta
                                    )}
                                </td>
                                <td>
                                    {editingId === faq.preguntaid ? (
                                        <textarea
                                            value={editForm.respuesta}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                respuesta: e.target.value
                                            })}
                                            className="edit-input"
                                            rows={3}
                                        />
                                    ) : (
                                        <div className="response-text">{faq.respuesta}</div>
                                    )}
                                </td>
                                <td>
                                    {editingId === faq.preguntaid ? (
                                        <select
                                            value={editForm.categoria}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                categoria: e.target.value
                                            })}
                                            className="edit-input"
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="status-badge active">{faq.categoria}</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {editingId === faq.preguntaid ? (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<SaveIcon/>}
                                                    onClick={() => handleSave(faq.preguntaid)}
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
                                                    onClick={() => startEditing(faq)}
                                                >
                                                    Editar
                                                </Button>
                                                {showDeleteConfirm === faq.preguntaid ? (
                                                    <div className="confirm-actions">
                                                        <IconButton
                                                            className="confirm-delete"
                                                            onClick={() => handleDelete(faq.preguntaid)}
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
                                                        onClick={() => setShowDeleteConfirm(faq.preguntaid)}
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
            {faqs.length > 0 && (
                <div className="pagination">
                    <div className="pagination-info">
                        Mostrando {currentFaqs.length} de {faqs.length} preguntas (Página {currentPage} de {totalPages})
                    </div>
                    {renderPaginationControls()}
                </div>
            )}

            <div className="add-admin-form-container">
                <h3 className="form-title">Crear Nueva Pregunta Frecuente</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = Object.fromEntries(
                        new FormData(e.currentTarget).entries()
                    );
                    handleCreateFaq(formData);
                    (e.target as HTMLFormElement).reset();
                }} className="add-admin-form">
                    <div className="form-grid">
                        {faqFields.map((field, index) => (
                            <div className="form-group" key={index}>
                                <label htmlFor={field.id}>{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        id={field.id}
                                        name={field.id}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        rows={4}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        id={field.id}
                                        name={field.id}
                                        required={field.required}
                                    >
                                        <option value="">Seleccione una categoría</option>
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
                            Crear Pregunta Frecuente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FAQManager;