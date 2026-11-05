import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface MfaVerificationViewProps {
  officialId: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export const MfaVerificationView: React.FC<MfaVerificationViewProps> = ({
  officialId,
  onBack,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (index: number, value: string) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take single digit
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the statutory verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authService.verifyAdminMfa({
        officialId,
        mfaCode: fullCode,
      });

      if (!result.success) {
        setErrorMessage(
          result.errorMessage ||
            'MFA authentication gateway is not yet connected to the backend service.'
        );
      }
    } catch {
      setErrorMessage('An unexpected error occurred during security handshake.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue mx-auto flex items-center justify-center border border-blue-100">
          <ShieldCheck className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-brand-navy">
          Two-Factor Authentication
        </h3>
        <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
          Statutory policy requires multi-factor authorization. Enter the 6-digit TOTP code generated for <strong className="text-slate-800">{officialId}</strong>.
        </p>
      </div>

      {errorMessage && (
        <div
          className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Digit Input Fields */}
        <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="6-digit security code">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`mfa-digit-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-12 text-center text-lg font-mono font-bold rounded-md border border-slate-300 bg-white text-brand-navy focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 focus:outline-none transition-colors"
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || code.join('').length < 6}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy-dark focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Verifying Security Token...</span>
            </>
          ) : (
            <span>Verify & Authenticate</span>
          )}
        </button>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-navy font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Use different credentials</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setErrorMessage('In prototype mode, TOTP generation is simulated. Live OTPs require backend gateway deployment.');
            }}
            className="text-brand-blue hover:text-brand-navy font-medium"
          >
            Resend token
          </button>
        </div>
      </form>
    </div>
  );
};

