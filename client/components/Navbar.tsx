'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, Role } from '../lib/auth';
import Logo from './Logo';
import {
  Home,
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
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on customer home page ('/'), header is handled in page.tsx
  if (pathname === '/') return null;

  const getNavItemsForRole = () => {
    if (!user) return [];

    if (user.role === 'ADMIN') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Item Sales', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Peak Rush', path: '/admin/peak-hours', icon: Flame },
        { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
        { label: 'Menu & Offers', path: '/admin/menu', icon: UtensilsCrossed },
        { label: 'Staff', path: '/admin/staff', icon: Users },
        { label: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
      ];
    }

    if (user.role === 'CASHIER') {
      return [
        { label: 'POS Billing', path: '/pos', icon: ShoppingCart },
        { label: 'Token Display', path: '/tokens', icon: MonitorPlay },
      ];
    }

    if (user.role === 'KITCHEN_STAFF') {
      return [
        { label: 'Kitchen (KDS)', path: '/kds', icon: ChefHat },
        { label: 'Token Display', path: '/tokens', icon: MonitorPlay },
      ];
    }

    return [];
  };

  const accessibleItems = getNavItemsForRole();

  const getLogoLink = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'CASHIER') return '/pos';
    if (user.role === 'KITCHEN_STAFF') return '/kds';
    return '/';
  };

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white/90 backdrop-blur-2xl border-r border-cream-300/80 shadow-[4px_0_24px_rgba(44,24,16,0.04)] flex-col justify-between p-5 z-50 text-cocoa-900 overflow-y-auto">
        <div className="space-y-6">
          {/* Logo & Title */}
          <Link href={getLogoLink()} className="flex flex-col items-center justify-center pt-2 pb-4 border-b border-cream-300/70 group">
            <Logo size="md" variant="full" theme="light" />
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-accent font-bold uppercase tracking-widest text-cocoa-500">
              Navigation Menu
            </div>
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-accent text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-cocoa-900 text-gold-300 shadow-lg scale-[1.02]'
                      : 'text-cocoa-700 hover:bg-cream-200/80 hover:text-cocoa-950'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-gold-400' : 'text-cocoa-500'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        {user && (
          <div className="pt-4 border-t border-cream-300/80 flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-xs font-sans font-bold text-cocoa-900 truncate">{user.name}</div>
              <div className="text-[10px] text-cocoa-600 font-accent font-bold uppercase tracking-wider">{user.role}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 rounded-xl bg-cream-200 hover:bg-red-50 text-cocoa-600 hover:text-red-600 border border-cream-300 transition-colors duration-300 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-cream-300/80 sticky top-0 z-50 shadow-sm text-cocoa-900">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href={getLogoLink()}>
            <Logo size="sm" theme="light" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-cream-200 text-cocoa-900 border border-cream-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="bg-cream-100 border-b border-cream-300/80 px-4 pt-2 pb-6 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 gap-2 pt-2">
              {accessibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-accent font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-cocoa-900 text-gold-300 shadow-md'
                        : 'bg-white/80 border border-cream-300/60 text-cocoa-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-cocoa-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {user && (
              <div className="mt-4 pt-4 border-t border-cream-300/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-sans font-bold text-cocoa-900">{user.name}</div>
                  <div className="text-[10px] text-cocoa-600 font-accent font-bold uppercase tracking-wider">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cream-200 text-cocoa-700 hover:text-red-600 border border-cream-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
