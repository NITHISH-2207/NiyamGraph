import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="py-12 md:py-16 bg-brand-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-slate-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-brand-navy">Home</Link>
            </li>
            <li>/</li>
            <li className="text-slate-800 font-medium">Terms of Use</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="bg-white p-8 sm:p-10 rounded-xl border border-brand-border shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
                Terms of Use
              </h1>
              <p className="text-xs text-slate-500">
                Document Version 1.0-DRAFT • Effective Date: Academic Year 2026-27
              </p>
            </div>
          </div>

          {/* Prominent Legal Status Banner */}
          <div
            className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900 text-sm">
                DRAFT – Not Legally Approved
              </p>
              <p className="leading-relaxed">
                This Terms of Use document is an engineering draft prepared for the Smart India Hackathon 2026 NiyamGraph demonstration. It does not constitute official legal terms published or sanctioned by the All India Council for Technical Education (AICTE) or any statutory council.
              </p>
            </div>
          </div>

          {/* Policy Content Sections */}
          <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 pt-4 border-t border-slate-100">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-brand-navy">
                1. Purpose and Scope of the Platform
              </h2>
              <p className="leading-relaxed">
                NiyamGraph is designed as a rule-driven approval and compliance intelligence platform intended to facilitate digital interactions between technical institutions and statutory regulatory desks. By accessing or testing any portal within this application, you acknowledge that you are interacting with an engineering prototype.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-brand-navy">
                2. Authorized Portal Usage
              </h2>
              <p className="leading-relaxed">
                Access to the <strong>Institution Portal</strong> is reserved strictly for designated nodal officers and verified administrative representatives of technical institutions. Access to the <strong>AICTE Administration Portal</strong> is restricted to authorized regulatory officers, scrutiny desks, and committee experts. Unauthorized access, automated credential attacks, or tampering with regulatory state graphs is strictly prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-brand-navy">
                3. Truthfulness and Integrity of Submitted Records
              </h2>
              <p className="leading-relaxed">
                All institutional applications, land records, building safety certifications, faculty cadre returns, and compliance affidavits uploaded to the platform must represent truthful and verified records. Fraudulent submissions or falsification of regulatory compliance trigger statutory penalties and rejection under applicable Approval Process Handbook (APH) regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-brand-navy">
                4. Audit Trails and Non-Repudiation
              </h2>
              <p className="leading-relaxed">
                To guarantee absolute transparency, NiyamGraph maintains immutable, cryptographically verifiable audit logs for every uploaded document, inspection finding, scrutiny remark, and committee decision. Actions taken under authenticated accounts cannot be repudiated.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-brand-navy">
                5. Prototype Liability Disclaimer
              </h2>
              <p className="leading-relaxed">
                The software is provided &quot;as is&quot; for academic evaluation and architectural demonstration. The engineering team assumes no liability for operational decisions taken outside the designated hackathon simulation environment.
              </p>
            </section>
          </div>

          {/* First-Time User Policy Version Acknowledgement Flow Interface */}
          <div className="mt-8 pt-6 border-t border-slate-200 bg-slate-50 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-blue" aria-hidden="true" />
              <h3 className="text-sm font-bold text-brand-navy">
                First-Time Policy Acknowledgement Interface
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upon initial authentication with a live backend, the user&apos;s account record is checked for agreement to the active policy version (<code>v1.0-draft-2026</code>). Users acknowledge terms once upon initial onboarding or when major statutory revisions are promulgated.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="policy-ack"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
              />
              <label htmlFor="policy-ack" className="text-xs font-medium text-slate-800">
                I have read and acknowledge the Terms of Use (Prototype Simulation Flow)
              </label>
            </div>

            {acknowledged && (
              <p className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Simulated acknowledgment saved to active user session state.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

