import React, { useEffect, useState } from 'react';
import { FileCheck2, Search, ExternalLink, RefreshCw, Eye, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { ScrutinyReport } from '../types/compliance';
import { StatusBadge } from '../components/common/StatusBadge';
import { EvidenceModal } from '../components/common/EvidenceModal';
import { ClarificationModal } from '../components/common/ClarificationModal';

interface ScrutinyReportsPageProps {
  onSelectApplication: (appId: number) => void;
}

export const ScrutinyReportsPage: React.FC<ScrutinyReportsPageProps> = ({ onSelectApplication }) => {
  const [reports, setReports] = useState<ScrutinyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [evidenceModal, setEvidenceModal] = useState<{ open: boolean; title: string; ref: string; category: string }>({
    open: false,
    title: '',
    ref: '',
    category: '',
  });
  const [clarificationModal, setClarificationModal] = useState<{
    open: boolean;
    reportRef: string;
    officer: string;
    reportId: number;
  }>({
    open: false,
    reportRef: '',
    officer: '',
    reportId: 0,
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.getScrutinyReports();
      setReports(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter((r) =>
    r.report_reference.toLowerCase().includes(search.toLowerCase()) ||
    r.scrutiny_officer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-card border border-border p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-navy-900">Submitted Scrutiny Committee Reports</h3>
          <p className="text-xs text-txt-secondary">
            Document verification reports submitted independently by Nirmal Kumar's scrutiny committee
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by reference..."
            className="w-full text-xs rounded-lg border border-border pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-navy-800 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-card border border-border p-8 text-center text-xs text-txt-secondary">
          No scrutiny reports found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-card border border-border p-5 space-y-4 shadow-2xs hover:border-navy-600/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-navy-800 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-navy-900">{report.report_reference}</span>
                      <StatusBadge status={report.report_status} size="sm" />
                    </div>
                    <span className="text-xs text-txt-secondary">
                      Committee Head: <strong className="text-slate-800">{report.scrutiny_officer_name}</strong> &bull; Submitted {new Date(report.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setClarificationModal({
                        open: true,
                        reportRef: report.report_reference,
                        officer: report.scrutiny_officer_name,
                        reportId: report.id,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-xs font-semibold text-navy-900 flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Clarification</span>
                  </button>
                  <button
                    onClick={() => onSelectApplication(report.application_id)}
                    className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5"
                  >
                    <span>Inspect Application</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded bg-surface-subtle">
                  <span className="text-txt-secondary block">Total Checks:</span>
                  <strong className="text-navy-900">{report.total_checked}</strong>
                </div>
                <div className="p-2.5 rounded bg-emerald-50 text-emerald-900">
                  <span className="text-emerald-700 block">Satisfied:</span>
                  <strong>{report.satisfied_count}</strong>
                </div>
                <div className="p-2.5 rounded bg-rose-50 text-rose-900">
                  <span className="text-rose-700 block">Deficient:</span>
                  <strong>{report.deficient_count}</strong>
                </div>
                <div className="p-2.5 rounded bg-amber-50 text-amber-900">
                  <span className="text-amber-700 block">Missing Proofs:</span>
                  <strong>{report.missing_docs_count}</strong>
                </div>
              </div>

              {/* Findings preview */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-txt-secondary block">
                  Report Findings Summary:
                </span>
                <p className="text-xs text-txt-primary leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {report.findings_summary || 'Document verification completed against applicable regulatory guidelines.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <EvidenceModal
        isOpen={evidenceModal.open}
        onClose={() => setEvidenceModal((m) => ({ ...m, open: false }))}
        title={evidenceModal.title}
        evidenceRef={evidenceModal.ref}
        category={evidenceModal.category}
      />

      <ClarificationModal
        isOpen={clarificationModal.open}
        onClose={() => setClarificationModal((m) => ({ ...m, open: false }))}
        reportType="Scrutiny"
        reportReference={clarificationModal.reportRef}
        targetOfficerName={clarificationModal.officer}
        onSubmitClarification={async (reason) => {
          await api.requestScrutinyClarification(clarificationModal.reportId, reason, clarificationModal.officer);
          alert('Clarification request dispatched to Scrutiny Officer.');
          fetchReports();
        }}
      />
    </div>
  );
};

