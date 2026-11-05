import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Building2,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import { scrutinyService, QueueResponse } from '@/services/scrutinyService';

export const ScrutinyQueuePage: React.FC = () => {
  const [queueData, setQueueData] = useState<QueueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('priority');
  const [page, setPage] = useState(1);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await scrutinyService.getQueue({
        search: search.trim() || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        application_type: selectedType !== 'ALL' ? selectedType : undefined,
        sort_by: sortBy,
        page,
        page_size: 10,
      });
      setQueueData(res);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedStatus, selectedType, sortBy, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQueue();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCRUTINY_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand-blue border border-blue-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
            <span>In Examination</span>
          </span>
        );
      case 'RESUBMISSION_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
            <span>Resubmission Received</span>
          </span>
        );
      case 'ASSIGNED_TO_SCRUTINY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Awaiting Scrutiny</span>
          </span>
        );
      case 'DEFICIENCY_ISSUED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80 whitespace-nowrap">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Deficiency Issued</span>
          </span>
        );
      case 'FORWARDED_TO_EVC':
      case 'SCRUTINY_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dispatched to EVC</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string, reason: string) => {
    if (priority === 'ESCALATED' || priority === 'HIGH') {
      return (
        <span
          title={reason}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          <span>High Urgency</span>
        </span>
      );
    }
    return (
      <span
        title={reason}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 whitespace-nowrap"
      >
        <span>Standard</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Workload Allocation & Queue
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-0.5">
            My Scrutiny Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Applications assigned for statutory document examination and regulatory compliance evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchQueue}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-brand-navy hover:bg-slate-50 shadow-xs transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Search & Sort Row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Application ID or Institution Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              aria-label="Filter by Application Type"
            >
              <option value="ALL">All Schemes</option>
              <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
              <option value="New Program / Course Addition">New Program / Course Addition</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              aria-label="Sort Applications"
            >
              <option value="priority">Sort by: Urgency & Deadlines</option>
              <option value="submission_date">Sort by: Submission Date</option>
              <option value="deadline">Sort by: Days to Deadline</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-brand-navy text-white text-xs sm:text-sm font-semibold hover:bg-brand-navy-dark transition-colors shrink-0 shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-slate-500 shrink-0">Stage Filter:</span>
          {[
            { id: 'ALL', label: 'All Active Applications' },
            { id: 'RESUBMISSION_RECEIVED', label: 'Resubmissions Awaiting Review' },
            { id: 'SCRUTINY_IN_PROGRESS', label: 'In Examination' },
            { id: 'ASSIGNED_TO_SCRUTINY', label: 'Awaiting Examination' },
            { id: 'SCRUTINY_COMPLETED', label: 'Completed' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                setSelectedStatus(pill.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === pill.id
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Listing: Desktop Table + Mobile Cards */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Application Queue...
          </p>
        </div>
      ) : queueData?.items && queueData.items.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table with Horizontal Scroll Support */}
          <div className="hidden lg:block overflow-x-auto rounded-xl bg-white border border-slate-200 shadow-xs">
            <table className="min-w-[1020px] w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Application & Sponsoring Institution</th>
                  <th className="px-6 py-4">Statutory Scheme</th>
                  <th className="px-6 py-4">Current Stage</th>
                  <th className="px-6 py-4">Assigned On</th>
                  <th className="px-6 py-4">SLA Pendency</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueData.items.map((item) => (
                  <tr key={item.application_id} className="hover:bg-blue-50/20 transition-colors group">
                    {/* Column 1: Application ID & Institution Details */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-navy group-hover:text-white transition-colors">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-brand-navy bg-slate-100 px-2 py-0.5 rounded">
                              {item.application_id}
                            </span>
                            {getPriorityBadge(item.priority_level, item.priority_reason)}
                          </div>
                          <p className="text-sm font-bold text-brand-navy group-hover:text-brand-blue transition-colors leading-snug">
                            {item.institution_name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.institution_category} • Southern Region
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Scheme & Academic Year */}
                    <td className="px-6 py-4.5">
                      <span className="font-semibold text-slate-800 block text-xs">
                        {item.application_type}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                        AY {item.academic_year}
                      </span>
                    </td>

                    {/* Column 3: Current Status Badge */}
                    <td className="px-6 py-4.5">{getStatusBadge(item.current_status)}</td>

                    {/* Column 4: Assigned Date */}
                    <td className="px-6 py-4.5">
                      <div className="space-y-0.5 text-slate-600">
                        <span className="font-medium block">
                          {new Date(item.assigned_date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          By Regional Desk ({item.assigned_by})
                        </span>
                      </div>
                    </td>

                    {/* Column 5: SLA Pendency */}
                    <td className="px-6 py-4.5">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-semibold block">
                          {item.pending_duration_days} days elapsed
                        </span>
                        {item.days_to_deadline !== null && item.days_to_deadline !== undefined && (
                          <span
                            className={`text-[11px] font-semibold block ${
                              item.days_to_deadline <= 2 ? 'text-rose-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {item.days_to_deadline > 0 ? `${item.days_to_deadline} days remaining` : 'Due today'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 6: Action Button */}
                    <td className="px-6 py-4.5 text-right">
                      <Link
                        to={`/scrutiny/applications/${item.application_id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-dark transition-colors shadow-xs whitespace-nowrap"
                      >
                        <span>Examine Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="block lg:hidden space-y-3">
            {queueData.items.map((item) => (
              <div
                key={item.application_id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brand-navy bg-slate-100 px-2 py-0.5 rounded">
                      {item.application_id}
                    </span>
                    {getPriorityBadge(item.priority_level, item.priority_reason)}
                  </div>
                  {getStatusBadge(item.current_status)}
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-brand-navy">{item.institution_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.institution_category}</p>
                </div>

                <div className="text-xs space-y-1.5 py-2.5 border-y border-slate-100 text-slate-600">
                  <div className="flex justify-between">
                    <span>Scheme:</span>
                    <span className="font-semibold text-slate-800">{item.application_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Academic Year:</span>
                    <span className="font-mono text-slate-700">AY {item.academic_year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendency:</span>
                    <span className="font-semibold text-slate-800">{item.pending_duration_days} days</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    to={`/scrutiny/applications/${item.application_id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-dark transition-colors shadow-xs"
                  >
                    <span>Open Scrutiny Dossier</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {queueData.total_pages > 1 && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {queueData.page} of {queueData.total_pages} ({queueData.total} applications)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={queueData.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={queueData.page >= queueData.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <p className="text-sm font-bold text-brand-navy">No applications found</p>
          <p className="text-xs text-slate-500">Try adjusting your search terms or stage filters.</p>
        </div>
      )}
    </div>
  );
};
