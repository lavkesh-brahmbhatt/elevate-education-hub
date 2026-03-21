import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // 1. Show loading state if auth info is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Redirect to login if user is not authenticated
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  // 3. If specific roles are required, check if user has permission
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    console.warn(`Access Denied: Role '${profile.role}' not permitted for this route.`);
    return <Navigate to="/dashboard" replace />;
  }

  // 4. If all checks pass, render the protected content
  return <>{children}</>;
}
