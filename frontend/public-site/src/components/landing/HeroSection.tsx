import React from 'react';
import { ArrowDown, Shield, FileCheck, Layers } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 bg-brand-bg border-b border-brand-border overflow-hidden">
      {/* Subtle institutional pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#183B5D 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Regulatory Context Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-brand-border text-xs font-semibold text-brand-navy shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>AICTE Approval Process Handbook (APH) Alignment</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight leading-[1.12]">
            Simplifying Approvals.
            <br />
            <span className="text-brand-blue">Strengthening Compliance.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            A unified digital platform for AICTE approval workflows, institutional compliance and transparent administrative monitoring.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => scrollTo('portals')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-md bg-brand-blue text-white hover:bg-brand-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors shadow-xs"
            >
              <span>Access Your Portal</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTo('capabilities')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-md bg-white text-brand-navy hover:bg-slate-50 border border-brand-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-colors shadow-xs"
            >
              <span>Explore the Platform</span>
              <ArrowDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
            </button>
          </div>

          {/* Trust Pillars */}
          <div className="pt-10 border-t border-brand-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-brand-border/60">
              <Shield className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-brand-navy">Statutory Integrity</p>
                <p className="text-xs text-slate-500">Immutable rule adjudication & audit logs</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-brand-border/60">
              <FileCheck className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-brand-navy">Zero Ambiguity</p>
                <p className="text-xs text-slate-500">Explicit deficiency notice & rectifications</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-brand-border/60">
              <Layers className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-brand-navy">Dual Architecture</p>
                <p className="text-xs text-slate-500">Dedicated portals with shared FastAPI core</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

