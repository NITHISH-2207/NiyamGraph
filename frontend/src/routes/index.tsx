import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Public pages
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
const UnauthorizedPage = lazy(() =>
  import('@/portals/public-site/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
);

// Institution Portal
const InstitutionLayout = lazy(() =>
  import('@/portals/institution-portal/layouts/InstitutionLayout').then((m) => ({
    default: m.InstitutionLayout,
  }))
);
const DashboardPage = lazy(() =>
  import('@/portals/institution-portal/pages/DashboardPage').then((m) => ({
     default: m.DashboardPage,
  }))
);

const SubmitApplicationPage = lazy(() =>
  import('@/portals/institution-portal/pages/SubmitApplicationPage').then((m) => ({
    default: m.SubmitApplicationPage,
  }))
);

// AICTE Scrutiny Portal
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

// AICTE Workspaces Under Development (EVC, Regional, Complaints)
const WorkspaceNotAvailablePage = lazy(() =>
  import('@/portals/aicte-portal/pages/WorkspaceNotAvailablePage').then((m) => ({
    default: m.WorkspaceNotAvailablePage,
  }))
);

const PageLoader: React.FC = () => (
  <div
    className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3"
    aria-label="Loading page content"
  >
    <Loader2 className="w-8 h-8 animate-spin text-brand-navy" aria-hidden="true" />
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      Loading Workspace...
    </span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 1. Protected Institution Portal Module */}
        <Route
          path="/institution"
          element={
            <ProtectedRoute
              requiredRole={['Institution Admin', 'Institution Staff']}
              loginPath="/auth/institution/login"
            >
              <InstitutionLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/institution/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="applications" element={<DashboardPage />} />
          <Route path="submit-application" element={<SubmitApplicationPage />} />
          <Route path="deficiencies" element={<DashboardPage />} />
          <Route path="documents" element={<DashboardPage />} />
          <Route path="progress" element={<DashboardPage />} />
          <Route path="compliance" element={<DashboardPage />} />
          <Route path="notifications" element={<DashboardPage />} />
        </Route>

        {/* 2. Protected Scrutiny Officer Portal Module */}
        <Route
          path="/scrutiny"
          element={
            <ProtectedRoute
              requiredRole={['AICTE Scrutiny Officer', 'AICTE Official', 'SCRUTINY_OFFICER', 'Super Administrator']}
              loginPath="/auth/admin/login"
            >
              <ScrutinyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/scrutiny/dashboard" replace />} />
          <Route path="dashboard" element={<ScrutinyDashboardPage />} />
          <Route path="queue" element={<ScrutinyQueuePage />} />
          <Route path="applications/:id" element={<ApplicationWorkspacePage />} />
          <Route path="rules" element={<RegulatoryRulesPage />} />
          <Route path="deficiencies" element={<DeficiencyListPage />} />
        </Route>

        {/* Scrutiny Portal Alias: /aicte/scrutiny/* */}
        <Route
          path="/aicte/scrutiny/*"
          element={<Navigate to="/scrutiny/dashboard" replace />}
        />

        {/* 3. Protected EVC Officer Portal Module */}
        <Route
          path="/aicte/evc/*"
          element={
            <ProtectedRoute
              requiredRole={['AICTE EVC Officer', 'EVC_OFFICER', 'Super Administrator']}
              loginPath="/auth/admin/login"
            >
              <WorkspaceNotAvailablePage
                workspaceName="Expert Visit Committee (EVC) Portal"
                expectedRole="AICTE EVC Officer"
              />
            </ProtectedRoute>
          }
        />

        {/* 4. Protected Regional Officer Portal Module */}
        <Route
          path="/aicte/regional/*"
          element={
            <ProtectedRoute
              requiredRole={['AICTE Regional Officer', 'REGIONAL_OFFICER', 'Super Administrator']}
              loginPath="/auth/admin/login"
            >
              <WorkspaceNotAvailablePage
                workspaceName="AICTE Regional Office Portal"
                expectedRole="AICTE Regional Officer"
              />
            </ProtectedRoute>
          }
        />

        {/* 5. Protected Complaints Officer Portal Module */}
        <Route
          path="/aicte/complaints/*"
          element={
            <ProtectedRoute
              requiredRole={['AICTE Complaints Officer', 'COMPLAINTS_OFFICER', 'Super Administrator']}
              loginPath="/auth/admin/login"
            >
              <WorkspaceNotAvailablePage
                workspaceName="AICTE Public Grievance & Complaints Portal"
                expectedRole="AICTE Complaints Officer"
              />
            </ProtectedRoute>
          }
        />

        {/* 6. Access Control & Authorization Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 7. Canonical Authentication Routes */}
        <Route path="/auth/institution/login" element={<InstitutionLoginPage />} />
        <Route path="/auth/admin/login" element={<AdminLoginPage />} />
        <Route path="/auth/official/login" element={<Navigate to="/auth/admin/login" replace />} />
        <Route path="/auth/scrutiny/signup" element={<ScrutinySignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Backward Compatibility & Direct Redirects */}
        <Route path="/institution/login" element={<Navigate to="/auth/institution/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/auth/admin/login" replace />} />
        <Route path="/official/login" element={<Navigate to="/auth/admin/login" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

        {/* 8. Public pages wrapped in shared RootLayout (Header + Footer) */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
