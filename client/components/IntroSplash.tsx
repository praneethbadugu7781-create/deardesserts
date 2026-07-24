'use client';

import React, { useState, useEffect } from 'react';

export default function IntroSplash() {
  const [stage, setStage] = useState<'IDLE' | 'TEXT_IN' | 'SPLIT' | 'LOGO_POP' | 'FADE_OUT' | 'DONE'>('IDLE');

  useEffect(() => {
    // Phase 1: Text "dear desserts" fades in (100ms)
    const t1 = setTimeout(() => setStage('TEXT_IN'), 100);

    // Phase 2: "dear" slides left, "desserts" slides right (550ms)
    const t2 = setTimeout(() => setStage('SPLIT'), 550);

    // Phase 3: Original Logo pops up smoothly in the middle (1000ms)
    const t3 = setTimeout(() => setStage('LOGO_POP'), 1000);

    // Phase 4: Smooth fade out to website (2100ms)
    const t4 = setTimeout(() => setStage('FADE_OUT'), 2100);

    // Phase 5: Unmount (2700ms)
    const t5 = setTimeout(() => setStage('DONE'), 2700);

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
      className={`fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden transition-opacity duration-500 transform-gpu ${
        stage === 'FADE_OUT' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Hardware-accelerated container with responsive sizing for 320px-375px mobile screens */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-4 md:gap-6 px-2 sm:px-4 transform-gpu will-change-transform max-w-full">
        
        {/* Left Word: dear */}
        <span
          className={`font-sans text-2xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-cocoa-900 transition-transform duration-500 ease-out transform-gpu will-change-transform ${
            stage === 'IDLE'
              ? 'opacity-0 translate-x-6 sm:translate-x-12'
              : !isSplit
              ? 'opacity-100 translate-x-0'
              : '-translate-x-1 sm:-translate-x-4 md:-translate-x-8 lg:-translate-x-14 opacity-100'
          }`}
        >
          dear
        </span>

        {/* Center: Original Emblem Logo (GPU scale transition, 0 layout reflow) */}
        <div
          className={`transition-all duration-500 ease-out transform-gpu will-change-transform flex items-center justify-center shrink-0 ${
            showLogo
              ? 'scale-100 opacity-100 w-12 sm:w-28 md:w-40 lg:w-48'
              : 'scale-0 opacity-0 w-0 overflow-hidden'
          }`}
        >
          <img
            src="/ddlogo.png"
            alt="Dear Desserts Original Logo"
            className="w-12 sm:w-28 md:w-40 lg:w-48 h-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* Right Word: desserts */}
        <span
          className={`font-sans text-2xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-caramel-600 transition-transform duration-500 ease-out transform-gpu will-change-transform ${
            stage === 'IDLE'
              ? 'opacity-0 -translate-x-6 sm:-translate-x-12'
              : !isSplit
              ? 'opacity-100 translate-x-0'
              : 'translate-x-1 sm:translate-x-4 md:translate-x-8 lg:translate-x-14 opacity-100'
          }`}
        >
          desserts
        </span>

      </div>
    </div>
  );
}
