'use client';

import React from 'react';
import Link from 'next/link';

type PremiumButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
};

const sizeClasses = {
  sm: 'px-5 py-2.5 text-[11px]',
  md: 'px-7 py-3.5 text-xs',
  lg: 'px-9 py-4 text-sm',
};

const variantClasses = {
  primary: 'btn-premium-primary text-white',
  secondary: 'btn-premium-secondary text-cocoa-800',
  ghost: 'btn-premium-ghost text-cocoa-700',
  gold: 'btn-premium-gold text-cocoa-950',
};

export default function PremiumButton({
  children,
  onClick,
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
}: PremiumButtonProps) {
  const classes = [
    'btn-premium group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-accent font-bold uppercase tracking-[0.18em] transition-all duration-300',
    sizeClasses[size],
    variantClasses[variant],
    disabled ? 'pointer-events-none opacity-60' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="btn-premium-shimmer" aria-hidden />
      <span className="relative z-10 flex items-center gap-2">{icon}{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
