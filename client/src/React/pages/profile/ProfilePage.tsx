// ProfilePage.tsx
import {useAuth} from '@context/AuthContext';
import {useUser} from "@context/UserContext.tsx";
import Sidebar from '@components//SideBar.tsx';
import '@css/ProfileStyle.css';
import ImageUpload from '@components/ImageUpload';
import {useEffect, useState} from 'react';


const ProfilePage: React.FC = () => {
    const {user} = useAuth();
    const {client, getUserData, editUser} = useUser();
    const [, setProfileImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        edad: 0,
        dni: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Cargar datos iniciales
    useEffect(() => {
        if (user?.img) {
            setProfileImage(`http://localhost:3001${user.img}`);
        }

        // Recargar datos del usuario
        if (user?.usuarioid) {
            getUserData(user.usuarioid.toString());
        }
    }, [user?.usuarioid]);

    // Actualizar formulario cuando cambian los datos del usuario
    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || '',
                edad: parseInt(user.edad) || 0,
                dni: user.dni || ''
            });
        }
    }, [user]);

    const onImageUploaded = (imageUrl: string) => {
        setProfileImage(`http://localhost:3001${imageUrl}`);
        if (user?.usuarioid) {
            getUserData(user.usuarioid.toString());
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        console.log(`Cambiando ${name} a ${value}`); // Debugging
        setFormData(prev => ({
            ...prev,
            [name]: name === 'edad' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.usuarioid) {
            setError("No se pudo identificar al usuario");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Usar los valores originales para edad y DNI
            const updatedData = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                edad: parseInt(user.edad) || 0,
                dni: user.dni,
                balance: client?.balance || 0,
                influencer: client?.influencer || false
            };

            await editUser(user.usuarioid.toString(), updatedData);

            // Recargar explícitamente los datos del usuario
            await getUserData(user.usuarioid.toString());

            setSuccess('Información actualizada correctamente');
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la información');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || '',
                edad: parseInt(user.edad) || 0,
                dni: user.dni || ''
            });
        }
        setIsEditing(false);
        setError(null);
        setSuccess(null);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="container">
            <Sidebar/>
            <main className="main-content">
                <div className="profile-container">
                    <div className={`settings-section ${isEditing ? 'editing-mode' : ''}`}>
                        <div className="section-header">
                            <h2>Información de cuenta</h2>
                            {!isEditing && (
                                <button
                                    className="edit-btn"
                                    onClick={handleEditClick}
                                >
                                    Editar
                                </button>
                            )}
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        {isEditing && <div className="editing-message">Modo edición activado</div>}

                        <form className="settings-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editable' : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="apellido">Apellido</label>
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editable' : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editable' : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edad">Edad</label>
                                <input
                                    type="number"
                                    id="edad"
                                    name="edad"
                                    value={formData.edad}
                                    disabled={true} // Siempre deshabilitado
                                    className="readonly-field" // Clase para campos de solo lectura
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dni">DNI</label>
                                <input
                                    type="text"
                                    id="dni"
                                    name="dni"
                                    value={formData.dni}
                                    disabled={true} // Siempre deshabilitado
                                    className="readonly-field" // Clase para campos de solo lectura
                                />
                            </div>
                            {isEditing && (
                                <div className="button-group">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="save-btn"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            )}
                        </form>
                        <ImageUpload userId={user?.usuarioid || 0} onImageUploaded={onImageUploaded}/>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;