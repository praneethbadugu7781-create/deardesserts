'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, Role } from '../lib/auth';
import Logo from './Logo';
import {
  ShoppingCart,
  ChefHat,
  MonitorPlay,
  LayoutDashboard,
  BarChart3,
  Flame,
  Boxes,
  UtensilsCrossed,
  Users,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  Lock,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, switchRoleDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on customer home page ('/'), header is handled in page.tsx
  if (pathname === '/') return null;

  const isKds = pathname === '/kds';
  const isTokens = pathname === '/tokens';

  const staffNavItems = [
    { label: 'POS Billing', path: '/pos', icon: ShoppingCart, roles: ['ADMIN', 'CASHIER'] },
    { label: 'Kitchen (KDS)', path: '/kds', icon: ChefHat, roles: ['ADMIN', 'KITCHEN_STAFF'] },
    { label: 'Token Display', path: '/tokens', icon: MonitorPlay, roles: ['ADMIN', 'CASHIER', 'KITCHEN_STAFF'] },
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { label: 'Item Sales', path: '/admin/analytics', icon: BarChart3, roles: ['ADMIN'] },
    { label: 'Peak Rush', path: '/admin/peak-hours', icon: Flame, roles: ['ADMIN'] },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes, roles: ['ADMIN'] },
    { label: 'Menu & Offers', path: '/admin/menu', icon: UtensilsCrossed, roles: ['ADMIN'] },
    { label: 'Staff', path: '/admin/staff', icon: Users, roles: ['ADMIN'] },
    { label: 'Reports', path: '/admin/reports', icon: FileSpreadsheet, roles: ['ADMIN'] },
  ];

  const accessibleItems = staffNavItems.filter(
    (item) => !user || item.roles.includes(user.role) || user.role === 'ADMIN'
  );

  return (
    <header
      className={`${
        isKds || isTokens
          ? 'glass-panel-dark border-b border-gold-500/20 text-white'
          : 'glass-panel border-b border-cream-300/80 text-cocoa-900'
      } sticky top-0 z-50 shadow-[0_4px_24px_rgba(44,24,16,0.04)] transition-all duration-500`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">
          {/* Logo */}
          <Link href="/" className="focus:outline-none flex items-center gap-3">
            <Logo size="md" theme={isKds || isTokens ? 'dark' : 'light'} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-cream-200/60 p-1.5 rounded-2xl border border-cream-300/80">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-accent text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-cocoa-900 text-gold-300 shadow-md scale-[1.02]'
                      : 'text-cocoa-600 hover:bg-white/80 hover:text-caramel-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-gold-400' : 'text-caramel-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Role Switcher & User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Role Switcher */}
            <div className="flex items-center bg-[#FAF3E8] p-1 rounded-xl border border-[#E0CFB3] text-xs">
              <span className="px-2 text-[#9B532B] font-extrabold text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Role:
              </span>
              {(['ADMIN', 'CASHIER', 'KITCHEN_STAFF'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRoleDemo(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition ${
                    user?.role === r
                      ? 'bg-[#1A0F0A] text-[#F3E5AB] shadow'
                      : 'text-[#633C1D] hover:text-[#1A0F0A]'
                  }`}
                >
                  {r === 'KITCHEN_STAFF' ? 'KITCHEN' : r}
                </button>
              ))}
            </div>

            {user && (
              <div className="flex items-center space-x-3 border-l border-[#E0CFB3] pl-4">
                <div className="text-right">
                  <div className="text-xs font-black">{user.name}</div>
                  <div className="text-[10px] text-[#9B532B] font-bold uppercase">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl bg-[#FAF3E8] hover:bg-red-50 text-[#633C1D] hover:text-red-600 border border-[#E0CFB3] transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#FAF3E8] border border-[#E0CFB3] text-[#1A0F0A]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#EADCC9] px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-[#1A0F0A] text-[#F3E5AB]' : 'bg-[#FAF3E8] text-[#633C1D]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
