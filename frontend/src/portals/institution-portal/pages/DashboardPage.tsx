import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { getStatusStyle, formatIST } from '../utils/statusMap';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Building2,
  Calendar,
  Bell,
  FileSpreadsheet,
  AlertOctagon,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { session } = useAuth();
  const { data, isLoading, isRefreshing, error, refetch, lastFetchedAt } = useDashboard();

  // Full Page Error State
  if (error && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-lg border border-red-200 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
          <AlertOctagon className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Failed to Load Dashboard Data</h2>
        <p className="text-xs text-slate-600 max-w-md mb-4 leading-relaxed">{error}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue-hover focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  // Full Page Loading Skeleton
  if (isLoading && !data) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading dashboard">
        {/* Header Skeleton */}
        <div className="h-20 bg-slate-200 rounded-lg" />
        {/* 4 Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-lg" />
          ))}
        </div>
        {/* Pending Actions Skeleton */}
        <div className="h-44 bg-slate-200 rounded-lg" />
        {/* Recent Applications Skeleton */}
        <div className="h-64 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  // Unpack Sections
  const instSection = data?.institution?.data;
  const statsSection = data?.stats?.data;
  const pendingSection = data?.pending_actions?.data;
  const recentSection = data?.recent_applications?.data || [];
  const notifSection = data?.notifications?.data;
  const analyticsSection = data?.analytics?.data;

  // Check section-level availability
  const unavailableSections = [
    data?.institution?.status === 'unavailable' && 'Institution Information',
    data?.stats?.status === 'unavailable' && 'Application Statistics',
    data?.pending_actions?.status === 'unavailable' && 'Pending Actions',
    data?.recent_applications?.status === 'unavailable' && 'Recent Applications',
    data?.notifications?.status === 'unavailable' && 'Notifications',
    data?.analytics?.status === 'unavailable' && 'Analytics',
  ].filter(Boolean) as string[];

  const isStaff = session?.role === 'Institution Staff';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* --------------------------------------------------------------------- */}
      {/* 0. Section Availability Warning Banner (if partial section failed)    */}
      {/* --------------------------------------------------------------------- */}
      {unavailableSections.length > 0 && (
        <div
          className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Partial Service Notice</span>
            <p className="text-[11px] leading-relaxed text-amber-800">
              The following sections are temporarily unavailable: {unavailableSections.join(', ')}.
              Operating sections continue to reflect real-time regulatory data.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-semibold text-brand-blue hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 1. Header Banner & Context                                            */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              AY 2026-27 Approval Processing Cycle Active
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {instSection?.name || session?.institutionName || 'Institutional Regulatory Dashboard'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>PID: <strong className="font-semibold text-slate-800">{instSection?.identifier || session?.institutionIdentifier || 'N/A'}</strong></span>
            <span>•</span>
            <span>Authorized Representative: <strong className="font-semibold text-slate-800">{instSection?.user?.display_name || session?.displayName}</strong> ({session?.role})</span>
            <span>•</span>
            <span>Region: <strong className="font-semibold text-slate-800">{instSection?.regional_office || 'Western Regional Office'}</strong></span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {lastFetchedAt && (
            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
              Updated: {lastFetchedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-blue' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Four Statistics Cards & Reconciling Breakdown Line                 */}
      {/* --------------------------------------------------------------------- */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">Regulatory Application Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Applications */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applications</span>
              <FileText className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{statsSection?.total ?? 0}</span>
              <span className="text-[11px] text-slate-500 font-medium">AY 2026-27</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">All active institutional filings</span>
          </div>

          {/* Card 2: Approved Applications */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">{statsSection?.approved ?? 0}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Sanctioned</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Digital EoA orders dispatched</span>
          </div>

          {/* Card 3: Under Review */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Under Review</span>
              <Clock className="w-4 h-4 text-brand-blue" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-brand-blue">{statsSection?.under_review ?? 0}</span>
              <span className="text-[11px] text-slate-500 font-medium">In Process</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Regional scrutiny & committee evaluation</span>
          </div>

          {/* Card 4: Requiring Action */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requiring Action</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">{statsSection?.requiring_action ?? 0}</span>
              <span className="text-[11px] text-amber-700 font-medium">Action Pending</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Deficiencies awaiting response</span>
          </div>
        </div>

        {/* Reconciling Breakdown Line */}
        {statsSection?.breakdown && (
          <div className="mt-2.5 px-4 py-2.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-y-1 shadow-2xs">
            <span className="font-semibold text-slate-700">Reconciliation Breakdown:</span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Approved: <strong className="text-emerald-700">{statsSection.breakdown.approved}</strong></span>
              <span>•</span>
              <span>Under Review: <strong className="text-brand-blue">{statsSection.breakdown.under_review}</strong></span>
              <span>•</span>
              <span>Requiring Action: <strong className="text-amber-700">{statsSection.breakdown.requiring_action}</strong></span>
              <span>•</span>
              <span>Draft: <strong className="text-slate-800">{statsSection.breakdown.draft}</strong></span>
              <span>•</span>
              <span>Rejected: <strong className="text-red-700">{statsSection.breakdown.rejected}</strong></span>
              <span>•</span>
              <span>Closed: <strong className="text-slate-600">{statsSection.breakdown.closed}</strong></span>
              <span>=</span>
              <span className="font-bold text-slate-900">Total: {statsSection.breakdown.total}</span>
            </div>
          </div>
        )}
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. Priority Content: Pending Actions (Highest Prominence)             */}
      {/* --------------------------------------------------------------------- */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden" aria-labelledby="pending-actions-heading">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <h2 id="pending-actions-heading" className="text-sm font-bold text-slate-900 tracking-tight">
              Statutory Actions & Rectifications Required
            </h2>
            {pendingSection && pendingSection.total_count > 0 && (
              <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-200">
                {pendingSection.total_count} Pending
              </span>
            )}
          </div>
          {isStaff && (
            <span className="text-[10px] text-slate-500 font-medium">
              Note: Institutional Staff accounts have read-only rectification access
            </span>
          )}
        </div>

        <div className="p-5">
          {!pendingSection || pendingSection.items.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" aria-hidden="true" />
              <h3 className="text-xs font-bold text-slate-800">No Pending Statutory Actions</h3>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                All institutional applications, compliance submissions, and deficiency rectifications are up to date.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSection.items.map((item) => {
                const isOverdue = item.is_overdue;
                const isDueSoon = item.is_due_soon;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isOverdue
                        ? 'bg-red-50/60 border-red-200'
                        : isDueSoon
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-slate-50/75 border-slate-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Urgent Badges */}
                        {isOverdue && (
                          <span className="bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                            STATUTORY DEADLINE EXCEEDED
                          </span>
                        )}
                        {isDueSoon && (
                          <span className="bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                            ACTION DUE SOON
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Ref: {item.reference}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                      <p className="text-[11px] text-slate-600 mt-0.5">{item.action_required}</p>
                    </div>

                    {/* Deadline & Status Details */}
                    <div className="flex items-center gap-4 shrink-0">
                      {item.deadline && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block font-medium">Statutory Deadline</span>
                          <span
                            className={`text-xs font-semibold ${
                              isOverdue ? 'text-red-700 font-bold' : isDueSoon ? 'text-amber-800' : 'text-slate-800'
                            }`}
                          >
                            {formatIST(item.deadline)}
                          </span>
                        </div>
                      )}

                      <span
                        className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${
                          isOverdue
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. Recent Applications Registry                                       */}
      {/* --------------------------------------------------------------------- */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden" aria-labelledby="recent-apps-heading">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="recent-apps-heading" className="text-sm font-bold text-slate-900 tracking-tight">
              Institutional Application Registry
            </h2>
            <p className="text-[11px] text-slate-500">
              Verified records under {instSection?.name || session?.institutionName || 'Institutional Profile'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">Official Registry AY 2026-27</span>
          </div>
        </div>

        {recentSection.length === 0 ? (
          <div className="text-center py-10 px-4">
            <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
            <h3 className="text-xs font-bold text-slate-800">No Applications Initiated Yet</h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5 mb-4">
              Your institution has not created any regulatory approval filings for this cycle.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-3">Application ID</th>
                  <th scope="col" className="px-5 py-3">Type</th>
                  <th scope="col" className="px-5 py-3">Current Stage</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Submitted</th>
                  <th scope="col" className="px-5 py-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSection.map((app) => {
                  const style = getStatusStyle(app.status);
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 tracking-tight">
                        {app.reference_number}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {app.application_type_name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        {app.current_stage}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatIST(app.submission_date) || 'Draft'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatIST(app.updated_at, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. Lower Grid: Notifications & Institution Info & Analytics           */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5A: Notifications & Regulatory Notices (1 col) */}
        <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-5" aria-labelledby="notifications-heading">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-blue" aria-hidden="true" />
              <h2 id="notifications-heading" className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notifications & Updates
              </h2>
            </div>
            {notifSection && notifSection.unread_count > 0 && (
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                {notifSection.unread_count} Unread
              </span>
            )}
          </div>

          {!notifSection || notifSection.items.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No recent notifications for your account.
            </div>
          ) : (
            <div className="space-y-3">
              {notifSection.items.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-md border text-xs ${
                    n.is_read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">{n.title}</span>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5">{formatIST(n.created_at, true)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5B: Institution Information (1 col) */}
        <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-5" aria-labelledby="institution-info-heading">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-brand-blue" aria-hidden="true" />
            <h2 id="institution-info-heading" className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Institutional Profile
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Official Name</span>
              <span className="font-semibold text-slate-900">{instSection?.name || session?.institutionName || 'Institutional Profile'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Institution Identifier (PID)</span>
              <span className="font-mono text-slate-800">{instSection?.identifier || session?.institutionIdentifier || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Programme Category</span>
              <span className="text-slate-800">{instSection?.type || 'Technical Education'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Regional Office Jurisdiction</span>
              <span className="text-slate-800">{instSection?.regional_office || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Approval & Operating Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{instSection?.status || 'Active'}</span>
              </span>
            </div>
          </div>
        </section>

        {/* 5C: Application Analytics / Status Distribution (1 col) */}
        <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-5" aria-labelledby="analytics-heading">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-brand-blue" aria-hidden="true" />
            <h2 id="analytics-heading" className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Status Distribution
            </h2>
          </div>

          {!analyticsSection || analyticsSection.status_distribution.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No analytics data available for current cycle.
            </div>
          ) : (
            <div className="space-y-4">
              {/* CSS Accessible Distribution Bars */}
              <div className="space-y-2">
                {analyticsSection.status_distribution.map((item) => (
                  <div key={item.bucket} className="text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium text-slate-700">{item.bucket}</span>
                      <span className="text-slate-500 font-mono">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.bucket === 'Approved'
                            ? 'bg-emerald-500'
                            : item.bucket === 'Under Review'
                            ? 'bg-brand-blue'
                            : item.bucket === 'Requiring Action'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(item.percentage, item.count > 0 ? 5 : 0)}%` }}
                        aria-label={`${item.bucket}: ${item.count} applications (${item.percentage}%)`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Text Alternative Breakdown */}
              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500">
                <p>Status distribution derived from statutory canonical buckets for AY 2026-27.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
