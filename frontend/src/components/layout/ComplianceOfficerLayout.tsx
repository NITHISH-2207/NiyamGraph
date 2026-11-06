import React, { useState } from 'react';
import { ComplianceOfficerSidebar, NavigationTab } from './ComplianceOfficerSidebar';
import { ComplianceOfficerHeader } from './ComplianceOfficerHeader';

interface ComplianceOfficerLayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unreadCount?: number;
  children: React.ReactNode;
}

export const ComplianceOfficerLayout: React.FC<ComplianceOfficerLayoutProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 3,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Sidebar */}
      <ComplianceOfficerSidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-[250px]'
        }`}
      >
        {/* Header */}
        <ComplianceOfficerHeader
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileOpen(true)}
          unreadCount={unreadCount}
          onNotificationsClick={() => onSelectTab('notifications')}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

