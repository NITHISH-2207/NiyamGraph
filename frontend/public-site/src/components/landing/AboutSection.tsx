import React from 'react';
import { ShieldCheck, BookOpen, Clock, Activity } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-20 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              About the Initiative
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
              Rule-driven Approvals & Compliance Intelligence
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Developed for the <strong>Smart India Hackathon 2026</strong>, NiyamGraph transforms regulatory workflows from fragmented bureaucratic cycles into an automated, transparent rule execution graph.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              The platform connects technical institutions directly with AICTE regional desks, scrutiny committees, and administrative authorities without back-and-forth ambiguity or lost documentation.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg bg-brand-bg border border-brand-border space-y-2">
              <div className="w-9 h-9 rounded-md bg-white text-brand-navy flex items-center justify-center border border-brand-border shadow-xs">
                <BookOpen className="w-5 h-5 text-brand-blue" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-brand-navy">APH Standard Alignment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rules dynamically encode standards from the statutory Approval Process Handbook, evaluating land norms, faculty cadration, and infrastructure benchmarks.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-brand-bg border border-brand-border space-y-2">
              <div className="w-9 h-9 rounded-md bg-white text-brand-navy flex items-center justify-center border border-brand-border shadow-xs">
                <Clock className="w-5 h-5 text-brand-gold" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-brand-navy">Statutory SLA Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated escalation timelines track regional scrutiny pendency, deficiency rectification windows, and committee appointment deadlines.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-brand-bg border border-brand-border space-y-2">
              <div className="w-9 h-9 rounded-md bg-white text-brand-navy flex items-center justify-center border border-brand-border shadow-xs">
                <Activity className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-brand-navy">Continuous Oversight</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post-approval undertakings, mandatory disclosures, and annual compliance milestones remain continuously audited across academic cycles.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-brand-bg border border-brand-border space-y-2">
              <div className="w-9 h-9 rounded-md bg-white text-brand-navy flex items-center justify-center border border-brand-border shadow-xs">
                <ShieldCheck className="w-5 h-5 text-brand-navy" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-brand-navy">Verifiable Audit Trails</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every document upload, officer remark, deficiency notice, and committee verdict produces an immutable verification trail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

