import '@css/DeleteUserStyle.css';
import React, {useEffect} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '@context/AuthContext.tsx';
import {useUser} from '@context/UserContext.tsx'

const DeleteSpecificAccount: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {isLoading } = useAuth();
    const {deleteUser} = useUser()

    useEffect(() => {
        document.body.classList.add('DeleteUserbody');
        return () => {
            document.body.classList.remove('DeleteUserbody');
        };
    }, []);

    const handleDeleteAccount = async () => {
        if (id) {
            try {
                await deleteUser(id);
                alert('Cuenta eliminada con éxito');
                navigate(-1);
            } catch (error) {
                console.error('Error al eliminar la cuenta:', error);
                alert('Error al eliminar la cuenta');
            }
        } else {
            alert('ID de usuario no válido');
        }

    };

    if (isLoading) return <div>Cargando...</div>;

    return (
        <div className="delete-user-container">
            <div className="delete-user-card">
                <h1>Eliminar Cuenta</h1>
                <p>
                    ¿Estás seguro que deseas eliminar esta cuenta? Esta acción es <strong>irreversible</strong>.
                </p>
                <p>ID de usuario: {id}</p>
                <div className="delete-user-buttons">
                    <button type="button" className="delete-user-cancel-btn"
                            onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                    <button type="button" className="delete-user-delete-btn"
                            onClick={handleDeleteAccount}>
                        Eliminar Cuenta
                    </button>
                </div>
                <div className="delete-user-warning">
                    <small>Esta acción no se puede deshacer.</small>
                </div>
            </div>
        </div>
    );
};

export default DeleteSpecificAccount;