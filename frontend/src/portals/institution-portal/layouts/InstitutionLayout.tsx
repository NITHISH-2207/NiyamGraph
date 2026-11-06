import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BrandEmblem } from '@/components/common/BrandEmblem';
import { RegBadge } from '@/components/common/RegBadge';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  AlertCircle,
  UploadCloud,
  GitFork,
  CheckSquare,
  Bell,
  HelpCircle,
  Search,
  LogOut,
  Menu,
  X,
  User,
  Scale,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export const InstitutionLayout: React.FC = () => {
  const { session, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/institution/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Submit Application', href: '/institution/submit-application', icon: <FilePlus className="w-4 h-4" /> },
    { label: 'My Applications', href: '/institution/applications', icon: <FileText className="w-4 h-4" /> },
    { label: 'Deficiency Notices', href: '/institution/deficiencies', icon: <AlertCircle className="w-4 h-4" /> },
    { label: 'Document Resubmission', href: '/institution/documents', icon: <UploadCloud className="w-4 h-4" /> },
    { label: 'Application Progress', href: '/institution/progress', icon: <GitFork className="w-4 h-4" /> },
    { label: 'Compliance Obligations', href: '/institution/compliance', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'Notifications', href: '/institution/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Help & Support', href: '/support', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const currentNav = navItems.find((item) => item.href === location.pathname);
  const activeTitle = currentNav ? currentNav.label : 'Dashboard';

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row antialiased text-slate-800">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden bg-[#183B5D] text-white px-4 py-3 flex items-center justify-between border-b border-[#245B82] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrandEmblem size="sm" variant="gold" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">NiyamGraph</span>
              <RegBadge />
            </div>
            <span className="text-[10px] text-slate-300 block font-medium">INSTITUTIONAL PORTAL</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-slate-200 hover:text-white hover:bg-[#245B82] focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#183B5D] text-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Institution Portal Sidebar"
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-[#245B82]/50 flex items-center gap-3">
          <BrandEmblem size="md" variant="gold" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">NiyamGraph</span>
              <RegBadge />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold block">
              Institutional Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#245B82] text-white shadow-xs'
                    : 'text-slate-300 hover:bg-[#1f486e] hover:text-white'
                }`}
              >
                {/* Active Gold Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#C5A45E] rounded-r" />
                )}
                <span className={isActive ? 'text-[#C5A45E]' : 'text-slate-400'}>{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-3.5 border-t border-[#245B82]/50 bg-[#132c45] flex items-center gap-2 text-[11px] text-slate-400">
          <Scale className="w-3.5 h-3.5 text-[#C5A45E] shrink-0" aria-hidden="true" />
          <div className="leading-tight">
            <span className="font-semibold text-slate-300 block">National Regulatory Council</span>
            <span className="text-[10px] text-slate-400">Statutory Governance Portal</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>NiyamGraph</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold">{activeTitle}</span>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by Application ID, Institute Name, Rule..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue transition-colors"
                readOnly
              />
            </div>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Design Tokens Pill */}
            <Link
              to="/terms"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium border border-slate-200"
            >
              <span>APH AY 2026-27</span>
            </Link>

            {/* Notifications Bell */}
            <Link
              to="/institution/notifications"
              className="relative p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile Card */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-7 h-7 rounded-full bg-[#183B5D] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {session?.displayName ? session.displayName.charAt(0) : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="font-semibold text-xs text-slate-800 block truncate max-w-[140px]">
                  {session?.displayName || 'Institutional User'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {session?.role || 'Institution Portal'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors ml-1"
                title="Sign out of Institution Portal"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Body Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Portal Footer */}
        <footer className="bg-white border-t border-slate-200 px-6 py-2.5 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NiyamGraph Regulatory Authority Platform • Institutional Governance & Approval Processing</span>
          <span>UI/UX Design Tokens • APH AY 2026-27</span>
        </footer>
      </div>
    </div>
  );
};
