'use client';

import React, { useState } from 'react';
import { Sparkles, ChefHat, Check, Plus, Flame, Heart, ShoppingBag } from 'lucide-react';
import PremiumButton from './PremiumButton';

interface Option {
  id: string;
  name: string;
  price: number;
  calories: number;
  icon?: string;
}

const BASES: Option[] = [
  { id: 'belgian', name: 'Classic Belgian Waffle', price: 140, calories: 320, icon: '🧇' },
  { id: 'dark-cocoa', name: 'Dark Cocoa Waffle', price: 160, calories: 350, icon: '🍫' },
  { id: 'red-velvet', name: 'Red Velvet Waffle', price: 170, calories: 360, icon: '🍰' },
  { id: 'thickshake-jar', name: 'Gourmet Shake Jar', price: 160, calories: 410, icon: '🥤' },
];

const TOPPINGS: Option[] = [
  { id: 'biscoff', name: 'Lotus Biscoff Crumble', price: 35, calories: 85, icon: '🍪' },
  { id: 'ferrero', name: 'Ferrero Rocher Crunch', price: 45, calories: 110, icon: '🌰' },
  { id: 'strawberry', name: 'Fresh Strawberries', price: 35, calories: 30, icon: '🍓' },
  { id: 'oreo', name: 'Oreo Blast', price: 25, calories: 70, icon: '🧁' },
  { id: 'almond', name: 'Roasted Almonds', price: 30, calories: 90, icon: '🥜' },
];

const SCOOPS: Option[] = [
  { id: 'none', name: 'No Ice Cream', price: 0, calories: 0, icon: '🚫' },
  { id: 'vanilla', name: 'Vanilla Bean Gelato', price: 40, calories: 120, icon: '🍨' },
  { id: 'belgian-choc', name: 'Belgian Dark Choc', price: 50, calories: 140, icon: '🤎' },
  { id: 'pistachio', name: 'Sicilian Pistachio', price: 60, calories: 150, icon: '🟢' },
];

const DRIZZLES: Option[] = [
  { id: 'nutella', name: 'Nutella Overload', price: 25, calories: 95, icon: '🍯' },
  { id: 'white-gold', name: 'White Choc Gold', price: 25, calories: 90, icon: '✨' },
  { id: 'dark-ganache', name: 'Dark Choc Ganache', price: 20, calories: 75, icon: '🍫' },
  { id: 'caramel', name: 'Salted Caramel', price: 20, calories: 80, icon: '🍬' },
];

export default function DessertCraftStudio() {
  const [selectedBase, setSelectedBase] = useState<Option>(BASES[0]);
  const [selectedToppings, setSelectedToppings] = useState<Option[]>([TOPPINGS[0]]);
  const [selectedScoop, setSelectedScoop] = useState<Option>(SCOOPS[1]);
  const [selectedDrizzle, setSelectedDrizzle] = useState<Option>(DRIZZLES[0]);
  const [orderAdded, setOrderAdded] = useState(false);

  const toggleTopping = (topping: Option) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      if (selectedToppings.length < 3) {
        setSelectedToppings([...selectedToppings, topping]);
      }
    }
  };

  const totalPrice =
    selectedBase.price +
    selectedToppings.reduce((acc, t) => acc + t.price, 0) +
    selectedScoop.price +
    selectedDrizzle.price;

  const totalCalories =
    selectedBase.calories +
    selectedToppings.reduce((acc, t) => acc + t.calories, 0) +
    selectedScoop.calories +
    selectedDrizzle.calories;

  const decadenceScore = Math.min(100, Math.round((totalCalories / 750) * 100));

  const handleOrderCustomCreation = () => {
    setOrderAdded(true);
    setTimeout(() => setOrderAdded(false), 3000);
  };

  return (
    <div id="craft-studio-section" className="relative overflow-hidden rounded-3xl border border-cream-300/80 bg-white/80 p-6 sm:p-8 lg:p-10 shadow-xl backdrop-blur-xl">
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.15)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(184,92,56,0.15)_0%,transparent_70%)]" />

      {/* Header */}
      <div className="relative z-10 mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-50 px-4 py-1.5 font-accent text-[10px] font-bold uppercase tracking-widest text-gold-700">
          <Sparkles className="h-3.5 w-3.5 text-gold-500 animate-pulse" />
          Interactive Dessert Studio
        </div>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-cocoa-900">
          Craft Your Signature Dessert
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-medium text-cocoa-600">
          Combine artisanal waffle bases, gelato scoops, and gourmet drizzles to create your own sweet masterpiece.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Base */}
          <div>
            <label className="block text-xs font-accent font-bold uppercase tracking-wider text-cocoa-900 mb-2">
              1. Choose Base Waffle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BASES.map((b) => {
                const active = selectedBase.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBase(b)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 ${
                      active
                        ? 'bg-cocoa-900 text-gold-300 border-cocoa-900 shadow-md scale-[1.03]'
                        : 'bg-cream-50 border-cream-300 text-cocoa-800 hover:bg-cream-200'
                    }`}
                  >
                    <span className="text-2xl mb-1">{b.icon}</span>
                    <span className="text-[11px] font-bold leading-tight">{b.name}</span>
                    <span className={`text-[10px] mt-1 ${active ? 'text-gold-400 font-extrabold' : 'text-cocoa-500 font-medium'}`}>
                      ₹{b.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Toppings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-accent font-bold uppercase tracking-wider text-cocoa-900">
                2. Gourmet Toppings (Select up to 3)
              </label>
              <span className="text-[10px] font-accent text-cocoa-500 font-bold">
                {selectedToppings.length}/3 Selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TOPPINGS.map((t) => {
                const active = selectedToppings.some((item) => item.id === t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTopping(t)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-gold-500/20 to-caramel-500/20 border-gold-500 text-cocoa-900 shadow-sm font-bold'
                        : 'bg-cream-50 border-cream-300 text-cocoa-700 hover:bg-cream-200'
                    }`}
                  >
                    <span className="text-xs flex items-center gap-1.5 truncate">
                      <span>{t.icon}</span>
                      <span className="truncate">{t.name}</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-gold-600 ml-1">
                      +₹{t.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Gelato Scoop */}
          <div>
            <label className="block text-xs font-accent font-bold uppercase tracking-wider text-cocoa-900 mb-2">
              3. Gelato Scoop
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SCOOPS.map((s) => {
                const active = selectedScoop.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScoop(s)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      active
                        ? 'bg-cocoa-900 text-gold-300 border-cocoa-900 shadow-sm font-bold'
                        : 'bg-cream-50 border-cream-300 text-cocoa-700 hover:bg-cream-200'
                    }`}
                  >
                    <div className="text-lg">{s.icon}</div>
                    <div className="text-[10px] font-bold truncate mt-0.5">{s.name}</div>
                    <div className={`text-[10px] ${active ? 'text-gold-400' : 'text-cocoa-500'}`}>
                      {s.price === 0 ? 'Free' : `+₹${s.price}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Drizzle */}
          <div>
            <label className="block text-xs font-accent font-bold uppercase tracking-wider text-cocoa-900 mb-2">
              4. Signature Drizzle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DRIZZLES.map((d) => {
                const active = selectedDrizzle.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDrizzle(d)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      active
                        ? 'bg-cocoa-900 text-gold-300 border-cocoa-900 shadow-sm font-bold'
                        : 'bg-cream-50 border-cream-300 text-cocoa-700 hover:bg-cream-200'
                    }`}
                  >
                    <div className="text-lg">{d.icon}</div>
                    <div className="text-[10px] font-bold truncate mt-0.5">{d.name}</div>
                    <div className={`text-[10px] ${active ? 'text-gold-400' : 'text-cocoa-500'}`}>
                      +₹{d.price}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Visual Preview Column */}
        <div className="lg:col-span-5 bg-cream-100/90 rounded-3xl border border-cream-300/90 p-6 shadow-inner space-y-5">
          <div className="flex items-center justify-between border-b border-cream-300/80 pb-3">
            <span className="font-accent text-xs font-bold uppercase tracking-wider text-cocoa-900 flex items-center gap-1.5">
              <ChefHat className="h-4 w-4 text-gold-600" />
              Live Recipe Preview
            </span>
            <span className="text-[10px] font-bold text-caramel-600 bg-caramel-100 px-2.5 py-0.5 rounded-full">
              Made Fresh
            </span>
          </div>

          <div className="relative bg-gradient-to-b from-white to-cream-200/80 rounded-2xl p-5 border border-cream-300 text-center shadow-md overflow-hidden">
            <div className="text-5xl mb-2 animate-bounce-soft">{selectedBase.icon}</div>
            <h3 className="font-display text-xl font-bold text-cocoa-900">
              Custom {selectedBase.name}
            </h3>
            <p className="text-xs text-gold-600 font-bold mt-0.5">
              Hand-crafted at Dear Desserts
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              <span className="text-[10px] bg-cocoa-900 text-gold-300 font-bold px-2 py-0.5 rounded-md">
                {selectedBase.name}
              </span>
              {selectedToppings.map((t) => (
                <span key={t.id} className="text-[10px] bg-gold-100 text-cocoa-900 font-bold px-2 py-0.5 rounded-md">
                  {t.name}
                </span>
              ))}
              {selectedScoop.id !== 'none' && (
                <span className="text-[10px] bg-cream-300 text-cocoa-900 font-bold px-2 py-0.5 rounded-md">
                  {selectedScoop.name}
                </span>
              )}
              <span className="text-[10px] bg-caramel-100 text-caramel-800 font-bold px-2 py-0.5 rounded-md">
                {selectedDrizzle.name}
              </span>
            </div>
          </div>

          <div className="space-y-2 bg-white p-3.5 rounded-xl border border-cream-300 text-xs">
            <div className="flex justify-between font-bold text-cocoa-800">
              <span>Indulgence Meter:</span>
              <span className="text-gold-600 font-black">{decadenceScore}% Decadent ({totalCalories} kcal)</span>
            </div>
            <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-gold-400 via-caramel-500 to-cocoa-800 h-full rounded-full transition-all duration-500"
                style={{ width: `${decadenceScore}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-cream-300/80 pt-4">
            <div>
              <span className="text-xs text-cocoa-600 font-medium block">Total Price</span>
              <span className="font-display text-3xl font-bold text-cocoa-900">₹{totalPrice}</span>
              <span className="text-[10px] text-cocoa-500 block">Incl. all taxes</span>
            </div>

            <button
              onClick={handleOrderCustomCreation}
              className={`px-6 py-3.5 rounded-2xl font-accent text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg ${
                orderAdded
                  ? 'bg-emerald-600 text-white scale-105'
                  : 'bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 hover:from-cocoa-900 hover:to-black hover:scale-[1.02]'
              }`}
            >
              {orderAdded ? (
                <>
                  <Check className="h-4 w-4 text-white" /> Recipe Saved!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 text-gold-400" /> Save Creation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
