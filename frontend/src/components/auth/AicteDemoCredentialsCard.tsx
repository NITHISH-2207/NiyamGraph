import React, { useState, useCallback } from 'react';
import { AICTE_DEMO_OFFICERS, demoCredentialsConfig, OfficerDemoAccount } from '@/config/demoConfig';
import { Copy, Check, KeyRound, Zap } from 'lucide-react';

interface AicteDemoCredentialsCardProps {
  onAutofill: (email: string, password: string) => void;
}

export const AicteDemoCredentialsCard: React.FC<AicteDemoCredentialsCardProps> = ({ onAutofill }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const demoPassword = demoCredentialsConfig.password || 'YourTestPassword123!';

  const handleCopy = useCallback((textToCopy: string, key: string) => {
    if (!textToCopy) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopiedKey(key);
          setTimeout(() => setCopiedKey(null), 2000);
        })
        .catch(() => fallbackCopy(textToCopy, key));
    } else {
      fallbackCopy(textToCopy, key);
    }
  }, []);

  const fallbackCopy = (textToCopy: string, key: string) => {
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
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.warn('Fallback copy failed:', err);
    }
  };

  return (
    <div
      className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-700 shadow-2xs"
      aria-labelledby="aicte-demo-title"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <KeyRound className="w-3.5 h-3.5 text-brand-navy" aria-hidden="true" />
          <span id="aicte-demo-title">Demonstration Officer Accounts</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          PWD: {demoPassword}
        </span>
      </div>

      <div className="space-y-2">
        {AICTE_DEMO_OFFICERS.map((officer: OfficerDemoAccount) => {
          const isCopied = copiedKey === officer.key;
          return (
            <div
              key={officer.key}
              className="p-2 rounded bg-white border border-slate-200 text-xs shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold text-slate-900">{officer.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      officer.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {officer.workspaceName}
                  </span>
                </div>
                <div className="font-mono text-slate-600 text-[11px] truncate select-all">
                  {officer.email}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => onAutofill(officer.email, demoPassword)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-brand-navy text-white hover:bg-brand-navy-dark transition-colors shadow-2xs"
                  title={`Autofill form as ${officer.label}`}
                >
                  <Zap className="w-3 h-3 text-brand-gold" />
                  <span>Autofill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(officer.email, officer.key)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                    isCopied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-300'
                  }`}
                  aria-label={`Copy ${officer.label} email`}
                  title={`Copy ${officer.email}`}
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
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-500 italic pt-2 leading-relaxed">
        Demonstration accounts are role-bound. Authenticating will automatically navigate each officer to their assigned AICTE workspace.
      </p>

      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {copiedKey ? `Email copied to clipboard` : ''}
      </div>
    </div>
  );
};
