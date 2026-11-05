import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrandEmblem } from '../common/BrandEmblem';
import { RegBadge } from '../common/RegBadge';
import { siteConfig } from '../../config/siteConfig';
import {
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  Landmark,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Intersection observer for section tracking on landing page
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = ['hero', 'about', 'capabilities', 'how-it-works'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const isLinkActive = (href: string) => {
    if (location.pathname === '/support' && href === '/support') return true;
    if (location.pathname === '/' && href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      return activeSection === targetId;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Authority Label */}
          <Link
            to="/"
            className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded p-1 group shrink-0"
            aria-label="NiyamGraph Home"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-navy flex items-center justify-center shadow-xs shrink-0">
              <BrandEmblem size="md" variant="light" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-bold tracking-tight text-brand-navy group-hover:text-brand-blue transition-colors">
                  {siteConfig.name}
                </span>
                <RegBadge />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-brand-secondary font-medium hidden sm:inline-block mt-0.5">
                Statutory Governance Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0" aria-label="Main Navigation">
            {siteConfig.navigation.map((item) => {
              const active = isLinkActive(item.href);
              const isAnchor = item.href.startsWith('/#');

              return isAnchor ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'text-brand-navy font-bold bg-slate-100 border-b-2 border-brand-blue'
                      : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'text-brand-navy font-bold bg-slate-100 border-b-2 border-brand-blue'
                      : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Accessible Login Dropdown (Preserves existing two + adds Scrutiny Login) */}
          <div className="hidden sm:flex items-center gap-3 shrink-0" ref={dropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setIsDropdownOpen(true);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-brand-navy text-white hover:bg-brand-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors shadow-xs whitespace-nowrap shrink-0"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="Access Portals Menu"
              >
                <span>Portal Sign In</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-76 rounded-xl bg-white shadow-xl border border-brand-border py-2 z-50 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Authorized Workspaces
                    </p>
                  </div>

                  {/* 1. Existing: Institution Login */}
                  <Link
                    to="/auth/institution/login"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                    role="menuitem"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors shrink-0">
                      <GraduationCap className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-blue">
                        Institution Login
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        For verified technical colleges & institutes
                      </p>
                    </div>
                  </Link>

                  {/* 2. Existing: AICTE Official Login */}
                  <Link
                    to="/auth/admin/login"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                    role="menuitem"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors shrink-0">
                      <Landmark className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-blue">
                        AICTE Official Login
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Regional officers, central desk & committees
                      </p>
                    </div>
                  </Link>

                  {/* 3. Scrutiny Officer Login */}
                  <Link
                    to="/auth/admin/login"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group border-t border-slate-100"
                    role="menuitem"
                  >
                    <div className="p-2 rounded-lg bg-amber-50 text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors shrink-0">
                      <ShieldCheck className="w-5 h-5 text-brand-gold" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-blue">
                          Scrutiny Officer Workspace
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Examine applications, verify rules & resubmissions
                      </p>
                    </div>
                  </Link>

                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>Statutory credentials required</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-brand-navy hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-brand-navy" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-brand-border bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {siteConfig.navigation.map((item) => {
              const isAnchor = item.href.startsWith('/#');
              return isAnchor ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      handleNavClick(item.href);
                    } else {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-brand-navy hover:bg-slate-50 rounded-lg"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-brand-navy hover:bg-slate-50 rounded-lg"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3">
              Portal Access
            </p>
            <Link
              to="/auth/institution/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold rounded-lg bg-brand-bg text-brand-navy hover:bg-slate-100"
            >
              <GraduationCap className="w-5 h-5 text-brand-blue" aria-hidden="true" />
              <span>Institution Portal Login</span>
            </Link>
            <Link
              to="/auth/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold rounded-lg bg-slate-100 text-brand-navy hover:bg-slate-200"
            >
              <Landmark className="w-5 h-5 text-brand-blue" aria-hidden="true" />
              <span>AICTE Official Login</span>
            </Link>
            <Link
              to="/auth/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold rounded-lg bg-brand-navy text-white hover:bg-brand-navy-dark shadow-xs"
            >
              <ShieldCheck className="w-5 h-5 text-brand-gold" aria-hidden="true" />
              <span>Scrutiny Officer Workspace</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
