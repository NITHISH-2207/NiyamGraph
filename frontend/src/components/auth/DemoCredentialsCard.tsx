import React, { useState, useCallback, useEffect } from 'react';
import { demoCredentialsConfig } from '@/config/demoConfig';
import { Copy, Check, KeyRound } from 'lucide-react';

export const DemoCredentialsCard: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Diagnostic warning in development if demo credentials are expected but not fully configured
  useEffect(() => {
    if (import.meta.env.DEV && !demoCredentialsConfig.showDemoCredentials) {
      if (demoCredentialsConfig.missingVariables.length > 0 && import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === 'true') {
        console.warn(
          '[NiyamGraph Demo] Demo credentials card is hidden because configuration is incomplete. Missing variables:',
          demoCredentialsConfig.missingVariables.join(', ')
        );
      }
    }
  }, []);

  const handleCopy = useCallback((textToCopy: string, fieldName: string) => {
    if (!textToCopy) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopiedField(fieldName);
          setTimeout(() => setCopiedField(null), 2000);
        })
        .catch(() => fallbackCopy(textToCopy, fieldName));
    } else {
      fallbackCopy(textToCopy, fieldName);
    }
  }, []);

  const fallbackCopy = (textToCopy: string, fieldName: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.warn('Fallback copy failed:', err);
    }
  };

  if (!demoCredentialsConfig.showDemoCredentials) {
    return null;
  }

  const items = [
    {
      key: 'institutionId',
      label: 'Institution ID',
      value: demoCredentialsConfig.institutionId,
      ariaLabel: 'Copy Institution ID',
    },
    {
      key: 'email',
      label: 'Registered Email',
      value: demoCredentialsConfig.email,
      ariaLabel: 'Copy Registered Email',
    },
    {
      key: 'password',
      label: 'Password',
      value: demoCredentialsConfig.password,
      ariaLabel: 'Copy Password',
    },
  ];

  return (
    <div
      className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-700 shadow-2xs"
      aria-labelledby="demo-credentials-title"
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
        <KeyRound className="w-3.5 h-3.5 text-brand-blue" aria-hidden="true" />
        <span id="demo-credentials-title">Demo Access Credentials</span>
      </div>

      {/* Credential rows with copy buttons */}
      <div className="space-y-1.5">
        {items.map((item) => {
          const isCopied = copiedField === item.key;
          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded bg-white border border-slate-200 text-xs shadow-2xs"
            >
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 w-28">
                  {item.label}:
                </span>
                <span className="font-mono text-slate-800 text-[11px] truncate select-all">
                  {item.value}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(item.value, item.key)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border shrink-0 ${
                  isCopied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-300'
                }`}
                aria-label={item.ariaLabel}
                title={item.ariaLabel}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                    <span className="text-[10px] font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" aria-hidden="true" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Explanatory Note */}
      <p className="text-[11px] text-slate-500 italic pt-2 leading-relaxed">
        Use these credentials to explore the Institution Portal demonstration.
      </p>

      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {copiedField ? `${items.find((i) => i.key === copiedField)?.label} copied to clipboard` : ''}
      </div>
    </div>
  );
};
