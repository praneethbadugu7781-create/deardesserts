'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../components/Logo';
import { ArrowLeft, Heart, Sparkles, Award, MapPin, Clock, Phone, UtensilsCrossed } from 'lucide-react';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-cream-100 font-sans text-cocoa-950 pb-20">
      {/* Seamless Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-cream-300/80 py-3.5 px-4 sm:px-8 shadow-sm flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-cocoa-800 hover:text-cocoa-950 font-extrabold text-xs sm:text-sm transition">
          <ArrowLeft className="w-4 h-4 text-gold-600" />
          <span>Back to Home</span>
        </Link>

        <Logo size="md" />

        <Link
          href="/menu"
          className="flex items-center gap-2 bg-gradient-to-r from-cocoa-900 to-cocoa-950 text-gold-300 hover:scale-105 px-4 py-2 rounded-2xl text-xs font-bold shadow-md transition"
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-gold-400" />
          <span>Explore Full Menu</span>
        </Link>
      </header>

      {/* Warm Luxury Hero Banner (Seamless Light Cream Design) */}
      <div className="relative overflow-hidden py-14 px-4 sm:px-8 text-center space-y-3.5 border-b border-cream-300/60 bg-gradient-to-b from-cream-100 via-cream-200/60 to-cream-100">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gold-300/60 text-gold-700 text-xs font-accent font-extrabold uppercase tracking-widest shadow-sm">
          <Sparkles className="w-4 h-4 text-gold-600" />
          <span>The Story of Dear Desserts</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-cocoa-950 tracking-tight leading-tight">
          Crafted With Heart, <span className="bg-gradient-to-r from-cocoa-900 via-gold-600 to-caramel-600 bg-clip-text text-transparent">Served With Love</span>
        </h1>

        <p className="text-sm sm:text-base text-cocoa-700 max-w-2xl mx-auto font-medium leading-relaxed">
          Discover how founder <strong className="text-cocoa-950 font-bold">Sohail</strong> turned a personal passion for authentic Belgian cocoa into Vijayawada’s favorite dessert destination.
        </p>
      </div>

      {/* Founder Sohail Story Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Founder Image & Quote Badge */}
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
              
              {/* Founder Overlay Card */}
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

        {/* Outlet Details */}
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
              className="px-6 py-3.5 rounded-2xl bg-white border border-cream-300 text-cocoa-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-cream-200 transition"
            >
              View Menu & Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
