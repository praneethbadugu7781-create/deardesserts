'use client';

import React from 'react';
import {
  ArrowRight,
  ChefHat,
  LayoutDashboard,
  Shield,
  ShoppingCart,
  X,
} from 'lucide-react';
import { Role } from '../lib/auth';
import PremiumButton from './PremiumButton';

interface StaffLoginModalProps {
  open: boolean;
  onClose: () => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  selectedRolePreset: Role;
  onRoleSelect: (role: Role) => void;
  loginError: string;
  isLoggingIn: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const roles: { role: Role; label: string; icon: typeof LayoutDashboard }[] = [
  { role: 'ADMIN', label: 'Admin', icon: LayoutDashboard },
  { role: 'CASHIER', label: 'Cashier POS', icon: ShoppingCart },
  { role: 'KITCHEN_STAFF', label: 'Kitchen KDS', icon: ChefHat },
];

export default function StaffLoginModal({
  open,
  onClose,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  selectedRolePreset,
  onRoleSelect,
  loginError,
  isLoggingIn,
  onSubmit,
}: StaffLoginModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-cocoa-950/70 p-4 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="modal-premium relative w-full max-w-md animate-scale-in rounded-[2rem] border border-gold-500/20 bg-white p-7 shadow-[0_32px_80px_rgba(18,10,7,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-cocoa-600 transition hover:bg-cream-200 hover:text-cocoa-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cocoa-800 to-cocoa-950 shadow-lg">
            <Shield className="h-7 w-7 text-gold-400" />
          </div>
          <h2 className="font-display text-3xl font-semibold text-cocoa-900">Staff Portal</h2>
          <p className="mt-1 text-sm text-cocoa-600/70">Secure access to outlet terminals</p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-cream-300 bg-cream-100/80 p-1.5">
          {roles.map(({ role, label, icon: Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => onRoleSelect(role)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2.5 font-accent text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedRolePreset === role
                  ? 'bg-cocoa-900 text-gold-300 shadow-md scale-[1.02]'
                  : 'text-cocoa-600 hover:bg-white/70'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {loginError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-700">
            {loginError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-accent text-[10px] font-bold uppercase tracking-[0.16em] text-cocoa-600">
              Email
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="input-premium w-full"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block font-accent text-[10px] font-bold uppercase tracking-[0.16em] text-cocoa-600">
              Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="input-premium w-full"
              required
            />
          </div>

          <PremiumButton type="submit" disabled={isLoggingIn} size="lg" className="mt-2 w-full">
            {isLoggingIn ? 'Authenticating…' : (
              <>
                Enter Terminal
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </PremiumButton>
        </form>
      </div>
    </div>
  );
}
