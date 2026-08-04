'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../components/Logo';
import Footer from '../../components/Footer';
import LiquidMetalButton from '../../components/LiquidMetalButton';
import {
  Heart,
  Sparkles,
  Award,
  MonitorPlay,
  Menu as MenuIcon,
  X,
  Lock,
  ArrowRight,
  UtensilsCrossed,
} from 'lucide-react';

export default function OurStoryPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-cocoa-950 flex flex-col justify-between">
      <div>
        {/* Main Website Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-cream-300/80 min-h-[4.5rem] md:min-h-[5.5rem] flex items-center shadow-sm">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
            {/* Left Side: Brand Logo */}
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <Logo size="lg" />
            </Link>

            {/* Middle Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-cream-300/80 shadow-sm">
              <Link href="/menu" className="font-accent text-xs font-bold uppercase tracking-wider text-cocoa-800 hover:text-gold-600 transition">
                Menu
              </Link>
              <Link href="/our-story" className="font-accent text-xs font-extrabold uppercase tracking-wider text-gold-600 hover:text-cocoa-950 transition">
                Our Story
              </Link>
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/tokens"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl border border-gold-500/30 bg-gold-50/80 text-cocoa-900 hover:bg-gold-100 font-accent text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                <MonitorPlay className="h-4 w-4 text-gold-600 animate-pulse" />
                <span>Token TV</span>
              </Link>

              <Link href="/login" className="hidden sm:block">
                <LiquidMetalButton label="Staff Portal" />
              </Link>

              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-white text-cocoa-900 border border-cream-300 hover:bg-cream-200 transition active:scale-95 shadow-sm"
              >
                {mobileNavOpen ? <X className="h-6 w-6 text-cocoa-950" /> : <MenuIcon className="h-6 w-6 text-cocoa-950" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileNavOpen && (
            <div className="absolute top-full left-0 right-0 w-full bg-cream-100/98 backdrop-blur-2xl border-b-2 border-cream-300/80 shadow-2xl p-5 space-y-3 z-50">
              <Link
                href="/menu"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between font-accent text-xs font-bold uppercase tracking-wider text-cocoa-950 py-3.5 px-4 rounded-xl bg-gold-100 border border-gold-300 shadow-sm"
              >
                <span className="flex items-center gap-2">🍰 Full Menu Catalog</span>
                <ArrowRight className="w-4 h-4 text-cocoa-900" />
              </Link>
              <Link
                href="/our-story"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between font-accent text-xs font-bold uppercase tracking-wider text-cocoa-900 py-3.5 px-4 rounded-xl bg-white/80 border border-cream-300/60"
              >
                <span>📖 Our Story (Founder Sohail)</span>
                <ArrowRight className="w-4 h-4 text-cocoa-400" />
              </Link>
              <Link
                href="/tokens"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between font-accent text-xs font-bold uppercase tracking-wider text-cocoa-900 py-3.5 px-4 rounded-xl bg-white/80 border border-cream-300/60"
              >
                <span className="flex items-center gap-2"><MonitorPlay className="h-4 w-4 text-gold-600" /> Token TV</span>
                <span className="text-[10px] bg-gold-200 text-cocoa-950 font-black px-2.5 py-0.5 rounded-full">Live</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-cocoa-900 text-gold-300 font-accent text-xs font-extrabold uppercase tracking-widest mt-2 shadow-lg"
              >
                <Lock className="w-4 h-4 text-gold-400" />
                <span>Staff Login Portal</span>
              </Link>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <div className="relative overflow-hidden py-16 px-4 sm:px-8 text-center space-y-4 border-b border-cream-300/60 bg-gradient-to-b from-cream-100 via-cream-200/60 to-cream-100">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gold-300/60 text-gold-700 text-xs font-accent font-extrabold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>The Founder's Journey</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-cocoa-950 tracking-tight leading-tight">
            Crafted With Heart, <span className="bg-gradient-to-r from-cocoa-900 via-gold-600 to-caramel-600 bg-clip-text text-transparent">Served With Love</span>
          </h1>

          <p className="text-sm sm:text-base text-cocoa-700 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover how founder <strong className="text-cocoa-950 font-bold">Sohail</strong> turned a personal passion for authentic Belgian cocoa into Vijayawada’s favorite dessert destination.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Founder Image & Quote */}
            <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl bg-cream-200">
              <div className="relative h-96 sm:h-[480px] w-full">
                <Image
                  src="/philosophy.jpg"
                  alt="Dear Desserts Founder Sohail Journey"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/90 via-cocoa-950/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-cream-300 shadow-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-accent text-[10px] font-black uppercase tracking-[0.2em] text-gold-600">The Visionary Founder</span>
                    <span className="text-xs font-extrabold text-cocoa-900 bg-gold-100 px-2.5 py-0.5 rounded-full border border-gold-300">Dear Desserts</span>
                  </div>
                  <h3 className="font-display font-black text-2xl text-cocoa-950">SOHAIL</h3>
                  <p className="text-xs text-cocoa-700 italic font-medium leading-relaxed">
                    "Every waffle we bake & every shake we blend carries one promise — Love at First Bite."
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Narrative Story */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="font-accent text-xs font-extrabold uppercase tracking-[0.25em] text-gold-600">Our Humble Beginnings</span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight text-cocoa-950">
                  A Sweet Journey Born From Passion & Dedication
                </h2>
              </div>

              <p className="text-base leading-relaxed text-cocoa-800 font-medium">
                Dear Desserts wasn’t built overnight in a corporate boardroom — it was born in a kitchen out of pure love, late-night recipe trials, and an unyielding obsession with genuine Belgian chocolate. Our founder, <strong className="text-cocoa-950 font-bold">Sohail</strong>, started with a simple yet heartfelt dream: to bring world-class, freshly baked bubble waffles, fudgy brownies, and thick artisanal shakes to Vijayawada.
              </p>

              <p className="text-sm leading-relaxed text-cocoa-700 font-normal">
                From hand-selecting rich Belgian cocoa suppliers to perfecting the golden crispy texture of our signature waffles, Sohail poured his heart into every single recipe. Today, Dear Desserts stands as a beloved home for dessert lovers — where quality is never compromised, and every order is crafted fresh with genuine warmth.
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { icon: Heart, label: 'Founded by Sohail', detail: 'Driven by Passion' },
                  { icon: Sparkles, label: '100% Pure Cocoa', detail: 'Belgian Import' },
                  { icon: Award, label: '#1 Rated Outlet', detail: 'Bhavanipuram' },
                ].map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm space-y-1">
                    <Icon className="h-5 w-5 text-gold-600" />
                    <div className="font-display font-extrabold text-xs text-cocoa-950">{label}</div>
                    <div className="text-[10px] text-cocoa-600 font-medium">{detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outlet CTA Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-cream-300/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <span className="font-accent text-xs font-extrabold uppercase tracking-widest text-gold-600">Flagship Location</span>
              <h3 className="font-display text-2xl font-bold text-cocoa-950">Visit Our Vijayawada Outlet</h3>
              <p className="text-xs text-cocoa-700 font-medium">Swathi Theatre Road, Opp. Sri Balaji Sweets, Bhavanipuram, Vijayawada - 520012</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://maps.app.goo.gl/RmuEvt2cNEy637Vk6"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cocoa-900 to-black text-gold-300 font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition"
              >
                Get Directions ↗
              </a>
              <Link
                href="/menu"
                className="px-6 py-3.5 rounded-2xl bg-white border border-cream-300 text-cocoa-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-cream-200 transition flex items-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4 text-gold-600" />
                <span>View Full Menu</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Website Luxury Footer */}
      <Footer />
    </div>
  );
}
