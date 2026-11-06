import React from 'react';
import { X, FileText, Image as ImageIcon, ExternalLink, ShieldCheck } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  evidenceRef: string;
  category: string;
  notes?: string;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  title,
  evidenceRef,
  category,
  notes,
}) => {
  if (!isOpen) return null;

  const isImage = evidenceRef.toLowerCase().includes('.jpg') || evidenceRef.toLowerCase().includes('.png') || evidenceRef.toLowerCase().includes('img');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-card shadow-2xl border border-border w-full max-w-xl overflow-hidden">
        <div className="bg-navy-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-saffron-500" />
            <h3 className="text-base font-semibold truncate max-w-md">
              Regulatory Verification Evidence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-navy-900">{title}</h4>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-surface-subtle text-txt-secondary border border-border">
              Category: {category}
            </span>
          </div>

          <div className="border border-border rounded-lg p-6 bg-slate-50 flex flex-col items-center justify-center text-center min-h-[180px]">
            {isImage ? (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-navy-900 font-mono">
                    {evidenceRef}
                  </p>
                  <p className="text-[11px] text-txt-secondary">
                    Geo-tagged photograph attached by EVC committee with GPS coordinates and physical timestamp.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-navy-800 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-navy-900 font-mono">
                    {evidenceRef}
                  </p>
                  <p className="text-[11px] text-txt-secondary">
                    Digitally signed document submitted through Institution Portal and verified by Scrutiny team.
                  </p>
                </div>
              </div>
            )}
          </div>

          {notes && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 space-y-1">
              <span className="font-semibold block">Inspection Remark / Summary:</span>
              <p className="text-txt-primary">{notes}</p>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition-colors"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

