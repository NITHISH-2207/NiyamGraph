import React from 'react';
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from 'lucide-react';

interface ApplicationFooterActionsProps {
  currentSectionIndex: number;
  totalSections: number;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onGoToReview: () => void;
}

export const ApplicationFooterActions: React.FC<ApplicationFooterActionsProps> = ({
  currentSectionIndex,
  totalSections,
  onPrev,
  onNext,
  onSaveDraft,
  onGoToReview,
}) => {
  const isFirst = currentSectionIndex === 1;
  const isLast = currentSectionIndex === totalSections;

  return (
    <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 rounded-b-lg shadow-md flex items-center justify-between gap-3">
      {/* Left: Previous */}
      <div>
        {!isFirst ? (
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Section</span>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onSaveDraft}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          <span>Save Draft</span>
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoToReview}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Submission</span>
          </button>
        )}
      </div>
    </div>
  );
};
