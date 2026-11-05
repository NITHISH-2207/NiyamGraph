import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { MfaVerificationView } from '@/components/auth/MfaVerificationView';
import { adminIdentifierConfig } from '@/config/identifierConfig';
import { authService } from '@/services/authService';
import { UserCheck, Loader2, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showMfaView, setShowMfaView] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!officialId.trim()) {
      errs.officialId = 'Official User ID or regulatory email is required.';
    } else if (officialId.trim().length < 4) {
      errs.officialId = 'User ID must be at least 4 characters.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Official statutory passwords must be at least 8 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await authService.loginAdmin({
        officialId: officialId.trim(),
        password,
      });

      if (!result.success) {
        setServerError(
          result.errorMessage || 'Sign-in is currently unavailable. Please try again later.'
        );
      }
    } catch {
      setServerError('Sign-in is currently unavailable. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      portalType="admin"
      portalTitle="AICTE Administration"
      leftHeading="Governance. Oversight. Accountability."
      leftSupportingText="A centralized workspace for application processing, regulatory administration and institutional compliance monitoring."
      benefits={[
        'Stage-gated application processing across all 7 regional zones',
        'Expert Visit Committee (EVC) & scrutiny panel management',
        'Statutory decision recording & digital approval seal issuance',
        'Continuous compliance audits & pendency SLA escalation alerts',
      ]}
      rightHeading="Official Sign In"
      rightSupportingText="Access your assigned administrative workspace."
    >
      {/* Inline Form Error - only displayed upon submit failure, never on page load */}
      {serverError && (
        <div
          className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">{serverError}</p>
        </div>
      )}

      {/* Conditional Rendering: Credentials Entry vs MFA Screen */}
      {showMfaView ? (
        <MfaVerificationView
          officialId={officialId || 'official.admin@aicte.gov.in'}
          onBack={() => setShowMfaView(false)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Field 1: Official Identifier */}
          <AuthFormField
            id="officialId"
            label={adminIdentifierConfig.label}
            placeholder={adminIdentifierConfig.placeholder}
            helperText={adminIdentifierConfig.helperText}
            value={officialId}
            onChange={(e) => {
              setOfficialId(e.target.value);
              if (errors.officialId) setErrors((prev) => ({ ...prev, officialId: '' }));
            }}
            error={errors.officialId}
            icon={<UserCheck className="w-4 h-4" aria-hidden="true" />}
            autoComplete="username"
          />

          {/* Field 2: Password */}
          <PasswordInput
            id="adminPassword"
            label="Administrative Password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            autoComplete="current-password"
          />

          {/* Forgot Password and Help */}
          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              to="/support"
              className="text-slate-500 hover:text-brand-blue inline-flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Nodal Desk Help</span>
            </Link>

            <Link
              to="/auth/forgot-password"
              className="text-brand-navy font-semibold hover:text-brand-blue underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy-dark focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Authenticating Statutory Officer...</span>
                </>
              ) : (
                <span>Secure Sign In</span>
              )}
            </button>
          </div>

          {/* Interactive Toggle for MFA Demonstration */}
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => setShowMfaView(true)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-brand-blue font-medium transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" aria-hidden="true" />
              <span>Simulate Multi-Factor Authentication (MFA) Screen</span>
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
