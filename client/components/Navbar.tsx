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

  const staffNavItems = [
    { label: 'Home', path: '/', icon: Home, roles: ['ADMIN', 'CASHIER', 'KITCHEN_STAFF', 'CUSTOMER'] },
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
    <header className="bg-white/80 backdrop-blur-xl border-b border-cream-300/60 sticky top-0 z-50 shadow-[0_4px_24px_rgba(44,24,16,0.04)] transition-all duration-500 text-cocoa-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">
          {/* Logo */}
          <Link href="/" className="focus:outline-none flex items-center gap-3 flex-shrink-0">
            <Logo size="md" theme="light" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-cream-200/60 p-1.5 rounded-2xl border border-cream-300/80 overflow-x-auto max-w-[55vw] scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      : 'text-cocoa-600 hover:bg-cream-200 hover:text-cocoa-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-gold-400' : 'text-cocoa-500'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 border-l border-cream-300/80 pl-4">
                <div className="text-right">
                  <div className="text-sm font-sans font-bold text-cocoa-900">{user.name}</div>
                  <div className="text-[10px] text-cocoa-600 font-accent font-bold uppercase tracking-wider">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl bg-cream-200 hover:bg-red-50 text-cocoa-600 hover:text-red-600 border border-cream-300 transition-colors duration-300"
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
              className="p-2 rounded-xl bg-cream-200 hover:bg-cream-300 border border-cream-300 text-cocoa-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-cream-100 border-b border-cream-300/80 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-accent font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-cocoa-900 text-gold-300 shadow-md'
                      : 'bg-white/80 border border-cream-300/60 text-cocoa-600 hover:bg-cream-200'
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
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cream-200 hover:bg-red-50 text-cocoa-600 hover:text-red-600 border border-cream-300 transition-colors duration-300"
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
