import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { BrandEmblem } from '@/components/common/BrandEmblem';
import { RegBadge } from '@/components/common/RegBadge';
import { Clock, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkspaceNotAvailablePageProps {
  workspaceName?: string;
  expectedRole?: string;
}

export const WorkspaceNotAvailablePage: React.FC<WorkspaceNotAvailablePageProps> = ({
  workspaceName = 'AICTE Administration Workspace',
  expectedRole,
}) => {
  const { session, logout } = useAuth();

  const officerName = session?.displayName || session?.fullName || 'Authorized Officer';
  const officerRole = session?.role || expectedRole || 'AICTE Officer';

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-between antialiased text-slate-800">
      {/* Top Header */}
      <header className="bg-[#183B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#245B82] shadow-xs">
        <div className="flex items-center gap-3">
          <BrandEmblem size="sm" variant="gold" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">NiyamGraph</span>
              <RegBadge />
            </div>
            <span className="text-[10px] text-slate-300 block font-medium uppercase tracking-wider">
              AICTE Administration Authority
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-[#245B82] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Notice Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" aria-hidden="true" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identity Verified: {officerRole}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {workspaceName} Scheduled for Phase 2
            </h1>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Welcome, <strong>{officerName}</strong>. You have successfully authenticated with valid statutory credentials.
              The <strong>{workspaceName}</strong> module is currently under active implementation for Academic Year 2026-27.
            </p>
          </div>

          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="font-semibold text-slate-800">Your Account Details:</div>
            <div className="text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div><strong>Name:</strong> {officerName}</div>
              <div><strong>Email:</strong> {session?.email}</div>
              <div><strong>Assigned Role:</strong> {officerRole}</div>
              <div><strong>Target Route:</strong> {session?.portalRedirectUrl}</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portal</span>
            </Link>

            <button
              onClick={logout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-brand-navy hover:bg-brand-navy-dark text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Administration</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-[11px] text-slate-500">
        NiyamGraph Regulatory Authority Platform • AICTE Administration Governance
      </footer>
    </div>
  );
};

