'use client';

import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import FadeInView from './FadeInView';

interface MenuProductCardProps {
  item: {
    id: string;
    name: string;
    price: number;
    description: string | null;
    imageUrl: string | null;
    isCombo: boolean;
    preparationMinutes: number;
    category?: { name: string };
  };
  index?: number;
}

export default function MenuProductCard({ item, index = 0 }: MenuProductCardProps) {
  return (
    <FadeInView delay={Math.min(index * 80, 480)} direction="up">
      <article className="menu-card group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-cream-400/60 bg-white/80 shadow-[0_8px_32px_rgba(44,24,16,0.06)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/30 hover:shadow-[0_24px_64px_rgba(44,24,16,0.14)]">
        <div className="menu-card-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative h-56 overflow-hidden bg-cream-200">
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80'}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/50 via-transparent to-transparent opacity-60" />

          <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-cocoa-950/75 px-3.5 py-1.5 font-accent text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300 backdrop-blur-md">
            {item.category?.name || 'Signature'}
          </div>

          {item.isCombo && (
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-caramel-500 to-caramel-400 px-3 py-1.5 font-accent text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
              <Sparkles className="h-3 w-3" />
              Combo
            </div>
          )}
        </div>

        <div className="relative flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-semibold leading-tight text-cocoa-800 transition-colors duration-300 group-hover:text-caramel-600">
              {item.name}
            </h3>
            <span className="font-accent text-lg font-extrabold text-caramel-600">₹{item.price}</span>
          </div>

          <p className="mb-5 line-clamp-2 flex-1 text-sm leading-relaxed text-cocoa-600/80">
            {item.description}
          </p>

          <div className="flex items-center justify-between border-t border-cream-300/80 pt-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-cocoa-600/70">
              <Clock className="h-3.5 w-3.5 text-caramel-500" />
              {item.preparationMinutes} min prep
            </span>
            <span className="rounded-full border border-cream-400 bg-cream-100 px-3.5 py-1.5 font-accent text-[10px] font-bold uppercase tracking-wider text-caramel-600">
              Order at Counter
            </span>
          </div>
        </div>
      </article>
    </FadeInView>
  );
}
