import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  loginPath?: string;
}

const RouteLoader: React.FC = () => (
  <div
    className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3"
    aria-label="Verifying authorization"
  >
    <Loader2 className="w-8 h-8 animate-spin text-brand-navy" aria-hidden="true" />
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      Verifying Statutory Authorization...
    </span>
  </div>
);

/**
 * Enterprise Role-Based Route Protection Guard
 * Validates authentication status and strictly enforces workspace role permissions.
 * Prevents unauthorized cross-portal navigation and URL spoofing.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  loginPath = '/auth/admin/login',
}) => {
  const { session, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoader />;
  }

  // 1. Enforce Authentication
  if (!isAuthenticated || !session) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 2. Enforce Role Segregation
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRoles = session.roles && session.roles.length > 0 ? session.roles : [session.role];

    const isAuthorized = userRoles.some((r) =>
      allowed.some((a) => a.toLowerCase() === r.toLowerCase())
    );

    if (!isAuthorized) {
      return (
        <Navigate
          to="/unauthorized"
          state={{ attemptedPath: location.pathname, requiredRoles: allowed }}
          replace
        />
      );
    }
  }

  return <>{children}</>;
};
