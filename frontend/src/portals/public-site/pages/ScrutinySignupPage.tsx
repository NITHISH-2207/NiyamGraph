import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { authService } from '@/services/authService';
import { User, Mail, Shield, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ScrutinySignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [officialId, setOfficialId] = useState('');
  const [designation, setDesignation] = useState('Scrutiny Officer');
  const [regionalOffice, setRegionalOffice] = useState('RO-SOUTH');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) errs.fullName = 'Full official name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid official email address is required.';
    if (!officialId.trim()) errs.officialId = 'Official Designation/Officer ID is required.';
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await authService.signupScrutinyOfficer({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        officialId: officialId.trim(),
        password,
        designation,
        regionalOfficeId: regionalOffice,
      });

      if (result.success) {
        navigate('/scrutiny/dashboard');
      } else {
        setServerError(result.errorMessage || 'Registration failed. Please try again.');
      }
    } catch {
      setServerError('Registration service unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      portalType="admin"
      portalTitle="AICTE Scrutiny Officer Registration"
      leftHeading="Official Desk Onboarding."
      leftSupportingText="Register your statutory credentials to access assigned institutional approval applications, document scrutiny tools, and compliance ledgers."
      benefits={[
        'Full access to assigned regional applications queue',
        'Automated document extraction & PyMuPDF processing',
        'Regulatory criteria matrix & deterministic checking',
        'Official deficiency notice drafting & digital dispatch',
      ]}
      rightHeading="Officer Registration"
      rightSupportingText="Enter your official details to establish your statutory workspace."
    >
      {serverError && (
        <div
          className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <AuthFormField
          id="fullName"
          label="Full Name & Title"
          placeholder="e.g. Dr. Rajeshwar Sharma"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
          }}
          error={errors.fullName}
          icon={<User className="w-4 h-4" aria-hidden="true" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthFormField
            id="email"
            label="Official Email"
            placeholder="scrutiny@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            icon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />

          <AuthFormField
            id="officialId"
            label="Officer ID / Code"
            placeholder="SO-2026-CH01"
            value={officialId}
            onChange={(e) => {
              setOfficialId(e.target.value);
              if (errors.officialId) setErrors((prev) => ({ ...prev, officialId: '' }));
            }}
            error={errors.officialId}
            icon={<Shield className="w-4 h-4" aria-hidden="true" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designation
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-brand-border focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Regional Jurisdiction
            </label>
            <select
              value={regionalOffice}
              onChange={(e) => setRegionalOffice(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-brand-border bg-white text-slate-700 focus:ring-2 focus:ring-brand-blue"
            >
              <option value="RO-SOUTH">Southern Region (Chennai)</option>
              <option value="RO-WEST">Western Region (Mumbai)</option>
              <option value="RO-NORTH">Northern Region (Kanpur)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PasswordInput
            id="signupPassword"
            label="Password"
            placeholder="Scrutiny@123"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy-dark focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Registering Statutory Officer...</span>
              </>
            ) : (
              <span>Create Scrutiny Officer Account</span>
            )}
          </button>
        </div>

        <div className="pt-2 text-center">
          <Link
            to="/auth/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-brand-navy hover:text-brand-blue font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Already have official credentials? Sign In</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
