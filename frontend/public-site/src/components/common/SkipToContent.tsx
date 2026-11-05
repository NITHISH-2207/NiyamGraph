import React from 'react';

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-navy focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
    >
      Skip to main content
    </a>
  );
};

