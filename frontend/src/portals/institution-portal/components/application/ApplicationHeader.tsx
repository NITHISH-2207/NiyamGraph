import React from 'react';
import { SaveStatus } from '../../hooks/useApplicationForm';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Calendar,
} from 'lucide-react';

interface ApplicationHeaderProps {
  category: string;
  academicYear: string;
  referenceNumber: string;
  status: string;
  saveStatus: SaveStatus;
  lastSavedAt: Date;
  onSaveDraft: () => void;
  isSubmitted?: boolean;
}

export const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({
  category,
  academicYear,
  referenceNumber,
  status,
  saveStatus,
  lastSavedAt,
  onSaveDraft,
  isSubmitted = false,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
      {/* Top Breadcrumb & Status Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Institution Portal</span>
          <span>/</span>
          <span className="text-slate-800 font-medium">Submit Application</span>
          <span>/</span>
          <span className="text-brand-blue font-semibold">{academicYear}</span>
        </div>

        {/* Save Status & Action */}
        {!isSubmitted && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-blue" />
                  <span className="text-slate-600 font-medium">Saving draft...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-500">
                    Draft saved at{' '}
                    <span className="font-mono text-slate-700">
                      {lastSavedAt.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-700">Unsaved changes</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-red-700">Autosave failed</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>
          </div>
        )}
      </div>

      {/* Title, Badges and Reference Row */}
      <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Submit Application
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#183B5D]/10 text-[#183B5D]">
              <Calendar className="w-3 h-3" />
              {academicYear}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                status === 'Submitted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {category} &mdash; Statutory institutional regulatory compliance filing.
          </p>
        </div>

        {/* Application Reference Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 px-3.5 shrink-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
            Application Reference
          </span>
          <span className="font-mono text-sm font-bold text-slate-800">
            {referenceNumber}
          </span>
        </div>
      </div>
    </div>
  );
};
