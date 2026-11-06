import React from 'react';
import { Menu, Bell, Shield, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { NavigationTab } from './ComplianceOfficerSidebar';

interface ComplianceOfficerHeaderProps {
  currentTab: NavigationTab;
  onOpenMobileMenu: () => void;
  unreadCount?: number;
  onNotificationsClick?: () => void;
  officerName?: string;
  regionalOffice?: string;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Compliance Officer Dashboard',
    subtitle: 'Monitor regulatory application progress, review verification reports, and track mandatory compliance requirements.'
  },
  registry: {
    title: 'Application Registry',
    subtitle: 'Search, filter, and inspect institutions across technical approval cycles.'
  },
  scrutiny: {
    title: 'Scrutiny Reports Review',
    subtitle: 'Review document verification findings submitted by the Scrutiny Committee.'
  },
  evc: {
    title: 'EVC Inspection Reports Review',
    subtitle: 'Review physical site inspection findings and infrastructure audits submitted by the EVC Committee.'
  },
  consolidated: {
    title: 'Consolidated Compliance Assessment Engine',
    subtitle: 'Cross-reference scrutiny and physical evidence against statutory regulatory requirements.'
  },
  conditions: {
    title: 'Approval Conditions & Post-Approval Compliance',
    subtitle: 'Track statutory obligations, deadlines, and pending institution compliance proofs.'
  },
  pending: {
    title: 'Pending Action Items',
    subtitle: 'Immediate compliance actions, clarification requests, and critical deficiencies awaiting officer review.'
  },
  analytics: {
    title: 'Reports & Regulatory Analytics',
    subtitle: 'High-level statistics, compliance rates, and downloadable consolidated summaries.'
  },
  notifications: {
    title: 'Compliance Notifications',
    subtitle: 'Real-time alerts on report submissions, conflict detections, and overdue conditions.'
  },
  audit: {
    title: 'Audit Trail & Compliance Log',
    subtitle: 'Immutable record of officer reviews, clarifications, and consolidated report submissions.'
  }
};

export const ComplianceOfficerHeader: React.FC<ComplianceOfficerHeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  unreadCount = 0,
  onNotificationsClick,
  officerName = 'Officer Loganath R K',
  regionalOffice = 'Western Regional Office',
}) => {
  const currentInfo = TAB_TITLES[currentTab] || {
    title: 'Compliance Management',
    subtitle: 'Institutional regulatory governance and approval workflows.'
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border shadow-xs">
      <div className="h-[68px] px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-navy-800 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
                NiyamGraph Portal
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-txt-secondary font-medium capitalize">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-navy-900 leading-tight truncate">
              {currentInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Badges, Notification & Officer Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          {/* Cycle Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle border border-border text-xs text-txt-secondary">
            <Calendar className="w-3.5 h-3.5 text-navy-600" />
            <span className="font-medium text-navy-900">Cycle 2026-27</span>
          </div>

          {/* Region Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle border border-border text-xs text-txt-secondary">
            <MapPin className="w-3.5 h-3.5 text-navy-600" />
            <span className="truncate max-w-[140px] font-medium text-txt-primary">{regionalOffice}</span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onNotificationsClick}
            className="relative p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-surface-subtle border border-transparent hover:border-border transition-all"
            title="View Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-saffron-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Officer Profile Card */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-9 h-9 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs shadow-sm border border-navy-700">
              LR
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-navy-900 leading-tight">
                {officerName}
              </span>
              <span className="text-[11px] font-medium text-saffron-600 leading-tight">
                Compliance Officer
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

