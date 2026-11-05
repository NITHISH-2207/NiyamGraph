import { siteConfig } from './siteConfig';

export interface AuthConfig {
  prototypeMode: boolean;
  authGuardEnabled: boolean;
  mfaCodeLength: number;
  knownInternalRedirectPaths: readonly string[];
}

export const authConfig: AuthConfig = {
  prototypeMode: true,
  authGuardEnabled: import.meta.env.VITE_AUTH_GUARD_ENABLED === 'true',
  mfaCodeLength: 6,
  knownInternalRedirectPaths: [
    siteConfig.paths.institutionPortal,
    siteConfig.paths.aictePortal,
    siteConfig.paths.institutionLogin,
    siteConfig.paths.adminLogin,
  ],
};

/**
 * Validates a redirect target path against internal known routes to prevent open redirect vulnerabilities.
 */
export function isSafeRedirectPath(targetPath: string): boolean {
  if (!targetPath || typeof targetPath !== 'string') return false;
  // Must be an internal relative path starting with /
  if (!targetPath.startsWith('/') || targetPath.startsWith('//')) return false;

  return authConfig.knownInternalRedirectPaths.some(
    (known) => targetPath === known || targetPath.startsWith(`${known}/`)
  );
}
