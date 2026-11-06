import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useAuth } from '@/context/AuthContext';
import { AicteDemoCredentialsCard } from '@/components/auth/AicteDemoCredentialsCard';
import { Mail, Loader2, AlertCircle, HelpCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
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
      const result = await loginAdmin({
        officialId: officialId.trim(),
        password,
      });

      if (result.success && result.session) {
        // Automatic role-based workspace destination returned by the backend
        const destination = result.session.portalRedirectUrl || '/scrutiny/dashboard';
        navigate(destination, { replace: true });
      } else {
        setServerError(result.errorMessage || 'Sign-in failed. Please check your credentials.');
      }
    } catch {
      setServerError('Sign-in service is currently unavailable. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      portalType="admin"
      portalTitle="AICTE Administration Portal"
      leftHeading="Centralized Regulatory Governance"
      leftSupportingText="A unified, role-governed administration gateway for AICTE Scrutiny Officers, Expert Visit Committees (EVC), Regional Offices, and Complaints Desks."
      benefits={[
        'Automated document scrutiny & deterministic APH 2026-27 norm verification',
        'Expert Visit Committee (EVC) panel coordination & digital verification',
        'Regional office jurisdiction workloads, scrutiny SLAs & escalation queues',
        'Centralized institutional grievance redressal & statutory compliance monitoring',
      ]}
      rightHeading="Official Sign In"
      rightSupportingText="Sign in with your assigned statutory account to access your regulatory workspace."
    >
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
          label="Official Email / Statutory User ID"
          placeholder="e.g. test.official@aicte.gov.in"
          helperText="Enter your registered AICTE administrative email or officer ID"
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
          placeholder="Enter official password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          error={errors.password}
          autoComplete="current-password"
        />

        {/* Support Link */}
        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            to="/support"
            className="text-slate-500 hover:text-brand-blue inline-flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Need assistance? Contact Regulatory Support</span>
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
                <span>Verifying Officer Credentials...</span>
              </>
            ) : (
              <span>Sign In to AICTE Workspace</span>
            )}
          </button>
        </div>

        {/* Four Distinct AICTE Officer Demo Credentials */}
        <AicteDemoCredentialsCard
          onAutofill={(autofillEmail, autofillPassword) => {
            setOfficialId(autofillEmail);
            setPassword(autofillPassword);
            if (errors.officialId) setErrors((prev) => ({ ...prev, officialId: '' }));
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
        />
      </form>
    </AuthLayout>
  );
};
