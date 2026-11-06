import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { ApprovalCondition } from '../types/compliance';
import { StatusBadge } from '../components/common/StatusBadge';

interface ApprovalConditionsPageProps {
  onSelectApplication: (id: number) => void;
}

export const ApprovalConditionsPage: React.FC<ApprovalConditionsPageProps> = ({ onSelectApplication }) => {
  const [conditions, setConditions] = useState<ApprovalCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      const res = await api.getApprovalConditions(statusFilter || undefined);
      setConditions(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, [statusFilter]);

  const handleUpdateStatus = async (condId: number, newStatus: string) => {
    try {
      setUpdatingId(condId);
      await api.updateApprovalCondition(condId, { condition_status: newStatus });
      await fetchConditions();
    } catch (err: any) {
      alert(`Error updating condition: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = conditions.filter((c) =>
    c.condition_description.toLowerCase().includes(search.toLowerCase()) ||
    c.condition_code.toLowerCase().includes(search.toLowerCase()) ||
    (c.institution_name && c.institution_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Header Toolbar */}
      <div className="bg-white rounded-card border border-border p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-navy-900">Post-Approval Compliance Obligations</h3>
          <p className="text-xs text-txt-secondary">
            Monitor statutory approval conditions, evidence submissions, and deadlines across institutions
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-border px-3 py-2 bg-white text-txt-primary focus:outline-none focus:ring-1 focus:ring-navy-600"
          >
            <option value="">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Evidence Submitted">Evidence Submitted</option>
            <option value="Satisfied">Satisfied</option>
            <option value="Overdue">Overdue</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conditions..."
              className="w-full text-xs rounded-lg border border-border pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-600"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-navy-800 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-card border border-border p-8 text-center text-xs text-txt-secondary">
          No approval conditions found.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((cond) => {
            const isOverdue = cond.condition_status === 'Overdue';

            return (
              <div
                key={cond.id}
                className={`bg-white rounded-card border p-4.5 space-y-3 transition-all shadow-2xs hover:border-navy-600/40 ${
                  isOverdue ? 'border-rose-300 bg-rose-50/15' : 'border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-navy-900 px-2 py-0.5 rounded bg-surface-subtle border border-border">
                        {cond.condition_code}
                      </span>
                      {cond.mandatory && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                          Mandatory Condition
                        </span>
                      )}
                      <StatusBadge status={cond.condition_status} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-navy-950">
                      {cond.institution_name || 'Apex Institute of Technology & Management'}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-txt-secondary font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-navy-600" />
                      Due: <strong className={isOverdue ? 'text-red-700' : 'text-slate-800'}>
                        {new Date(cond.due_date).toLocaleDateString()}
                      </strong>
                    </span>
                    <button
                      onClick={() => onSelectApplication(cond.application_id)}
                      className="px-2.5 py-1 text-xs font-semibold text-navy-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors flex items-center gap-1"
                    >
                      <span>Application</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-txt-primary leading-relaxed font-medium">
                    {cond.condition_description}
                  </p>
                  <span className="text-[11px] text-txt-secondary block">
                    Statutory Criterion: <strong className="text-slate-700">{cond.regulatory_reference}</strong>
                  </span>
                </div>

                {/* Evidence & Officer Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-txt-secondary">
                    {cond.evidence_reference ? (
                      <span className="font-mono text-[11px] text-navy-800 bg-slate-100 px-2 py-1 rounded">
                        Submitted Proof: {cond.evidence_reference}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No verification proof submitted yet by institution.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Update Status:</span>
                    <select
                      disabled={updatingId === cond.id}
                      value={cond.condition_status}
                      onChange={(e) => handleUpdateStatus(cond.id, e.target.value)}
                      className="text-xs rounded border border-border bg-white px-2 py-1 font-semibold text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-600"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Evidence Submitted">Evidence Submitted</option>
                      <option value="Under Verification">Under Verification</option>
                      <option value="Satisfied">Satisfied</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

