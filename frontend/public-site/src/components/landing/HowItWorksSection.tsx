import React from 'react';
import {
  FileText,
  UserCheck,
  Users,
  Stamp,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Filing & Submission',
      summary: 'Institution submits an application.',
      detail:
        'Colleges upload digital filings, self-assessment questionnaires, land norms, and cadre affidavits with automated pre-validation.',
      icon: FileText,
    },
    {
      stepNumber: '02',
      title: 'Regional Scrutiny',
      summary: 'Authorized AICTE officers process the application.',
      detail:
        'Regional office scrutiny desks evaluate statutory checklists, identify specific deficiencies, or clear cases for inspection.',
      icon: UserCheck,
    },
    {
      stepNumber: '03',
      title: 'Committee Evaluation',
      summary: 'Applicable EVC and committee reviews take place.',
      detail:
        'Expert Visit Committees (EVC) conduct geo-tagged inspections, and Standing Hearing Committees review contested queries.',
      icon: Users,
    },
    {
      stepNumber: '04',
      title: 'Executive Adjudication',
      summary: 'Competent authority records the authorized decision.',
      detail:
        'Executive committee passes final adjudication: Sanctioned Extension of Approval (EoA), program intake expansion, or rejection.',
      icon: Stamp,
    },
    {
      stepNumber: '05',
      title: 'Lifecycle Oversight',
      summary: 'Institutional compliance and document validity are monitored.',
      detail:
        'Continuous post-approval tracking validates ongoing faculty cadres, student grievance portals, and annual renewal milestones.',
      icon: ShieldAlert,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-brand-bg border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Operational Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            A Connected Regulatory Journey
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            From initial institutional filing to continuous compliance oversight.
          </p>
        </div>

        {/* Desktop Horizontal Workflow / Mobile Vertical Timeline */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/4 left-10 right-10 h-0.5 bg-slate-300 z-0 -translate-y-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.stepNumber}
                  className="flex flex-col p-6 rounded-xl bg-white border border-brand-border shadow-xs hover:border-brand-blue/50 transition-all duration-200"
                >
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-brand-navy text-white">
                      STEP {item.stepNumber}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-brand-navy mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-brand-blue mb-2.5">
                    {item.summary}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.detail}
                  </p>

                  {/* Step Connector Indicator for Mobile */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center py-2 text-slate-300">
                      ↓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Regulatory Disclaimer Box */}
        <div className="mt-12 max-w-3xl mx-auto p-4 rounded-lg bg-white border border-brand-border flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-slate-600">
            <strong className="text-slate-800">Regulatory Note:</strong> This is a high-level conceptual workflow. Actual stages, verification levels, and scrutiny protocols are dynamically configurable according to applicable AICTE Approval Process Handbook (APH) regulations and institutional category. Not every application follows identical stages.
          </p>
        </div>
      </div>
    </section>
  );
};

