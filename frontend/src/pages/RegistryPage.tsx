import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Building,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { ApplicationSummary } from '../types/compliance';
import { StatusBadge } from '../components/common/StatusBadge';

interface RegistryPageProps {
  onSelectApplication: (id: number) => void;
}

export const RegistryPage: React.FC<RegistryPageProps> = ({ onSelectApplication }) => {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [appType, setAppType] = useState('');
  const [currentStage, setCurrentStage] = useState('');
  const [region, setRegion] = useState('');
  const [scrutinyStatus, setScrutinyStatus] = useState('');
  const [evcStatus, setEvcStatus] = useState('');
  const [complianceStatus, setComplianceStatus] = useState('');

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getApplications({
        search: search || undefined,
        application_type: appType || undefined,
        current_stage: currentStage || undefined,
        regional_office: region || undefined,
        scrutiny_status: scrutinyStatus || undefined,
        evc_status: evcStatus || undefined,
        compliance_status: complianceStatus || undefined,
        page,
        page_size: pageSize,
      });
      setApplications(res.applications);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [page, appType, currentStage, region, scrutinyStatus, evcStatus, complianceStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApps();
  };

  const handleResetFilters = () => {
    setSearch('');
    setAppType('');
    setCurrentStage('');
    setRegion('');
    setScrutinyStatus('');
    setEvcStatus('');
    setComplianceStatus('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-card border border-border p-4.5 space-y-3.5 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Application ID (e.g. NG-2026-AP-8941), Institution name, or Institution ID..."
              className="w-full text-xs rounded-lg border border-border pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="px-4 py-2.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Multi-Select Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Application Type</label>
            <select
              value={appType}
              onChange={(e) => { setAppType(e.target.value); setPage(1); }}
              className="w-full rounded border border-border bg-white px-2 py-1.5 text-xs text-txt-primary focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="">All Types</option>
              <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
              <option value="New Institution">New Institution</option>
              <option value="Increase in Intake">Increase in Intake</option>
              <option value="Adding New Department">Adding New Department</option>
              <option value="Autonomous Status">Autonomous Status</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Workflow Stage</label>
            <select
              value={currentStage}
              onChange={(e) => { setCurrentStage(e.target.value); setPage(1); }}
              className="w-full rounded border border-border bg-white px-2 py-1.5 text-xs text-txt-primary focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="">All Stages</option>
              <option value="Scrutiny Review">Scrutiny Review</option>
              <option value="EVC Inspection">EVC Inspection</option>
              <option value="Compliance Review">Compliance Review</option>
              <option value="Deficiency Resolution">Deficiency Resolution</option>
              <option value="Compliance Assessment Submitted">Report Submitted</option>
              <option value="Post-Approval Monitoring">Post-Approval Monitoring</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Regional Office</label>
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); setPage(1); }}
              className="w-full rounded border border-border bg-white px-2 py-1.5 text-xs text-txt-primary focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="">All Regions</option>
              <option value="Western Regional Office">Western Regional Office</option>
              <option value="Southern Regional Office">Southern Regional Office</option>
              <option value="Northern Regional Office">Northern Regional Office</option>
              <option value="Central Regional Office">Central Regional Office</option>
              <option value="Eastern Regional Office">Eastern Regional Office</option>
              <option value="South-Western Regional Office">South-Western Region</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Scrutiny Status</label>
            <select
              value={scrutinyStatus}
              onChange={(e) => { setScrutinyStatus(e.target.value); setPage(1); }}
              className="w-full rounded border border-border bg-white px-2 py-1.5 text-xs text-txt-primary focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="">All</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending</option>
              <option value="Clarification Requested">Clarification</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-secondary mb-1">EVC Status</label>
            <select
              value={evcStatus}
              onChange={(e) => { setEvcStatus(e.target.value); setPage(1); }}
              className="w-full rounded border border-border bg-white px-2 py-1.5 text-xs text-txt-primary focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="">All</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Compliance Status</label>
            <select
              value={complianceStatus}
              onChange={(e) => { setComplianceStatus(e.target.value); setPage(1); }}
              className="w-full rounded border border-border bg-white px-2 py-1.5 text-xs text-txt-primary focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="">All</option>
              <option value="Ready for Compliance Report">Ready for Report</option>
              <option value="Mandatory Requirements Pending">Mandatory Pending</option>
              <option value="Critical Deficiency Identified">Critical Deficiency</option>
              <option value="Manual Verification Required">Verification Required</option>
              <option value="Compliance Report Submitted">Report Submitted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-card border border-border shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 text-navy-800 animate-spin" />
            <span className="text-xs text-txt-secondary">Loading institutional records...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-navy-900">No Applications Found</h4>
            <p className="text-xs text-txt-secondary">Try adjusting your search criteria or resetting filters.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 text-xs font-semibold text-navy-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-txt-secondary font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Application ID</th>
                  <th className="p-3.5">Institution & Details</th>
                  <th className="p-3.5">Type & Region</th>
                  <th className="p-3.5">Workflow Stage</th>
                  <th className="p-3.5 text-center">Scrutiny</th>
                  <th className="p-3.5 text-center">EVC</th>
                  <th className="p-3.5 text-center">Compliance Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplication(app.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 font-mono font-bold text-navy-900 whitespace-nowrap">
                      {app.application_id}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        ID: {app.institution_id_str}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-[240px]">
                      <span className="font-bold text-txt-primary group-hover:text-navy-800 transition-colors block truncate">
                        {app.institution_name}
                      </span>
                      <span className="text-[11px] text-txt-secondary truncate block">
                        Assigned: {app.assigned_compliance_officer}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-800 block">{app.application_type}</span>
                      <span className="text-[11px] text-txt-secondary block">{app.regional_office}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-semibold text-navy-900 block">{app.current_stage}</span>
                      <span className="text-[10px] text-slate-400 block">Next: {app.next_action}</span>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <StatusBadge status={app.scrutiny_status} size="sm" showDot={false} />
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <StatusBadge status={app.evc_status} size="sm" showDot={false} />
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <StatusBadge status={app.compliance_status} size="sm" />
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApplication(app.id);
                        }}
                        className="px-3 py-1 bg-navy-800 group-hover:bg-navy-700 text-white font-semibold rounded text-xs transition-colors shadow-2xs"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-border flex items-center justify-between text-xs text-txt-secondary">
          <span>
            Showing <strong>{applications.length}</strong> of <strong>{total}</strong> applications
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-border bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-border bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

