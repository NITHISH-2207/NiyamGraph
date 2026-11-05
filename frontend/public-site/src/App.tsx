import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Loader2 } from 'lucide-react';

// Code-split route components for optimized bundle delivery
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const InstitutionLoginPage = lazy(() =>
  import('./pages/InstitutionLoginPage').then((m) => ({ default: m.InstitutionLoginPage }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const TermsPage = lazy(() =>
  import('./pages/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
const AccessibilityPage = lazy(() =>
  import('./pages/AccessibilityPage').then((m) => ({ default: m.AccessibilityPage }))
);
const SupportPage = lazy(() =>
  import('./pages/SupportPage').then((m) => ({ default: m.SupportPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
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

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Routes wrapped in shared institutional RootLayout (Header + Footer) */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Dedicated full-screen split layouts */}
          <Route path="/institution/login" element={<InstitutionLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
