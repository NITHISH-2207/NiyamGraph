/**
 * Splash Screen Duration & Timing Configuration (Section 4)
 * Defined as named constants for ease of maintenance.
 *
 * Total splash visibility: 2.8 seconds (2800ms)
 * Timing breakdown:
 * - Fade-in: 0.5s (500ms)
 * - Hold: 1.8s (1800ms)
 * - Fade-out: 0.5s (500ms)
 */
export const SPLASH_CONFIG = {
  TOTAL_DURATION_MS: 2800,
  FADE_IN_DURATION_MS: 500,
  HOLD_DURATION_MS: 1800,
  FADE_OUT_DURATION_MS: 500,
} as const;

/**
 * Timestamp when the fade-out transition initiates (2300ms)
 */
export const SPLASH_FADE_OUT_START_MS: number =
  SPLASH_CONFIG.FADE_IN_DURATION_MS + SPLASH_CONFIG.HOLD_DURATION_MS;

