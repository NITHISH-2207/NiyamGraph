import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, GraduationCap, Landmark } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 md:py-28 bg-brand-bg min-h-[70vh] flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-white border border-brand-border text-brand-navy flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8 text-brand-blue" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-800">
            HTTP 404 • RECORD NOT LOCATED
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
            The regulatory route or document record you requested does not exist or has been relocated within the NiyamGraph registry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue-hover shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Return to Home</span>
          </Link>
          <Link
            to="/institution/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-white border border-brand-border text-brand-navy text-sm font-semibold hover:bg-slate-50 shadow-xs transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-brand-blue" aria-hidden="true" />
            <span>Institution Login</span>
          </Link>
          <Link
            to="/admin/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-white border border-brand-border text-brand-navy text-sm font-semibold hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Landmark className="w-4 h-4 text-brand-gold" aria-hidden="true" />
            <span>Official Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

