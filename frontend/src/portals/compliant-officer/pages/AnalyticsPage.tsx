import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStatistics, ApplicationSummary } from '../types/compliance';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dash = await api.getDashboard();
        setStats(dash.statistics);
        const appsRes = await api.getApplications({ page_size: 50 });
        setApplications(appsRes.applications);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-[350px]">
        <RefreshCw className="w-6 h-6 text-navy-800 animate-spin" />
      </div>
    );
  }

  // Derived calculations from real backend data
  const regionalCounts = applications.reduce((acc: Record<string, number>, curr) => {
    acc[curr.regional_office] = (acc[curr.regional_office] || 0) + 1;
    return acc;
  }, {});

  const stageCounts = applications.reduce((acc: Record<string, number>, curr) => {
    acc[curr.current_stage] = (acc[curr.current_stage] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-card border border-border p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-navy-900">
            Regulatory Analytics & Institutional Throughput
          </h3>
          <p className="text-xs text-txt-secondary mt-0.5">
            Operational governance reporting for AICTE technical approval cycle 2026-27
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Printer className="w-4 h-4 text-saffron-500" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-card border border-border p-4.5 space-y-1">
          <span className="text-xs text-txt-secondary font-medium">Total Workload</span>
          <div className="text-2xl font-bold text-navy-900">{stats.assigned_applications}</div>
          <span className="text-[11px] text-slate-500">Active institutional applications</span>
        </div>
        <div className="bg-white rounded-card border border-border p-4.5 space-y-1">
          <span className="text-xs text-txt-secondary font-medium">Dual Reports Completed</span>
          <div className="text-2xl font-bold text-emerald-700">{stats.both_reports_submitted}</div>
          <span className="text-[11px] text-emerald-800">Scrutiny + EVC submitted</span>
        </div>
        <div className="bg-white rounded-card border border-border p-4.5 space-y-1">
          <span className="text-xs text-txt-secondary font-medium">Critical Gate Gaps</span>
          <div className="text-2xl font-bold text-rose-700">{stats.critical_compliance_gaps}</div>
          <span className="text-[11px] text-rose-800">Mandatory criteria shortfalls</span>
        </div>
        <div className="bg-white rounded-card border border-border p-4.5 space-y-1">
          <span className="text-xs text-txt-secondary font-medium">Approval Conditions Monitored</span>
          <div className="text-2xl font-bold text-amber-700">{stats.pending_approval_conditions}</div>
          <span className="text-[11px] text-amber-800">Post-approval obligations</span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Workload Distribution */}
        <div className="bg-white rounded-card border border-border p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
            Regional Regulatory Directorate Workload
          </h4>
          <div className="space-y-3">
            {Object.entries(regionalCounts).map(([region, count]) => {
              const pct = Math.round((count / applications.length) * 100);
              return (
                <div key={region} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-txt-primary">{region}</span>
                    <span className="font-mono text-txt-secondary">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-navy-800 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Stage Funnel */}
        <div className="bg-white rounded-card border border-border p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
            Workflow Stage Pipeline Funnel
          </h4>
          <div className="space-y-3">
            {Object.entries(stageCounts).map(([stage, count]) => {
              const pct = Math.round((count / applications.length) * 100);
              return (
                <div key={stage} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-txt-primary">{stage}</span>
                    <span className="font-mono text-txt-secondary">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-saffron-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

