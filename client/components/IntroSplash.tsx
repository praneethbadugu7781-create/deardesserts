'use client';

import React, { useState, useEffect } from 'react';

export default function IntroSplash() {
  const [stage, setStage] = useState<'IDLE' | 'TEXT_IN' | 'SPLIT' | 'LOGO_POP' | 'FADE_OUT' | 'DONE'>('IDLE');

  useEffect(() => {
    // 1. Text "DEAR DESSERTS" appears in center (150ms)
    const t1 = setTimeout(() => setStage('TEXT_IN'), 150);

    // 2. "DEAR" slides left, "DESSERTS" slides right (700ms)
    const t2 = setTimeout(() => setStage('SPLIT'), 750);

    // 3. Circular Waffle Emblem Logo pops into the middle (1350ms)
    const t3 = setTimeout(() => setStage('LOGO_POP'), 1350);

    // 4. Smooth luxurious dissolve fade out to main website (2700ms)
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
      className={`fixed inset-0 z-[100] bg-cocoa-950 flex items-center justify-center overflow-hidden transition-all duration-800 ${
        stage === 'FADE_OUT' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Radial Background & Gold Light Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/25 via-cocoa-900/60 to-cocoa-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-gold-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex items-center justify-center px-4">
        
        {/* Left Word: DEAR */}
        <span
          className={`font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white transition-all duration-800 ease-out drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${
            stage === 'IDLE'
              ? 'opacity-0 translate-x-12 scale-90'
              : !isSplit
              ? 'opacity-100 translate-x-0 scale-100'
              : '-translate-x-4 sm:-translate-x-8 md:-translate-x-12 lg:-translate-x-16 opacity-100 scale-105 text-gold-300'
          }`}
        >
          DEAR
        </span>

        {/* Center: Waffle Emblem Logo popping in the middle */}
        <div
          className={`mx-2 sm:mx-4 md:mx-6 transition-all duration-700 cubic-bezier flex items-center justify-center ${
            showLogo
              ? 'w-24 sm:w-36 md:w-44 lg:w-52 opacity-100 scale-100 rotate-0'
              : 'w-0 opacity-0 scale-0 rotate-[-45deg] overflow-hidden'
          }`}
        >
          <div className="relative">
            <img
              src="/ddlogo.png"
              alt="Dear Desserts Emblem Logo"
              className="w-24 sm:w-36 md:w-44 lg:w-52 h-auto object-contain drop-shadow-[0_10px_30px_rgba(212,175,55,0.5)] border-2 border-gold-400/40 rounded-full p-1 bg-cocoa-900/80"
            />
            {showLogo && (
              <div className="absolute inset-0 rounded-full animate-ping bg-gold-400/30 blur-md pointer-events-none" />
            )}
          </div>
        </div>

        {/* Right Word: DESSERTS */}
        <span
          className={`font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white transition-all duration-800 ease-out drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${
            stage === 'IDLE'
              ? 'opacity-0 -translate-x-12 scale-90'
              : !isSplit
              ? 'opacity-100 translate-x-0 scale-100'
              : 'translate-x-4 sm:translate-x-8 md:translate-x-12 lg:translate-x-16 opacity-100 scale-105 text-gold-300'
          }`}
        >
          DESSERTS
        </span>

      </div>
    </div>
  );
}
