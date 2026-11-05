import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandEmblem } from '@/components/common/BrandEmblem';
import { RegBadge } from '@/components/common/RegBadge';
import { authService } from '@/services/authService';
import {
  LayoutDashboard,
  Inbox,
  AlertTriangle,
  BookOpen,
  Menu,
  X,
  LogOut,
  User,
  Shield,
} from 'lucide-react';

export const ScrutinyLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const session = authService.getCurrentSession() || {
    fullName: 'Dr. Rajeshwar Sharma',
    designation: 'Senior Scrutiny Officer',
    officialId: 'SO-2026-CH01',
    regionalOfficeId: 'RO-SOUTH',
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/scrutiny/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'My Scrutiny Queue',
      href: '/scrutiny/queue',
      icon: Inbox,
    },
    {
      label: 'Regulatory Rules',
      href: '/scrutiny/rules',
      icon: BookOpen,
    },
    {
      label: 'Deficiency Notices',
      href: '/scrutiny/deficiencies',
      icon: AlertTriangle,
    },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isLinkActive = (href: string) => {
    if (href === '/scrutiny/queue') {
      return location.pathname === '/scrutiny/queue' || location.pathname.startsWith('/scrutiny/applications');
    }
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Top Statutory Header - Exactly 64px, perfectly aligned, zero text wrapping */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand Emblem & Workspace Identity */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-1 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-100 xl:hidden focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link
                to="/scrutiny/dashboard"
                className="flex items-center gap-2.5 focus:outline-none group"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center shadow-xs group-hover:bg-brand-navy-dark transition-colors shrink-0">
                  <BrandEmblem size="sm" variant="light" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-base sm:text-lg font-black tracking-tight text-brand-navy group-hover:text-brand-blue transition-colors">
                      NiyamGraph
                    </span>
                    <RegBadge />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-blue mt-0.5 whitespace-nowrap">
                    Scrutiny Officer Workspace
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Main Desktop Navigation (Strict single-line, zero wrapping) */}
            <nav className="hidden xl:flex items-center gap-1 shrink-0" aria-label="Main Navigation">
              {navItems.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-brand-navy text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-gold' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Region Pill + Officer + Sign Out (Strict single-line) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Region Pill */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span>RO-South (Chennai)</span>
              </div>

              {/* Officer Info */}
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-brand-blue border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-brand-navy leading-none whitespace-nowrap">
                    {session.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 whitespace-nowrap">
                    {session.officialId}
                  </span>
                </div>
              </div>

              {/* Direct Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition-colors shadow-xs whitespace-nowrap shrink-0"
                title="Sign Out of Desk"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5 mb-2">
              <Shield className="w-4 h-4 text-brand-blue shrink-0" />
              <div>
                <p className="text-xs font-bold text-brand-navy">{session.fullName}</p>
                <p className="text-[11px] text-slate-500">{session.designation} • RO-South (Chennai)</p>
              </div>
            </div>

            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    active ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Desk</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Full-Width Content Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none">
        <Outlet />
      </main>
    </div>
  );
};
