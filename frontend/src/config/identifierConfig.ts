/**
 * Configurable parameters for Institution Identifier validation.
 * Adaptable to changes in statutory registry formats (e.g. AICTE Permanent Institute ID, AISHE code, or state registration numbers).
 */
export interface IdentifierConfig {
  label: string;
  fieldId: string;
  placeholder: string;
  helperText: string;
  // Flexible regex allowing standard formats like "1-93821094", "PID-12345678", "AICTE-INST-001", or alphanumeric codes
  pattern: RegExp;
  patternDescription: string;
  minLength: number;
  maxLength: number;
}

export const institutionIdentifierConfig: IdentifierConfig = {
  label: 'Institution ID / AICTE Permanent ID (PID)',
  fieldId: 'institutionId',
  placeholder: 'e.g. 1-93821094 or PID-2026-0891',
  helperText: 'Enter the permanent institute identifier assigned by the regulatory authority.',
  // AICTE PIDs are typically 1-XXXXXXXX or alphanumeric IDs between 6 and 24 characters
  pattern: /^[A-Za-z0-9\-_]{5,25}$/,
  patternDescription: 'Identifier must be 5–25 characters consisting of letters, numbers, hyphens, or underscores.',
  minLength: 5,
  maxLength: 25,
};

export const adminIdentifierConfig = {
  label: 'Official User ID / Regulatory Email',
  fieldId: 'officialId',
  placeholder: 'e.g. ro.kanpur@aicte.gov.in or ADM-HQ-4091',
  helperText: 'Enter your designated administrative account identifier or institutional email.',
};

