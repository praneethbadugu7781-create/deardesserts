'use client';

import React, { useState, useEffect } from 'react';

export default function IntroSplash() {
  const [stage, setStage] = useState<'IDLE' | 'SLIDE_IN' | 'MEET_GLOW' | 'FADE_OUT' | 'DONE'>('IDLE');

  useEffect(() => {
    // 100ms: Left and Right logos slide into the center from sides
    const timer1 = setTimeout(() => setStage('SLIDE_IN'), 100);
    // 750ms: Meet in middle with golden sparkle flare
    const timer2 = setTimeout(() => setStage('MEET_GLOW'), 750);
    // 1600ms: Smoothly dissolve out
    const timer3 = setTimeout(() => setStage('FADE_OUT'), 1600);
    // 2200ms: Unmount
    const timer4 = setTimeout(() => setStage('DONE'), 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  if (stage === 'DONE') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-cocoa-950 flex items-center justify-center overflow-hidden transition-all duration-700 ${
        stage === 'FADE_OUT' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background particles & gold glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/20 via-cocoa-900/50 to-cocoa-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Intro Showcase Container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-6">
        
        {/* Left Side: Emblem Logo sliding in from left */}
        <div
          className={`transform transition-all duration-700 ease-out ${
            stage === 'IDLE'
              ? '-translate-x-96 opacity-0 scale-75'
              : stage === 'SLIDE_IN'
              ? 'translate-x-0 opacity-100 scale-100'
              : 'translate-x-0 opacity-100 scale-110'
          }`}
        >
          <div className="relative">
            <img
              src="/ddlogo.png"
              alt="Dear Desserts Logo"
              className="h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 object-contain drop-shadow-[0_10px_25px_rgba(212,175,55,0.4)]"
            />
            {stage === 'MEET_GLOW' && (
              <div className="absolute inset-0 rounded-full animate-ping bg-gold-400/30 blur-md pointer-events-none" />
            )}
          </div>
        </div>

        {/* Golden Sparkle Divider in Middle */}
        <div
          className={`hidden md:block h-16 w-0.5 bg-gradient-to-b from-transparent via-gold-400 to-transparent transition-all duration-500 ${
            stage === 'MEET_GLOW' ? 'opacity-100 h-24 shadow-[0_0_15px_#D4AF37]' : 'opacity-0 h-0'
          }`}
        />

        {/* Right Side: Title Image sliding in from right */}
        <div
          className={`transform transition-all duration-700 ease-out ${
            stage === 'IDLE'
              ? 'translate-x-96 opacity-0 scale-75'
              : stage === 'SLIDE_IN'
              ? 'translate-x-0 opacity-100 scale-100'
              : 'translate-x-0 opacity-100 scale-105'
          }`}
        >
          <img
            src="/ddtitle.png"
            alt="Dear Desserts Title"
            className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] filter brightness-110"
          />
          <div className="font-accent text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-gold-400 text-center mt-2 opacity-90">
            Love At First Bite
          </div>
        </div>
      </div>
    </div>
  );
}
