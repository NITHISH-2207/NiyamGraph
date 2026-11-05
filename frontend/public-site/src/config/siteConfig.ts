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
  urls: {
    institutionPortal: string;
    aictePortal: string;
    apiBase: string;
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
  urls: {
    institutionPortal: import.meta.env.VITE_INSTITUTION_PORTAL_URL || 'http://localhost:5174',
    aictePortal: import.meta.env.VITE_AICTE_PORTAL_URL || 'http://localhost:5175',
    apiBase: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
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
      { label: 'Institution Portal', href: '/institution/login' },
      { label: 'AICTE Administration', href: '/admin/login' },
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

