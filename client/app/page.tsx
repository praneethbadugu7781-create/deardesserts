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
import DessertCraftStudio from '../components/DessertCraftStudio';
import LiquidMetalButton from '../components/LiquidMetalButton';
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

  const loadCustomerMenu = async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        fetchApi('/menu/categories'),
        fetchApi('/menu/items'),
      ]);
      setCategories(catsRes || []);
      setItems(itemsRes || []);
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
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
    const matchesCat =
      selectedCat === 'ALL' ||
      item.category?.id === selectedCat ||
      item.category?.slug === selectedCat;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const featuredItems = items.filter((i) => i.isCombo || i.price >= 150).slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-cream-100 text-cocoa-800">
      {/* Announcement bar */}
      {showAnnouncement && (
        <div className="relative z-50 bg-gradient-to-r from-cocoa-800 via-caramel-600 to-cocoa-800 py-2.5 text-center text-[11px] font-accent font-bold uppercase tracking-[0.12em] text-cream-100">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold-400 animate-pulse-soft" />
            Crafted fresh daily — explore our signature dessert collection
            <a href="#menu-section" className="ml-1 underline decoration-gold-400 underline-offset-2 hover:text-gold-300 transition-colors">
              View Menu
            </a>
          </span>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Sticky header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'glass-panel border-b border-cream-300/80 shadow-[0_8px_32px_rgba(44,24,16,0.06)] py-2'
            : 'bg-cream-100 py-3'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
          {/* Left Side: Emblem Logo + Nav Buttons */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex-shrink-0">
              <Logo size="md" variant="icon-only" />
            </Link>
            <nav className="hidden xl:flex items-center gap-6">
              <a href="#menu-section" className="nav-link-premium">Menu</a>
              <a href="#craft-studio-section" className="nav-link-premium">Craft Studio</a>
              <a href="#specials-section" className="nav-link-premium">Specials</a>
              <a href="#story-section" className="nav-link-premium">Our Story</a>
              <Link href="/tokens" className="nav-link-premium flex items-center gap-1.5">
                <MonitorPlay className="h-3.5 w-3.5 text-gold-600" />
                Token TV
              </Link>
            </nav>
          </div>

          {/* Center (Middle): Dear Desserts Title Image BIGGER */}
          <Link href="/" className="hidden sm:block absolute left-1/2 -translate-x-1/2">
            <div className="h-12 w-48 md:h-14 md:w-64 relative flex items-center justify-center">
              <Image
                src="/ddtitle.png"
                alt="Dear Desserts Title"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Right Side: Shader Liquid Metal Staff Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <LiquidMetalButton label="Staff Portal" />
            </Link>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="xl:hidden p-2 rounded-xl bg-cream-200 text-cocoa-900 border border-cream-300 hover:bg-cream-300 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-cream-100/95 backdrop-blur-xl border-b border-cream-300 px-6 py-4 space-y-3 animate-fade-in">
            <a
              href="#menu-section"
              onClick={() => setMobileNavOpen(false)}
              className="block font-accent text-xs font-bold uppercase tracking-wider text-cocoa-900 py-2 border-b border-cream-200"
            >
              📜 Explore Menu
            </a>
            <a
              href="#craft-studio-section"
              onClick={() => setMobileNavOpen(false)}
              className="block font-accent text-xs font-bold uppercase tracking-wider text-gold-600 py-2 border-b border-cream-200"
            >
              ✨ Custom Dessert Studio
            </a>
            <a
              href="#specials-section"
              onClick={() => setMobileNavOpen(false)}
              className="block font-accent text-xs font-bold uppercase tracking-wider text-cocoa-900 py-2 border-b border-cream-200"
            >
              🔥 Today's Specials
            </a>
            <Link
              href="/tokens"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center justify-between font-accent text-xs font-bold uppercase tracking-wider text-cocoa-900 py-2 border-b border-cream-200"
            >
              <span className="flex items-center gap-2"><MonitorPlay className="h-4 w-4 text-gold-600" /> Token TV</span>
              <span className="text-[10px] bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">Live</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileNavOpen(false)}
              className="block text-center w-full py-2.5 rounded-xl bg-cocoa-900 text-gold-300 font-accent text-xs font-bold uppercase tracking-wider mt-2"
            >
              🔐 Staff Login
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="hero-mesh noise-overlay relative overflow-hidden pb-20 pt-8 lg:pb-28 lg:pt-12">
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.1)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,92,56,0.1)_0%,transparent_70%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="space-y-8 text-center lg:text-left">
            <FadeInView delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-white/50 px-4 py-2 font-accent text-[10px] font-bold uppercase tracking-[0.2em] text-caramel-600 backdrop-blur-sm">
                <Award className="h-3.5 w-3.5 text-gold-500" />
                Flagship Outlet · Dear Desserts #DD-01
              </div>
            </FadeInView>

            <FadeInView delay={100}>
              <h1 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-cocoa-900">
                Where Every Bite
                <span className="block bg-gradient-to-r from-caramel-500 via-gold-500 to-caramel-600 bg-clip-text text-transparent">
                  Tells a Story
                </span>
              </h1>
            </FadeInView>

            <FadeInView delay={200}>
              <p className="mx-auto max-w-lg text-base leading-relaxed text-cocoa-600/85 lg:mx-0 lg:text-lg">
                Artisanal Belgian waffles, hand-crafted cakes, and gourmet thickshakes —
                made with premium ingredients and served with love at every order.
              </p>
            </FadeInView>

            <FadeInView delay={300}>
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <PremiumButton href="#menu-section" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                  Explore Menu
                </PremiumButton>
                <PremiumButton href="#specials-section" variant="secondary" size="lg">
                  View Specials
                </PremiumButton>
              </div>
            </FadeInView>

            <FadeInView delay={400}>
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { value: `${items.length || '13'}+`, label: 'Signature Items' },
                  { value: '100%', label: 'Fresh Daily' },
                  { value: '4.9★', label: 'Guest Rating' },
                ].map((stat) => (
                  <div key={stat.label} className="stat-pill">
                    <div className="font-display text-2xl font-semibold text-cocoa-900">{stat.value}</div>
                    <div className="mt-0.5 font-accent text-[9px] font-bold uppercase tracking-wider text-cocoa-600/70">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={200} direction="left" className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="animate-float relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold-500/10 via-transparent to-caramel-500/10 shadow-[0_0_60px_rgba(201,162,39,0.2)]" />
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-[0_32px_80px_rgba(44,24,16,0.18)]">
                <div className="relative h-[420px] w-full lg:h-[520px]">
                  <Image
                    src="https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900&q=85"
                    alt="Dear Desserts signature Belgian shake and waffle"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl border border-white/20 bg-cocoa-950/70 px-5 py-3.5 backdrop-blur-md">
                  <div>
                    <div className="font-accent text-[10px] font-bold uppercase tracking-wider text-gold-400">Chef&apos;s Pick</div>
                    <div className="font-display text-lg font-semibold text-white">Belgian Chocolate Thickshake</div>
                  </div>
                  <div className="flex items-center gap-1 font-accent text-xl font-extrabold text-gold-400">
                    <Star className="h-4 w-4 fill-gold-400" />
                    ₹170
                  </div>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>

        <div className="mt-16 flex justify-center animate-bounce">
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
            {filteredItems.map((item, i) => (
              <MenuProductCard key={item.id} item={item} index={i} />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-2xl text-cocoa-600/60">No items match your search</p>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Craft Studio Section */}
      <section className="relative py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <DessertCraftStudio />
          </FadeInView>
        </div>
      </section>

      {/* Story */}
      <section id="story-section" className="relative overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <FadeInView direction="right">
            <div className="relative overflow-hidden rounded-[2rem]">
              <div className="relative h-80 w-full lg:h-[420px]">
                <Image
                  src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=85"
                  alt="Dear Desserts artisan kitchen"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-cocoa-950/40 to-transparent" />
            </div>
          </FadeInView>

          <FadeInView delay={150}>
            <span className="font-accent text-[11px] font-bold uppercase tracking-[0.25em] text-caramel-500">Our Philosophy</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-cocoa-900 sm:text-5xl">
              Crafted With Passion,<br />Served With Love
            </h2>
            <p className="mt-6 text-base leading-relaxed text-cocoa-600/85">
              At Dear Desserts, we believe every dessert is an experience. From Belgian cocoa sourced
              from premium suppliers to organic vanilla beans and golden-crisp waffles — every ingredient
              is chosen to create moments worth remembering.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {[
                { icon: Leaf, text: 'Premium Ingredients' },
                { icon: Clock, text: 'Made Fresh to Order' },
                { icon: Award, text: 'Award-Winning Recipes' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 rounded-full border border-cream-400 bg-white/60 px-4 py-2 font-accent text-[10px] font-bold uppercase tracking-wider text-cocoa-700"
                >
                  <Icon className="h-3.5 w-3.5 text-caramel-500" />
                  {text}
                </div>
              ))}
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t-4 border-gold-500/40 bg-cocoa-950 pt-16 text-cream-100">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 border-b border-cocoa-800 px-4 pb-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="space-y-4">
            <Logo size="lg" theme="dark" />
            <p className="text-sm leading-relaxed text-cream-300/70">
              Handcrafted Belgian waffles, warm chocolate fudge, artisanal thickshakes, and gourmet quick bites — made fresh with love.
            </p>
            <div className="flex gap-3 pt-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cocoa-700 bg-cocoa-900 text-gold-400 transition-all duration-300 hover:border-gold-500/50 hover:bg-caramel-600 hover:text-white hover:scale-110"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-xl text-gold-400">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-cream-300/70">
              {[
                { label: 'Menu Explorer', href: '#menu-section' },
                { label: 'Signature Specials', href: '#specials-section' },
                { label: 'Our Story', href: '#story-section' },
                { label: 'Token TV Screen', href: '/tokens' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-gold-400 hover:translate-x-1 inline-block duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl text-gold-400">Visit Us</h4>
            <div className="mt-4 space-y-3 text-sm text-cream-300/70">
              <div className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-caramel-500" />
                <div>
                  <div className="font-semibold text-white">Everyday</div>
                  <div>Mon – Sun: 11:00 AM – 11:30 PM</div>
                </div>
              </div>
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-caramel-500" />
                <div>
                  <div className="font-semibold text-white">Flagship #DD-01</div>
                  <div>74 Park Street, Central District</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-caramel-500" />
                <div>+91 98765 43210</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-xl text-gold-400">Dessert Club</h4>
            <p className="mt-4 text-sm text-cream-300/70">Exclusive offers & promo codes delivered to your inbox.</p>
            {subscribed ? (
              <div className="mt-4 rounded-xl border border-gold-500/30 bg-cocoa-900 px-4 py-3 text-center text-sm font-semibold text-gold-400">
                Welcome to the Dessert Club!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail) setSubscribed(true);
                }}
                className="mt-4"
              >
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-cocoa-700 bg-cocoa-900 px-4 py-3 text-sm text-white placeholder-cocoa-600 outline-none transition focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-caramel-600 p-2 text-white transition hover:bg-caramel-500 hover:scale-105"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-[11px] text-cocoa-600 sm:flex-row sm:px-6 lg:px-8">
          <div>© 2026 <strong className="text-cream-300/60">Dear Desserts Inc.</strong> · GSTIN: 19AAACD1234F1Z9</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-cream-300 transition">Privacy</a>
            <a href="#" className="hover:text-cream-300 transition">Terms</a>
            <a href="#" className="hover:text-cream-300 transition">FSSAI #10022011000543</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
