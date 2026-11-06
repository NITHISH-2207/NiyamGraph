import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  FileCheck2,
  Building2,
  Scale,
  AlertOctagon,
  ClipboardList,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardResponse, ApplicationSummary } from '../types/compliance';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { NavigationTab } from '../components/layout/ComplianceOfficerSidebar';

interface DashboardPageProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onSelectApplication: (appId: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onSelectApplication,
}) => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-navy-800 animate-spin" />
        <p className="text-sm font-medium text-txt-secondary">
          Loading Compliance Officer intelligence metrics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-card p-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="text-base font-bold text-red-800">Dashboard Unavailable</h3>
        <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { statistics, priority_alerts, recent_applications, recent_activity } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-navy-800 via-navy-700 to-navy-600 text-white rounded-card p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-saffron-500 text-navy-950 uppercase tracking-wide">
              {data.regulatory_cycle}
            </span>
            <span className="text-xs text-slate-300 font-medium">Western Regional Directorate</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Welcome back, {data.officer_name}
          </h2>
          <p className="text-xs text-slate-200/80 max-w-2xl leading-relaxed">
            You have <strong className="text-white font-semibold">{statistics.assigned_applications} applications</strong> assigned. Both reports are ready for <strong className="text-emerald-300">{statistics.both_reports_submitted}</strong> institutions, with <strong className="text-amber-300">{statistics.critical_compliance_gaps}</strong> critical deficiency gates requiring immediate review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => onNavigateTab('consolidated')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-saffron-500 hover:bg-saffron-600 text-navy-950 font-bold text-xs shadow-sm transition-all"
          >
            <Scale className="w-4 h-4" />
            <span>Review Pending Reports</span>
          </button>
          <button
            onClick={() => onNavigateTab('registry')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Application Registry</span>
          </button>
        </div>
      </div>

      {/* 6 Key Operational KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <MetricCard
          title="Assigned Applications"
          value={statistics.assigned_applications}
          context="Institutional Approval Cycle"
          statusText="Active"
          statusType="info"
          icon={FileSpreadsheet}
          onClick={() => onNavigateTab('registry')}
        />
        <MetricCard
          title="Awaiting Scrutiny"
          value={statistics.awaiting_scrutiny}
          context="Documentary Verification"
          statusText={statistics.awaiting_scrutiny > 0 ? 'Pending' : 'Done'}
          statusType={statistics.awaiting_scrutiny > 0 ? 'warning' : 'success'}
          icon={FileCheck2}
          onClick={() => onNavigateTab('scrutiny')}
        />
        <MetricCard
          title="Awaiting EVC Report"
          value={statistics.awaiting_evc}
          context="Physical Site Inspection"
          statusText={statistics.awaiting_evc > 0 ? 'Scheduled' : 'Done'}
          statusType={statistics.awaiting_evc > 0 ? 'warning' : 'success'}
          icon={Building2}
          onClick={() => onNavigateTab('evc')}
        />
        <MetricCard
          title="Ready for Review"
          value={statistics.ready_for_compliance_review}
          context="Dual Reports In Place"
          statusText="Actionable"
          statusType="success"
          icon={Scale}
          onClick={() => onNavigateTab('consolidated')}
        />
        <MetricCard
          title="Critical Gaps & Conflicts"
          value={statistics.critical_compliance_gaps}
          context="Mandatory Gate Triggers"
          statusText="Requires Signoff"
          statusType="danger"
          icon={AlertOctagon}
          onClick={() => onNavigateTab('pending')}
        />
        <MetricCard
          title="Pending Conditions"
          value={statistics.pending_approval_conditions}
          context="Post-Approval Monitoring"
          statusText="Under Watch"
          statusType="neutral"
          icon={ClipboardList}
          onClick={() => onNavigateTab('conditions')}
        />
      </div>

      {/* Priority Alerts Section */}
      <div className="bg-white rounded-card border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h3 className="text-sm font-bold text-navy-900 tracking-tight">
              Priority Regulatory Alerts & Gate Blockers
            </h3>
          </div>
          <span className="text-xs text-txt-secondary font-medium">
            {priority_alerts.length} actionable flags
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {priority_alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectApplication(alert.application_id)}
              className="group cursor-pointer rounded-lg border border-border hover:border-navy-600/50 p-4 transition-all duration-200 hover:shadow-sm bg-surface-subtle/50 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-border">
                    {alert.application_id_str}
                  </span>
                  <StatusBadge status={alert.priority} size="sm" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-txt-primary group-hover:text-navy-800 transition-colors line-clamp-1">
                    {alert.institution_name}
                  </h4>
                  <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                    {alert.category}
                  </p>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {alert.required_action}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-navy-800 font-semibold group-hover:text-navy-950">
                <span>Resolve Discrepancy</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Application Progress Table & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Applications Progress */}
        <div className="lg:col-span-2 bg-white rounded-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">
                Assigned Applications Progress
              </h3>
              <p className="text-xs text-txt-secondary">
                Committee submissions and compliance assessment status
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('registry')}
              className="text-xs font-semibold text-navy-600 hover:text-navy-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-txt-secondary font-semibold uppercase text-[11px]">
                  <th className="pb-3">Application ID</th>
                  <th className="pb-3">Institution</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-center">Scrutiny</th>
                  <th className="pb-3 text-center">EVC</th>
                  <th className="pb-3 text-center">Gate State</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplication(app.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-mono font-bold text-navy-900 whitespace-nowrap">
                      {app.application_id}
                    </td>
                    <td className="py-3 max-w-[200px]">
                      <span className="font-semibold text-txt-primary truncate block">
                        {app.institution_name}
                      </span>
                      <span className="text-[11px] text-txt-secondary">
                        {app.regional_office}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 whitespace-nowrap">
                      {app.application_type}
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={app.scrutiny_status} size="sm" showDot={false} />
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={app.evc_status} size="sm" showDot={false} />
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={app.compliance_status} size="sm" />
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-[11px] font-semibold text-navy-600 hover:text-navy-900">
                        Review &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Recent Activity Audit Stream */}
        <div className="bg-white rounded-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-navy-600" />
              <h3 className="text-sm font-bold text-navy-900">Recent Activity</h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-semibold text-navy-600 hover:text-navy-800"
            >
              Full Log
            </button>
          </div>

          <div className="space-y-3.5">
            {recent_activity.map((act) => (
              <div
                key={act.id}
                className="text-xs border-l-2 border-navy-800 pl-3 py-1 space-y-0.5"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono font-medium text-navy-800">{act.application_id_str}</span>
                  <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-medium text-txt-primary line-clamp-2">
                  {act.description}
                </p>
                <span className="text-[10px] text-txt-secondary block">
                  By {act.officer}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

