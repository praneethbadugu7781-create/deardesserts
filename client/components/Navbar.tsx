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

  // Infer role from user state or current path so links NEVER disappear
  const activeRole = user?.role || (
    pathname.startsWith('/admin') ? 'ADMIN' :
    pathname === '/pos' ? 'CASHIER' :
    pathname === '/kds' ? 'KITCHEN_STAFF' : 'ADMIN'
  );

  const getNavItemsForRole = () => {
    if (activeRole === 'ADMIN') {
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

    if (activeRole === 'CASHIER') {
      return [
        { label: 'POS Billing', path: '/pos', icon: ShoppingCart },
        { label: 'Token Display', path: '/tokens', icon: MonitorPlay },
      ];
    }

    if (activeRole === 'KITCHEN_STAFF') {
      return [
        { label: 'Kitchen (KDS)', path: '/kds', icon: ChefHat },
        { label: 'Token Display', path: '/tokens', icon: MonitorPlay },
      ];
    }

    return [];
  };

  const accessibleItems = getNavItemsForRole();

  const getLogoLink = () => {
    if (activeRole === 'ADMIN') return '/admin/dashboard';
    if (activeRole === 'CASHIER') return '/pos';
    if (activeRole === 'KITCHEN_STAFF') return '/kds';
    return '/';
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-cream-300/80 sticky top-0 z-50 shadow-sm text-cocoa-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.25rem]">
          {/* Logo */}
          <Link href={getLogoLink()} className="flex items-center gap-3 flex-shrink-0">
            <Logo size="sm" theme="light" />
          </Link>

          {/* Role Nav Pills */}
          <nav className="hidden md:flex items-center space-x-1 bg-cream-200/70 p-1 rounded-2xl border border-cream-300/80">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-accent text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-cocoa-900 text-gold-300 shadow-md scale-[1.02]'
                      : 'text-cocoa-700 hover:bg-cream-200 hover:text-cocoa-950'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-400' : 'text-cocoa-500'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden sm:flex items-center space-x-3 border-l border-cream-300/80 pl-3">
                <div className="text-right leading-tight">
                  <div className="text-xs font-sans font-bold text-cocoa-900">{user.name}</div>
                  <div className="text-[9px] text-cocoa-600 font-accent font-bold uppercase tracking-wider">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl bg-cream-200 hover:bg-red-50 text-cocoa-600 hover:text-red-600 border border-cream-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-cream-200 border border-cream-300 text-cocoa-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream-100 border-b border-cream-300/80 px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 gap-2 pt-2">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-accent font-bold uppercase tracking-wider transition-all ${
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
  );
}
