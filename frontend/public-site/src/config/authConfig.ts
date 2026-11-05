import { siteConfig } from './siteConfig';

export interface AuthConfig {
  prototypeMode: boolean;
  allowedRedirectOrigins: string[];
  mfaCodeLength: number;
}

export const authConfig: AuthConfig = {
  prototypeMode: true,
  allowedRedirectOrigins: [
    new URL(siteConfig.urls.institutionPortal).origin,
    new URL(siteConfig.urls.aictePortal).origin,
  ],
  mfaCodeLength: 6,
};

/**
 * Validates a redirect target URL against whitelisted origins to prevent open redirect vulnerabilities.
 */
export function isSafeRedirectUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl, window.location.origin);
    // Allow relative paths within current domain
    if (parsed.origin === window.location.origin) {
      return true;
    }
    // Check against configured allowed portal origins
    return authConfig.allowedRedirectOrigins.includes(parsed.origin);
  } catch {
    return false;
  }
}
