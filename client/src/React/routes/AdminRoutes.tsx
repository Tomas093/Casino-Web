// AdminRoutes.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useAdmin } from  '@context/AdminContext.tsx'

const AdminOnlyRoutes = () => {
    const { isLoading } = useAuth();
    const { isAdmin } = useAdmin()
    const [admin, setAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            const result = await isAdmin();
            setAdmin(result);
        };
        checkAdmin();
    }, [isAdmin]);

    if (isLoading || admin === null) return <div>Cargando...</div>;
    if (!admin) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default AdminOnlyRoutes;