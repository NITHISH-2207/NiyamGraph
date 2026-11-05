import React, { useState } from 'react';
import { SplashScreen } from '../components/splash/SplashScreen';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutSection } from '../components/landing/AboutSection';
import { PortalSelectionSection } from '../components/landing/PortalSelectionSection';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';

export const LandingPage: React.FC = () => {
  const [splashFinished, setSplashFinished] = useState(() => {
    return Boolean(sessionStorage.getItem('niyamgraph_splash_shown'));
  });

  return (
    <>
      {/* Splash overlay displayed only once per session */}
      {!splashFinished && (
        <SplashScreen onComplete={() => setSplashFinished(true)} />
      )}

      {/* Render landing content immediately underneath so it is ready */}
      <div className="flex flex-col w-full">
        <HeroSection />
        <AboutSection />
        <PortalSelectionSection />
        <CapabilitiesSection />
        <HowItWorksSection />
      </div>
    </>
  );
};

