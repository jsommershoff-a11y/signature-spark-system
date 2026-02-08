import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/lib/roles';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requireMinRole?: AppRole;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireMinRole 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasMinRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Check specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  // Check minimum role requirement
  if (requireMinRole && !hasMinRole(requireMinRole)) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  return <>{children}</>;
}
