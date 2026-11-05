/**
 * Modular Authentication Service Contract & Unimplemented Adapter
 * Ready for future FastAPI backend & Supabase Auth integration.
 */

export interface InstitutionLoginCredentials {
  institutionId: string;
  email: string;
  password: string;
}

export interface AdminLoginCredentials {
  officialId: string;
  password: string;
}

export interface MfaVerificationPayload {
  officialId: string;
  mfaCode: string;
  challengeId?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: 'institution_representative' | 'aicte_officer' | 'committee_expert' | 'super_admin';
  institutionId?: string;
  portalRedirectUrl: string;
  tokenExpiresAt: number;
}

export interface AuthResult {
  success: boolean;
  requiresMfa?: boolean;
  challengeId?: string;
  session?: AuthSession;
  errorMessage?: string;
}

export interface AuthService {
  loginInstitution(credentials: InstitutionLoginCredentials): Promise<AuthResult>;
  loginAdmin(credentials: AdminLoginCredentials): Promise<AuthResult>;
  verifyAdminMfa(payload: MfaVerificationPayload): Promise<AuthResult>;
  requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }>;
  isBackendConnected(): boolean;
}

/**
 * Prototype Adapter
 * Represents the decoupled layer prior to live Supabase / FastAPI backend connection.
 * Strictly avoids faking successful login or storing any credentials.
 */
export class PrototypeAuthAdapter implements AuthService {
  private hasLiveBackend: boolean;

  constructor() {
    // Live backend is only considered active if an explicit backend URL and tokens are configured
    this.hasLiveBackend = Boolean(
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  isBackendConnected(): boolean {
    return this.hasLiveBackend;
  }

  async loginInstitution(_credentials: InstitutionLoginCredentials): Promise<AuthResult> {
    // Artificial latency to simulate network request and allow testing loading states
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!this.hasLiveBackend) {
      return {
        success: false,
        errorMessage: 'Sign-in is currently unavailable. Please try again later.',
      };
    }

    // Placeholder for future Supabase client or FastAPI /api/v1/auth/institution/login call
    throw new Error('Supabase/FastAPI live authentication handler not implemented.');
  }

  async loginAdmin(_credentials: AdminLoginCredentials): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!this.hasLiveBackend) {
      return {
        success: false,
        errorMessage: 'Sign-in is currently unavailable. Please try again later.',
      };
    }

    throw new Error('Supabase/FastAPI live authentication handler not implemented.');
  }

  async verifyAdminMfa(_payload: MfaVerificationPayload): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      success: false,
      errorMessage:
        'MFA verification service is not yet connected. Authenticator TOTP validation requires the backend security gateway.',
    };
  }

  async requestPasswordReset(_identifier: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      success: false,
      message:
        'Password reset dispatch is unavailable in prototype mode. Institutional access credentials are reset through the statutory nodal officer.',
    };
  }
}

export const authService: AuthService = new PrototypeAuthAdapter();

