import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { InstitutionProfileData } from '../../types/application';

interface SubmissionSuccessViewProps {
  referenceNumber: string;
  category: string;
  academicYear: string;
  profile: InstitutionProfileData;
  adminName: string;
  adminDesignation: string;
  onResetToDraft?: () => void;
}

export const SubmissionSuccessView: React.FC<SubmissionSuccessViewProps> = ({
  referenceNumber,
  category,
  academicYear,
  profile,
  adminName,
  adminDesignation,
}) => {
  const navigate = useNavigate();
  const submissionTime = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  const handleDownloadReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in">
      {/* Success Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-xs text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Filing Successfully Submitted
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 pt-2">
            Extension of Approval Application Submitted
          </h1>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Your application for Extension of Approval (EoA) has been cryptographically logged into the regulatory scrutiny queue.
          </p>
        </div>

        {/* Reference & Snapshot Box */}
        <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 text-left max-w-xl mx-auto space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="text-xs font-medium text-slate-500">Application Reference Number:</span>
            <span className="font-mono text-sm font-bold text-slate-900">{referenceNumber}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="text-xs font-medium text-slate-500">Institution:</span>
            <span className="text-xs font-semibold text-slate-800 text-right">
              {profile.officialName} (PID: {profile.identifier})
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="text-xs font-medium text-slate-500">Regulatory Category:</span>
            <span className="text-xs font-semibold text-slate-800">{category}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="text-xs font-medium text-slate-500">Academic Year:</span>
            <span className="text-xs font-bold text-brand-blue">{academicYear}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="text-xs font-medium text-slate-500">Submitted By:</span>
            <span className="text-xs font-semibold text-slate-800">
              {adminName} ({adminDesignation})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500">Submission Timestamp:</span>
            <span className="text-xs font-mono text-slate-700">{submissionTime}</span>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 max-w-xl mx-auto text-left leading-relaxed">
          <strong>Official Regulatory Notice:</strong> This document serves as an electronic acknowledgement receipt confirming receipt of your institutional self-disclosure. It does not constitute a grant of AICTE approval. Extension of Approval is subject to scrutiny and council decisions.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print / Save Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/institution/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Return to Institution Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
