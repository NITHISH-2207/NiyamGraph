import React, { useState } from 'react';
import { ApprovedProgramme, ProgrammeConfirmationStatus } from '../../../types/application';
import {
  CheckCircle2,
  AlertTriangle,
  Check,
  Flag,
  FileQuestion,
  X,
  History,
} from 'lucide-react';

interface ApprovedProgrammesSectionProps {
  programmes: ApprovedProgramme[];
  onUpdateProgrammeConfirmation: (
    id: string,
    status: ProgrammeConfirmationStatus,
    remarks?: string
  ) => void;
  onConfirmAll: () => void;
}

export const ApprovedProgrammesSection: React.FC<ApprovedProgrammesSectionProps> = ({
  programmes,
  onUpdateProgrammeConfirmation,
  onConfirmAll,
}) => {
  const [flagModalProgId, setFlagModalProgId] = useState<string | null>(null);
  const [issueRemarks, setIssueRemarks] = useState('');

  const handleOpenFlagModal = (id: string) => {
    setFlagModalProgId(id);
    const existing = programmes.find((p) => p.id === id)?.reportedIssueRemarks || '';
    setIssueRemarks(existing);
  };

  const handleSaveFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (flagModalProgId) {
      onUpdateProgrammeConfirmation(flagModalProgId, 'Issue Reported', issueRemarks);
      setFlagModalProgId(null);
    }
  };

  const allConfirmed =
    programmes.length > 0 &&
    programmes.every((p) => p.confirmationStatus === 'Confirmed');

  if (programmes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Approved Programme Information is Currently Unavailable
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          No previously approved courses or intake records were retrieved from the central AICTE registry for this institution. Please check your network or submit a profile correction request note.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Intake Notice */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Existing Approved Programmes & Historical Intake
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Verify previously sanctioned courses and seats for the preceding academic cycle.
            </p>
          </div>

          <button
            type="button"
            onClick={onConfirmAll}
            disabled={allConfirmed}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm All Programmes</span>
          </button>
        </div>

        {/* Historical Intake Policy Warning */}
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 mb-5">
          <History className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Historical Intake Protection:</strong> Approved intake values reflect official Council sanctions from the previous academic year. Direct modification of approved seats is prohibited in standard EoA. If your institution seeks an <strong>Increase in Intake</strong> or <strong>New Courses</strong>, those changes must be processed through their designated approval workflow categories.
          </div>
        </div>

        {/* Programmes Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3">Level</th>
                <th className="p-3">Programme & Course</th>
                <th className="p-3">Specialization</th>
                <th className="p-3 text-center">Approved Intake</th>
                <th className="p-3">Status</th>
                <th className="p-3">Confirmation</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {programmes.map((prog) => {
                const isConfirmed = prog.confirmationStatus === 'Confirmed';
                const isFlagged = prog.confirmationStatus === 'Issue Reported';

                return (
                  <tr
                    key={prog.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isConfirmed
                        ? 'bg-emerald-50/20'
                        : isFlagged
                        ? 'bg-amber-50/30'
                        : ''
                    }`}
                  >
                    <td className="p-3 font-medium text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {prog.programmeLevel}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{prog.course}</div>
                      <div className="text-[11px] text-slate-500">{prog.programmeName}</div>
                      {prog.previousApprovalRef && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Ref: {prog.previousApprovalRef}
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-slate-700">{prog.specialization}</td>

                    <td className="p-3 text-center">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {prog.approvedIntake}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {prog.currentStatus}
                      </span>
                    </td>

                    <td className="p-3">
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmed
                        </span>
                      )}
                      {isFlagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Issue Reported
                        </span>
                      )}
                      {!isConfirmed && !isFlagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                          Pending Review
                        </span>
                      )}

                      {isFlagged && prog.reportedIssueRemarks && (
                        <p className="text-[10px] text-amber-800 italic mt-1 max-w-xs truncate">
                          &ldquo;{prog.reportedIssueRemarks}&rdquo;
                        </p>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateProgrammeConfirmation(
                              prog.id,
                              isConfirmed ? 'Pending Confirmation' : 'Confirmed'
                            )
                          }
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                            isConfirmed
                              ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {isConfirmed ? 'Undo' : 'Confirm'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenFlagModal(prog.id)}
                          className="p-1 rounded text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="Report discrepancy or discontinuation"
                          aria-label={`Report discrepancy for ${prog.course}`}
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flag Issue Modal */}
      {flagModalProgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Report Programme Discrepancy</span>
              </div>
              <button
                type="button"
                onClick={() => setFlagModalProgId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Record discrepancies regarding course nomenclature, previously sanctioned seats, or programmes pending closure.
            </p>

            <form onSubmit={handleSaveFlag} className="space-y-4">
              <div>
                <label
                  htmlFor="prog-remarks-input"
                  className="text-xs font-semibold text-slate-700 block mb-1"
                >
                  Discrepancy Description:
                </label>
                <textarea
                  id="prog-remarks-input"
                  rows={3}
                  value={issueRemarks}
                  onChange={(e) => setIssueRemarks(e.target.value)}
                  placeholder="e.g. Sanctioned intake in 2025-26 approval letter was 120, but registry displays 60..."
                  className="w-full text-xs p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFlagModalProgId(null)}
                  className="px-3.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-xs"
                >
                  Record Discrepancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
