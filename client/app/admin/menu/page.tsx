'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import { UtensilsCrossed, Plus, Tag, X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  taxPercent?: number;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  isCombo?: boolean;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function MenuManagementPage() {
  const REAL_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Bubble Waffles', slug: 'bubble-waffles' },
    { id: 'cat-2', name: 'Belgian Waffles', slug: 'belgian-waffles' },
    { id: 'cat-3', name: "The Poppin' Bowl", slug: 'pop-bowl' },
    { id: 'cat-4', name: 'Brownie', slug: 'brownie' },
    { id: 'cat-5', name: 'Specials', slug: 'specials' },
    { id: 'cat-6', name: 'The Bowl Cakes', slug: 'bowl-cakes' },
    { id: 'cat-7', name: 'The Crunch Corner', slug: 'savories' },
  ];

  const REAL_MENU_ITEMS: MenuItem[] = [
    // Bubble Waffles
    { id: 'bw-1', name: 'Triple Trouble', price: 180, isAvailable: true, category: { id: 'cat-1', name: 'Bubble Waffles' } },
    { id: 'bw-2', name: 'Triple Trouble with Ice Cream', price: 200, isAvailable: true, category: { id: 'cat-1', name: 'Bubble Waffles' } },
    { id: 'bw-3', name: 'Fruity Pebble', price: 200, isAvailable: true, category: { id: 'cat-1', name: 'Bubble Waffles' } },
    { id: 'bw-4', name: 'KitKat Crunch', price: 210, isAvailable: true, category: { id: 'cat-1', name: 'Bubble Waffles' } },
    { id: 'bw-5', name: 'Oreo Dream', price: 210, isAvailable: true, category: { id: 'cat-1', name: 'Bubble Waffles' } },
    { id: 'bw-6', name: 'Nutella Nirvana', price: 220, isAvailable: true, category: { id: 'cat-1', name: 'Bubble Waffles' } },
    { id: 'bw-7', name: 'Lotus Biscoff Bliss', price: 230, isAvailable: true, category: { id: 'cat-1', name: 'Bubble Waffles' } },

    // Belgian Waffles
    { id: 'bel-1', name: 'Triple Choco Melt', price: 120, isAvailable: true, category: { id: 'cat-2', name: 'Belgian Waffles' } },
    { id: 'bel-2', name: 'Coffee Mocha', price: 150, isAvailable: true, category: { id: 'cat-2', name: 'Belgian Waffles' } },
    { id: 'bel-3', name: 'Naked Nutella', price: 160, isAvailable: true, category: { id: 'cat-2', name: 'Belgian Waffles' } },
    { id: 'bel-4', name: 'Kiki & Oreo', price: 160, isAvailable: true, category: { id: 'cat-2', name: 'Belgian Waffles' } },
    { id: 'bel-5', name: 'Lotus Biscoff Love', price: 160, isAvailable: true, category: { id: 'cat-2', name: 'Belgian Waffles' } },

    // The Poppin' Bowl
    { id: 'pop-1', name: 'The Triple Choco', price: 190, isAvailable: true, category: { id: 'cat-3', name: "The Poppin' Bowl" } },
    { id: 'pop-2', name: 'Triple Choco with Ice Cream', price: 210, isAvailable: true, category: { id: 'cat-3', name: "The Poppin' Bowl" } },
    { id: 'pop-3', name: 'Break Time with KitKat', price: 220, isAvailable: true, category: { id: 'cat-3', name: "The Poppin' Bowl" } },
    { id: 'pop-4', name: 'Nutella Pop Bowl', price: 230, isAvailable: true, category: { id: 'cat-3', name: "The Poppin' Bowl" } },
    { id: 'pop-5', name: 'Biscoff Pop Bowl', price: 240, isAvailable: true, category: { id: 'cat-3', name: "The Poppin' Bowl" } },
    { id: 'pop-6', name: 'The Fruit Loaded', price: 250, isAvailable: true, category: { id: 'cat-3', name: "The Poppin' Bowl" } },

    // Brownies
    { id: 'br-1', name: 'Triple Chocolate Brownie', price: 130, isAvailable: true, category: { id: 'cat-4', name: 'Brownie' } },
    { id: 'br-2', name: 'Oreo Overload Brownie', price: 140, isAvailable: true, category: { id: 'cat-4', name: 'Brownie' } },
    { id: 'br-3', name: 'Meltdown with Vanilla', price: 160, isAvailable: true, category: { id: 'cat-4', name: 'Brownie' } },
    { id: 'br-4', name: 'Biscoff Brownie', price: 160, isAvailable: true, category: { id: 'cat-4', name: 'Brownie' } },
    { id: 'br-5', name: 'Hazelnut Heaven', price: 160, isAvailable: true, category: { id: 'cat-4', name: 'Brownie' } },

    // Specials
    { id: 'sp-1', name: 'Matilda Cake', price: 180, isAvailable: true, category: { id: 'cat-5', name: 'Specials' } },
    { id: 'sp-2', name: 'Magnum Obsession', price: 200, isAvailable: true, category: { id: 'cat-5', name: 'Specials' } },
    { id: 'sp-3', name: 'Brownie Bowl', price: 200, isAvailable: true, category: { id: 'cat-5', name: 'Specials' } },
    { id: 'sp-4', name: 'Nutella Bites', price: 200, isAvailable: true, category: { id: 'cat-5', name: 'Specials' } },
    { id: 'sp-5', name: 'Death by Chocolate', price: 240, isAvailable: true, category: { id: 'cat-5', name: 'Specials' } },

    // Bowl Cakes
    { id: 'bc-1', name: 'Triple Choco Bowl', price: 180, isAvailable: true, category: { id: 'cat-6', name: 'The Bowl Cakes' } },
    { id: 'bc-2', name: 'Crunch Chocolate Bowl', price: 220, isAvailable: true, category: { id: 'cat-6', name: 'The Bowl Cakes' } },
    { id: 'bc-3', name: 'KitKat Bowl', price: 220, isAvailable: true, category: { id: 'cat-6', name: 'The Bowl Cakes' } },
    { id: 'bc-4', name: 'Oreo Overload Bowl', price: 220, isAvailable: true, category: { id: 'cat-6', name: 'The Bowl Cakes' } },
    { id: 'bc-5', name: 'Biscoff Bowl', price: 230, isAvailable: true, category: { id: 'cat-6', name: 'The Bowl Cakes' } },
    { id: 'bc-6', name: 'Kunafa Kraze Bowl', price: 250, isAvailable: true, category: { id: 'cat-6', name: 'The Bowl Cakes' } },
    { id: 'bc-7', name: 'Ferrero Rocher Bowl', price: 300, isAvailable: true, category: { id: 'cat-6', name: 'The Bowl Cakes' } },

    // The Crunch Corner (Savories)
    { id: 'cc-1', name: 'Salted French Fries', price: 80, isAvailable: true, category: { id: 'cat-7', name: 'The Crunch Corner' } },
    { id: 'cc-2', name: 'Peri Peri French Fries', price: 100, isAvailable: true, category: { id: 'cat-7', name: 'The Crunch Corner' } },
    { id: 'cc-3', name: 'Cheesy Fries', price: 130, isAvailable: true, category: { id: 'cat-7', name: 'The Crunch Corner' } },
    { id: 'cc-4', name: 'Chicken Loaded Fries', price: 150, isAvailable: true, category: { id: 'cat-7', name: 'The Crunch Corner' } },
    { id: 'cc-5', name: 'Chicken Popcorn', price: 150, isAvailable: true, category: { id: 'cat-7', name: 'The Crunch Corner' } },
    { id: 'cc-6', name: 'Chicken Wings', price: 160, isAvailable: true, category: { id: 'cat-7', name: 'The Crunch Corner' } },
    { id: 'cc-7', name: 'Cheesy Chicken Bun', price: 100, isAvailable: true, category: { id: 'cat-7', name: 'The Crunch Corner' } },
  ];

  const [categories, setCategories] = useState<Category[]>(REAL_CATEGORIES);
  const [items, setItems] = useState<MenuItem[]>(REAL_MENU_ITEMS);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [disabledItemIds, setDisabledItemIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('cat-1');
  const [price, setPrice] = useState(180);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Read out of stock map from localStorage
    const savedDisabled = typeof window !== 'undefined' ? localStorage.getItem('dd_disabled_items') : null;
    let disabledList: string[] = [];
    if (savedDisabled) {
      try {
        disabledList = JSON.parse(savedDisabled);
      } catch (e) {}
    }
    setDisabledItemIds(disabledList);

    try {
      const [catsRes, itemsRes] = await Promise.all([
        fetchApi('/menu/categories').catch(() => null),
        fetchApi('/menu/items').catch(() => null),
      ]);

      if (catsRes && Array.isArray(catsRes) && catsRes.length > 0) {
        setCategories(catsRes);
      }
      if (itemsRes && Array.isArray(itemsRes) && itemsRes.length > 0) {
        setItems(itemsRes);
      }
    } catch (err) {
      console.error('Failed to load API menu:', err);
    }
  };

  const handleToggleStock = (itemId: string) => {
    const isCurrentlyDisabled = disabledItemIds.includes(itemId);
    let nextDisabled: string[];

    if (isCurrentlyDisabled) {
      nextDisabled = disabledItemIds.filter((id) => id !== itemId);
    } else {
      nextDisabled = [...disabledItemIds, itemId];
    }

    setDisabledItemIds(nextDisabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dd_disabled_items', JSON.stringify(nextDisabled));
      // Dispatch custom event for instant POS sync
      window.dispatchEvent(new Event('storage'));
    }

    // Call API backend sync if active
    fetchApi(`/menu/items/${itemId}/toggle-availability`, { method: 'PATCH' }).catch((e) =>
      console.warn('API stock toggle fallback:', e)
    );
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catObj = categories.find((c) => c.id === categoryId) || categories[0];
    const newItem: MenuItem = {
      id: 'custom-' + Date.now(),
      name,
      price: Number(price),
      isAvailable: true,
      category: { id: catObj.id, name: catObj.name },
    };

    const updated = [newItem, ...items];
    setItems(updated);
    setName('');
    setShowAddModal(false);
    alert(`Added "${name}" to Menu successfully!`);
  };

  const filteredItems = items.filter((it) => {
    if (selectedCat === 'ALL') return true;
    return it.category?.id === selectedCat || it.category?.name === selectedCat;
  });

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-cocoa-900 tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-gold-400" /> Outlet Menu & Stock Control
            </h1>
            <span className="px-3 py-1 rounded-full bg-gold-400/20 text-cocoa-900 font-extrabold text-xs border border-gold-300 shadow-sm">
              Total Items: {items.length}
            </span>
          </div>
          <p className="text-sm text-gold-600 font-medium mt-1">
            Manage all 42 store items, update prices, and mark items In Stock / Out of Stock for live POS cashier billing
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 hover:from-cocoa-900 hover:to-black font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCat('ALL')}
          className={`px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            selectedCat === 'ALL'
              ? 'bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 shadow-md'
              : 'bg-white text-cocoa-800 hover:bg-cream-200 border border-cream-300'
          }`}
        >
          All Items ({items.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              selectedCat === c.id
                ? 'bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 shadow-md'
                : 'bg-white text-cocoa-800 hover:bg-cream-200 border border-cream-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Fast Text-Only Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isOut = disabledItemIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`bg-white/90 backdrop-blur-xl rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all ${
                isOut ? 'border-red-300 bg-red-50/20' : 'border-cream-300/80 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cream-200 text-cocoa-700">
                    {item.category?.name || 'Desserts'}
                  </span>
                  <span className="font-display font-extrabold text-lg text-cocoa-900">
                    ₹{item.price}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-cocoa-900 leading-snug">
                  {item.name}
                </h3>
              </div>

              <div className="pt-3 mt-3 border-t border-cream-200 flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-black flex items-center gap-1 ${
                    isOut ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {isOut ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                    </>
                  )}
                </span>

                <button
                  onClick={() => handleToggleStock(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition shadow-sm ${
                    isOut
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isOut ? 'MARK IN STOCK' : 'MARK OUT OF STOCK'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-cream-300">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-base text-cocoa-900">Add New Outlet Menu Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ferrero Rocher Waffle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 font-medium text-cocoa-900"
                />
              </div>

              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 font-medium text-cocoa-900 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 font-medium text-cocoa-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-bold rounded-xl shadow hover:shadow-lg transition"
                >
                  ADD MENU ITEM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
