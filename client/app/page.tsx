'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../components/Logo';
import { useAuth, Role } from '../lib/auth';
import { fetchApi } from '../lib/api';
import PremiumButton from '../components/PremiumButton';
import FadeInView from '../components/FadeInView';
import MenuProductCard from '../components/MenuProductCard';
import StaffLoginModal from '../components/StaffLoginModal';
import LiquidMetalButton from '../components/LiquidMetalButton';
import IntroSplash from '../components/IntroSplash';
import {
  Search,
  Sparkles,
  Lock,
  ArrowRight,
  MonitorPlay,
  Star,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Send,
  Award,
  Leaf,
  Clock,
  Heart,
  ChevronDown,
  X,
  Menu as MenuIcon,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  taxPercent: number;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isCombo: boolean;
  preparationMinutes: number;
  category: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const MARQUEE_ITEMS = [
  'Belgian Chocolate Thickshake',
  'Signature Waffles',
  'Artisan Cakes',
  'Gourmet Combos',
  'Fresh Daily',
  'Flagship Outlet #DD-01',
];

export default function CustomerHomePage() {
  const { login } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(true);
  const [scrolled, setScrolled] = useState(false);

  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('admin@deardesserts.com');
  const [loginPassword, setLoginPassword] = useState<string>('admin123');
  const [selectedRolePreset, setSelectedRolePreset] = useState<Role>('ADMIN');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    loadCustomerMenu();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
  { id: 'bw-1', name: 'Triple Trouble', price: 180, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-2', name: 'Triple Trouble with Ice Cream', price: 200, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-3', name: 'Fruity Pebble', price: 200, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-4', name: 'KitKat Crunch', price: 210, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-5', name: 'Oreo Dream', price: 210, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[0] },
  { id: 'bw-6', name: 'Nutella Nirvana', price: 220, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 7, category: REAL_CATEGORIES[0] },
  { id: 'bw-7', name: 'Lotus Biscoff Bliss', price: 230, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600', description: 'Bubble Waffle', isAvailable: true, isCombo: false, preparationMinutes: 7, category: REAL_CATEGORIES[0] },

  // Belgian Waffles
  { id: 'belg-1', name: 'Triple Choco Melt', price: 120, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },
  { id: 'belg-2', name: 'Coffee Mocha', price: 150, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },
  { id: 'belg-3', name: 'Naked Nutella', price: 160, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },
  { id: 'belg-4', name: 'Kiki & Oreo', price: 160, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },
  { id: 'belg-5', name: 'Lotus Biscoff Love', price: 160, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600', description: 'Belgian Waffle', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[1] },

  // The Poppin' Bowl
  { id: 'pop-1', name: 'The Triple Choco', price: 190, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', description: "Poppin' Bowl", isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },
  { id: 'pop-2', name: 'Triple Choco with Ice Cream', price: 210, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', description: "Poppin' Bowl", isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },
  { id: 'pop-3', name: 'Break Time with KitKat', price: 220, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', description: "Poppin' Bowl", isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },
  { id: 'pop-4', name: 'Nutella Pop Bowl', price: 230, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', description: "Poppin' Bowl", isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },
  { id: 'pop-5', name: 'Biscoff Pop Bowl', price: 240, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', description: "Poppin' Bowl", isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },
  { id: 'pop-6', name: 'The Fruit Loaded', price: 250, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600', description: "Poppin' Bowl", isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[2] },

  // Brownies
  { id: 'br-1', name: 'Triple Chocolate Brownie', price: 130, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', description: 'Brownie', isAvailable: true, isCombo: false, preparationMinutes: 4, category: REAL_CATEGORIES[3] },
  { id: 'br-2', name: 'Oreo Overload Brownie', price: 140, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', description: 'Brownie', isAvailable: true, isCombo: false, preparationMinutes: 4, category: REAL_CATEGORIES[3] },
  { id: 'br-3', name: 'Meltdown with Vanilla', price: 160, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', description: 'Brownie', isAvailable: true, isCombo: false, preparationMinutes: 4, category: REAL_CATEGORIES[3] },
  { id: 'br-4', name: 'Biscoff Brownie', price: 160, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', description: 'Brownie', isAvailable: true, isCombo: false, preparationMinutes: 4, category: REAL_CATEGORIES[3] },
  { id: 'br-5', name: 'Hazelnut Heaven', price: 160, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', description: 'Brownie', isAvailable: true, isCombo: false, preparationMinutes: 4, category: REAL_CATEGORIES[3] },

  // Specials
  { id: 'sp-1', name: 'Matilda Cake', price: 180, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Specials', isAvailable: true, isCombo: false, preparationMinutes: 4, category: REAL_CATEGORIES[4] },
  { id: 'sp-2', name: 'Magnum Obsession', price: 200, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Specials', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[4] },
  { id: 'sp-3', name: 'Brownie Bowl', price: 200, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', description: 'Specials', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[4] },
  { id: 'sp-4', name: 'Nutella Bites', price: 200, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Specials', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[4] },
  { id: 'sp-5', name: 'Death by Chocolate', price: 240, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Specials', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[4] },

  // Bowl Cakes
  { id: 'bc-1', name: 'Triple Choco Bowl', price: 180, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[5] },
  { id: 'bc-2', name: 'Crunch Chocolate Bowl', price: 220, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[5] },
  { id: 'bc-3', name: 'KitKat Bowl', price: 220, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[5] },
  { id: 'bc-4', name: 'Oreo Overload Bowl', price: 220, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[5] },
  { id: 'bc-5', name: 'Biscoff Bowl', price: 230, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[5] },
  { id: 'bc-6', name: 'Kunafa Kraze Bowl', price: 250, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[5] },
  { id: 'bc-7', name: 'Ferrero Rocher Bowl', price: 300, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', description: 'Bowl Cake', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[5] },

  // The Crunch Corner (savories)
  { id: 'sav-1', name: 'Salted French Fries', price: 80, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savories', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[6] },
  { id: 'sav-2', name: 'Peri Peri French Fries', price: 100, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savories', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[6] },
  { id: 'sav-3', name: 'Cheesy Fries', price: 130, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savories', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[6] },
  { id: 'sav-4', name: 'Chicken Loaded Fries', price: 150, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savories', isAvailable: true, isCombo: false, preparationMinutes: 7, category: REAL_CATEGORIES[6] },
  { id: 'sav-5', name: 'Chicken Popcorn', price: 150, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savories', isAvailable: true, isCombo: false, preparationMinutes: 6, category: REAL_CATEGORIES[6] },
  { id: 'sav-6', name: 'Chicken Wings', price: 160, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savories', isAvailable: true, isCombo: false, preparationMinutes: 8, category: REAL_CATEGORIES[6] },
  { id: 'sav-7', name: 'Cheesy Chicken Bun', price: 100, taxPercent: 5, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', description: 'Savories', isAvailable: true, isCombo: false, preparationMinutes: 5, category: REAL_CATEGORIES[6] },
];

  const loadCustomerMenu = async () => {
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

  const handleRolePresetSelect = (role: Role) => {
    setSelectedRolePreset(role);
    if (role === 'ADMIN') {
      setLoginEmail('admin@deardesserts.com');
      setLoginPassword('admin123');
    } else if (role === 'CASHIER') {
      setLoginEmail('cashier@deardesserts.com');
      setLoginPassword('cashier123');
    } else {
      setLoginEmail('kitchen@deardesserts.com');
      setLoginPassword('kitchen123');
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await login(loginEmail, loginPassword);
      setShowStaffModal(false);
      if (selectedRolePreset === 'CASHIER') {
        window.location.href = '/pos';
      } else if (selectedRolePreset === 'KITCHEN_STAFF') {
        window.location.href = '/kds';
      } else {
        window.location.href = '/admin/dashboard';
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
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

  const featuredItems = items.filter((i) => i.isCombo || i.price >= 150).slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-cream-100 text-cocoa-800">
      {/* Intro Animation Splash */}
      <IntroSplash />

      {/* Announcement bar */}
      {showAnnouncement && (
        <div className="relative z-50 bg-gradient-to-r from-cocoa-800 via-caramel-600 to-cocoa-800 py-2.5 px-8 text-center text-[10px] sm:text-[11px] font-accent font-bold uppercase tracking-[0.1em] text-cream-100 overflow-hidden">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 leading-tight">
            <Sparkles className="h-3.5 w-3.5 text-gold-400 shrink-0 animate-pulse-soft" />
            <span className="truncate">Crafted fresh daily — explore our signature dessert collection</span>
            <a href="#menu-section" className="shrink-0 underline decoration-gold-400 underline-offset-2 hover:text-gold-300 transition-colors ml-1">
              View Menu
            </a>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}      {/* Sticky header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 min-h-[4.5rem] md:min-h-[5.5rem] flex items-center ${
          scrolled
            ? 'glass-panel border-b border-cream-300/80 shadow-[0_8px_32px_rgba(44,24,16,0.06)] py-2 md:py-3'
            : 'bg-cream-100 py-3 md:py-4'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 relative">
          {/* Left Side: Emblem Logo + Nav links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="flex-shrink-0">
              <Logo size="md" variant="icon-only" />
            </Link>

            {/* Mobile Title logo inline (shown on < md screens so it NEVER overflows) */}
            <Link href="/" className="md:hidden flex items-center">
              <img
                src="/ddtitle.png"
                alt="Dear Desserts"
                className="h-8 sm:h-10 w-auto object-contain filter drop-shadow-sm"
              />
            </Link>

            <nav className="hidden xl:flex items-center gap-8 ml-4">
              <Link href="/menu" className="font-accent text-xs font-bold uppercase tracking-wider text-cocoa-800 hover:text-gold-600 transition">
                Menu
              </Link>
              <Link href="/our-story" className="font-accent text-xs font-bold uppercase tracking-wider text-cocoa-800 hover:text-gold-600 transition">
                Our Story
              </Link>
            </nav>
          </div>

          {/* Desktop Center (Middle): Dear Desserts Title Logo */}
          <Link href="/" className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
            <div className="h-16 w-64 md:h-20 md:w-[22rem] relative flex items-center justify-center">
              <Image
                src="/ddtitle.png"
                alt="Dear Desserts Title"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain filter drop-shadow-md scale-110 sm:scale-125 transition-transform duration-300 hover:scale-130"
                priority
              />
            </div>
          </Link>

          {/* Right Side: Token TV + Staff Portal + Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/tokens"
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-gold-500/30 bg-gold-50/60 text-cocoa-900 hover:bg-gold-100/80 font-accent text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-[1.02]"
            >
              <MonitorPlay className="h-4 w-4 text-gold-600 animate-pulse" />
              <span>Token TV</span>
            </Link>

            {/* Desktop Staff Portal Button */}
            <Link href="/login" className="hidden sm:block">
              <LiquidMetalButton label="Staff Portal" />
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="xl:hidden p-2.5 rounded-xl bg-cream-200 text-cocoa-900 border border-cream-300 hover:bg-cream-300 transition-all active:scale-95 shadow-sm"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="h-6 w-6 text-cocoa-950" /> : <MenuIcon className="h-6 w-6 text-cocoa-950" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="absolute top-full left-0 right-0 w-full bg-cream-100/98 backdrop-blur-2xl border-b-2 border-cream-300/80 shadow-2xl p-5 space-y-3 z-50 animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/menu"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center justify-between font-accent text-xs font-bold uppercase tracking-wider text-cocoa-950 py-3.5 px-4 rounded-xl bg-gold-100 border border-gold-300 shadow-sm"
            >
              <span className="flex items-center gap-2">🍰 Menu & Catalog</span>
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
              <span className="flex items-center gap-2"><MonitorPlay className="h-4 w-4 text-gold-600" /> Token TV Screen</span>
              <span className="text-[10px] bg-gold-200 text-cocoa-950 font-black px-2.5 py-0.5 rounded-full border border-gold-400">Live</span>
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-cocoa-900 text-gold-300 font-accent text-xs font-extrabold uppercase tracking-widest mt-2 shadow-lg border border-gold-500/30"
            >
              <Lock className="w-4 h-4 text-gold-400" />
              <span>Staff Login Portal</span>
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-mesh noise-overlay relative overflow-hidden pb-20 pt-8 lg:pb-28 lg:pt-12">
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.12)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,92,56,0.12)_0%,transparent_70%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="space-y-8 text-center lg:text-left">
            <FadeInView delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-white/80 px-4 py-2 font-accent text-[11px] font-extrabold uppercase tracking-[0.2em] text-caramel-700 shadow-sm backdrop-blur-md">
                <Award className="h-4 w-4 text-gold-600" />
                <span>Flagship Outlet · Bhavanipuram, Vijayawada</span>
              </div>
            </FadeInView>

            <FadeInView delay={100}>
              <h1 className="font-display text-[clamp(2.75rem,6.5vw,5.25rem)] font-extrabold leading-[0.98] tracking-tight text-cocoa-950">
                Where Every Bite
                <span className="block bg-gradient-to-r from-cocoa-900 via-gold-600 to-caramel-600 bg-clip-text text-transparent">
                  Tells a Sweet Story
                </span>
              </h1>
            </FadeInView>

            <FadeInView delay={200}>
              <p className="mx-auto max-w-lg text-base leading-relaxed text-cocoa-700 lg:mx-0 lg:text-lg font-medium">
                Handcrafted Belgian waffles, warm chocolate fudge, artisanal thickshakes, and gourmet quick bites — made fresh daily with love in Vijayawada.
              </p>
            </FadeInView>

            <FadeInView delay={300}>
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cocoa-900 via-cocoa-950 to-black text-gold-300 font-extrabold text-sm uppercase tracking-wider shadow-xl border border-gold-400/30 hover:scale-105 transition-all active:scale-95"
                >
                  <span>🍰 View Menu & Catalog</span>
                  <ArrowRight className="h-4 w-4 text-gold-400" />
                </Link>
              </div>
            </FadeInView>

            <FadeInView delay={400}>
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { value: `${items.length > 0 ? items.length : 43}+`, label: 'Signature Items' },
                  { value: '100%', label: 'Fresh Daily' },
                  { value: '4.9★', label: 'Artisanal Quality' },
                ].map((stat) => (
                  <div key={stat.label} className="stat-pill bg-white/80 border border-cream-300/80 p-4 rounded-2xl shadow-sm">
                    <div className="font-display text-2xl font-bold text-cocoa-950">{stat.value}</div>
                    <div className="mt-0.5 font-accent text-[9px] font-extrabold uppercase tracking-wider text-gold-700">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>

          {/* Right Side: Interactive Hero Bestseller Card Showcase */}
          <FadeInView delay={200} direction="left" className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="animate-float relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold-500/15 via-transparent to-caramel-500/15 shadow-[0_0_60px_rgba(201,162,39,0.25)]" />
              <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-[0_32px_80px_rgba(44,24,16,0.2)] bg-white">
                <div className="relative h-[420px] w-full lg:h-[500px]">
                  <Image
                    src="https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900&q=85"
                    alt="Dear Desserts Signature Belgian Chocolate Thickshake"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/90 via-cocoa-950/20 to-transparent" />
                  
                  {/* Floating Tags */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-cocoa-950/90 backdrop-blur-md text-gold-300 border border-gold-400/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      🔥 #1 Chef's Pick
                    </span>
                    <span className="bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      🟢 Outlet Open Now
                    </span>
                  </div>

                  {/* Card Bottom Details */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                    <div className="space-y-1">
                      <span className="font-accent text-[10px] font-extrabold uppercase tracking-[0.2em] text-gold-400">Handcrafted Daily</span>
                      <p className="font-display text-2xl font-extrabold tracking-tight">Belgian Chocolate Thickshake</p>
                      <p className="text-xs text-cream-300/80 font-medium">Rich Belgian cocoa, creamy ice cream & chocolate drip</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="font-display text-3xl font-black text-gold-400">₹170</span>
                      <p className="text-[10px] text-cream-300/70 font-bold uppercase">Net Price</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>

        <div className="mt-12 flex justify-center animate-bounce">
          <ChevronDown className="h-6 w-6 text-cocoa-600/40" />
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-cream-300/80 bg-cocoa-900 py-3.5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, i) => (
            <span key={i} className="mx-8 flex items-center gap-3 font-accent text-xs font-bold uppercase tracking-[0.25em] text-gold-400/90">
              <span className="h-1.5 w-1.5 rounded-full bg-caramel-500" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Specials */}
      <section id="specials-section" className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mb-14 text-center">
            <span className="font-accent text-[11px] font-bold uppercase tracking-[0.25em] text-caramel-500">Curated Selection</span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-cocoa-900 sm:text-5xl">Signature Specials</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-cocoa-600/80">
              Hand-picked favourites loved by our guests — premium combos and bestsellers crafted to perfection.
            </p>
          </FadeInView>

          <div className="grid gap-6 md:grid-cols-3">
            {(featuredItems.length > 0 ? featuredItems : items.slice(0, 3)).map((item, i) => (
              <MenuProductCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu-section" className="grid-premium relative border-t border-cream-300/60 bg-cream-200/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mb-12 text-center">
            <span className="font-accent text-[11px] font-bold uppercase tracking-[0.25em] text-caramel-500">Full Collection</span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-cocoa-900 sm:text-5xl">Explore Our Menu</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-cocoa-600/80">
              Cakes · Waffles · Savouries · Shakes · Ice Creams · Combos
            </p>
          </FadeInView>

          <FadeInView delay={100}>
            <div className="mb-10 flex flex-col gap-4 rounded-[1.5rem] border border-cream-400/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => setSelectedCat('ALL')}
                  className={`cat-pill whitespace-nowrap flex-shrink-0 ${selectedCat === 'ALL' ? 'cat-pill-active' : 'cat-pill-inactive'}`}
                >
                  All ({items.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`cat-pill whitespace-nowrap flex-shrink-0 ${selectedCat === cat.id ? 'cat-pill-active' : 'cat-pill-inactive'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-caramel-500" />
                <input
                  type="text"
                  placeholder="Search menu…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-premium w-full pl-11"
                />
              </div>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayItems.slice(0, 6).map((item, i) => (
              <MenuProductCard key={item.id} item={item} index={i} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cocoa-900 via-cocoa-950 to-black text-gold-300 font-extrabold text-base shadow-xl border border-gold-400/30 hover:scale-105 transition-all"
            >
              <span>🍰 Click Here to See Full Menu & Price List</span>
              <ArrowRight className="w-5 h-5 text-gold-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Story & Founder Journey */}
      <section id="story-section" className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-cream-100 via-cream-200/50 to-cream-100 border-t border-cream-300/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <FadeInView direction="right">
            <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl">
              <div className="relative h-80 w-full lg:h-[480px]">
                <Image
                  src="/philosophy.jpg"
                  alt="Dear Desserts Founder Sohail Journey"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/90 via-cocoa-950/20 to-transparent" />
                
                {/* Founder Badge overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-cream-300 shadow-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-accent text-[10px] font-black uppercase tracking-[0.2em] text-gold-600">The Visionary Founder</span>
                    <span className="text-xs font-bold text-cocoa-700">Dear Desserts</span>
                  </div>
                  <h4 className="font-display font-extrabold text-xl text-cocoa-950">SOHAIL</h4>
                  <p className="text-xs text-cocoa-700 italic">"Every waffle we bake & every shake we blend carries one promise — Love at First Bite."</p>
                </div>
              </div>
            </div>
          </FadeInView>

          <FadeInView delay={150} className="space-y-6">
            <div>
              <span className="font-accent text-xs font-extrabold uppercase tracking-[0.25em] text-gold-600">Our Founder's Story</span>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold leading-tight text-cocoa-950">
                A Sweet Passion Born From Heart, Vision & Dedication
              </h2>
            </div>

            <p className="text-base leading-relaxed text-cocoa-800 font-medium">
              Dear Desserts wasn’t built in a corporate boardroom — it was born in a kitchen out of pure love, late-night recipe experiments, and a deep obsession with genuine Belgian cocoa. Our founder, <strong className="text-cocoa-950 font-bold">Sohail</strong>, started with a simple yet heartfelt dream: to bring world-class, freshly baked bubble waffles, fudgy brownies, and thick artisanal shakes to Vijayawada.
            </p>

            <p className="text-sm leading-relaxed text-cocoa-700 font-normal">
              From hand-selecting rich Belgian cocoa suppliers to perfecting the golden crispy texture of our signature waffles, Sohail poured his heart into every single recipe. Today, Dear Desserts stands as a beloved home for dessert lovers — where quality is never compromised, and every order is crafted fresh with genuine warmth.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Heart, label: 'Founded by Sohail', detail: 'Driven by Passion' },
                { icon: Sparkles, label: '100% Pure Cocoa', detail: 'Belgian Import' },
                { icon: Award, label: '#1 Rated Outlet', detail: 'Bhavanipuram' },
              ].map(({ icon: Icon, label, detail }) => (
                <div key={label} className="p-3.5 rounded-2xl bg-white border border-cream-300 shadow-sm space-y-1">
                  <Icon className="h-4 w-4 text-gold-600" />
                  <div className="font-display font-extrabold text-xs text-cocoa-950">{label}</div>
                  <div className="text-[10px] text-cocoa-600 font-medium">{detail}</div>
                </div>
              ))}
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Location Section */}
      <section className="relative overflow-hidden py-16 bg-cream-200/60 border-t border-cream-300/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="mb-10 text-center">
              <span className="font-accent text-xs font-bold uppercase tracking-widest text-caramel-600">
                📍 Location & Hours
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-cocoa-900 sm:text-4xl">
                Visit Us at Bhavanipuram
              </h2>
              <p className="mt-2 text-sm text-cocoa-600">
                Swathi Theatre Road, Opposite Sri Balaji Sweets, Bhavanipuram, Vijayawada
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="bg-white/90 rounded-3xl p-6 border border-cream-300 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gold-100 text-gold-700">
                  <MapPin className="h-6 w-6 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-cocoa-900">Dear Desserts Outlet</h3>
                  <p className="text-xs text-cocoa-600">Bhavanipuram, Vijayawada</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-cocoa-600">
                Swathi Theatre Road, Opp. Sri Balaji Sweets, Bhavanipuram, Vijayawada, Andhra Pradesh 520012
              </p>

              <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-xs text-cocoa-700 font-semibold">
                <span>⏰ Mon - Sun</span>
                <span>11:00 AM - 11:30 PM</span>
              </div>

              <a
                href="https://maps.app.goo.gl/RmuEvt2cNEy637Vk6"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-cocoa-900 text-gold-300 font-accent text-xs font-bold uppercase tracking-wider hover:bg-cocoa-950 transition-all shadow-md"
              >
                <MapPin className="h-4 w-4 text-gold-400" />
                Get Driving Directions
              </a>
            </div>

            <div className="lg:col-span-2 rounded-3xl overflow-hidden border-2 border-cream-300 shadow-xl h-80 relative">
              <iframe
                title="Dear Desserts Google Maps Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.950404089735!2d80.5956404!3d16.5286013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35efe07103ecf5%3A0x21dd6ef0860f8992!2sDear%20Desserts!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Light Cream Luxury Footer */}
      <footer className="relative border-t-2 border-gold-400/60 bg-gradient-to-b from-cream-100 via-cream-200/90 to-cream-300/80 text-cocoa-900 pt-16 overflow-hidden">
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
              <h4 className="font-display text-lg font-bold text-cocoa-950 tracking-wide">Live Portals</h4>
              <ul className="space-y-2.5 text-xs text-cocoa-700 font-medium">
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
                  <button
                    onClick={() => setShowStaffModal(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-cream-300 text-cocoa-900 text-[11px] font-extrabold hover:bg-cocoa-900 hover:text-gold-300 transition shadow-sm"
                  >
                    <Lock className="w-3 h-3 text-gold-500" />
                    <span>Staff Portal Login</span>
                  </button>
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
    </div>
  );
}
