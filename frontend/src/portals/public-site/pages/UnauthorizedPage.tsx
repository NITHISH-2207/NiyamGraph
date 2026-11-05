import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { session, logout } = useAuth();
  const location = useLocation();

  const state = location.state as { attemptedPath?: string; requiredRoles?: string[] } | undefined;
  const attemptedPath = state?.attemptedPath || location.pathname;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full bg-white rounded-lg border border-red-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" aria-hidden="true" />
        </div>

        <div>
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">
            403 Forbidden Access
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Unauthorized Workspace Access
          </h1>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Your authenticated account does not have permission to access the requested route:
            <br />
            <code className="mt-1 inline-block font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 text-[11px]">
              {attemptedPath}
            </code>
          </p>
        </div>

        {session && (
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs text-left">
            <div className="text-slate-500 text-[11px] font-medium">Currently Authenticated As:</div>
            <div className="font-semibold text-slate-800 mt-0.5">{session.displayName || session.email}</div>
            <div className="text-slate-600 text-[11px] mt-0.5">Assigned Role: <strong>{session.role}</strong></div>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2">
          {session?.portalRedirectUrl && (
            <Link
              to={session.portalRedirectUrl}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-dark transition-colors shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Go to Your Assigned Workspace</span>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            <button
              onClick={logout}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

