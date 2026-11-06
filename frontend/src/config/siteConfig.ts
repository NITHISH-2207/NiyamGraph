import { resolveApiBaseUrl } from '@/services/apiClient';

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  regulatoryAuthority: string;
  version: string;
  apiBaseUrl: string;
  paths: {
    institutionPortal: string;
    aictePortal: string;
    institutionLogin: string;
    adminLogin: string;
    forgotPassword: string;
  };
  navigation: NavItem[];
  footerLinks: {
    platform: NavItem[];
    access: NavItem[];
    support: NavItem[];
    legal: NavItem[];
  };
}

export const siteConfig: SiteConfig = {
  name: 'NiyamGraph',
  tagline: 'Simplifying Approvals. Strengthening Compliance.',
  description:
    'A unified digital platform for AICTE approval workflows, institutional compliance and transparent administrative monitoring.',
  regulatoryAuthority: 'Statutory Regulatory Authority • Technical Education Governance',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiBaseUrl: resolveApiBaseUrl(),
  paths: {
    institutionPortal: '/institution',
    aictePortal: '/admin',
    institutionLogin: '/auth/institution/login',
    adminLogin: '/auth/admin/login',
    forgotPassword: '/auth/forgot-password',
  },
  navigation: [
    { label: 'Home', href: '/#hero' },
    { label: 'About', href: '/#about' },
    { label: 'Platform', href: '/#capabilities' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Help & Support', href: '/support' },
  ],
  footerLinks: {
    platform: [
      { label: 'About NiyamGraph', href: '/#about' },
      { label: 'Platform Capabilities', href: '/#capabilities' },
      { label: 'How It Works', href: '/#how-it-works' },
    ],
    access: [
      { label: 'Institution Portal', href: '/auth/institution/login' },
      { label: 'AICTE Administration', href: '/auth/admin/login' },
    ],
    support: [
      { label: 'Help & Support', href: '/support' },
      { label: 'Contact Helpdesk', href: '/support#contact' },
      { label: 'Accessibility Statement', href: '/accessibility' },
    ],
    legal: [
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Data Handling Protocol', href: '/privacy#data-handling' },
    ],
  },
};
