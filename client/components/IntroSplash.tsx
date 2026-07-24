'use client';

import React, { useState, useEffect } from 'react';

export default function IntroSplash() {
  const [stage, setStage] = useState<'IDLE' | 'TEXT_IN' | 'SPLIT' | 'LOGO_POP' | 'FADE_OUT' | 'DONE'>('IDLE');

  useEffect(() => {
    // 1. Text "dear desserts" appears in center (150ms)
    const t1 = setTimeout(() => setStage('TEXT_IN'), 150);

    // 2. "dear" slides left, "desserts" slides right (750ms)
    const t2 = setTimeout(() => setStage('SPLIT'), 750);

    // 3. Original Emblem Logo pops into the middle (1350ms)
    const t3 = setTimeout(() => setStage('LOGO_POP'), 1350);

    // 4. Smooth dissolve fade out to main website (2700ms)
    const t4 = setTimeout(() => setStage('FADE_OUT'), 2700);

    // 5. Unmount (3500ms)
    const t5 = setTimeout(() => setStage('DONE'), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  if (stage === 'DONE') return null;

  const isSplit = stage === 'SPLIT' || stage === 'LOGO_POP' || stage === 'FADE_OUT';
  const showLogo = stage === 'LOGO_POP' || stage === 'FADE_OUT';

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden transition-all duration-800 ${
        stage === 'FADE_OUT' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle soft luxury background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-cream-100/50 to-white pointer-events-none" />

      {/* Main Showcase Container */}
      <div className="relative z-10 flex items-center justify-center px-4">
        
        {/* Left Word: dear */}
        <span
          className={`font-sans text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-cocoa-900 transition-all duration-800 ease-out drop-shadow-sm ${
            stage === 'IDLE'
              ? 'opacity-0 translate-x-16 scale-90'
              : !isSplit
              ? 'opacity-100 translate-x-0 scale-100'
              : '-translate-x-4 sm:-translate-x-8 md:-translate-x-12 lg:-translate-x-16 opacity-100 scale-105'
          }`}
        >
          dear
        </span>

        {/* Center: Original Waffle Emblem Logo popping in the middle */}
        <div
          className={`mx-2 sm:mx-4 md:mx-6 transition-all duration-700 ease-out flex items-center justify-center ${
            showLogo
              ? 'w-24 sm:w-36 md:w-44 lg:w-56 opacity-100 scale-100 rotate-0'
              : 'w-0 opacity-0 scale-0 rotate-[-30deg] overflow-hidden'
          }`}
        >
          <img
            src="/ddlogo.png"
            alt="Dear Desserts Original Logo"
            className="w-24 sm:w-36 md:w-44 lg:w-56 h-auto object-contain drop-shadow-xl"
          />
        </div>

        {/* Right Word: desserts */}
        <span
          className={`font-sans text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-caramel-600 transition-all duration-800 ease-out drop-shadow-sm ${
            stage === 'IDLE'
              ? 'opacity-0 -translate-x-16 scale-90'
              : !isSplit
              ? 'opacity-100 translate-x-0 scale-100'
              : 'translate-x-4 sm:translate-x-8 md:translate-x-12 lg:translate-x-16 opacity-100 scale-105'
          }`}
        >
          desserts
        </span>

      </div>
    </div>
  );
}
