import React from 'react';
import { X, Printer, Shield, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { ApplicationDetail, ConsolidatedReport } from '../../types/compliance';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationDetail;
  report?: ConsolidatedReport | null;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  application,
  report,
}) => {
  if (!isOpen) return null;

  const assessment = application.assessment;
  const scrutiny = application.scrutiny_report;
  const evc = application.evc_report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-card shadow-2xl border border-border w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Actions (no-print) */}
        <div className="bg-navy-800 text-white px-5 py-3.5 flex items-center justify-between no-print flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-saffron-500" />
            <span className="font-semibold text-sm">
              Consolidated Regulatory Compliance Report Preview
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-saffron-500 hover:bg-saffron-600 text-navy-950 font-bold text-xs shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-navy-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-6 bg-white text-txt-primary">
          {/* Institutional Header */}
          <div className="border-b-2 border-navy-800 pb-5 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-navy-800 font-bold text-lg uppercase tracking-wider">
              <Shield className="w-6 h-6 text-saffron-500" />
              <span>NiyamGraph Regulatory Governance Platform</span>
            </div>
            <p className="text-xs text-txt-secondary font-medium uppercase tracking-wide">
              Statutory Technical Institutional Approval & Compliance Assessment
            </p>
            <p className="text-[11px] text-slate-400">
              Government of India — Western Regional Regulatory Directorate (Cycle 2026-27)
            </p>
          </div>

          {/* Reference Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-txt-secondary block">Application ID:</span>
              <strong className="text-navy-900 font-mono text-sm">{application.application_id}</strong>
            </div>
            <div>
              <span className="text-txt-secondary block">Report Reference:</span>
              <strong className="text-navy-900 font-mono">{report?.report_reference || 'DRAFT-ASSESSMENT'}</strong>
            </div>
            <div>
              <span className="text-txt-secondary block">Scrutiny Ref:</span>
              <span className="font-mono text-slate-700">{scrutiny?.report_reference || 'PENDING'}</span>
            </div>
            <div>
              <span className="text-txt-secondary block">EVC Inspection Ref:</span>
              <span className="font-mono text-slate-700">{evc?.report_reference || 'PENDING'}</span>
            </div>
          </div>

          {/* Institution Summary */}
          <div className="p-4 rounded-lg border border-border space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
              <span className="text-txt-secondary font-medium">Institution Name:</span>
              <span className="font-bold text-sm text-navy-900">{application.institution.name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div>
                <span className="text-txt-secondary">Institution ID: </span>
                <span className="font-semibold text-slate-800">{application.institution.institution_id}</span>
              </div>
              <div>
                <span className="text-txt-secondary">Application Type: </span>
                <span className="font-semibold text-slate-800">{application.application_type}</span>
              </div>
              <div>
                <span className="text-txt-secondary">Regional Office: </span>
                <span className="font-semibold text-slate-800">{application.regional_office}</span>
              </div>
            </div>
          </div>

          {/* Compliance Score Summary */}
          {assessment && (
            <div className="p-4 rounded-lg bg-navy-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
                  Consolidated Compliance Index
                </span>
                <h4 className="text-2xl font-bold mt-0.5">
                  {assessment.compliance_percentage}% Compliant
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {assessment.satisfied_requirements} of {assessment.total_applicable_requirements} statutory requirements satisfied.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded bg-navy-700 font-medium">
                  Deficiencies: <strong className="text-rose-300">{assessment.potential_deficiencies}</strong>
                </span>
                <span className="px-3 py-1.5 rounded bg-navy-700 font-medium">
                  Conflicts: <strong className="text-amber-300">{assessment.conflicting_findings}</strong>
                </span>
                <span className="px-3 py-1.5 rounded bg-navy-700 font-medium">
                  Gate: <strong className="text-emerald-300">{assessment.assessment_status}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Findings Table */}
          {assessment && assessment.findings.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Requirement-Wise Cross-Committee Evaluation Matrix
              </h5>
              <div className="border border-border rounded-lg overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-border">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Requirement & Reference</th>
                      <th className="p-2.5">Scrutiny Finding</th>
                      <th className="p-2.5">EVC Finding</th>
                      <th className="p-2.5">Consolidated Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assessment.findings.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-mono font-bold text-navy-900 whitespace-nowrap">
                          {f.requirement_code}
                          {f.mandatory && <span className="text-red-500 ml-0.5">*</span>}
                        </td>
                        <td className="p-2.5">
                          <span className="font-semibold block text-slate-800">{f.requirement_name}</span>
                          <span className="text-[10px] text-slate-400">{f.regulatory_reference}</span>
                        </td>
                        <td className="p-2.5 text-slate-600 max-w-[160px]">
                          {f.scrutiny_finding_text || <span className="italic text-slate-400">Not verified</span>}
                        </td>
                        <td className="p-2.5 text-slate-600 max-w-[160px]">
                          {f.evc_finding_text || <span className="italic text-slate-400">Not verified</span>}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              f.compliance_status === 'Satisfied'
                                ? 'bg-emerald-100 text-emerald-800'
                                : f.compliance_status.includes('Deficien')
                                ? 'bg-rose-100 text-rose-800'
                                : f.compliance_status.includes('Conflict')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {f.compliance_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Officer Remarks & Recommendation */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div>
              <span className="font-bold text-navy-900 uppercase tracking-wider block mb-1">
                Compliance Officer Assessment Remarks:
              </span>
              <p className="text-txt-primary whitespace-pre-wrap leading-relaxed">
                {report?.officer_remarks || 'Pending submission remarks from Compliance Officer.'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-txt-secondary block">Statutory Recommendation:</span>
                <strong className="text-navy-900 text-sm">
                  {report?.approval_recommendation || 'Conditional Approval / Action Required'}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-txt-secondary block">Assessing Officer:</span>
                <strong className="text-navy-900">{application.assigned_compliance_officer}</strong>
              </div>
            </div>
          </div>

          {/* Legal / Prototype Disclaimer */}
          <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-3 text-center">
            * This is an automated consolidated assessment document generated by the NiyamGraph prototype platform.
            Final authoritative regulatory decisions belong to the designated Competent Regulatory Authority.
          </div>
        </div>
      </div>
    </div>
  );
};

