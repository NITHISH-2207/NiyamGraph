import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface WorkflowTimelineProps {
  currentStage: string;
  scrutinyStatus?: string;
  evcStatus?: string;
  complianceStatus?: string;
}

const STAGES = [
  { key: 'submission', label: 'Application Submitted' },
  { key: 'scrutiny', label: 'Scrutiny Review' },
  { key: 'evc', label: 'EVC Physical Inspection' },
  { key: 'compliance', label: 'Consolidated Assessment' },
  { key: 'report', label: 'Report Submission' },
  { key: 'monitoring', label: 'Approval & Conditions' },
];

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  currentStage,
  scrutinyStatus,
  evcStatus,
  complianceStatus,
}) => {
  const normStage = (currentStage || '').toLowerCase();

  const getStageIndex = () => {
    if (normStage.includes('submitted') && !normStage.includes('report') && !normStage.includes('assessment')) return 0;
    if (normStage.includes('scrutiny')) return 1;
    if (normStage.includes('evc')) return 2;
    if (normStage.includes('compliance review') || normStage.includes('deficiency') || normStage.includes('assessment ready')) return 3;
    if (normStage.includes('report submitted') || normStage.includes('assessment submitted')) return 4;
    if (normStage.includes('post-approval') || normStage.includes('monitoring') || normStage.includes('approved')) return 5;
    return 3;
  };

  const currentIndex = getStageIndex();

  return (
    <div className="w-full bg-white rounded-card border border-border p-4.5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-navy-900">
            Regulatory Workflow Progression
          </h4>
          <p className="text-xs text-txt-secondary">
            AICTE-style multi-committee verification pipeline
          </p>
        </div>
        <div className="text-xs font-medium px-2.5 py-1 rounded bg-surface-subtle text-navy-800 border border-border">
          Active Stage: <strong className="text-navy-900">{currentStage}</strong>
        </div>
      </div>

      <div className="relative flex items-center justify-between w-full">
        {/* Connecting Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-navy-800 transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 95}%` }}
        />

        {STAGES.map((stg, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <div key={stg.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#237A46] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-navy-800 text-white ring-4 ring-navy-800/20'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium text-center max-w-[90px] leading-tight ${
                  isCurrent
                    ? 'text-navy-900 font-semibold'
                    : isCompleted
                    ? 'text-txt-primary'
                    : 'text-slate-400'
                }`}
              >
                {stg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

