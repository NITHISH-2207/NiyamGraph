import React from 'react';
import { Link } from 'react-router-dom';
import { BrandEmblem } from '../common/BrandEmblem';
import { RegBadge } from '../common/RegBadge';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  portalType: 'institution' | 'admin';
  portalTitle: string;
  leftHeading: string;
  leftSupportingText: string;
  benefits: string[];
  rightHeading: string;
  rightSupportingText: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  portalTitle,
  leftHeading,
  leftSupportingText,
  benefits,
  rightHeading,
  rightSupportingText,
  children,
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-brand-bg text-slate-800 antialiased">
      {/* LEFT PANEL (~45% on desktop): Deep Navy Institutional Authority */}
      <section
        className="w-full lg:w-[45%] bg-[#102A45] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-[#183B5D]"
        aria-label="Portal Identity and Overview"
      >
        {/* Subtle radial background atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle at 10% 20%, #245B82 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Top Brand Link & Return to Home */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-brand-gold rounded p-1 group"
              aria-label="Back to NiyamGraph Home"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <BrandEmblem size="md" variant="light" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-white group-hover:text-slate-200">
                    NiyamGraph
                  </span>
                  <RegBadge />
                </div>
                <span className="text-[11px] uppercase tracking-wider text-brand-gold-light font-semibold">
                  {portalTitle}
                </span>
              </div>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Vertically Centered Main Content Block */}
          <div className="my-auto py-8 sm:py-10 lg:py-12 max-w-lg space-y-6 lg:space-y-8">
            {/* Heading & Supporting Info */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                {leftHeading}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {leftSupportingText}
              </p>
            </div>

            {/* Institutional Capabilities List */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
                Institutional Capabilities
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A45E] shrink-0" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Left Statutory Watermark */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>AICTE Statutory Regulatory Framework</span>
            <span className="font-mono text-[11px] text-[#C5A45E]">AY 2026-27</span>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL (~55% on desktop): Clean White Form Surface */}
      <section
        className="w-full lg:w-[55%] flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-white"
        aria-label="Sign In Form"
      >
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              {rightHeading}
            </h2>
            <p className="text-sm text-slate-600">
              {rightSupportingText}
            </p>
          </div>

          {/* Main Form Slot */}
          {children}

          {/* Legal Acknowledgement Line */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              By signing in, you acknowledge the applicable{' '}
              <Link
                to="/terms"
                className="text-brand-blue font-medium underline underline-offset-2 hover:text-brand-navy"
              >
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-brand-blue font-medium underline underline-offset-2 hover:text-brand-navy"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
