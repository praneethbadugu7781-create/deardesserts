'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../../components/Logo';
import Footer from '../../components/Footer';
import LiquidMetalButton from '../../components/LiquidMetalButton';
import { fetchApi } from '../../lib/api';
import {
  Search,
  Sparkles,
  Clock,
  ShoppingCart,
  MonitorPlay,
  Menu as MenuIcon,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  taxPercent: number;
  imageUrl?: string;
  description?: string;
  isAvailable: boolean;
  isCombo: boolean;
  preparationMinutes?: number;
  category?: Category;
}

const REAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Bubble Waffles', slug: 'bubble-waffles' },
  { id: 'cat-2', name: 'Belgian Waffles', slug: 'belgian-waffles' },
  { id: 'cat-3', name: "The Poppin' Bowl", slug: 'pop-bowl' },
  { id: 'cat-4', name: 'Brownies', slug: 'brownies' },
  { id: 'cat-5', name: 'Specials', slug: 'specials' },
  { id: 'cat-6', name: 'Bowl Cakes', slug: 'bowl-cakes' },
  { id: 'cat-7', name: 'The Crunch Corner', slug: 'savories' },
];

const REAL_MENU_ITEMS: MenuItem[] = [
  // Bubble Waffles
  { id: 'bw-1', name: 'Triple Trouble', price: 180, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-2', name: 'Triple Trouble with Ice Cream', price: 200, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-3', name: 'Fruity Pebble', price: 200, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-4', name: 'KitKat Crunch', price: 210, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-5', name: 'Oreo Dream', price: 210, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-6', name: 'Nutella Nirvana', price: 220, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 7, category: REAL_CATEGORIES[0] },
  { id: 'bw-7', name: 'Lotus Biscoff Bliss', price: 230, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 7, category: REAL_CATEGORIES[0] },

  // Belgian Waffles
  { id: 'belg-1', name: 'Triple Choco Melt', price: 120, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },
  { id: 'belg-2', name: 'Coffee Mocha', price: 150, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },
  { id: 'belg-3', name: 'Naked Nutella', price: 160, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },
  { id: 'belg-4', name: 'Kiki & Oreo', price: 160, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },
  { id: 'belg-5', name: 'Red Velvet Love', price: 170, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },

  // The Poppin' Bowl
  { id: 'pop-1', name: 'Overloaded Brownie Pop', price: 200, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', description: 'Poppin Bowl', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },
  { id: 'pop-2', name: 'Nutella Pop Bowl', price: 220, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', description: 'Poppin Bowl', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },
  { id: 'pop-3', name: 'Biscoff Pop Bowl', price: 240, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', description: 'Poppin Bowl', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },

  // Brownies & Sundaes
  { id: 'br-1', name: 'Classic Fudgy Brownie', price: 100, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', description: 'Gourmet Brownie', isAvailable: true, isCombo: false, preparationMinutes: 4, category: REAL_CATEGORIES[3] },
  { id: 'br-2', name: 'Sizzling Brownie with Ice Cream', price: 160, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', description: 'Sizzling Sundae', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[3] },
  { id: 'br-3', name: 'Nutella Brownie Stack', price: 180, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', description: 'Gourmet Brownie', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[3] },

  // Bowl Cakes
  { id: 'bc-1', name: 'Choco Lava Bowl', price: 150, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[5] },
  { id: 'bc-2', name: 'Death by Chocolate Bowl', price: 220, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[5] },
  { id: 'bc-3', name: 'Biscoff Bowl', price: 230, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[5] },

  // The Crunch Corner (Savouries)
  { id: 'sav-1', name: 'Salted French Fries', price: 80, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savouries', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[6] },
  { id: 'sav-2', name: 'Peri Peri French Fries', price: 100, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savouries', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[6] },
  { id: 'sav-3', name: 'Cheesy Chicken Bun', price: 100, taxPercent: 0, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savouries', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[6] },
];

export default function FullMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        fetchApi('/menu/categories').catch(() => null),
        fetchApi('/menu/items').catch(() => null),
      ]);

      if (Array.isArray(catsRes) && catsRes.length > 0 && Array.isArray(itemsRes) && itemsRes.length > 0) {
        setCategories(catsRes);
        setItems(itemsRes);
        return;
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
    setCategories(REAL_CATEGORIES);
    setItems(REAL_MENU_ITEMS);
  };

  const filteredItems = items.filter((item) => {
    let matchesCat = selectedCat === 'ALL';

    if (!matchesCat) {
      const selCatObj = categories.find((c) => c.id === selectedCat || c.slug === selectedCat || c.name === selectedCat);
      const targetCatId = selCatObj?.id || selectedCat;
      const targetCatName = (selCatObj?.name || selectedCat).toLowerCase();
      const targetCatSlug = (selCatObj?.slug || selectedCat).toLowerCase();

      const itemCatId = item.category?.id || '';
      const itemCatName = (typeof item.category === 'string' ? item.category : item.category?.name || item.description || '').toLowerCase();
      const itemCatSlug = (item.category?.slug || '').toLowerCase();

      matchesCat = Boolean(
        (itemCatId && targetCatId && itemCatId === targetCatId) ||
        (itemCatName && targetCatName && (itemCatName === targetCatName || itemCatName.includes(targetCatName) || targetCatName.includes(itemCatName))) ||
        (itemCatSlug && targetCatSlug && itemCatSlug === targetCatSlug)
      );
    }

    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const displayItems = filteredItems.length > 0 ? filteredItems : items;

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
              <Link href="/menu" className="font-accent text-xs font-extrabold uppercase tracking-wider text-gold-600 hover:text-cocoa-950 transition">
                Menu
              </Link>
              <Link href="/our-story" className="font-accent text-xs font-bold uppercase tracking-wider text-cocoa-800 hover:text-gold-600 transition">
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

        {/* Hero Banner */}
        <div className="relative overflow-hidden py-14 px-4 sm:px-8 text-center space-y-3.5 border-b border-cream-300/60 bg-gradient-to-b from-cream-100 via-cream-200/60 to-cream-100">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gold-300/60 text-gold-700 text-xs font-accent font-extrabold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>Complete Dessert Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-cocoa-950 tracking-tight leading-tight">
            Explore Our <span className="bg-gradient-to-r from-cocoa-900 via-gold-600 to-caramel-600 bg-clip-text text-transparent">Full Menu</span>
          </h1>

          <p className="text-sm sm:text-base text-cocoa-700 max-w-2xl mx-auto font-medium leading-relaxed">
            Freshly baked Belgian waffles, fudgy brownies, artisanal thickshakes, poppin bowls & crunchy quick bites!
          </p>
        </div>

        {/* Category Pills & Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-cream-300/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCat('ALL')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  selectedCat === 'ALL'
                    ? 'bg-cocoa-900 text-gold-300 shadow-md font-extrabold'
                    : 'bg-cream-200 text-cocoa-700 hover:bg-cream-300'
                }`}
              >
                All Items ({items.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCat === cat.id
                      ? 'bg-cocoa-900 text-gold-300 shadow-md font-extrabold'
                      : 'bg-cream-200 text-cocoa-700 hover:bg-cream-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
              <input
                type="text"
                placeholder="Search waffle, brownie, bowl..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-xs font-medium outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-cream-300/80 shadow-md hover:shadow-xl hover:border-gold-500/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-cream-200">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-cocoa-950/80 backdrop-blur-md text-gold-300 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      {item.category?.name || 'Desserts'}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-extrabold text-lg text-cocoa-950 group-hover:text-gold-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-cocoa-600 line-clamp-2 mt-1 font-medium">
                      {item.description || 'Made fresh to order with premium Belgian ingredients.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream-200">
                  <span className="text-xl font-black text-cocoa-950">₹{item.price}</span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-cocoa-600 bg-cream-100 px-2.5 py-1 rounded-xl">
                    <Clock className="w-3 h-3 text-gold-500" />
                    <span>{item.preparationMinutes || 5} mins</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Website Luxury Footer */}
      <Footer />
    </div>
  );
}
