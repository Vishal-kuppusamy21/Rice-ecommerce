import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
    const { isAuthenticated, isAdmin, user, setAuthModalOpen, setAuthModalTab } = useStore();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated && !user) {
            setAuthModalTab('login');
            setAuthModalOpen(true);
        }
    }, [isAuthenticated, user, setAuthModalOpen, setAuthModalTab]);

    if (!isAuthenticated && !user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
