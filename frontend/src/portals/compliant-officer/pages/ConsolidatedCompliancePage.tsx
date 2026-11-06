import React, { useEffect, useState } from 'react';
import {
  Scale,
  Play,
  FileCheck2,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Save,
  Send,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { ApplicationSummary, ComplianceAssessment } from '../types/compliance';
import { StatusBadge } from '../components/common/StatusBadge';

interface ConsolidatedCompliancePageProps {
  onSelectApplication: (id: number) => void;
}

export const ConsolidatedCompliancePage: React.FC<ConsolidatedCompliancePageProps> = ({
  onSelectApplication,
}) => {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [assessment, setAssessment] = useState<ComplianceAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [engineRunning, setEngineRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await api.getApplications({ page_size: 50 });
      setApplications(res.applications);
      if (res.applications.length > 0 && !selectedAppId) {
        setSelectedAppId(res.applications[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessment = async (appId: number) => {
    try {
      const data = await api.getApplicationAssessment(appId);
      setAssessment(data);
    } catch {
      setAssessment(null);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedAppId) {
      fetchAssessment(selectedAppId);
    }
  }, [selectedAppId]);

  const handleRunEngine = async () => {
    if (!selectedAppId) return;
    try {
      setEngineRunning(true);
      setStatusMessage(null);
      const res = await api.runAssessmentEngine(selectedAppId);
      setAssessment(res);
      setStatusMessage('Compliance Engine cross-evaluated Scrutiny and EVC reports successfully!');
      fetchApps();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setEngineRunning(false);
    }
  };

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-card border border-border p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-navy-800 text-white uppercase tracking-wider">
              Flagship Capability
            </span>
            <span className="text-xs font-semibold text-saffron-600">Cross-Committee Regulatory Intelligence</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-navy-900 mt-1">
            Consolidated Compliance Assessment Engine
          </h2>
          <p className="text-xs text-txt-secondary max-w-2xl mt-0.5">
            Cross-references documentary findings from Scrutiny and on-site physical audits from EVC against statutory norms, detecting inconsistencies, conflicting evidence, and mandatory gate blockers.
          </p>
        </div>

        {selectedAppId && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleRunEngine}
              disabled={engineRunning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-saffron-500" />
              <span>{engineRunning ? 'Evaluating Norms...' : 'Re-run Engine'}</span>
            </button>
            <button
              onClick={() => onSelectApplication(selectedAppId)}
              className="px-3.5 py-2 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-navy-900 text-xs font-bold transition-all shadow-2xs"
            >
              Open Dossier &rarr;
            </button>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-card bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Application Selector (Left) & Assessment Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Selector */}
        <div className="bg-white rounded-card border border-border p-4.5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">
            Select Assigned Application
          </h3>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {applications.map((a) => {
              const isSelected = a.id === selectedAppId;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAppId(a.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-navy-800 bg-navy-50/50 shadow-2xs'
                      : 'border-border hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-navy-900">
                      {a.application_id}
                    </span>
                    <StatusBadge status={a.compliance_status} size="sm" />
                  </div>
                  <h4 className="text-xs font-semibold text-txt-primary truncate">
                    {a.institution_name}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-txt-secondary mt-1">
                    <span>{a.application_type}</span>
                    <span className="text-slate-400">{a.regional_office}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Assessment Matrix & Findings */}
        <div className="lg:col-span-2 space-y-5">
          {selectedApp && assessment ? (
            <div className="space-y-5">
              {/* Scorecard */}
              <div className="bg-navy-800 text-white rounded-card p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                      Evaluation Result for {selectedApp.application_id}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {selectedApp.institution_name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-saffron-500">
                      {assessment.compliance_percentage}%
                    </div>
                    <span className="text-[11px] text-slate-300">Compliance Rate</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-navy-700/80 text-xs">
                  <div>
                    <span className="text-slate-300 block">Satisfied:</span>
                    <strong className="text-emerald-300">{assessment.satisfied_requirements} / {assessment.total_applicable_requirements}</strong>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Deficiencies:</span>
                    <strong className="text-rose-300">{assessment.potential_deficiencies}</strong>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Conflicts:</span>
                    <strong className="text-amber-300">{assessment.conflicting_findings}</strong>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Mandatory Gate:</span>
                    <strong className="text-white">{assessment.assessment_status}</strong>
                  </div>
                </div>
              </div>

              {/* Requirement Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Requirement Cross-Reference Findings ({assessment.findings.length})
                </h4>

                {assessment.findings.map((f) => (
                  <div
                    key={f.id}
                    className={`bg-white rounded-card border p-4 space-y-2.5 text-xs shadow-2xs ${
                      f.compliance_status === 'Conflicting Findings'
                        ? 'border-amber-300 bg-amber-50/20'
                        : f.compliance_status === 'Potential Deficiency'
                        ? 'border-rose-300 bg-rose-50/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-navy-900 px-2 py-0.5 rounded bg-surface-subtle border border-border">
                          {f.requirement_code}
                        </span>
                        <span className="font-bold text-txt-primary">{f.requirement_name}</span>
                        {f.mandatory && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <StatusBadge status={f.compliance_status} size="sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded bg-surface-subtle border border-border">
                        <span className="font-semibold text-navy-900 block mb-0.5">Scrutiny Document Finding:</span>
                        <p className="text-txt-primary">{f.scrutiny_finding_text || 'Not verified'}</p>
                      </div>
                      <div className="p-2.5 rounded bg-surface-subtle border border-border">
                        <span className="font-semibold text-navy-900 block mb-0.5">EVC Physical Finding:</span>
                        <p className="text-txt-primary">{f.evc_finding_text || 'Not verified'}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-navy-900">Engine Determination: </span>
                      <span className="text-txt-primary">{f.reasoning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-border p-12 text-center space-y-3">
              <Scale className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-navy-900">Assessment Pending</h4>
              <p className="text-xs text-txt-secondary">
                Click "Re-run Engine" above to trigger automated cross-referencing for this application.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

