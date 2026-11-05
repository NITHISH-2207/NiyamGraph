import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { BrandEmblem } from '@/components/common/BrandEmblem';
import { RegBadge } from '@/components/common/RegBadge';
import { authService } from '@/services/authService';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please provide your registered email or official identifier.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await authService.requestPasswordReset(identifier.trim());
      setSubmitted(true);
      setMessage(res.message);
    } catch {
      setError('Failed to dispatch password recovery request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-blue rounded"
          aria-label="NiyamGraph Home"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-navy flex items-center justify-center">
            <BrandEmblem size="md" variant="light" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-navy">
            NiyamGraph
          </span>
          <RegBadge />
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy tracking-tight">
          Credential Recovery
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Reset access credentials for verified institutional or administrative accounts.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xs border border-brand-border rounded-xl sm:px-10 space-y-6">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Recovery Request Logged
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {message ||
                  'Your request has been recorded. In production, a secure cryptographic reset link is dispatched to the authorized registry email.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/"
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-md bg-brand-blue text-white hover:bg-brand-blue-hover"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthFormField
                id="identifier"
                label="Registered Email or Institute PID"
                placeholder="e.g. principal@college.edu.in"
                helperText="Enter the official email associated with your regulatory profile."
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError(null);
                }}
                error={error || undefined}
                icon={<Mail className="w-4 h-4" aria-hidden="true" />}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy-dark focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Processing Recovery Request...</span>
                  </>
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-navy font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Back to Portal Selection</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

