'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, Clock, ArrowRight } from 'lucide-react';

const SHOWCASE_ITEMS = [
  {
    id: 1,
    name: 'Belgian Chocolate Thickshake',
    tagline: '#1 Chef’s Signature',
    price: 170,
    prepTime: '5 mins',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900&q=85',
    desc: 'Rich imported Belgian cocoa blended with organic vanilla bean gelato & rich dark fudge drip.',
    badgeColor: 'bg-gold-500 text-cocoa-950',
  },
  {
    id: 2,
    name: 'Triple Trouble Bubble Waffle',
    tagline: 'Most Popular Dessert',
    price: 180,
    prepTime: '6 mins',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=900&q=85',
    desc: 'Crispy warm bubble waffle layered with milk, dark & white chocolate drizzle with crunchy crumbles.',
    badgeColor: 'bg-cocoa-900 text-gold-300',
  },
  {
    id: 3,
    name: 'Overloaded Brownie Pop Bowl',
    tagline: 'Vijayawada Special',
    price: 200,
    prepTime: '5 mins',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&q=85',
    desc: 'Bite-sized fudgy brownie pops submerged in a warm pool of liquid Belgian chocolate.',
    badgeColor: 'bg-caramel-600 text-cream-100',
  },
];

export default function HeroBestsellerShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length);
  };

  const current = SHOWCASE_ITEMS[currentIndex];

  return (
    <div className="relative group">
      {/* Outer Golden Glow */}
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold-500/25 via-caramel-500/10 to-cocoa-900/30 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Main Glassmorphism Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-[0_32px_80px_rgba(44,24,16,0.25)] bg-cocoa-950">
        <div className="relative h-[440px] w-full lg:h-[510px]">
          <Image
            key={current.id}
            src={current.image}
            alt={current.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-all duration-700 scale-105 animate-in fade-in zoom-in-95 duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950 via-cocoa-950/40 to-black/20" />

          {/* Floating Badges */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-lg ${current.badgeColor}`}>
                ✨ {current.tagline}
              </span>
              <span className="bg-white/90 backdrop-blur-md text-cocoa-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Clock className="w-3 h-3 text-gold-600" /> {current.prepTime}
              </span>
            </div>

            <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full">
              🟢 Outlet Open
            </span>
          </div>

          {/* Next / Prev Nav Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-cocoa-950 backdrop-blur-md flex items-center justify-center shadow-lg transition transform hover:scale-110 active:scale-95 z-20"
            aria-label="Previous item"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-cocoa-950 backdrop-blur-md flex items-center justify-center shadow-lg transition transform hover:scale-110 active:scale-95 z-20"
            aria-label="Next item"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Bottom Card Info & Price Tag */}
          <div className="absolute bottom-6 left-6 right-6 z-10 space-y-3">
            <div className="flex items-end justify-between text-white">
              <div className="space-y-1 max-w-[70%]">
                <div className="flex items-center gap-1 text-[11px] font-bold text-gold-400 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-gold-400" /> Bestseller Showcase
                </div>
                <h3 className="font-display text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {current.name}
                </h3>
                <p className="text-xs text-cream-200/90 font-medium line-clamp-2 leading-relaxed">
                  {current.desc}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-display text-3xl sm:text-4xl font-black text-gold-400 drop-shadow-md">₹{current.price}</span>
                <div className="text-[10px] text-cream-300/80 font-bold uppercase tracking-wider">Net Price</div>
              </div>
            </div>

            {/* Pagination Dots & CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <div className="flex items-center gap-1.5">
                {SHOWCASE_ITEMS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-7 bg-gold-400' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gold-400 hover:bg-gold-300 text-cocoa-950 text-xs font-extrabold uppercase tracking-wider shadow-md transition transform hover:scale-105"
              >
                <span>Order in Menu</span>
                <ArrowRight className="w-3.5 h-3.5 text-cocoa-950" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
