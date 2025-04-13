import '../Css/DeleteUserStyle.css';
import React, {useEffect} from "react"; // Asegúrate de que la ruta sea correcta
import {useAuth} from './AuthContext';

const DeleteUser: React.FC = () => {
    const { user, deleteUser, isLoading } = useAuth();

    useEffect(() => {
        document.body.classList.add('DeleteUserbody');
        return () => {
            document.body.classList.remove('DeleteUserbody');
        };
    }, []);

    if (isLoading) return <div>Cargando...</div>;

    return (
        <div className="delete-user-container">
            <div className="delete-user-card">
                <h1>Eliminar Cuenta</h1>
                <p>
                    ¿Estás seguro que deseas eliminar tu cuenta? Esta acción es <strong>irreversible</strong> y se
                    perderán todos tus datos.
                </p>
                <p>
                    Se cerrará la sesión de forma automática una vez confirmada la eliminación.
                </p>
                <form id="deleteForm">
                    <input type="hidden" name="id" value="<!-- Aquí va el ID del usuario -->"/>
                    <div className="delete-user-buttons">
                        <button type="button" className="delete-user-cancel-btn"
                                onClick={() => window.history.back()}>Cancelar
                        </button>
                        <button type="button" id="deleteButton" className="delete-user-delete-btn"
                                onClick={() => user && deleteUser(user.usuarioid.toString())}>Eliminar Cuenta
                        </button>
                    </div>
                </form>
                <div className="delete-user-warning">
                    <small>Recuerda que al eliminar tu cuenta no podrás recuperarla.</small>
                </div>
            </div>
        </div>
    );
};

export default DeleteUser;