import React from 'react';
import { SectionMeta } from '../../types/application';
import { Check, AlertCircle } from 'lucide-react';

interface ApplicationStepperProps {
  sections: SectionMeta[];
  currentSectionIndex: number;
  highestSectionIndex: number;
  sectionCompletionStatus: Record<string, boolean>;
  onSelectSection: (index: number) => void;
  sectionWarningCounts?: Record<string, number>;
}

export const ApplicationStepper: React.FC<ApplicationStepperProps> = ({
  sections,
  currentSectionIndex,
  highestSectionIndex,
  sectionCompletionStatus,
  onSelectSection,
  sectionWarningCounts = {},
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
      {/* Desktop Stepper */}
      <nav aria-label="Application Progress Stepper" className="hidden lg:block">
        <ol className="grid grid-cols-6 gap-2">
          {sections.map((section) => {
            const isCurrent = section.index === currentSectionIndex;
            const isCompleted = sectionCompletionStatus[section.id];
            const isAccessible = section.index <= highestSectionIndex || isCompleted;
            const hasWarnings = (sectionWarningCounts[section.id] || 0) > 0;

            return (
              <li key={section.id} className="relative">
                <button
                  type="button"
                  onClick={() => isAccessible && onSelectSection(section.index)}
                  disabled={!isAccessible}
                  className={`w-full text-left p-3 rounded-md transition-all flex flex-col gap-1.5 border ${
                    isCurrent
                      ? 'bg-brand-blue/5 border-brand-blue ring-1 ring-brand-blue/20'
                      : isCompleted
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 cursor-pointer'
                      : isAccessible
                      ? 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                      : 'bg-slate-50/50 border-slate-100 opacity-60 cursor-not-allowed'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-brand-blue text-white shadow-2xs'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : section.index}
                    </span>

                    {hasWarnings && (
                      <span
                        className="inline-flex items-center text-amber-600"
                        title="Section has pending items"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div>
                    <span
                      className={`text-xs font-semibold block truncate ${
                        isCurrent ? 'text-brand-blue font-bold' : 'text-slate-800'
                      }`}
                    >
                      {section.shortTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile & Tablet Compact View */}
      <div className="lg:hidden flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">
            {currentSectionIndex}
          </span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Step {currentSectionIndex} of 6: {sections[currentSectionIndex - 1]?.title}
            </span>
            <span className="text-[10px] text-slate-500">
              {sectionCompletionStatus[sections[currentSectionIndex - 1]?.id]
                ? 'Completed'
                : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Quick Jump Selector */}
        <select
          value={currentSectionIndex}
          onChange={(e) => onSelectSection(Number(e.target.value))}
          className="text-xs border border-slate-300 rounded-md p-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          aria-label="Select section"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.index}>
              {s.shortTitle} {sectionCompletionStatus[s.id] ? '✓' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

