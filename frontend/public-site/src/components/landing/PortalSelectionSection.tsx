import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Landmark,
  CheckCircle2,
  ArrowRight,
  Shield,
  Building2,
} from 'lucide-react';

export const PortalSelectionSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (url: string) => {
    navigate(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent, url: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(url);
    }
  };

  return (
    <section id="portals" className="py-20 md:py-28 bg-brand-bg border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Access Portals
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Choose Your Portal
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Select your authorized workspace to continue securely.
          </p>
        </div>

        {/* Two Equal Prominence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {/* Card 1: Institution Portal */}
          <div
            onClick={() => handleCardClick('/institution/login')}
            onKeyDown={(e) => handleKeyDown(e, '/institution/login')}
            tabIndex={0}
            role="button"
            aria-label="Enter Institution Portal: For registered technical colleges and institutes"
            className="group flex flex-col justify-between p-8 sm:p-10 rounded-xl bg-white border border-brand-border shadow-xs hover:shadow-lg hover:border-brand-blue/50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 relative"
          >
            {/* Top Indicator */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-lg bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <GraduationCap className="w-7 h-7" aria-hidden="true" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-brand-blue" aria-hidden="true" />
                  College Workspace
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                  Institution Portal
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  A dedicated workspace for registered technical institutions to manage applications, track approval progress, respond to deficiencies and monitor institutional compliance.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Key Capabilities
                </p>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Submit applications for Extension of Approval (EoA) & new programs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Track real-time stage-by-stage application progress</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Respond to deficiency notices within designated rectification windows</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Upload statutory supporting documents & cadre proofs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Monitor post-approval compliance obligations & undertakings</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Button Action */}
            <div className="pt-8">
              <span className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-md bg-brand-blue text-white group-hover:bg-brand-blue-hover transition-colors shadow-xs">
                <span>Institution Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </div>

          {/* Card 2: AICTE Administration Portal */}
          <div
            onClick={() => handleCardClick('/admin/login')}
            onKeyDown={(e) => handleKeyDown(e, '/admin/login')}
            tabIndex={0}
            role="button"
            aria-label="Enter AICTE Administration Portal: For authorized regulatory officers and committee chairs"
            className="group flex flex-col justify-between p-8 sm:p-10 rounded-xl bg-white border border-brand-border shadow-xs hover:shadow-lg hover:border-brand-navy/60 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 relative"
          >
            {/* Top Indicator */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 text-brand-navy flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-navy group-hover:text-white transition-all">
                  <Landmark className="w-7 h-7" aria-hidden="true" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  <Shield className="w-3.5 h-3.5 text-[#C5A45E]" aria-hidden="true" />
                  Statutory Desks
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                  AICTE Administration Portal
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  A centralized workspace for authorized AICTE personnel to process applications, coordinate committees, manage regulatory decisions and monitor institutional compliance.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Key Capabilities
                </p>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Application processing across all 7 Regional Jurisdictions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>EVC (Expert Visit Committee) and Scrutiny panel coordination</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Authorized regulatory decision recording & digital EoA issuance</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Automated rule engine validation against APH norms</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Pendency monitoring, SLA escalation & statutory MIS exports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Button Action */}
            <div className="pt-8">
              <span className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-md bg-brand-navy text-white group-hover:bg-brand-navy-dark transition-colors shadow-xs">
                <span>Official Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

