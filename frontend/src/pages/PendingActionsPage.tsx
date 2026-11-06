import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Scale,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  FileCheck2,
  Building2,
  AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';
import { ApplicationSummary } from '../types/compliance';
import { StatusBadge } from '../components/common/StatusBadge';

interface PendingActionsPageProps {
  onSelectApplication: (id: number) => void;
}

export const PendingActionsPage: React.FC<PendingActionsPageProps> = ({ onSelectApplication }) => {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActionItems = async () => {
    try {
      setLoading(true);
      const res = await api.getApplications({ page_size: 50 });
      setApplications(res.applications);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionItems();
  }, []);

  // Filter actionable applications
  const readyForReport = applications.filter(
    (a) => a.compliance_status === 'Ready for Compliance Report'
  );
  const conflictsAndGaps = applications.filter(
    (a) =>
      a.compliance_status === 'Critical Deficiency Identified' ||
      a.compliance_status === 'Manual Verification Required' ||
      a.compliance_status === 'Mandatory Requirements Pending'
  );
  const awaitingReports = applications.filter(
    (a) => a.scrutiny_status !== 'Submitted' || a.evc_status !== 'Submitted'
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card border border-border p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-navy-900">
          Compliance Officer Action Queue
        </h3>
        <p className="text-xs text-txt-secondary mt-0.5">
          Actionable regulatory items requiring assessment review, conflict resolution, or report signoff
        </p>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-navy-800 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Ready for Consolidated Report */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                1. Ready for Consolidated Compliance Report Draft & Submission ({readyForReport.length})
              </h4>
            </div>

            {readyForReport.length === 0 ? (
              <div className="bg-white rounded-card border border-border p-5 text-xs text-txt-secondary text-center">
                No applications currently in ready state.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {readyForReport.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApplication(app.id)}
                    className="bg-white rounded-card border border-emerald-200 p-4 space-y-2 hover:shadow-sm cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-navy-900">{app.application_id}</span>
                      <StatusBadge status={app.compliance_status} size="sm" />
                    </div>
                    <h5 className="text-xs font-bold text-txt-primary group-hover:text-navy-800 transition-colors">
                      {app.institution_name}
                    </h5>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Both Scrutiny and EVC reports fully satisfied. Proceed to finalize and submit consolidated assessment.
                    </p>
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-navy-600 group-hover:text-navy-900 flex items-center gap-1">
                        <span>Draft Consolidated Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Critical Gaps & Conflicting Findings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                2. Conflicting Findings & Critical Deficiency Gate Blockers ({conflictsAndGaps.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {conflictsAndGaps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app.id)}
                  className="bg-white rounded-card border border-amber-300 p-4 space-y-2.5 hover:shadow-sm cursor-pointer transition-all group bg-amber-50/15"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-navy-900">{app.application_id}</span>
                    <StatusBadge status={app.compliance_status} size="sm" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-txt-primary group-hover:text-navy-800 transition-colors">
                      {app.institution_name}
                    </h5>
                    <span className="text-[11px] text-txt-secondary">{app.application_type} &bull; {app.regional_office}</span>
                  </div>
                  <p className="text-[11px] text-amber-900 font-medium bg-amber-100/60 p-2 rounded">
                    Action Required: Review conflicting evidence between Scrutiny & EVC or resolve mandatory cadre/safety shortfall.
                  </p>
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <span className="text-xs font-semibold text-navy-600 group-hover:text-navy-900 flex items-center gap-1">
                      <span>Inspect Discrepancies</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Awaiting Reports */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                3. Awaiting Committee Reports ({awaitingReports.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {awaitingReports.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app.id)}
                  className="bg-white rounded-card border border-border p-4 space-y-2 hover:shadow-sm cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-navy-900">{app.application_id}</span>
                    <span className="text-xs text-txt-secondary font-medium">Stage: {app.current_stage}</span>
                  </div>
                  <h5 className="text-xs font-bold text-txt-primary truncate group-hover:text-navy-800">
                    {app.institution_name}
                  </h5>
                  <div className="flex items-center gap-3 text-xs pt-1">
                    <div className="flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-navy-600" />
                      <span>Scrutiny: <strong className="text-slate-800">{app.scrutiny_status}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-navy-600" />
                      <span>EVC: <strong className="text-slate-800">{app.evc_status}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

