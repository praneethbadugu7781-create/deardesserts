'use client';

import React from 'react';
import Image from 'next/image';

export default function Logo({
  size = 'md',
  variant = 'full',
  theme = 'light',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon-only' | 'title-only';
  theme?: 'light' | 'dark';
}) {
  const logoSizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-36 h-36',
  };

  const titleHeightMap = {
    sm: 'h-6 w-28',
    md: 'h-9 w-40',
    lg: 'h-11 w-52',
    xl: 'h-16 w-64',
    '2xl': 'h-20 w-80',
  };

  return (
    <div className="flex items-center space-x-3 group select-none justify-center transition-transform duration-500 group-hover:scale-[1.02]">
      {variant !== 'title-only' && (
        <div className={`${logoSizeMap[size]} relative flex items-center justify-center transition-all duration-500 group-hover:scale-105 flex-shrink-0`}>
          <Image
            src="/ddlogo.png"
            alt="Dear Desserts Emblem"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain filter drop-shadow-md"
            priority
          />
        </div>
      )}

      {variant !== 'icon-only' && (
        <div className={`relative flex flex-col justify-center ${titleHeightMap[size]}`}>
          <Image
            src="/ddtitle.png"
            alt="Dear Desserts - Love At First Bite"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-contain transition-opacity duration-200 filter drop-shadow-sm ${
              theme === 'dark'
                ? 'brightness-200 contrast-200 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]'
                : ''
            }`}
            priority
          />
        </div>
      )}
    </div>
  );
}
