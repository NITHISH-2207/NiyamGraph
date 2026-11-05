import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { institutionIdentifierConfig } from '@/config/identifierConfig';
import { authService } from '@/services/authService';
import { Building2, Mail, Loader2, AlertCircle, HelpCircle } from 'lucide-react';

export const InstitutionLoginPage: React.FC = () => {
  const [institutionId, setInstitutionId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    // Validate Institution ID using central identifierConfig
    if (!institutionId.trim()) {
      errs.institutionId = 'Institution identifier is required.';
    } else if (!institutionIdentifierConfig.pattern.test(institutionId.trim())) {
      errs.institutionId = institutionIdentifierConfig.patternDescription;
    }

    // Validate Authorized Email
    if (!email.trim()) {
      errs.email = 'Registered authorized email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid registered institutional email address.';
    }

    // Validate Password
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
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
      const result = await authService.loginInstitution({
        institutionId: institutionId.trim(),
        email: email.trim(),
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
      portalType="institution"
      portalTitle="Institution Portal"
      leftHeading="Your Institution’s Regulatory Workspace"
      leftSupportingText="Manage your approval applications, regulatory communication and institutional compliance through one connected platform."
      benefits={[
        'Extension of Approval (EoA) & program variation submissions',
        'Transparent deficiency management & rectification timelines',
        'Secure institutional document repository & compliance proofs',
        'Real-time regulatory status alerts & committee updates',
      ]}
      rightHeading="Welcome Back"
      rightSupportingText="Sign in to your verified institution account."
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

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Field 1: Institution Identifier */}
        <AuthFormField
          id="institutionId"
          label={institutionIdentifierConfig.label}
          placeholder={institutionIdentifierConfig.placeholder}
          helperText={institutionIdentifierConfig.helperText}
          value={institutionId}
          onChange={(e) => {
            setInstitutionId(e.target.value);
            if (errors.institutionId) setErrors((prev) => ({ ...prev, institutionId: '' }));
          }}
          error={errors.institutionId}
          icon={<Building2 className="w-4 h-4" aria-hidden="true" />}
          autoComplete="organization"
        />

        {/* Field 2: Registered Email */}
        <AuthFormField
          id="email"
          type="email"
          label="Registered Authorized Email"
          placeholder="e.g. principal@engineering.edu.in"
          helperText="The email address assigned to your verified nodal representative."
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={errors.email}
          icon={<Mail className="w-4 h-4" aria-hidden="true" />}
          autoComplete="email"
        />

        {/* Field 3: Password */}
        <PasswordInput
          id="password"
          label="Password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          error={errors.password}
          autoComplete="current-password"
        />

        {/* Forgot Password and Support Links */}
        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            to="/support"
            className="text-slate-500 hover:text-brand-blue inline-flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Need sign-in assistance?</span>
          </Link>

          <Link
            to="/auth/forgot-password"
            className="text-brand-blue font-semibold hover:text-brand-navy underline underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue-hover focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Verifying Institutional Profile...</span>
              </>
            ) : (
              <span>Sign In to Institution Portal</span>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
