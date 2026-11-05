import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  Mail,
  FileQuestion,
  GraduationCap,
  Landmark,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does an institution obtain verified credentials for NiyamGraph?',
      a: 'In accordance with AICTE statutory protocol, institutions are pre-registered using their permanent Institute Permanent ID (PID) registered in the national directory. Nodal officers receive initial cryptographic activation credentials directly at their authorized email on file.',
    },
    {
      q: 'What is the standard rectification window for deficiency notices?',
      a: 'When a Regional Scrutiny desk issues a deficiency query, the regulatory clock triggers a 15-day rectification window. Institutions can upload amended affidavits, faculty appointment letters, or structural certificates directly via the Institution Portal.',
    },
    {
      q: 'Can multiple representatives log in on behalf of one college?',
      a: 'Yes. While the Institution ID / PID uniquely binds the college profile, the architecture supports multi-user role assignments (e.g. Principal, Registrar, Head of Department) tied to individual verified representative emails.',
    },
    {
      q: 'What should an AICTE official do if multi-factor authentication (MFA) fails?',
      a: 'Official administrative accounts are secured through hardware/app TOTP authenticators. If access to the authenticator device is lost, the official must contact the Central System Administrator at Headquarters to initiate an identity verification reset.',
    },
    {
      q: 'Are Extension of Approval (EoA) sanction letters generated digitally?',
      a: 'Yes. Once an application satisfies all rule engine prerequisites and receives competent executive sanction, a tamper-evident digital EoA document embedded with a verifiable cryptographic QR signature is generated.',
    },
  ];

  return (
    <div className="py-12 md:py-16 bg-brand-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-brand-navy">Home</Link>
            </li>
            <li>/</li>
            <li className="text-slate-800 font-medium">Help &amp; Support</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="bg-white p-8 rounded-xl border border-brand-border shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100">
              <HelpCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
                Help &amp; Regulatory Guidance
              </h1>
              <p className="text-xs text-slate-500">
                Statutory Technical Assistance • Knowledge Base • Nodal Desk Support
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pt-2">
            Find answers to common procedural inquiries regarding application submission, deficiency rectification, committee inspections, and portal authentication.
          </p>
        </div>

        {/* Quick Portal Switcher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-white border border-brand-border space-y-3">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
              <GraduationCap className="w-5 h-5" />
              <span>Institution Portal Help</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assistance with AICTE Permanent ID verification, document uploads, fee payment validations, and EoA tracking.
            </p>
            <Link
              to="/institution/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-navy"
            >
              <span>Go to Institution Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-lg bg-white border border-brand-border space-y-3">
            <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
              <Landmark className="w-5 h-5" />
              <span>AICTE Official Desk Support</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Guidance for Regional Office scrutiny officers, EVC chairpersons, Standing Appellate Committee members.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-navy hover:text-brand-blue"
            >
              <span>Go to Official Login</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white p-8 rounded-xl border border-brand-border shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <FileQuestion className="w-5 h-5 text-brand-blue" aria-hidden="true" />
            <h2 className="text-lg font-bold text-brand-navy">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 font-semibold text-sm text-brand-navy hover:text-brand-blue transition-colors focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-blue' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-3 text-xs text-slate-600 leading-relaxed pl-1 pr-6 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Anchored Contact Section */}
        <section id="contact" className="scroll-mt-28 bg-white p-8 rounded-xl border border-brand-border shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-blue" aria-hidden="true" />
            <h2 className="text-lg font-bold text-brand-navy">
              Contact Helpdesk Placeholder
            </h2>
          </div>

          {/* Prototype disclaimer notice */}
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-bold">Prototype Demonstration Environment</p>
              <p className="leading-relaxed">
                In adherence to project rules, official telephone numbers, private contact addresses, and government email inboxes are not published here. For Smart India Hackathon 2026 jury questions, please consult the student project repository documentation and issue trackers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-600">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-800">Hackathon Evaluation Desk</p>
              <p>Smart India Hackathon 2026 Project Repository</p>
              <p className="text-slate-500">Track: Rule-driven Approvals &amp; Compliance Intelligence</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-800">Statutory Nodal Integration</p>
              <p>Simulated API Gateway: <code>localhost:8000/api/v1</code></p>
              <p className="text-slate-500">Supabase RLS &amp; FastAPI Validation Pipeline</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

