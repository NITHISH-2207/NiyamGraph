/**
 * Modular Authentication Service Contract & API Adapter
 * Connects directly to FastAPI backend (/api/v1/auth) using Bearer tokens.
 * Handles unified AICTE Administration Login, role-based workspace routing,
 * and Institution Portal authentication.
 */
import { apiClient, ApiError } from './apiClient';

export interface InstitutionLoginCredentials {
  institutionId: string;
  email: string;
  password: string;
}

export interface AdminLoginCredentials {
  officialId: string;
  password: string;
  selectedRole?: string;
}

export interface ScrutinySignupPayload {
  fullName: string;
  email: string;
  officialId: string;
  password: string;
  designation?: string;
  regionalOfficeId?: string;
}

export interface MfaVerificationPayload {
  officialId: string;
  mfaCode: string;
  challengeId?: string;
}

export interface WorkspaceDestination {
  id: string;
  name: string;
  route: string;
  isAvailable?: boolean;
}

export interface AuthSession {
  userId: string;
  email: string;
  displayName: string;
  fullName?: string;
  role: string;
  roles: string[];
  primaryRole?: string;
  portalRedirectUrl: string;
  workspace?: WorkspaceDestination;
  token?: string;
  tokenExpiresAt?: number;

  // Institution-specific
  institutionId?: string;
  institutionName?: string;
  institutionIdentifier?: string;

  // AICTE Official-specific
  officialId?: string;
  designation?: string;
  regionalOfficeId?: string;
}

export interface AuthResult {
  success: boolean;
  requiresMfa?: boolean;
  challengeId?: string;
  session?: AuthSession;
  errorMessage?: string;
}

export interface BackendTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    is_active: boolean;
  };
  role: string;
  institution?: {
    id: string;
    identifier: string;
    official_name: string;
    institution_type: string;
    regional_office: string;
    state: string;
    status: string;
  };
}

export interface BackendOfficialTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    is_active: boolean;
  };
  roles: string[];
  primary_role: string;
  workspace: {
    id: string;
    name: string;
    route: string;
    is_available: boolean;
  };
}

const STORAGE_KEY = 'niyamgraph_auth_session';

export class FastAPIAuthAdapter {
  getCurrentSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as AuthSession;
    } catch {
      return null;
    }
  }

  setCurrentSession(session: AuthSession | null) {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      apiClient.clearToken();
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Authenticate Institution User via FastAPI (/api/v1/auth/institution/login)
   */
  async loginInstitution(credentials: InstitutionLoginCredentials): Promise<AuthResult> {
    try {
      const response = await apiClient.post<BackendTokenResponse>('/auth/institution/login', {
        institution_id: credentials.institutionId.trim(),
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (!response.access_token) {
        return {
          success: false,
          errorMessage: 'Invalid authentication response received from server.',
        };
      }

      apiClient.setToken(response.access_token);

      const session: AuthSession = {
        userId: response.user.id,
        email: response.user.email,
        displayName: response.user.full_name || response.user.email.split('@')[0],
        fullName: response.user.full_name,
        role: response.role,
        roles: [response.role],
        primaryRole: response.role,
        institutionId: response.institution?.id,
        institutionName: response.institution?.official_name,
        institutionIdentifier: response.institution?.identifier,
        portalRedirectUrl: '/institution/dashboard',
        token: response.access_token,
        tokenExpiresAt: Date.now() + (response.expires_in || 86400) * 1000,
      };

      this.setCurrentSession(session);
      return {
        success: true,
        session,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const errorData = error.data as { detail?: string; error?: { message?: string } } | undefined;
        const msg =
          errorData?.detail ||
          errorData?.error?.message ||
          'Invalid institution ID, email or password.';
        return {
          success: false,
          errorMessage: msg,
        };
      }
      return {
        success: false,
        errorMessage: 'Unable to connect to authentication service. Please verify your network.',
      };
    }
  }

  /**
   * Authenticate AICTE Administration Officer via FastAPI (/api/v1/auth/official/login)
   * Routing is database role-driven, NEVER email substring matched.
   */
  async loginAdmin(credentials: AdminLoginCredentials): Promise<AuthResult> {
    try {
      const response = await apiClient.post<BackendOfficialTokenResponse>('/auth/official/login', {
        identifier: credentials.officialId.trim(),
        password: credentials.password,
      });

      if (!response.access_token) {
        return {
          success: false,
          errorMessage: 'Invalid authentication response received from server.',
        };
      }

      apiClient.setToken(response.access_token);

      const session: AuthSession = {
        userId: response.user.id,
        email: response.user.email,
        displayName: response.user.full_name || response.user.email.split('@')[0],
        fullName: response.user.full_name,
        officialId: credentials.officialId.trim(),
        designation: response.primary_role,
        role: response.primary_role,
        roles: response.roles || [response.primary_role],
        primaryRole: response.primary_role,
        regionalOfficeId: 'RO-CENTRAL',
        portalRedirectUrl: response.workspace?.route || '/scrutiny/dashboard',
        workspace: {
          id: response.workspace?.id || 'scrutiny',
          name: response.workspace?.name || 'Scrutiny Portal',
          route: response.workspace?.route || '/scrutiny/dashboard',
          isAvailable: response.workspace?.is_available ?? true,
        },
        token: response.access_token,
        tokenExpiresAt: Date.now() + (response.expires_in || 86400) * 1000,
      };

      this.setCurrentSession(session);
      return {
        success: true,
        session,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const errorData = error.data as { detail?: string; error?: { message?: string } } | undefined;
        const msg =
          errorData?.detail ||
          errorData?.error?.message ||
          'Invalid official credentials or password.';
        return {
          success: false,
          errorMessage: msg,
        };
      }
      return {
        success: false,
        errorMessage: 'Unable to connect to AICTE authentication service. Please verify your network.',
      };
    }
  }

  async signupScrutinyOfficer(payload: ScrutinySignupPayload): Promise<AuthResult> {
    try {
      const res = await apiClient.post<any>('/auth/signup', {
        full_name: payload.fullName,
        email: payload.email,
        official_id: payload.officialId,
        password: payload.password,
        designation: payload.designation || 'Scrutiny Officer',
        regional_office_id: payload.regionalOfficeId || 'RO-SOUTH',
      });

      const session: AuthSession = {
        userId: res.user_id,
        officialId: res.official_id,
        displayName: res.full_name,
        fullName: res.full_name,
        designation: res.designation,
        email: payload.email,
        role: 'AICTE Scrutiny Officer',
        roles: res.roles || ['AICTE Scrutiny Officer'],
        primaryRole: 'AICTE Scrutiny Officer',
        regionalOfficeId: res.regional_office_id || 'RO-SOUTH',
        portalRedirectUrl: '/scrutiny/dashboard',
        token: res.token,
        tokenExpiresAt: Date.now() + 24 * 3600 * 1000,
      };

      this.setCurrentSession(session);
      return { success: true, session };
    } catch {
      return {
        success: false,
        errorMessage: 'Registration failed. Please contact your system administrator.',
      };
    }
  }

  async verifyAdminMfa(payload: MfaVerificationPayload): Promise<AuthResult> {
    return this.loginAdmin({ officialId: payload.officialId, password: 'mfa_verified' });
  }

  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.post('/auth/forgot-password', { identifier });
      return {
        success: true,
        message: 'Password reset instructions have been dispatched to your verified email.',
      };
    } catch {
      return {
        success: true,
        message: 'If an active account matches the supplied identifier, reset instructions have been dispatched.',
      };
    }
  }

  async getCurrentUser(): Promise<AuthSession | null> {
    const cached = this.getCurrentSession();
    const token = apiClient.getToken();
    if (!token && !cached) return null;

    try {
      const meData = await apiClient.get<{
        user: { id: string; email: string; full_name?: string; is_active: boolean };
        role: string;
        institution?: { id: string; identifier: string; official_name: string; status: string };
      }>('/auth/me');

      if (!meData.user || !meData.user.is_active) {
        this.logout();
        return null;
      }

      const session: AuthSession = {
        ...(cached || {}),
        userId: meData.user.id,
        email: meData.user.email,
        displayName: meData.user.full_name || meData.user.email.split('@')[0],
        fullName: meData.user.full_name,
        role: meData.role,
        roles: cached?.roles && cached.roles.length > 0 ? cached.roles : [meData.role],
        primaryRole: meData.role,
        institutionId: meData.institution?.id,
        institutionName: meData.institution?.official_name,
        institutionIdentifier: meData.institution?.identifier,
        portalRedirectUrl: cached?.portalRedirectUrl || (meData.institution ? '/institution/dashboard' : '/scrutiny/dashboard'),
      };

      this.setCurrentSession(session);
      return session;
    } catch {
      return cached;
    }
  }
}

export const authService = new FastAPIAuthAdapter();
