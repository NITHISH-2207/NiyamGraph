import React, { useState } from 'react';
import {
  InstitutionProfileData,
  ApprovedProgramme,
  DocumentChecklistItem,
  FieldResponse,
  StatutoryDeclaration,
  ValidationIssue,
} from '../../../types/application';
import {
  FileText,
  Building2,
  GraduationCap,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Edit2,
  Lock,
  Send,
  X,
} from 'lucide-react';

interface ReviewSubmitSectionProps {
  isAdmin: boolean;
  referenceNumber: string;
  category: string;
  academicYear: string;
  profile: InstitutionProfileData;
  isProfileConfirmed: boolean;
  programmes: ApprovedProgramme[];
  responses: Record<string, FieldResponse>;
  documents: DocumentChecklistItem[];
  declaration: StatutoryDeclaration;
  onUpdateDeclaration: (updates: Partial<StatutoryDeclaration>) => void;
  validationIssues: ValidationIssue[];
  canSubmit: boolean;
  onGoToSection: (sectionIndex: number) => void;
  onSubmit: () => void;
}

export const ReviewSubmitSection: React.FC<ReviewSubmitSectionProps> = ({
  isAdmin,
  referenceNumber,
  category,
  academicYear,
  profile,
  isProfileConfirmed,
  programmes,
  responses,
  documents,
  declaration,
  onUpdateDeclaration,
  validationIssues,
  canSubmit,
  onGoToSection,
  onSubmit,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const errors = validationIssues.filter((i) => i.severity === 'error');
  const warnings = validationIssues.filter((i) => i.severity === 'warning');

  // Stats
  const confirmedProgsCount = programmes.filter((p) => p.confirmationStatus === 'Confirmed').length;
  const uploadedDocsCount = documents.filter((d) => d.status === 'Uploaded').length;
  const answeredDisclosuresCount = Object.values(responses).filter((r) => r.status !== 'Not Answered').length;
  const totalDisclosuresCount = Object.keys(responses).length;

  return (
    <div className="space-y-6">
      {/* Overview & Readiness Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <h2 className="text-base font-bold text-slate-900">
            Consolidated Application Review & Final Submission
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Carefully inspect all institutional disclosures and uploaded evidence prior to statutory submission.
          </p>
        </div>

        {/* Validation Issues Alert Box */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-800">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span>{errors.length} Mandatory Requirement(s) Incomplete</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-red-800 text-xs">
              {errors.map((err, i) => (
                <li key={i}>
                  <strong>{err.sectionTitle}:</strong> {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && errors.length === 0 && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{warnings.length} Advisory Item(s) to Verify</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800 text-xs">
              {warnings.map((w, i) => (
                <li key={i}>
                  <strong>{w.sectionTitle}:</strong> {w.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section Review Cards Grid */}
        <div className="space-y-4">
          {/* Section 1 Review */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-blue" />
                <span className="font-bold text-xs text-slate-900">
                  1. Application Information
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Category: <strong>{category}</strong> &bull; AY: <strong>{academicYear}</strong> &bull; Ref: <span className="font-mono">{referenceNumber}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGoToSection(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {/* Section 2 Review */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <span className="font-bold text-xs text-slate-900">
                  2. Institution Profile
                </span>
                {isProfileConfirmed ? (
                  <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Confirmed
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                    Pending Confirmation
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                {profile.officialName} (PID: <span className="font-mono">{profile.identifier}</span>) &bull; {profile.district}, {profile.state}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGoToSection(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {/* Section 3 Review */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-blue" />
                <span className="font-bold text-xs text-slate-900">
                  3. Approved Programmes
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                  {confirmedProgsCount} of {programmes.length} Confirmed
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Historical intake reviewed across {programmes.length} active academic programmes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGoToSection(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {/* Section 4 Review */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-blue" />
                <span className="font-bold text-xs text-slate-900">
                  4. Institutional Self-Disclosure
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                  {answeredDisclosuresCount} of {totalDisclosuresCount} Answered
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Disclosures filled across Groups A through H (Faculty, Infrastructure, Labs, Library, Safety).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGoToSection(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {/* Section 5 Review */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-brand-blue" />
                <span className="font-bold text-xs text-slate-900">
                  5. Document Checklist
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                  {uploadedDocsCount} Files Uploaded
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Affidavit 2, Fire NOC, Occupancy Certificate, Structural Stability, and geo-map.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGoToSection(5)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Section 6: Statutory Declaration */}
        <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldCheck className="w-5 h-5 text-brand-blue" />
            <span>Statutory Declaration & Authenticity Certification</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
            <p>
              I, the undersigned authorized representative on behalf of{' '}
              <strong>{profile.officialName}</strong> (PID:{' '}
              <span className="font-mono">{profile.identifier}</span>), hereby declare that all statements, measurements, student intakes, faculty profiles, and uploaded documents submitted in this application for Extension of Approval (EoA) for Academic Year <strong>{academicYear}</strong> are authentic, complete, and strictly compliant with AICTE Approval Process Handbook regulations.
            </p>
            <p>
              I understand that any misrepresentation, suppression of facts, or submission of fraudulent certificates will invite penal action under relevant provisions of the AICTE Act, 1987.
            </p>
            <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-2">
              Note: This declaration and signature-ready workflow serves as statutory administrative acknowledgement. Digital Signature Certificate (DSC) verification may be introduced in subsequent regulatory phases.
            </p>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
            <input
              id="declaration-accepted"
              type="checkbox"
              checked={declaration.accepted}
              onChange={(e) => onUpdateDeclaration({ accepted: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue shrink-0 cursor-pointer"
            />
            <label
              htmlFor="declaration-accepted"
              className="text-xs text-slate-800 font-semibold cursor-pointer select-none leading-relaxed"
            >
              I accept the statutory declaration and certify that I have verified all supporting evidence before submission.
            </label>
          </div>

          {/* Signatory Name & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label
                htmlFor="admin-name"
                className="text-xs font-semibold text-slate-700 block mb-1"
              >
                Authorized Signatory Name:
              </label>
              <input
                id="admin-name"
                type="text"
                value={declaration.adminName}
                onChange={(e) => onUpdateDeclaration({ adminName: e.target.value })}
                placeholder="Full Name of Principal / Director"
                className="w-full text-xs p-2.5 rounded-md border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label
                htmlFor="admin-designation"
                className="text-xs font-semibold text-slate-700 block mb-1"
              >
                Signatory Designation:
              </label>
              <input
                id="admin-designation"
                type="text"
                value={declaration.adminDesignation}
                onChange={(e) => onUpdateDeclaration({ adminDesignation: e.target.value })}
                placeholder="e.g. Principal / Director / Nodal Officer"
                className="w-full text-xs p-2.5 rounded-md border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Final Submission Block */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {!isAdmin ? (
              <span className="flex items-center gap-1.5 text-amber-800 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Final submission is restricted to <strong>Institution Admin</strong>. Institution Staff may review and save drafts.
                </span>
              </span>
            ) : !canSubmit ? (
              <span className="text-red-700 font-medium">
                Please resolve incomplete mandatory requirements above before submitting.
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                All statutory requirements validated and ready for submission.
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!isAdmin || !canSubmit}
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Submit Final Application</span>
          </button>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Confirm Final Regulatory Submission</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-900">{profile.officialName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Permanent ID (PID):</span>
                <span className="font-mono text-slate-800">{profile.identifier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-900">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Year:</span>
                <span className="font-bold text-brand-blue">{academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Signatory:</span>
                <span className="font-semibold text-slate-900">
                  {declaration.adminName} ({declaration.adminDesignation})
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
              <strong>Final Submission Warning:</strong>
              <p className="leading-relaxed">
                Once submitted, this application draft will be locked from further edits. An immutable regulatory snapshot and digital submission receipt will be generated for scrutiny.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Return to Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmit();
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
