import React, { useEffect, useState } from 'react';
import { History, Search, RefreshCw, ShieldCheck, Filter } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types/compliance';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditTrail();
      setLogs(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.officer_name.toLowerCase().includes(search.toLowerCase()) ||
    (l.remarks && l.remarks.toLowerCase().includes(search.toLowerCase())) ||
    (l.application_id_str && l.application_id_str.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-card border border-border p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-navy-900">Regulatory Audit Trail & Accountability Log</h3>
          <p className="text-xs text-txt-secondary">
            Immutable system audit logs tracking report reviews, clarifications, assessments, and consolidated submissions
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit actions, officers, apps..."
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
          No audit entries found.
        </div>
      ) : (
        <div className="bg-white rounded-card border border-border overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-txt-secondary font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Log ID & Time</th>
                  <th className="p-3.5">Acting Officer & Role</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Application</th>
                  <th className="p-3.5">Record Context / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono text-slate-400 block text-[10px]">#AUD-{log.id}</span>
                      <span className="font-medium text-slate-700">
                        {new Date(log.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <strong className="text-navy-900 block">{log.officer_name}</strong>
                      <span className="text-[11px] text-txt-secondary">{log.role}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-subtle border border-border font-mono font-bold text-navy-800 text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-navy-900 whitespace-nowrap">
                      {log.application_id_str || 'N/A'}
                    </td>
                    <td className="p-3.5 text-txt-primary max-w-sm">
                      {log.remarks || 'Standard compliance action execution.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

