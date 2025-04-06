import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const SuperAdminOnlyRoutes = () => {
    const { isSuperadmin, isLoading } = useAuth();
    const [superadmin, setSuperadmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkSuperAdmin = async () => {
            const result = await isSuperadmin();
            setSuperadmin(result);
        };
        checkSuperAdmin();
    }, [isSuperadmin]);

    if (isLoading || superadmin === null) return <div>Cargando...</div>;
    if (!superadmin) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default SuperAdminOnlyRoutes;