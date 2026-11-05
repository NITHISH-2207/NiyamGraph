import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, Database, FileCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
            <li className="text-slate-800 font-medium">Privacy Policy</li>
          </ol>
        </nav>

        {/* Content Box */}
        <div className="bg-white p-8 sm:p-10 rounded-xl border border-brand-border shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
                Privacy Policy &amp; Data Governance
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
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900 text-sm">
                DRAFT – Not Legally Approved
              </p>
              <p className="leading-relaxed">
                This document is a technical privacy and data handling specification for the NiyamGraph software architecture. It is an engineering draft prepared for Smart India Hackathon 2026 and has not been legally certified by government authorities.
              </p>
            </div>
          </div>

          {/* Privacy Articles */}
          <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 pt-4 border-t border-slate-100">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-brand-navy">
                1. Information Collected and Processed
              </h2>
              <p className="leading-relaxed">
                NiyamGraph processes two primary categories of information necessary for statutory compliance:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  <strong>Institutional Compliance Records:</strong> Land titles, building stability approvals, fire safety certificates, library volume counts, laboratory equipment declarations, and faculty-to-student cadre ratios.
                </li>
                <li>
                  <strong>Authorized Representative Profile Data:</strong> Official institutional email addresses, statutory representative names, and cryptographic authentication logs.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-brand-navy">
                2. Purpose of Data Processing
              </h2>
              <p className="leading-relaxed">
                Data is processed solely for statutory regulatory validation, automated rule evaluation under the Approval Process Handbook, coordination of Expert Visit Committees (EVC), and generation of digital Extension of Approval (EoA) decisions.
              </p>
            </section>

            {/* Anchored Data Handling Protocol Section */}
            <section id="data-handling" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                <h2 className="text-base font-bold text-brand-navy">
                  3. Statutory Data Handling Protocol
                </h2>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-brand-border space-y-3 text-xs text-slate-600">
                <p className="font-medium text-slate-800">
                  Technical Architecture Controls:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                    <p className="font-bold text-brand-navy flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brand-blue" />
                      Encryption in Transit &amp; Rest
                    </p>
                    <p>All REST API communication enforces TLS 1.3. Persistent database tables utilize AES-256 block-level encryption.</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                    <p className="font-bold text-brand-navy flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-brand-gold" />
                      Row-Level Security (RLS)
                    </p>
                    <p>PostgreSQL tenant policies ensure institutions can inspect only their own verified filings and deficiency notices.</p>
                  </div>
                </div>
                <p className="pt-2 text-[11px] text-slate-500">
                  <strong>Notice:</strong> Specific production data hosting locations, sovereignty certifications, and formal Data Protection Officer (DPO) designations are reserved for post-hackathon statutory deployment.
                </p>
              </div>
            </section>

            <section className="space-y-2 pt-4">
              <h2 className="text-base font-bold text-brand-navy">
                4. Data Retention and Archival
              </h2>
              <p className="leading-relaxed">
                Approved applications, sanction letters, and deficiency records are retained for a minimum statutory period corresponding to the academic accreditation cycle (typically 5 to 7 academic years) to satisfy regulatory audit requirements.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

