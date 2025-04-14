import '@css/DeleteUserStyle.css';
import React, {useEffect, useState} from "react";
import {useAuth} from '@context/AuthContext.tsx';
import {useUser} from "@context/UserContext.tsx";
import userApi from '@api/userApi';

const DeleteUser: React.FC = () => {
    const { user, isLoading: authLoading, logout } = useAuth();
    const {isLoading: userLoading } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [userExists, setUserExists] = useState<boolean>(true);

    useEffect(() => {
        document.body.classList.add('DeleteUserbody');

        // Verificar que el usuario existe al cargar el componente
        const checkUserExists = async () => {
            if (!user) return;

            try {
                await userApi.getUserById(user.usuarioid.toString());
                setUserExists(true);
            } catch (err) {
                console.log("Error al verificar usuario:", err);
                setUserExists(false);
                setError("No se puede eliminar la cuenta porque el usuario no existe o ya ha sido eliminado.");
            }
        };

        checkUserExists();

        return () => {
            document.body.classList.remove('DeleteUserbody');
        };
    }, [user]);

    const handleDeleteUser = async () => {
        if (!user) return;

        if (!userExists) {
            setError("No se puede eliminar la cuenta porque el usuario no existe o ya ha sido eliminado.");
            return;
        }

        try {
            setError(null);
            // Intentar eliminar directamente sin verificación previa (ya la hicimos)
            await userApi.deleteUser(user.usuarioid.toString());
            console.log("Usuario eliminado exitosamente");

            // Cerrar sesión después de eliminar cuenta
            if (logout) {
                logout();
            } else {
                // Redirigir al inicio si no hay función de logout
                window.location.href = "/";
            }
        } catch (err: any) {
            console.error("Error en componente al eliminar usuario:", err);
            if (err?.response?.status === 404) {
                setError("El usuario no existe o ya ha sido eliminado.");
            } else {
                setError(err.message || "No se pudo eliminar la cuenta. Por favor, intenta de nuevo.");
            }
        }
    };

    if (authLoading || userLoading) return <div>Cargando...</div>;

    return (
        <div className="delete-user-container">
            <div className="delete-user-card">
                <h1>Eliminar Cuenta</h1>

                {!userExists ? (
                    <div className="delete-user-error">
                        <p>Esta cuenta ya no existe o ha sido eliminada previamente.</p>
                        <button
                            className="delete-user-cancel-btn"
                            onClick={() => window.location.href = "/"}
                        >
                            Volver al inicio
                        </button>
                    </div>
                ) : (
                    <>
                        <p>
                            ¿Estás seguro que deseas eliminar tu cuenta? Esta acción es <strong>irreversible</strong> y se
                            perderán todos tus datos.
                        </p>
                        <p>
                            Se cerrará la sesión de forma automática una vez confirmada la eliminación.
                        </p>
                        {error && (
                            <div className="delete-user-error">
                                <p>{error}</p>
                            </div>
                        )}
                        <form id="deleteForm">
                            <div className="delete-user-buttons">
                                <button type="button" className="delete-user-cancel-btn"
                                        onClick={() => window.history.back()}>Cancelar
                                </button>
                                <button
                                    type="button"
                                    id="deleteButton"
                                    className="delete-user-delete-btn"
                                    onClick={handleDeleteUser}
                                    disabled={authLoading || userLoading}
                                >
                                    {userLoading ? "Eliminando..." : "Eliminar Cuenta"}
                                </button>
                            </div>
                        </form>
                        <div className="delete-user-warning">
                            <small>Recuerda que al eliminar tu cuenta no podrás recuperarla.</small>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DeleteUser;