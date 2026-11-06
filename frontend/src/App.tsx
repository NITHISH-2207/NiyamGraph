<<<<<<< HEAD
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';
=======
import React, { useState, useEffect } from 'react';
import { ComplianceOfficerLayout } from './components/layout/ComplianceOfficerLayout';
import { NavigationTab } from './components/layout/ComplianceOfficerSidebar';
import { DashboardPage } from './pages/DashboardPage';
import { RegistryPage } from './pages/RegistryPage';
import { ApplicationDetailPageWrapper } from './pages/ApplicationDetailPageWrapper';
import { ScrutinyReportsPage } from './pages/ScrutinyReportsPage';
import { EVCReportsPage } from './pages/EVCReportsPage';
import { ConsolidatedCompliancePage } from './pages/ConsolidatedCompliancePage';
import { ApprovalConditionsPage } from './pages/ApprovalConditionsPage';
import { PendingActionsPage } from './pages/PendingActionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(2);

  const fetchUnread = async () => {
    try {
      const notifs = await api.getNotifications();
      const unread = notifs.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchUnread();
  }, [currentTab]);

  const handleSelectApplication = (id: number) => {
    setSelectedAppId(id);
  };

  const handleBackToRegistry = () => {
    setSelectedAppId(null);
  };

  const handleTabChange = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setSelectedAppId(null); // Return from deep detail view when switching main tabs
  };
>>>>>>> ac03a0beaddd84a70757bc4e338223b8cb6439ac

  return (
<<<<<<< HEAD
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
=======
    <ComplianceOfficerLayout
      currentTab={currentTab}
      onSelectTab={handleTabChange}
      unreadCount={unreadCount}
    >
      {/* If an application is selected for detail inspection, render the 9-section dossier */}
      {selectedAppId !== null ? (
        <ApplicationDetailPageWrapper
          applicationId={selectedAppId}
          onBack={handleBackToRegistry}
        />
      ) : (
        <>
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={handleTabChange}
              onSelectApplication={handleSelectApplication}
            />
          )}

          {currentTab === 'registry' && (
            <RegistryPage onSelectApplication={handleSelectApplication} />
          )}

          {currentTab === 'scrutiny' && (
            <ScrutinyReportsPage onSelectApplication={handleSelectApplication} />
          )}

          {currentTab === 'evc' && (
            <EVCReportsPage onSelectApplication={handleSelectApplication} />
          )}

          {currentTab === 'consolidated' && (
            <ConsolidatedCompliancePage onSelectApplication={handleSelectApplication} />
          )}

          {currentTab === 'conditions' && (
            <ApprovalConditionsPage onSelectApplication={handleSelectApplication} />
          )}

          {currentTab === 'pending' && (
            <PendingActionsPage onSelectApplication={handleSelectApplication} />
          )}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'notifications' && (
            <NotificationsPage
              onSelectApplication={handleSelectApplication}
              onRefreshCount={fetchUnread}
            />
          )}

          {currentTab === 'audit' && <AuditTrailPage />}
        </>
      )}
    </ComplianceOfficerLayout>
>>>>>>> ac03a0beaddd84a70757bc4e338223b8cb6439ac
  );
}

export default App;

