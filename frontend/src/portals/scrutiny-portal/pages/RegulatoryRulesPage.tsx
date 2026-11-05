import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { scrutinyService, RegulatoryRuleItem } from '@/services/scrutinyService';

export const RegulatoryRulesPage: React.FC = () => {
  const [rules, setRules] = useState<RegulatoryRuleItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRules = async () => {
      setIsLoading(true);
      try {
        const res = await scrutinyService.getApplicableRules('APP-2026-ENG-8492');
        setRules(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRules();
  }, []);

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.clause_reference.toLowerCase().includes(search.toLowerCase()) ||
      r.requirement_description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-brand-border">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
          Normative Framework
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
          AICTE Regulatory Criteria Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configurable rule foundation powering deterministic validation and AI document scrutiny.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">DEMONSTRATION REGULATORY DATA</p>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            These rules represent demonstration criteria synthesized for project prototyping based on Approval Process Handbook (APH 2026-27). Official regulations must be configured through authorized administrative channels.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white border border-brand-border shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by clause or requirement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-brand-border bg-white text-slate-700"
          aria-label="Filter by Rule Category"
        >
          <option value="ALL">All Categories</option>
          <option value="MANDATORY_DOCUMENT">Mandatory Document</option>
          <option value="NUMERICAL_THRESHOLD">Numerical Threshold</option>
          <option value="DATE_VALIDITY">Date Validity</option>
          <option value="CROSS_DOCUMENT_CONSISTENCY">Cross-Document Consistency</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-brand-border">
          <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold uppercase">Loading Criteria...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRules.map((r) => (
            <div key={r.id} className="p-5 rounded-xl bg-white border border-brand-border shadow-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-brand-navy text-white">
                    {r.clause_reference}
                  </span>
                  <h3 className="text-sm font-bold text-brand-navy">{r.title}</h3>
                </div>
                <span className="text-[11px] font-semibold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                  {r.category}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{r.requirement_description}</p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex flex-wrap gap-4">
                <span>Handbook: {r.regulation_name}</span>
                <span>Source: {r.source_document} ({r.source_page || 'Section IV'})</span>
                <span>Version: {r.current_version}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
