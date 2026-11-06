import React, { useState } from 'react';
import { X, Send, HelpCircle, AlertCircle } from 'lucide-react';

interface ClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'Scrutiny' | 'EVC';
  reportReference: string;
  targetOfficerName: string;
  findingCode?: string;
  findingText?: string;
  onSubmitClarification: (reason: string) => Promise<void>;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  isOpen,
  onClose,
  reportType,
  reportReference,
  targetOfficerName,
  findingCode,
  findingText,
  onSubmitClarification,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide detailed clarification instructions for the team.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmitClarification(reason);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit clarification request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-card shadow-2xl border border-border w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-navy-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-saffron-500" />
            <h3 className="text-base font-semibold">
              Request Clarification from {reportType} Team
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-surface-subtle border border-border p-3 rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-txt-secondary font-medium">Report Reference:</span>
              <span className="font-semibold text-navy-900">{reportReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-txt-secondary font-medium">Assigned Committee Lead:</span>
              <span className="font-semibold text-navy-900">{targetOfficerName}</span>
            </div>
            {findingCode && (
              <div className="pt-2 border-t border-slate-200 text-txt-secondary">
                <span className="font-medium text-navy-800">Related Requirement: </span>
                <span className="font-mono font-semibold">{findingCode}</span>
                {findingText && <p className="mt-1 italic text-slate-600 line-clamp-2">"{findingText}"</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
              Clarification Instructions / Discrepancy Details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Specify the exact verification point, documentary shortfall, or physical discrepancy that requires committee clarification..."
              className="w-full text-sm rounded-lg border border-border p-3 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Dispatch Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

