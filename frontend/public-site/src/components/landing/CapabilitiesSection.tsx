import React from 'react';
import { GitBranch, ClipboardCheck, ClockAlert, LineChart } from 'lucide-react';

export const CapabilitiesSection: React.FC = () => {
  const capabilities = [
    {
      title: 'Approval Automation',
      description: 'Structured application routing and stage-wise regulatory processing.',
      detail:
        'Eliminate manual handoffs with rule-driven stage gating. Automatically transition applications through Regional Scrutiny, EVC, Standing Appellate Committee, and Council Approval based on verified prerequisites.',
      icon: GitBranch,
      color: 'text-brand-blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Compliance Monitoring',
      description: 'Track institutional undertakings, evidence submissions and document verification.',
      detail:
        'Enforce continuous regulatory accountability. Validate land occupancy proofs, fire safety certificates, faculty roster ratios, and endowment fund deposits through systematic digital scrutiny.',
      icon: ClipboardCheck,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Deadline Intelligence',
      description: 'Monitor upcoming deadlines, EVC schedules and overdue actions.',
      detail:
        'Proactive statutory SLA alerts notify regional desks and applicant colleges before inspection windows lapse. Auto-trigger deficiency rectification timers and escalation sequences.',
      icon: ClockAlert,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Operational Visibility',
      description: 'Access consolidated dashboards, reports and traceable audit history.',
      detail:
        'Empower AICTE leadership and regional directors with real-time intake analytics, regional pendency heatmaps, automated national MIS generation, and immutable chronological action logs.',
      icon: LineChart,
      color: 'text-brand-navy',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
    },
  ];

  return (
    <section id="capabilities" className="py-20 md:py-28 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Core Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            A Unified Platform for Regulatory Administration
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Engineered to replace siloed approval steps with a transparent, rule-adjudicated governance pipeline.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-blue/40 hover:shadow-md transition-all duration-200 group"
              >
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${item.bgColor} border ${item.borderColor} ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {item.description}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

