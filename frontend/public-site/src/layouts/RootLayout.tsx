import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/header/Header';
import { Footer } from '../components/footer/Footer';
import { SkipToContent } from '../components/common/SkipToContent';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-slate-800 antialiased selection:bg-brand-blue/20 selection:text-brand-navy">
      <SkipToContent />
      <Header />
      <main id="main-content" className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

