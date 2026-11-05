import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const AuthFormField = React.forwardRef<HTMLInputElement, AuthFormFieldProps>(
  ({ id, label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 text-left">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          {label}
        </label>

        <div className="relative rounded-md shadow-2xs">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={`block w-full rounded-md border text-sm transition-colors min-h-[44px] py-2.5 ${
              icon ? 'pl-10' : 'pl-3.5'
            } pr-3.5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-400/30'
                : 'border-slate-300 focus:border-brand-blue focus:ring-brand-blue/30'
            } ${className}`}
            {...props}
          />
        </div>

        {error ? (
          <p
            id={`${id}-error`}
            className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${id}-helper`} className="text-[11px] text-slate-500 mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

AuthFormField.displayName = 'AuthFormField';

