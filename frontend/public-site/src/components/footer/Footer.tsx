import React from 'react';
import { Link } from 'react-router-dom';
import { BrandEmblem } from '../common/BrandEmblem';
import { RegBadge } from '../common/RegBadge';
import { siteConfig } from '../../config/siteConfig';
import { ShieldCheck, Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-brand-border text-slate-700">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-1 space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue rounded"
              aria-label="NiyamGraph Home"
            >
              <div className="w-8 h-8 rounded-md bg-brand-navy flex items-center justify-center">
                <BrandEmblem size="sm" variant="light" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-brand-navy">
                  {siteConfig.name}
                </span>
                <RegBadge />
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-slate-600">
              Rule-driven Approvals & Compliance Intelligence platform designed for statutory technical education oversight.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-brand-navy font-medium">
              <Scale className="w-4 h-4 text-brand-gold shrink-0" aria-hidden="true" />
              <span>Smart India Hackathon 2026 Prototype</span>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Platform
            </p>
            <ul className="space-y-2 text-sm">
              {siteConfig.footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-600 hover:text-brand-blue transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Access */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Portals
            </p>
            <ul className="space-y-2 text-sm">
              {siteConfig.footerLinks.access.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-600 hover:text-brand-blue transition-colors flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Assistance
            </p>
            <ul className="space-y-2 text-sm">
              {siteConfig.footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-600 hover:text-brand-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal & Compliance */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Governance
            </p>
            <ul className="space-y-2 text-sm">
              {siteConfig.footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-600 hover:text-brand-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Institutional Prototype Disclaimer Notice */}
      <div className="bg-slate-50 border-t border-brand-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0" aria-hidden="true" />
            <p>
              <strong className="font-semibold text-slate-700">Prototype Notice:</strong> NiyamGraph is an academic demonstration and engineering prototype developed for Smart India Hackathon 2026. It is not an official public AICTE or Government of India operational portal unless formally sanctioned and deployed by the competent statutory authority.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-brand-border bg-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {currentYear} NiyamGraph Team. All rights reserved. Architectural Prototype.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Version: <strong className="font-mono text-slate-700">{siteConfig.version}</strong>
            </span>
            <span>•</span>
            <span className="text-slate-500">
              Dual-Portal React Architecture + FastAPI Core
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
