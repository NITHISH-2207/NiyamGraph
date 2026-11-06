import React from 'react';
import { EOA_RULESET_INFO } from '../../data/eoaDevelopmentFixtures';
import { ShieldAlert, Layers } from 'lucide-react';

interface ApplicationProgressProps {
  completedSectionsCount: number;
  overallProgressPercent: number;
  uploadedDocsCount: number;
  mandatoryDocsTotal: number;
}

export const ApplicationProgress: React.FC<ApplicationProgressProps> = ({
  completedSectionsCount,
  overallProgressPercent,
  uploadedDocsCount,
  mandatoryDocsTotal,
}) => {
  return (
    <div className="space-y-3">
      {/* Ruleset Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{EOA_RULESET_INFO.label}</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
              {EOA_RULESET_INFO.version}
            </span>
          </div>
          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
            {EOA_RULESET_INFO.notice}
          </p>
        </div>
      </div>

      {/* Progress Bar & Summary Stats */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-blue" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Application Readiness
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-600">
              Sections Completed:{' '}
              <strong className="text-slate-900">{completedSectionsCount} of 6</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Mandatory Documents:{' '}
              <strong className="text-slate-900">
                {uploadedDocsCount} of {mandatoryDocsTotal}
              </strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-brand-blue">{overallProgressPercent}% Complete</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-brand-blue transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, overallProgressPercent)}%` }}
            role="progressbar"
            aria-valuenow={overallProgressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
};
