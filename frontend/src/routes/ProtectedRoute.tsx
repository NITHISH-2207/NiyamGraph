import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authConfig } from '../config/authConfig';

export type UserRole =
  | 'institution_representative'
  | 'aicte_officer'
  | 'committee_expert'
  | 'super_admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  loginPath?: string;
}

/**
 * Route protection wrapper.
 * Controlled by VITE_AUTH_GUARD_ENABLED (defaults to false / pass-through during development).
 * When active and unauthenticated, redirects to the designated login path without faking authentication.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  loginPath = '/auth/institution/login',
}) => {
  const location = useLocation();

  // If auth guard is disabled (default in dev/prototype), pass through directly
  if (!authConfig.authGuardEnabled) {
    return <>{children}</>;
  }

  // Auth context interface placeholder (future Supabase Auth / JWT verification)
  const isAuthenticated = false; // Source of truth: unauthenticated in prototype mode

  if (!isAuthenticated) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location.pathname, requiredRole }}
        replace
      />
    );
  }

  return <>{children}</>;
};

