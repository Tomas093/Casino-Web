import {useEffect, useState} from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '@context/AuthContext';
import {useAdmin} from '@context//AdminContext.tsx'

const SuperAdminOnlyRoutes = () => {
    const { isLoading } = useAuth();
    const { isSuperAdmin } = useAdmin()
    const [superadmin, setSuperadmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkSuperAdmin = async () => {
            const result = await isSuperAdmin();
            setSuperadmin(result);
        };
        checkSuperAdmin();
    }, [isSuperAdmin]);

    if (isLoading || superadmin === null) return <div>Cargando...</div>;
    if (!superadmin) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default SuperAdminOnlyRoutes;