import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck2,
  Building2,
  Scale,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  Bell,
  History,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'registry'
  | 'scrutiny'
  | 'evc'
  | 'consolidated'
  | 'conditions'
  | 'pending'
  | 'analytics'
  | 'notifications'
  | 'audit';

interface ComplianceOfficerSidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unreadNotificationsCount?: number;
}

const NAV_ITEMS = [
  { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'registry' as NavigationTab, label: 'Application Registry', icon: FileSpreadsheet },
  { id: 'scrutiny' as NavigationTab, label: 'Scrutiny Reports', icon: FileCheck2 },
  { id: 'evc' as NavigationTab, label: 'EVC Inspection Reports', icon: Building2 },
  { id: 'consolidated' as NavigationTab, label: 'Consolidated Compliance', icon: Scale, highlight: true },
  { id: 'conditions' as NavigationTab, label: 'Approval Conditions', icon: ClipboardList },
  { id: 'pending' as NavigationTab, label: 'Pending Actions', icon: AlertTriangle },
  { id: 'analytics' as NavigationTab, label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'notifications' as NavigationTab, label: 'Notifications', icon: Bell, hasBadge: true },
  { id: 'audit' as NavigationTab, label: 'Audit Trail', icon: History },
];

export const ComplianceOfficerSidebar: React.FC<ComplianceOfficerSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  unreadNotificationsCount = 0,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-navy-800 text-white z-50 transition-all duration-300 flex flex-col justify-between border-r border-navy-700/60 shadow-xl lg:shadow-none ${
          mobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[72px]' : 'lg:w-[250px]'}`}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="h-[68px] flex items-center justify-between px-4.5 border-b border-navy-700/70">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-saffron-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-wide text-white leading-tight">
                    NiyamGraph
                  </span>
                  <span className="text-[11px] font-medium text-amber-300/90 tracking-wider uppercase">
                    Compliance Portal
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-navy-600 text-white font-semibold shadow-inner'
                      : 'text-slate-200/80 hover:bg-navy-700/70 hover:text-white'
                  }`}
                >
                  {/* Left indicator bar for active item */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-saffron-500 rounded-r" />
                  )}

                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-saffron-500' : 'text-slate-300 group-hover:text-white'
                    }`}
                  />

                  {(!collapsed || mobileOpen) && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {/* Notification badge */}
                  {item.hasBadge && unreadNotificationsCount > 0 && (!collapsed || mobileOpen) && (
                    <span className="bg-saffron-500 text-navy-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {unreadNotificationsCount}
                    </span>
                  )}

                  {/* Dot badge on collapsed */}
                  {collapsed && !mobileOpen && item.hasBadge && unreadNotificationsCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-saffron-500 ring-2 ring-navy-800" />
                  )}

                  {/* Tooltip on collapsed desktop */}
                  {collapsed && !mobileOpen && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & collapse toggle button */}
        <div className="p-3 border-t border-navy-700/70">
          {(!collapsed || mobileOpen) && (
            <div className="px-3 py-2 rounded bg-navy-900/60 mb-2 text-xs text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-slate-200">AICTE 2026-27</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-700 text-emerald-400 font-medium">
                Live Prototype
              </span>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-700/80 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium w-full px-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

