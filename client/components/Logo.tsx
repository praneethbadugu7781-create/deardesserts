'use client';

import React from 'react';

export default function Logo({
  size = 'md',
  variant = 'full',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon-only' | 'title-only';
  theme?: 'light' | 'dark';
}) {
  const iconSizeMap = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  const titleTextMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  const subtextMap = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
    '2xl': 'text-sm',
  };

  return (
    <div className="flex items-center space-x-2.5 group select-none transition-transform duration-300 hover:scale-[1.01]">
      {variant !== 'title-only' && (
        <div className={`${iconSizeMap[size]} relative flex items-center justify-center flex-shrink-0`}>
          <img
            src="/ddlogo.png"
            alt="Dear Desserts"
            className="w-full h-full object-contain filter drop-shadow-md rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/ddlogo.jpeg';
            }}
          />
        </div>
      )}

      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-display font-black tracking-tight ${titleTextMap[size]} text-cocoa-900`}>
            Dear <span className="text-gold-500">Desserts</span>
          </span>
          <span className={`font-accent font-extrabold uppercase tracking-widest text-gold-600/90 mt-0.5 ${subtextMap[size]}`}>
            Love At First Bite
          </span>
        </div>
      )}
    </div>
  );
}
