import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authService,
  AuthSession,
  InstitutionLoginCredentials,
  AdminLoginCredentials,
  AuthResult,
} from '../services/authService';

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: InstitutionLoginCredentials) => Promise<AuthResult>;
  loginAdmin: (credentials: AdminLoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from token on mount / refresh
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const currentSession = await authService.getCurrentUser();
        if (isMounted) {
          setSession(currentSession);
        }
      } catch (err) {
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Listen for session expiry event dispatched by central 401 handler
    const handleSessionExpired = () => {
      setSession(null);
    };

    window.addEventListener('niyamgraph:session-expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('niyamgraph:session-expired', handleSessionExpired);
    };
  }, []);

  const login = useCallback(async (credentials: InstitutionLoginCredentials): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await authService.loginInstitution(credentials);
      if (result.success && result.session) {
        setSession(result.session);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAdmin = useCallback(async (credentials: AdminLoginCredentials): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await authService.loginAdmin(credentials);
      if (result.success && result.session) {
        setSession(result.session);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setSession(null);
      setIsLoading(false);
    }
  }, []);

  const value = {
    session,
    isAuthenticated: Boolean(session),
    isLoading,
    login,
    loginAdmin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

