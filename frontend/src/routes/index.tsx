import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages from portals/public-site
const LandingPage = lazy(() =>
  import('@/portals/public-site/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const InstitutionLoginPage = lazy(() =>
  import('@/portals/public-site/pages/InstitutionLoginPage').then((m) => ({
    default: m.InstitutionLoginPage,
  }))
);
const AdminLoginPage = lazy(() =>
  import('@/portals/public-site/pages/AdminLoginPage').then((m) => ({
    default: m.AdminLoginPage,
  }))
);
const ScrutinySignupPage = lazy(() =>
  import('@/portals/public-site/pages/ScrutinySignupPage').then((m) => ({
    default: m.ScrutinySignupPage,
  }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/portals/public-site/pages/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const TermsPage = lazy(() =>
  import('@/portals/public-site/pages/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = lazy(() =>
  import('@/portals/public-site/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
const AccessibilityPage = lazy(() =>
  import('@/portals/public-site/pages/AccessibilityPage').then((m) => ({
    default: m.AccessibilityPage,
  }))
);
const SupportPage = lazy(() =>
  import('@/portals/public-site/pages/SupportPage').then((m) => ({ default: m.SupportPage }))
);
const NotFoundPage = lazy(() =>
  import('@/portals/public-site/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Scrutiny Portal
const ScrutinyLayout = lazy(() =>
  import('@/portals/scrutiny-portal/layouts/ScrutinyLayout').then((m) => ({
    default: m.ScrutinyLayout,
  }))
);
const ScrutinyDashboardPage = lazy(() =>
  import('@/portals/scrutiny-portal/pages/ScrutinyDashboardPage').then((m) => ({
    default: m.ScrutinyDashboardPage,
  }))
);
const ScrutinyQueuePage = lazy(() =>
  import('@/portals/scrutiny-portal/pages/ScrutinyQueuePage').then((m) => ({
    default: m.ScrutinyQueuePage,
  }))
);
const ApplicationWorkspacePage = lazy(() =>
  import('@/portals/scrutiny-portal/pages/ApplicationWorkspacePage').then((m) => ({
    default: m.ApplicationWorkspacePage,
  }))
);
const RegulatoryRulesPage = lazy(() =>
  import('@/portals/scrutiny-portal/pages/RegulatoryRulesPage').then((m) => ({
    default: m.RegulatoryRulesPage,
  }))
);
const DeficiencyListPage = lazy(() =>
  import('@/portals/scrutiny-portal/pages/DeficiencyListPage').then((m) => ({
    default: m.DeficiencyListPage,
  }))
);

const PageLoader: React.FC = () => (
  <div
    className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3"
    aria-label="Loading page content"
  >
    <Loader2 className="w-8 h-8 animate-spin text-brand-blue" aria-hidden="true" />
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      Loading Workspace...
    </span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Scrutiny Officer Portal Module */}
        <Route path="/scrutiny" element={<ScrutinyLayout />}>
          <Route index element={<Navigate to="/scrutiny/dashboard" replace />} />
          <Route path="dashboard" element={<ScrutinyDashboardPage />} />
          <Route path="queue" element={<ScrutinyQueuePage />} />
          <Route path="applications/:id" element={<ApplicationWorkspacePage />} />
          <Route path="rules" element={<RegulatoryRulesPage />} />
          <Route path="deficiencies" element={<DeficiencyListPage />} />
        </Route>

        {/* Public pages wrapped in shared RootLayout (Header + Footer) */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Canonical Authentication Routes */}
        <Route path="/auth/institution/login" element={<InstitutionLoginPage />} />
        <Route path="/auth/admin/login" element={<AdminLoginPage />} />
        <Route path="/auth/scrutiny/signup" element={<ScrutinySignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Backward Compatibility & Direct Redirects */}
        <Route path="/institution/login" element={<Navigate to="/auth/institution/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/auth/admin/login" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
      </Routes>
    </Suspense>
  );
};
