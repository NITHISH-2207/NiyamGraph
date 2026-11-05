import React, { useState, useEffect, useRef } from 'react';
import { BrandEmblem } from '@/components/common/BrandEmblem';
import { RegBadge } from '@/components/common/RegBadge';
import { SPLASH_CONFIG, SPLASH_FADE_OUT_START_MS } from '@/config/splashConfig';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'initial' | 'visible' | 'fading' | 'hidden'>('initial');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [progressActive, setProgressActive] = useState(false);

  const fadeOutTimerRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if splash has already been presented during this session
    const hasSeenSplash = sessionStorage.getItem('niyamgraph_splash_shown');
    if (hasSeenSplash) {
      setStage('hidden');
      onComplete();
      return;
    }

    // Check prefers-reduced-motion media query
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    // Initial state -> Visible (triggers fade-in over 500ms)
    setStage('visible');

    // Trigger subtle progress expansion slightly after mount
    progressTimerRef.current = setTimeout(() => {
      setProgressActive(true);
    }, 50);

    // At 2300ms (0.5s fade-in + 1.8s hold), initiate smooth 0.5s fade-out
    fadeOutTimerRef.current = setTimeout(() => {
      setStage('fading');
    }, SPLASH_FADE_OUT_START_MS);

    // At 2800ms total duration, finalize session record and unmount overlay
    completeTimerRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem('niyamgraph_splash_shown', 'true');
      } catch {
        // Safe fallback if sessionStorage is restricted
      }
      setStage('hidden');
      onComplete();
    }, SPLASH_CONFIG.TOTAL_DURATION_MS);

    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [onComplete]);

  const handleDismiss = () => {
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);

    try {
      sessionStorage.setItem('niyamgraph_splash_shown', 'true');
    } catch {
      // Safe fallback
    }
    setStage('hidden');
    onComplete();
  };

  if (stage === 'hidden') {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NiyamGraph Initializing"
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#102A45] text-white select-none cursor-pointer transition-opacity duration-500 ease-out ${
        stage === 'visible'
          ? 'opacity-100'
          : stage === 'fading'
          ? 'opacity-0 pointer-events-none'
          : 'opacity-0'
      }`}
    >
      {/* Subtle radial background highlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 45%, #245B82 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md">
        {/* Central Emblem - Scale/Slide animation disabled when prefers-reduced-motion is true */}
        <div
          className={`mb-6 transition-all duration-700 ease-out ${
            prefersReducedMotion ? 'opacity-100' : 'animate-emblem'
          }`}
        >
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xs">
            <BrandEmblem size="lg" variant="light" />
          </div>
        </div>

        {/* Wordmark with REG badge */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            NiyamGraph
          </span>
          <RegBadge className="scale-110" />
        </div>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-slate-300 font-medium tracking-wide mb-8">
          Simplifying Approvals. Strengthening Compliance.
        </p>

        {/* Subtle Institutional Progress Line */}
        <div className="w-48 h-1 bg-white/15 rounded-full overflow-hidden">
          <div
            className={`h-full bg-[#C5A45E] rounded-full transition-all duration-[2000ms] ease-out ${
              prefersReducedMotion ? 'transition-none' : ''
            }`}
            style={{
              width: progressActive ? '100%' : '12%',
            }}
          />
        </div>

        {/* Quick Skip helper */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="mt-6 text-[11px] text-slate-400 hover:text-white transition-colors underline underline-offset-4 focus:outline-none"
        >
          Click anywhere or press to enter
        </button>
      </div>
    </div>
  );
};
