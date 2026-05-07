import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'vendor')[];
}


const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Still checking token validity — don't flash the login page
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
            <Loader2 className="h-7 w-7 text-orange-600 animate-spin" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Checking authentication…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role check — if roles are specified and user doesn't match, redirect home
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" state={{ unauthorized: true }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
