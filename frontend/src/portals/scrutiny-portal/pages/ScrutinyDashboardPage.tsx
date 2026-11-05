import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Inbox,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Building,
} from 'lucide-react';
import { scrutinyService, DashboardData } from '@/services/scrutinyService';

export const ScrutinyDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await scrutinyService.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to load scrutiny dashboard data. Please verify backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-white rounded-xl border border-brand-border">
        <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Loading Scrutiny Operations...
        </span>
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_assigned: 3,
    awaiting_scrutiny: 1,
    under_examination: 1,
    deficiencies_pending: 0,
    resubmissions_awaiting_review: 1,
    completed_scrutiny_reports: 0,
    overdue_tasks: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Executive Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Scrutiny Officer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time regulatory examination progress, statutory deadlines, and deficiency rectification status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-brand-border text-xs font-semibold text-slate-700 hover:text-brand-navy hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/scrutiny/queue"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-dark shadow-xs transition-colors"
          >
            <Inbox className="w-4 h-4 text-brand-gold" />
            <span>Open Application Queue</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-brand-border shadow-xs hover:border-brand-blue/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Assigned
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              {metrics.total_assigned}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Dossiers</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-brand-border shadow-xs hover:border-brand-blue/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Awaiting Scrutiny
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              {metrics.awaiting_scrutiny}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Pending Start</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-brand-border shadow-xs hover:border-brand-blue/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Under Examination
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
              {metrics.under_examination}
            </span>
            <span className="text-[11px] font-medium text-slate-500">In Progress</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-brand-border shadow-xs hover:border-brand-blue/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resubmission Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700">
              {metrics.resubmissions_awaiting_review}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Rectified Proofs</span>
          </div>
        </div>
      </div>

      {/* Row 2: Pending Actions & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Action Required */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-brand-border shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-bold text-brand-navy">Pending Actions Required</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {data?.pending_actions?.length || 0} items
              </span>
            </div>

            {data?.pending_actions && data.pending_actions.length > 0 ? (
              <div className="space-y-3">
                {data.pending_actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-brand-blue/50 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-navy text-white">
                          {act.application_id}
                        </span>
                        <span className="text-xs font-semibold text-brand-navy group-hover:text-brand-blue transition-colors">
                          {act.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{act.institution}</span>
                      </p>
                    </div>

                    <Link
                      to={act.action_url}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue-hover transition-colors shadow-xs shrink-0"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No immediate pending actions required. All assigned scrutiny queues are up to date.
              </div>
            )}
          </div>

          {/* Differentiator Highlights Card */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-brand-navy to-brand-navy-dark text-white shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-brand-gold">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold tracking-wide uppercase">
                Statutory Evidence Ledger & AICTE Rule Engine
              </h3>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Every automated scrutiny observation is verified against official Approval Process Handbook (APH 2026-27) clauses, linked with page numbers and document checksums.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded bg-white/10 border border-white/20">
                ✓ Multi-format PyMuPDF & OCR
              </span>
              <span className="px-2.5 py-1 rounded bg-white/10 border border-white/20">
                ✓ Versioned Text Diff Comparison
              </span>
              <span className="px-2.5 py-1 rounded bg-white/10 border border-white/20">
                ✓ Cross-Document Consistency Matrix
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Audit Trail */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-brand-border shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-brand-navy">Recent Audit Events</h2>
              </div>
              <span className="text-[11px] text-slate-400">Live Ledger</span>
            </div>

            <div className="space-y-4">
              {data?.recent_activities && data.recent_activities.length > 0 ? (
                data.recent_activities.map((item) => (
                  <div key={item.id} className="text-xs border-l-2 border-brand-blue/30 pl-3 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-semibold text-brand-navy">{item.action}</span>
                      <span>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{item.remarks || item.action}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>By {item.actor_name}</span>
                      <span>•</span>
                      <span>{item.actor_role}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No audit events recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
