import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { authService } from '@/services/authService';
import { Mail, Loader2, AlertCircle, HelpCircle, UserPlus, Zap } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [officialId, setOfficialId] = useState('scrutiny@gmail.com');
  const [password, setPassword] = useState('Scrutiny@123');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!officialId.trim()) {
      errs.officialId = 'Statutory email or official ID is required.';
    }

    if (!password) {
      errs.password = 'Password is required.';
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

      if (result.success) {
        navigate('/scrutiny/dashboard');
      } else {
        setServerError(result.errorMessage || 'Sign-in failed. Please check credentials.');
      }
    } catch {
      setServerError('Sign-in service is currently unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      portalType="admin"
      portalTitle="AICTE Scrutiny Portal"
      leftHeading="Evidence-Based Scrutiny. Transparent Governance."
      leftSupportingText="A unified workspace for examining institutional applications, validating statutory documents, and communicating regulatory deficiencies."
      benefits={[
        'Automated document text extraction with page citations',
        'Deterministic & AI comparison against APH 2026-27 norms',
        'Traceable deficiency notice issuance with 15-day cure window',
        'Side-by-side textual diff highlighting institutional corrections',
      ]}
      rightHeading="Official Sign In"
      rightSupportingText="Enter your official statutory credentials to continue."
    >
      {/* Demo Credentials Pill */}
      <div className="p-3 rounded-lg bg-blue-50/90 border border-blue-200/80 flex items-center justify-between text-xs text-brand-navy">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-gold shrink-0" aria-hidden="true" />
          <span className="font-medium">
            Demo: <strong className="text-brand-blue">scrutiny@gmail.com</strong> / <strong className="text-brand-blue">Scrutiny@123</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setOfficialId('scrutiny@gmail.com');
            setPassword('Scrutiny@123');
          }}
          className="px-2 py-0.5 rounded bg-brand-navy text-white text-[11px] font-semibold hover:bg-brand-navy-dark transition-colors shadow-xs"
        >
          Autofill
        </button>
      </div>

      {/* Inline Form Error */}
      {serverError && (
        <div
          className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Field 1: Official Identifier */}
        <AuthFormField
          id="officialId"
          label="Official Email / Statutory ID"
          placeholder="scrutiny@gmail.com"
          helperText="Enter your registered scrutiny official email"
          value={officialId}
          onChange={(e) => {
            setOfficialId(e.target.value);
            if (errors.officialId) setErrors((prev) => ({ ...prev, officialId: '' }));
          }}
          error={errors.officialId}
          icon={<Mail className="w-4 h-4" aria-hidden="true" />}
          autoComplete="username"
        />

        {/* Field 2: Password */}
        <PasswordInput
          id="adminPassword"
          label="Password"
          placeholder="Scrutiny@123"
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
            <span>Support Desk</span>
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
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to Scrutiny Desk</span>
            )}
          </button>
        </div>

        {/* Registration Link */}
        <div className="pt-3 text-center border-t border-slate-100">
          <Link
            to="/auth/scrutiny/signup"
            className="inline-flex items-center gap-1.5 text-xs text-brand-navy font-semibold hover:text-brand-blue transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-brand-gold" aria-hidden="true" />
            <span>New Scrutiny Officer? Register / Sign Up</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
