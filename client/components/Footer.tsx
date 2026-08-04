'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import {
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  Clock,
  MapPin,
  Phone,
  Lock,
} from 'lucide-react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative border-t-2 border-gold-400/60 bg-gradient-to-b from-cream-100 via-cream-200/90 to-cream-300/80 text-cocoa-900 pt-16 overflow-hidden w-full">
      {/* Subtle Watermark */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none opacity-10 overflow-hidden select-none">
        <span className="font-display font-black text-[12vw] leading-none text-gold-500 tracking-wider whitespace-nowrap">
          DEAR DESSERTS
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">
        {/* Top VIP Dessert Club Light Glass Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-cream-300/90 p-8 md:p-10 rounded-3xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-accent font-extrabold uppercase tracking-wider border border-gold-300/50">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" /> VIP Dessert Club
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-cocoa-950 tracking-tight">
              Unlock Secret Releases & Special Offers
            </h3>
            <p className="text-xs sm:text-sm text-cocoa-700 font-medium">
              Subscribe to get exclusive weekend waffle promo codes & secret menu drops delivered to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="rounded-2xl border border-gold-400/50 bg-cream-100 px-6 py-4 text-center text-sm font-bold text-cocoa-900 shadow-sm">
                🎉 Welcome to the Dear Desserts VIP Club!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail) setSubscribed(true);
                }}
                className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full sm:w-72 rounded-2xl border border-cream-300 bg-white px-5 py-3.5 text-xs text-cocoa-900 placeholder-cocoa-400 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 shadow-sm"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cocoa-800 to-cocoa-950 hover:from-cocoa-900 hover:to-black text-gold-300 font-extrabold text-xs tracking-wider uppercase shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  Subscribe Now
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main 4-Column Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-cream-300/80 pb-12">
          {/* Col 1: Brand & Socials */}
          <div className="space-y-5">
            <Logo size="lg" theme="light" />
            <p className="text-xs leading-relaxed text-cocoa-700 font-medium">
              Handcrafted Belgian waffles, warm chocolate fudge, artisanal thickshakes, and gourmet quick bites — made fresh with love daily at our Vijayawada outlet.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[
                { Icon: Instagram, href: 'https://instagram.com' },
                { Icon: Facebook, href: 'https://facebook.com' },
                { Icon: Twitter, href: 'https://twitter.com' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-cream-300 bg-white text-cocoa-800 transition-all duration-300 hover:border-gold-500 hover:bg-cocoa-900 hover:text-gold-300 hover:scale-110 shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Gourmet Menu Catalog */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-bold text-cocoa-950 tracking-wide">Gourmet Catalog</h4>
            <ul className="space-y-2.5 text-xs text-cocoa-700 font-medium">
              <li>
                <Link href="/menu" className="hover:text-gold-600 transition flex items-center gap-1.5 font-bold text-cocoa-900">
                  <span>🍰 Full Menu Catalog</span>
                </Link>
              </li>
              {['Bubble Waffles', 'Belgian Waffles', 'The Poppin Bowl', 'Brownies & Sundaes', 'Bowl Cakes', 'The Crunch Corner'].map((catName) => (
                <li key={catName}>
                  <Link href="/menu" className="hover:text-gold-600 transition hover:translate-x-1 inline-block duration-200">
                    {catName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Outlet Location & Hours */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-bold text-cocoa-950 tracking-wide">Flagship Outlet</h4>
            <div className="space-y-3 text-xs text-cocoa-700 font-medium">
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-cocoa-900">Mon – Sun: 11:00 AM – 11:30 PM</div>
                  <div className="text-[10px] text-green-700 font-bold mt-0.5">🟢 Outlet Open Everyday</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-cocoa-900">Dear Desserts Outlet</div>
                  <div>Swathi Theatre Road, Opp. Sri Balaji Sweets, Bhavanipuram, Vijayawada</div>
                  <a
                    href="https://maps.app.goo.gl/RmuEvt2cNEy637Vk6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-gold-600 hover:text-gold-700 underline"
                  >
                    Get Driving Directions ↗
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-gold-600 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-gold-600 font-bold text-cocoa-900 transition">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Portals & Staff Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-bold text-cocoa-950 tracking-wide">Quick Portals</h4>
            <ul className="space-y-2.5 text-xs text-cocoa-700 font-medium">
              <li>
                <Link href="/our-story" className="hover:text-gold-600 transition hover:translate-x-1 inline-block font-bold text-cocoa-900">
                  📖 Our Story (Founder Sohail)
                </Link>
              </li>
              <li>
                <Link href="/tokens" className="hover:text-gold-600 transition hover:translate-x-1 inline-block">
                  📺 Token TV Live Display
                </Link>
              </li>
              <li>
                <Link href="/pos" className="hover:text-gold-600 transition hover:translate-x-1 inline-block">
                  🛒 Cashier POS Terminal
                </Link>
              </li>
              <li>
                <Link href="/kds" className="hover:text-gold-600 transition hover:translate-x-1 inline-block">
                  👨‍🍳 Kitchen Display (KDS)
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-gold-600 transition hover:translate-x-1 inline-block">
                  📊 Executive Admin Dashboard
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-cream-300 text-cocoa-900 text-[11px] font-extrabold hover:bg-cocoa-900 hover:text-gold-300 transition shadow-sm"
                >
                  <Lock className="w-3 h-3 text-gold-500" />
                  <span>Staff Portal Login</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Back-to-Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cocoa-600 pb-12">
          <div>
            © {new Date().getFullYear()} <strong className="text-cocoa-950 font-bold">Dear Desserts</strong> • Swathi Theatre Road, Bhavanipuram, Vijayawada
          </div>

          <div className="flex items-center gap-6">
            <Link href="/menu" className="hover:text-gold-600 transition font-medium">Full Menu</Link>
            <Link href="/our-story" className="hover:text-gold-600 transition font-medium">Our Story</Link>
            <a href="https://maps.app.goo.gl/RmuEvt2cNEy637Vk6" target="_blank" rel="noopener noreferrer" className="hover:text-gold-600 transition font-medium">Location</a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:bg-cocoa-900 hover:text-gold-300 font-bold text-cocoa-900 transition flex items-center gap-1 bg-white px-3.5 py-1.5 rounded-xl border border-cream-300 shadow-sm"
            >
              <span>↑ Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
