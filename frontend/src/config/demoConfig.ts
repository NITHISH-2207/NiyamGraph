/**
 * Demonstration Credentials Configuration
 * Controls whether the public demonstration credentials block is visible on the Institution Login page.
 *
 * SECURITY NOTICE:
 * All variables prefixed with VITE_ are embedded into the client-side JavaScript bundle and are publicly visible.
 * Never place production passwords, database credentials, or secret keys in these variables.
 * Only a dedicated demonstration account with limited privileges may be displayed.
 */

export interface DemoCredentialsConfig {
  showDemoCredentials: boolean;
  institutionId: string;
  email: string;
  password: string;
  missingVariables: string[];
}

const rawShow = import.meta.env.VITE_SHOW_DEMO_CREDENTIALS;
const showFlag = rawShow === 'true';

// Read values from environment, providing standard demonstration defaults when demo mode is enabled
const demoId = (
  import.meta.env.VITE_DEMO_INSTITUTION_ID || (showFlag ? 'TEST-PID-1-93821094' : '')
).trim();

const demoEmail = (
  import.meta.env.VITE_DEMO_EMAIL || (showFlag ? 'test.admin@apex.edu.in' : '')
).trim();

// Password is sourced strictly from environment variable VITE_DEMO_PASSWORD
const demoPassword = (import.meta.env.VITE_DEMO_PASSWORD || '').trim();

// Compute list of missing variables for diagnostics
const missing: string[] = [];
if (!showFlag) missing.push('VITE_SHOW_DEMO_CREDENTIALS');
if (!import.meta.env.VITE_DEMO_INSTITUTION_ID) missing.push('VITE_DEMO_INSTITUTION_ID');
if (!import.meta.env.VITE_DEMO_EMAIL) missing.push('VITE_DEMO_EMAIL');
if (!import.meta.env.VITE_DEMO_PASSWORD) missing.push('VITE_DEMO_PASSWORD');

export const demoCredentialsConfig: DemoCredentialsConfig = {
  showDemoCredentials: Boolean(showFlag && demoId && demoEmail && demoPassword),
  institutionId: demoId,
  email: demoEmail,
  password: demoPassword,
  missingVariables: missing,
};

export interface OfficerDemoAccount {
  key: string;
  label: string;
  role: string;
  email: string;
  workspaceName: string;
  workspaceRoute: string;
  isAvailable: boolean;
}

export const AICTE_DEMO_OFFICERS: OfficerDemoAccount[] = [
  {
    key: 'scrutiny',
    label: 'Scrutiny Officer',
    role: 'AICTE Scrutiny Officer',
    email: 'test.official@aicte.gov.in',
    workspaceName: 'Scrutiny Portal',
    workspaceRoute: '/scrutiny/dashboard',
    isAvailable: true,
  },
  {
    key: 'evc',
    label: 'EVC Officer',
    role: 'AICTE EVC Officer',
    email: 'test.evc@aicte.gov.in',
    workspaceName: 'EVC Portal',
    workspaceRoute: '/aicte/evc/dashboard',
    isAvailable: false,
  },
  {
    key: 'regional',
    label: 'Regional Officer',
    role: 'AICTE Regional Officer',
    email: 'test.regional@aicte.gov.in',
    workspaceName: 'Regional Portal',
    workspaceRoute: '/aicte/regional/dashboard',
    isAvailable: false,
  },
  {
    key: 'complaints',
    label: 'Complaints Officer',
    role: 'AICTE Complaints Officer',
    email: 'test.complaints@aicte.gov.in',
    workspaceName: 'Complaints Portal',
    workspaceRoute: '/aicte/complaints/dashboard',
    isAvailable: false,
  },
];
