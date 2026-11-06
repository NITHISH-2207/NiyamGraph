import React from 'react';
import {
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ApplicationInformationSectionProps {
  category: string;
  academicYear: string;
  referenceNumber: string;
  status: string;
  rulesetVersion: string;
  onContinue: () => void;
}

export const ApplicationInformationSection: React.FC<ApplicationInformationSectionProps> = ({
  category,
  academicYear,
  referenceNumber,
  status,
  rulesetVersion,
  onContinue,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Application Information & Scope
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Review regulatory parameters governing this submission cycle before entering disclosures.
            </p>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Ruleset: {rulesetVersion}
          </span>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
              Application Category
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {category}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
              Academic Year
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-blue">
              <Calendar className="w-3.5 h-3.5" />
              <span>{academicYear}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
              Application Reference
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 block">
              {referenceNumber}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
              Current Filing Status
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{status} (Draft Preparation)</span>
            </div>
          </div>
        </div>

        {/* Regulatory Scope Warning Banner */}
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm block">Important Category Advisory</span>
            <p className="leading-relaxed">
              This workflow is strictly intended for <strong>Extension of Approval (EoA) based on Self-Disclosure</strong> without variations.
              If your institution intends to apply for an <strong>Increase in Intake</strong>, <strong>Introduction of New Courses</strong>, <strong>Closure</strong>, <strong>Restoration of Intake</strong>, or <strong>Break in EoA</strong>, a separate application category is required under AICTE Approval Process Handbook (APH) regulations.
            </p>
          </div>
        </div>

        {/* Preparation Guidelines */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            <span>Submission Checklist & Readiness Steps</span>
          </div>

          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>
              <strong>Institution Profile:</strong> Check official permanent PID, addresses, leadership, and affiliating university records.
            </li>
            <li>
              <strong>Approved Programmes:</strong> Review historical intakes. Discrepancies must be flagged prior to final declaration.
            </li>
            <li>
              <strong>Self-Disclosure:</strong> Ensure all Groups A through H have been truthfully disclosed with accurate quantities.
            </li>
            <li>
              <strong>Document Verification:</strong> Keep scanned PDF copies of statutory Fire NOC, Building Occupancy, and Affidavit 2 ready.
            </li>
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue-hover focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors shadow-xs"
        >
          <span>Continue to Institution Profile</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
