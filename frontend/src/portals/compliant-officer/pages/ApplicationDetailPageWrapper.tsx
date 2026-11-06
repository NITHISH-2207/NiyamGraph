import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building,
  Calendar,
  MapPin,
  Mail,
  Phone,
  FileCheck2,
  Building2,
  Scale,
  ClipboardList,
  History,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Printer,
  HelpCircle,
  Play,
  Save,
  Send,
  Eye,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import {
  ApplicationDetail,
  ComplianceFinding,
  ConsolidatedReport
} from '../types/compliance';
import { StatusBadge } from '../components/common/StatusBadge';
import { WorkflowTimeline } from '../components/common/WorkflowTimeline';
import { ClarificationModal } from '../components/common/ClarificationModal';
import { EvidenceModal } from '../components/common/EvidenceModal';
import { ReportPreviewModal } from '../components/common/ReportPreviewModal';

interface ApplicationDetailPageWrapperProps {
  applicationId: number;
  onBack: () => void;
}

export const ApplicationDetailPageWrapper: React.FC<ApplicationDetailPageWrapperProps> = ({
  applicationId,
  onBack,
}) => {
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assessment' | 'scrutiny' | 'evc' | 'report' | 'conditions' | 'institution' | 'audit'>('assessment');

  // Modals state
  const [clarificationModal, setClarificationModal] = useState<{
    open: boolean;
    type: 'Scrutiny' | 'EVC';
    reportRef: string;
    officer: string;
    findingCode?: string;
    findingText?: string;
  }>({
    open: false,
    type: 'Scrutiny',
    reportRef: '',
    officer: '',
  });

  const [evidenceModal, setEvidenceModal] = useState<{
    open: boolean;
    title: string;
    ref: string;
    category: string;
    notes?: string;
  }>({
    open: false,
    title: '',
    ref: '',
    category: '',
  });

  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Consolidated draft form
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [recommendation, setRecommendation] = useState('Conditional Approval / Action Required');
  const [draftSubmitting, setDraftSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getApplicationDetail(applicationId);
      setApp(res);
      if (res.consolidated_report) {
        setOfficerRemarks(res.consolidated_report.officer_remarks || '');
        setRecommendation(res.consolidated_report.approval_recommendation || 'Conditional Approval / Action Required');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [applicationId]);

  const handleRunAssessment = async () => {
    if (!app) return;
    try {
      setDraftSubmitting(true);
      setActionSuccess(null);
      const updatedAssessment = await api.runAssessmentEngine(app.id);
      setActionSuccess('Intelligent Compliance Engine executed! Cross-referenced reports against regulatory criteria.');
      await fetchDetail();
    } catch (err: any) {
      alert(`Assessment Error: ${err.message}`);
    } finally {
      setDraftSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!app) return;
    try {
      setDraftSubmitting(true);
      setActionSuccess(null);
      await api.draftConsolidatedReport(app.id, officerRemarks, recommendation);
      setActionSuccess('Draft consolidated report saved successfully.');
      await fetchDetail();
    } catch (err: any) {
      alert(`Draft Error: ${err.message}`);
    } finally {
      setDraftSubmitting(false);
    }
  };

  const handleSubmitFinalReport = async () => {
    if (!app || !app.consolidated_report) return;
    const confirmSubmit = window.confirm(
      'Are you sure you want to officially submit this Consolidated Compliance Assessment? Once submitted, the assessment is locked and transmitted to the next approval stage.'
    );
    if (!confirmSubmit) return;

    try {
      setDraftSubmitting(true);
      setActionSuccess(null);
      await api.submitConsolidatedReport(app.consolidated_report.id);
      setActionSuccess('Consolidated Compliance Report submitted successfully to the regulatory decision authority.');
      await fetchDetail();
    } catch (err: any) {
      alert(`Submission Blocked: ${err.message}`);
    } finally {
      setDraftSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-navy-800 animate-spin" />
        <span className="text-xs font-semibold text-txt-secondary">
          Loading institutional dossier and committee findings...
        </span>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-card text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
        <h4 className="text-base font-bold text-red-800">Application Record Not Found</h4>
        <p className="text-xs text-red-600">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-navy-800 text-white rounded-lg text-xs font-semibold"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const assessment = app.assessment;
  const scrutiny = app.scrutiny_report;
  const evc = app.evc_report;
  const report = app.consolidated_report;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Application Identifier Card */}
      <div className="bg-white rounded-card border border-border p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-navy-900 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Application Registry</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-navy-900 text-xs font-bold transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-navy-800" />
              <span>Print Preview</span>
            </button>
            <button
              onClick={handleRunAssessment}
              disabled={draftSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-saffron-500" />
              <span>Run Assessment Engine</span>
            </button>
          </div>
        </div>

        {/* Header Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-navy-950 px-2 py-0.5 rounded bg-surface-subtle border border-border">
                {app.application_id}
              </span>
              <StatusBadge status={app.compliance_status} size="md" />
              <span className="text-xs text-txt-secondary font-medium">
                Cycle {app.academic_year}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-navy-900">
              {app.institution.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-txt-secondary pt-0.5">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-navy-600" />
                Type: <strong className="text-txt-primary">{app.application_type}</strong>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-navy-600" />
                Region: <strong className="text-txt-primary">{app.regional_office}</strong>
              </span>
              <span>
                Institution ID: <strong className="text-txt-primary">{app.institution.institution_id}</strong>
              </span>
            </div>
          </div>

          {/* Quick Compliance Gauge */}
          {assessment && (
            <div className="bg-navy-800 text-white rounded-lg p-3.5 flex items-center gap-4 flex-shrink-0">
              <div className="text-center pr-3 border-r border-navy-700">
                <div className="text-2xl font-bold text-saffron-500 leading-tight">
                  {assessment.compliance_percentage}%
                </div>
                <div className="text-[10px] text-slate-300 font-medium">Compliance Rate</div>
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Statutory Gate:</span>
                  <strong className="text-emerald-300">{assessment.assessment_status}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Satisfied:</span>
                  <strong>{assessment.satisfied_requirements} / {assessment.total_applicable_requirements}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Deficiencies:</span>
                  <strong className="text-rose-300">{assessment.potential_deficiencies}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Stage Timeline */}
      <WorkflowTimeline
        currentStage={app.current_stage}
        scrutinyStatus={app.scrutiny_status}
        evcStatus={app.evc_status}
        complianceStatus={app.compliance_status}
      />

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-3.5 rounded-card bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'assessment'
              ? 'border-navy-800 text-navy-900 bg-white'
              : 'border-transparent text-txt-secondary hover:text-navy-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Intelligent Assessment Engine</span>
          {assessment && assessment.conflicting_findings > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {assessment.conflicting_findings} Conflicts
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('scrutiny')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'scrutiny'
              ? 'border-navy-800 text-navy-900 bg-white'
              : 'border-transparent text-txt-secondary hover:text-navy-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Scrutiny Report</span>
          <StatusBadge status={app.scrutiny_status} size="sm" showDot={false} />
        </button>

        <button
          onClick={() => setActiveTab('evc')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'evc'
              ? 'border-navy-800 text-navy-900 bg-white'
              : 'border-transparent text-txt-secondary hover:text-navy-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>EVC Inspection Report</span>
          <StatusBadge status={app.evc_status} size="sm" showDot={false} />
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'report'
              ? 'border-navy-800 text-navy-900 bg-white'
              : 'border-transparent text-txt-secondary hover:text-navy-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Consolidated Report & Submission</span>
          {report && <StatusBadge status={report.report_status} size="sm" showDot={false} />}
        </button>

        <button
          onClick={() => setActiveTab('conditions')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'conditions'
              ? 'border-navy-800 text-navy-900 bg-white'
              : 'border-transparent text-txt-secondary hover:text-navy-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Approval Conditions ({app.approval_conditions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('institution')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'institution'
              ? 'border-navy-800 text-navy-900 bg-white'
              : 'border-transparent text-txt-secondary hover:text-navy-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Institution Dossier</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-navy-800 text-navy-900 bg-white'
              : 'border-transparent text-txt-secondary hover:text-navy-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Flagship Assessment Engine View */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          {/* Mandatory Compliance Gate Card */}
          {assessment && (
            <div className="bg-white rounded-card border border-border p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-5 h-5 text-navy-800" />
                  <h3 className="text-sm font-bold text-navy-900">
                    Mandatory Regulatory Gate Status
                  </h3>
                </div>
                <StatusBadge status={assessment.assessment_status} size="md" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="text-txt-secondary block">Total Applicable</span>
                  <strong className="text-base text-navy-900">{assessment.total_applicable_requirements} Criteria</strong>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <span className="text-emerald-800 block">Satisfied / Verified</span>
                  <strong className="text-base text-emerald-900">{assessment.satisfied_requirements} Norms</strong>
                </div>
                <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-200">
                  <span className="text-rose-800 block">Critical Deficiencies</span>
                  <strong className="text-base text-rose-900">{assessment.potential_deficiencies} Shortfalls</strong>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                  <span className="text-amber-800 block">Conflicting Findings</span>
                  <strong className="text-base text-amber-900">{assessment.conflicting_findings} Flags</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-txt-secondary flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-navy-800 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-navy-900">Assessment Rule: </strong>
                  {assessment.engine_summary}
                </p>
              </div>
            </div>
          )}

          {/* Requirement Comparison Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">
                Requirement-Level Cross-Committee Findings & Evidence Traceability
              </h3>
              <span className="text-xs text-txt-secondary">
                {assessment?.findings.length || 0} statutory items evaluated
              </span>
            </div>

            {assessment && assessment.findings.length > 0 ? (
              <div className="space-y-3">
                {assessment.findings.map((f) => {
                  const isConflict = f.compliance_status === 'Conflicting Findings';
                  const isDeficient = f.compliance_status === 'Potential Deficiency';
                  const isMissing = f.compliance_status === 'Evidence Missing';

                  return (
                    <div
                      key={f.id}
                      className={`bg-white rounded-card border transition-all p-4.5 space-y-3 ${
                        isConflict
                          ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                          : isDeficient
                          ? 'border-rose-300 bg-rose-50/10'
                          : 'border-border'
                      }`}
                    >
                      {/* Finding Title & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-navy-900 px-2 py-0.5 rounded bg-surface-subtle border border-border">
                            {f.requirement_code}
                          </span>
                          <h4 className="text-sm font-bold text-txt-primary">
                            {f.requirement_name}
                          </h4>
                          {f.mandatory && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                              Mandatory
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-txt-secondary font-mono">{f.regulatory_reference}</span>
                          <StatusBadge status={f.compliance_status} size="sm" />
                        </div>
                      </div>

                      {/* Side by side comparison: Scrutiny vs EVC */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Scrutiny documentary finding */}
                        <div className="p-3 rounded-lg bg-surface-subtle border border-border space-y-1">
                          <div className="flex items-center justify-between font-semibold text-navy-900">
                            <span className="flex items-center gap-1.5">
                              <FileCheck2 className="w-3.5 h-3.5 text-navy-600" />
                              Scrutiny Document Finding:
                            </span>
                            <StatusBadge status={f.scrutiny_finding_status || 'Pending'} size="sm" showDot={false} />
                          </div>
                          <p className="text-txt-primary leading-relaxed">
                            {f.scrutiny_finding_text || <span className="italic text-slate-400">Scrutiny report not yet submitted for this requirement.</span>}
                          </p>
                        </div>

                        {/* EVC physical inspection finding */}
                        <div className="p-3 rounded-lg bg-surface-subtle border border-border space-y-1">
                          <div className="flex items-center justify-between font-semibold text-navy-900">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-navy-600" />
                              EVC Physical Site Finding:
                            </span>
                            <StatusBadge status={f.evc_finding_status || 'Pending'} size="sm" showDot={false} />
                          </div>
                          <p className="text-txt-primary leading-relaxed">
                            {f.evc_finding_text || <span className="italic text-slate-400">EVC physical inspection not yet submitted for this requirement.</span>}
                          </p>
                        </div>
                      </div>

                      {/* Engine Reasoning & Evidence Traceability */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-navy-900">
                          <Scale className="w-3.5 h-3.5 text-saffron-600" />
                          <span>Intelligent Engine Determination:</span>
                        </div>
                        <p className="text-txt-primary leading-relaxed">{f.reasoning}</p>
                        {f.evidence_summary && (
                          <div className="pt-1.5 text-[11px] text-txt-secondary border-t border-slate-200/80 font-mono">
                            Evidence Source: {f.evidence_summary}
                          </div>
                        )}
                      </div>

                      {/* Officer Clarification or Remark trigger */}
                      {isConflict && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Requires Compliance Officer conflict resolution or clarification request.
                          </span>
                          <button
                            onClick={() =>
                              setClarificationModal({
                                open: true,
                                type: 'EVC',
                                reportRef: evc?.report_reference || 'EVC-REF',
                                officer: evc?.evc_officer_name || 'EVC Officer',
                                findingCode: f.requirement_code,
                                findingText: f.reasoning,
                              })
                            }
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                          >
                            Request Clarification &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-card border border-border p-10 text-center space-y-3">
                <Scale className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-navy-900">Assessment Engine Not Yet Executed</h4>
                <p className="text-xs text-txt-secondary max-w-md mx-auto">
                  Click the button below to cross-evaluate Scrutiny and EVC submissions against statutory regulations.
                </p>
                <button
                  onClick={handleRunAssessment}
                  disabled={draftSubmitting}
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                  Generate Initial Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Scrutiny Report Review */}
      {activeTab === 'scrutiny' && (
        <div className="space-y-5">
          {scrutiny ? (
            <div className="bg-white rounded-card border border-border p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-navy-900">{scrutiny.report_reference}</span>
                    <StatusBadge status={scrutiny.report_status} size="sm" />
                  </div>
                  <p className="text-xs text-txt-secondary mt-0.5">
                    Submitted by {scrutiny.scrutiny_officer_name} on {new Date(scrutiny.submitted_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setClarificationModal({
                        open: true,
                        type: 'Scrutiny',
                        reportRef: scrutiny.report_reference,
                        officer: scrutiny.scrutiny_officer_name,
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-surface-subtle text-navy-900 text-xs font-semibold transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-navy-700" />
                    <span>Request Clarification</span>
                  </button>
                  <button
                    onClick={async () => {
                      await api.reviewScrutinyReport(scrutiny.id, 'Scrutiny report reviewed by Compliance Officer.');
                      setActionSuccess('Scrutiny report marked reviewed.');
                      fetchDetail();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Mark Review Complete
                  </button>
                </div>
              </div>

              {/* Scrutiny Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-surface-subtle rounded-lg border border-border">
                  <span className="text-txt-secondary block">Total Checked</span>
                  <strong className="text-base text-navy-900">{scrutiny.total_checked}</strong>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-emerald-800 block">Satisfied</span>
                  <strong className="text-base text-emerald-900">{scrutiny.satisfied_count}</strong>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-rose-800 block">Deficient</span>
                  <strong className="text-base text-rose-900">{scrutiny.deficient_count}</strong>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-amber-800 block">Missing Documents</span>
                  <strong className="text-base text-amber-900">{scrutiny.missing_docs_count}</strong>
                </div>
              </div>

              {/* Scrutiny Findings List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Documentary Verification Checklist Items
                </h4>
                <div className="border border-border rounded-lg overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-txt-secondary border-b border-border">
                      <tr>
                        <th className="p-3">Req Code</th>
                        <th className="p-3">Requirement</th>
                        <th className="p-3">Documentary Finding</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scrutiny.findings.map((sf) => (
                        <tr key={sf.id} className="hover:bg-slate-50/60">
                          <td className="p-3 font-mono font-bold text-navy-900 whitespace-nowrap">
                            {sf.requirement_code}
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            {sf.requirement_name}
                          </td>
                          <td className="p-3 text-slate-700 max-w-xs">
                            {sf.finding}
                            {sf.remarks && (
                              <span className="text-[11px] text-slate-400 block mt-0.5">{sf.remarks}</span>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <StatusBadge status={sf.finding_status} size="sm" />
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {sf.evidence_reference ? (
                              <button
                                onClick={() =>
                                  setEvidenceModal({
                                    open: true,
                                    title: sf.requirement_name || 'Document Verification',
                                    ref: sf.evidence_reference || 'REF',
                                    category: sf.category || 'Documentation',
                                    notes: sf.remarks,
                                  })
                                }
                                className="text-navy-600 font-semibold hover:underline flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{sf.evidence_reference}</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-border p-10 text-center space-y-2">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-navy-900">Scrutiny Report Not Yet Submitted</h4>
              <p className="text-xs text-txt-secondary">
                Document verification is in progress by Nirmal Kumar's scrutiny team.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: EVC Report Review */}
      {activeTab === 'evc' && (
        <div className="space-y-5">
          {evc ? (
            <div className="bg-white rounded-card border border-border p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-navy-900">{evc.report_reference}</span>
                    <StatusBadge status={evc.report_status} size="sm" />
                  </div>
                  <p className="text-xs text-txt-secondary mt-0.5">
                    Physical on-site inspection conducted by {evc.evc_officer_name} on {new Date(evc.inspection_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setClarificationModal({
                        open: true,
                        type: 'EVC',
                        reportRef: evc.report_reference,
                        officer: evc.evc_officer_name,
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-surface-subtle text-navy-900 text-xs font-semibold transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-navy-700" />
                    <span>Request Clarification</span>
                  </button>
                  <button
                    onClick={async () => {
                      await api.reviewEVCReport(evc.id, 'EVC physical inspection report reviewed by Compliance Officer.');
                      setActionSuccess('EVC report marked reviewed.');
                      fetchDetail();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Mark Review Complete
                  </button>
                </div>
              </div>

              {/* EVC Inspection Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-surface-subtle rounded-lg border border-border">
                  <span className="text-txt-secondary block">Total Inspected</span>
                  <strong className="text-base text-navy-900">{evc.total_checked}</strong>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-emerald-800 block">Verified On-Site</span>
                  <strong className="text-base text-emerald-900">{evc.verified_count}</strong>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-rose-800 block">Deficiencies Found</span>
                  <strong className="text-base text-rose-900">{evc.deficiency_count}</strong>
                </div>
                <div className="p-3 bg-surface-subtle rounded-lg border border-border">
                  <span className="text-txt-secondary block">Geo Coordinates</span>
                  <strong className="text-xs font-mono text-navy-900 truncate block">{evc.geo_coordinates}</strong>
                </div>
              </div>

              {/* EVC Findings List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Physical Infrastructure & Environmental Audit Observations
                </h4>
                <div className="border border-border rounded-lg overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-txt-secondary border-b border-border">
                      <tr>
                        <th className="p-3">Req Code</th>
                        <th className="p-3">Facility Inspected</th>
                        <th className="p-3">On-Site Observation</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Photographic Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {evc.findings.map((ef) => (
                        <tr key={ef.id} className="hover:bg-slate-50/60">
                          <td className="p-3 font-mono font-bold text-navy-900 whitespace-nowrap">
                            {ef.requirement_code}
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            {ef.requirement_name}
                            <span className="text-[10px] text-slate-400 block">{ef.category_type}</span>
                          </td>
                          <td className="p-3 text-slate-700 max-w-xs">
                            {ef.finding}
                            {ef.remarks && (
                              <span className="text-[11px] text-slate-400 block mt-0.5">{ef.remarks}</span>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <StatusBadge status={ef.finding_status} size="sm" />
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {ef.evidence_reference ? (
                              <button
                                onClick={() =>
                                  setEvidenceModal({
                                    open: true,
                                    title: ef.requirement_name || 'Physical Verification',
                                    ref: ef.evidence_reference || 'REF',
                                    category: ef.category_type || 'Infrastructure',
                                    notes: ef.remarks,
                                  })
                                }
                                className="text-navy-600 font-semibold hover:underline flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{ef.evidence_reference}</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-border p-10 text-center space-y-2">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-navy-900">EVC Inspection Report Not Yet Submitted</h4>
              <p className="text-xs text-txt-secondary">
                Physical site visit by Nithish Kumar's EVC committee is pending or scheduled.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Consolidated Report Editor & Final Submission */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="bg-white rounded-card border border-border p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-900">
                  Consolidated Compliance Report Formulation
                </h3>
                <p className="text-xs text-txt-secondary">
                  Final synthesis for the regulatory approval decision workflow
                </p>
              </div>
              {report && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    Ref: {report.report_reference} (v{report.report_version})
                  </span>
                  <StatusBadge status={report.report_status} size="sm" />
                </div>
              )}
            </div>

            {/* Validation Checklist before submission */}
            <div className="p-3.5 rounded-lg bg-surface-subtle border border-border space-y-2 text-xs">
              <span className="font-bold text-navy-900 uppercase text-[11px] block">
                Statutory Submission Validation Gates:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  {scrutiny ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                  <span>Scrutiny Report Submitted & Linked</span>
                </div>
                <div className="flex items-center gap-2">
                  {evc ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                  <span>EVC Inspection Report Submitted & Linked</span>
                </div>
                <div className="flex items-center gap-2">
                  {assessment && assessment.conflicting_findings === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}
                  <span>Conflicts Evaluated & Acknowledged ({assessment?.conflicting_findings || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  {officerRemarks.trim().length >= 10 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                  <span>Officer Remarks Completed (min 10 chars)</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                  Statutory Approval Recommendation <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={report?.report_status === 'Submitted'}
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-navy-600"
                >
                  <option value="Unconditional Approval Recommended">Unconditional Approval Recommended</option>
                  <option value="Conditional Approval / Action Required">Conditional Approval / Action Required</option>
                  <option value="Deficiency Resolution Window Required">Deficiency Resolution Window Required (Hearing)</option>
                  <option value="Rejection Recommended Due to Critical Mandatory Deficiencies">Rejection Recommended Due to Critical Mandatory Deficiencies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                  Compliance Officer Assessment Synthesis & Findings Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  disabled={report?.report_status === 'Submitted'}
                  rows={6}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  placeholder="Detail your consolidated regulatory assessment, addressing both Scrutiny documentary records and EVC physical inspection findings..."
                  className="w-full text-xs rounded-lg border border-border p-3 focus:outline-none focus:ring-2 focus:ring-navy-600 leading-relaxed font-sans placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-xs font-bold text-navy-900 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Full Consolidated Report</span>
                </button>

                {report?.report_status === 'Submitted' ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Report Officially Submitted by {report.submitted_by}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={draftSubmitting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Draft</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitFinalReport}
                      disabled={draftSubmitting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Consolidated Assessment</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Approval Conditions */}
      {activeTab === 'conditions' && (
        <div className="bg-white rounded-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-900">
                Post-Approval Compliance Obligations & Conditions Tracker
              </h3>
              <p className="text-xs text-txt-secondary">
                Track mandatory institutional obligations, proof submissions, and statutory deadlines
              </p>
            </div>
          </div>

          {app.approval_conditions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {app.approval_conditions.map((cond) => (
                <div key={cond.id} className="py-4 space-y-2 first:pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-navy-900 px-2 py-0.5 rounded bg-surface-subtle border border-border">
                        {cond.condition_code}
                      </span>
                      <h4 className="text-xs font-bold text-txt-primary">
                        {cond.condition_description}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-txt-secondary">
                        Due: <strong>{new Date(cond.due_date).toLocaleDateString()}</strong>
                      </span>
                      <StatusBadge status={cond.condition_status} size="sm" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-txt-secondary pt-1">
                    <span>Regulatory Ref: <strong className="text-slate-700">{cond.regulatory_reference}</strong></span>
                    {cond.evidence_reference && (
                      <span className="font-mono text-[11px] text-navy-700 bg-slate-100 px-2 py-0.5 rounded">
                        Proof: {cond.evidence_reference}
                      </span>
                    )}
                    {cond.officer_remarks && (
                      <span className="italic text-slate-500">Note: {cond.officer_remarks}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-txt-secondary">
              No active post-approval conditions registered for this application.
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Institution Dossier */}
      {activeTab === 'institution' && (
        <div className="bg-white rounded-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-bold text-navy-900 border-b border-border pb-3">
            Institutional Master Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div>
                <span className="text-txt-secondary block">Full Legal Name:</span>
                <strong className="text-sm text-navy-950">{app.institution.name}</strong>
              </div>
              <div>
                <span className="text-txt-secondary block">Permanent Institute ID:</span>
                <strong className="font-mono text-slate-800">{app.institution.institution_id}</strong>
              </div>
              <div>
                <span className="text-txt-secondary block">Campus Address:</span>
                <span className="text-slate-800">{app.institution.address || 'Campus Plot 42, Sector 8'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-txt-secondary block">District & State:</span>
                <span className="text-slate-800">{app.institution.district}, {app.institution.state} - {app.institution.pincode}</span>
              </div>
              <div>
                <span className="text-txt-secondary block">Contact Email:</span>
                <span className="text-navy-600 font-medium">{app.institution.contact_email}</span>
              </div>
              <div>
                <span className="text-txt-secondary block">Contact Phone:</span>
                <span className="text-slate-800">{app.institution.contact_phone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-bold text-navy-900 border-b border-border pb-3">
            Application Audit History
          </h3>
          <div className="space-y-3">
            <div className="text-xs border-l-2 border-navy-800 pl-3 py-1 space-y-1">
              <span className="font-mono text-[11px] text-slate-400">
                {new Date(app.submission_date).toLocaleString()}
              </span>
              <p className="font-bold text-navy-900">APPLICATION_SUBMITTED</p>
              <p className="text-txt-secondary">
                Application submitted by institution for {app.application_type}.
              </p>
            </div>
            {app.scrutiny_report && (
              <div className="text-xs border-l-2 border-navy-800 pl-3 py-1 space-y-1">
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(app.scrutiny_report.submitted_at).toLocaleString()}
                </span>
                <p className="font-bold text-navy-900">SCRUTINY_REPORT_SUBMITTED</p>
                <p className="text-txt-secondary">
                  Report {app.scrutiny_report.report_reference} submitted by {app.scrutiny_report.scrutiny_officer_name}.
                </p>
              </div>
            )}
            {app.evc_report && (
              <div className="text-xs border-l-2 border-navy-800 pl-3 py-1 space-y-1">
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(app.evc_report.submitted_at).toLocaleString()}
                </span>
                <p className="font-bold text-navy-900">EVC_REPORT_SUBMITTED</p>
                <p className="text-txt-secondary">
                  Report {app.evc_report.report_reference} submitted by {app.evc_report.evc_officer_name}.
                </p>
              </div>
            )}
            {app.consolidated_report && app.consolidated_report.submitted_at && (
              <div className="text-xs border-l-2 border-emerald-600 pl-3 py-1 space-y-1">
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(app.consolidated_report.submitted_at).toLocaleString()}
                </span>
                <p className="font-bold text-emerald-800">CONSOLIDATED_REPORT_SUBMITTED</p>
                <p className="text-txt-secondary">
                  Official assessment {app.consolidated_report.report_reference} submitted by {app.consolidated_report.submitted_by}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ClarificationModal
        isOpen={clarificationModal.open}
        onClose={() => setClarificationModal((m) => ({ ...m, open: false }))}
        reportType={clarificationModal.type}
        reportReference={clarificationModal.reportRef}
        targetOfficerName={clarificationModal.officer}
        findingCode={clarificationModal.findingCode}
        findingText={clarificationModal.findingText}
        onSubmitClarification={async (reason) => {
          if (clarificationModal.type === 'Scrutiny' && scrutiny) {
            await api.requestScrutinyClarification(scrutiny.id, reason, clarificationModal.officer);
          } else if (clarificationModal.type === 'EVC' && evc) {
            await api.requestEVCClarification(evc.id, reason, clarificationModal.officer);
          }
          setActionSuccess(`Clarification notice dispatched to ${clarificationModal.type} team.`);
          fetchDetail();
        }}
      />

      <EvidenceModal
        isOpen={evidenceModal.open}
        onClose={() => setEvidenceModal((m) => ({ ...m, open: false }))}
        title={evidenceModal.title}
        evidenceRef={evidenceModal.ref}
        category={evidenceModal.category}
        notes={evidenceModal.notes}
      />

      <ReportPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        application={app}
        report={report}
      />
    </div>
  );
};
