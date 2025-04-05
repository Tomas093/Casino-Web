// ProfilePage.tsx
import { useAuth } from './AuthContext';
import Sidebar from './SideBar.tsx';
import './ProfileStyle.css';
import ImageUpload from './ImageUpload';
import { useEffect, useState } from 'react';

const ProfilePage: React.FC = () => {
    const { user, getUserData } = useAuth();
    const [,setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        if (user?.img) {
            setProfileImage(`http://localhost:3001${user.img}`);
        }

        // Recargar datos del usuario para asegurarnos de tener la última imagen
        if (user?.usuarioid) {
            getUserData(user.usuarioid.toString());
        }
    }, [user]);

    const onImageUploaded = (imageUrl: string) => {
        setProfileImage(`http://localhost:3001${imageUrl}`);
        // Recargar los datos del usuario para actualizar la imagen en el contexto
        if (user?.usuarioid) {
            getUserData(user.usuarioid.toString());
        }
    };

    return (
        <div className="container">
            <Sidebar />
            <main className="main-content">
                <div className="profile-container">
                    <div className="settings-section">
                        <h2>Información de cuenta</h2>
                        <form className="settings-form">
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" defaultValue={user?.nombre || ''} />
                            </div>
                            <div className="form-group">
                                <label>Apellido</label>
                                <input type="text" defaultValue={user?.apellido || ''} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" defaultValue={user?.email || ''} />
                            </div>
                        </form>
                        <ImageUpload userId={user?.usuarioid || 0} onImageUploaded={onImageUploaded} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;