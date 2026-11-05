import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { scrutinyService } from '@/services/scrutinyService';

export const DeficiencyListPage: React.FC = () => {
  const [deficiencies, setDeficiencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const defs1 = await scrutinyService.getDeficiencyHistory('APP-2026-ARCH-3011');
        const defs2 = await scrutinyService.getDeficiencyHistory('APP-2026-ENG-8492');
        setDeficiencies([...defs1, ...defs2]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-brand-border">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
          Statutory Compliance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
          Deficiency Notice Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Formal notices communicated to institutions with 15-day rectification windows and tracking.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-brand-border">
          <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold uppercase">Loading Notices...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deficiencies.length > 0 ? (
            deficiencies.map((notice) => (
              <div key={notice.notice_id} className="p-5 rounded-xl bg-white border border-brand-border shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-mono text-xs sm:text-sm font-bold text-brand-navy">
                      Notice Ref: {notice.reference_number}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Status: {notice.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700">{notice.general_remarks}</p>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Deficiency Items
                  </h4>
                  {notice.items.map((item: any) => (
                    <div key={item.item_id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <p className="font-semibold text-brand-navy">{item.requirement_summary}</p>
                      <p className="text-slate-600">Problem: {item.observed_deficiency}</p>
                      <p className="text-brand-blue font-medium">Rectification: {item.required_correction}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100">
                  <span>Issued: {notice.issue_date ? new Date(notice.issue_date).toLocaleDateString() : 'Draft'} • Due: {notice.due_date ? new Date(notice.due_date).toLocaleDateString() : 'N/A'}</span>
                  <Link
                    to={`/scrutiny/applications/${notice.items[0]?.source_document ? 'APP-2026-ARCH-3011' : 'APP-2026-ENG-8492'}?tab=deficiencies`}
                    className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:text-brand-blue-hover"
                  >
                    <span>View in Application Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-brand-border text-xs text-slate-500">
              No formal deficiency notices issued yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
