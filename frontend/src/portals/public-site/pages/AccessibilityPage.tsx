import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, Monitor, Keyboard, Contrast } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="py-12 md:py-16 bg-brand-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-slate-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-brand-navy">Home</Link>
            </li>
            <li>/</li>
            <li className="text-slate-800 font-medium">Accessibility Statement</li>
          </ol>
        </nav>

        {/* Content Card */}
        <div className="bg-white p-8 sm:p-10 rounded-xl border border-brand-border shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100">
              <Eye className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
                Accessibility Statement
              </h1>
              <p className="text-xs text-slate-500">
                Conformance Target: WCAG 2.1 Level AA Guidelines
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 pt-2 border-t border-slate-100">
            <p className="leading-relaxed">
              NiyamGraph is committed to ensuring that regulatory tools and institutional portals are universally accessible to all users, regardless of technology, physical ability, or cognitive difference.
            </p>

            <h2 className="text-base font-bold text-brand-navy">
              Accessibility Principles Embedded in NiyamGraph
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
              <div className="p-4 rounded-lg bg-brand-bg border border-brand-border space-y-2">
                <div className="flex items-center gap-2 text-brand-navy font-semibold text-sm">
                  <Keyboard className="w-4 h-4 text-brand-blue" aria-hidden="true" />
                  <span>Full Keyboard Operability</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every button, link, form control, and portal selector is accessible via sequential Tab navigation, Enter, Space, and Escape controls with visible focus rings.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-brand-bg border border-brand-border space-y-2">
                <div className="flex items-center gap-2 text-brand-navy font-semibold text-sm">
                  <Contrast className="w-4 h-4 text-brand-gold" aria-hidden="true" />
                  <span>Color Contrast Compliance</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Foreground text meets or exceeds the 4.5:1 minimum contrast ratio against surfaces. Color is never used as the sole conveyor of status or regulatory validation.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-brand-bg border border-brand-border space-y-2">
                <div className="flex items-center gap-2 text-brand-navy font-semibold text-sm">
                  <Monitor className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Reduced Motion Support</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Respects operating system preferences for <code>prefers-reduced-motion</code>, disabling decorative animations, transition effects, and auto-scrolling.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-brand-bg border border-brand-border space-y-2">
                <div className="flex items-center gap-2 text-brand-navy font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue" aria-hidden="true" />
                  <span>Semantic HTML &amp; Screen Readers</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standard landmark elements (<code>header</code>, <code>main</code>, <code>footer</code>, <code>section</code>), explicit form labels, and live ARIA alert states for error feedback.
                </p>
              </div>
            </div>

            <section className="space-y-2 pt-4">
              <h2 className="text-base font-bold text-brand-navy">
                Screen Reader Testing &amp; Assistive Tech
              </h2>
              <p className="leading-relaxed">
                The interface includes a dedicated skip-to-content bypass mechanism, decorative SVGs marked with <code>aria-hidden=&quot;true&quot;</code>, and form inputs programmatically associated with descriptive helper texts.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

